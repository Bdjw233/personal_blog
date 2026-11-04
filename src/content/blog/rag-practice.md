---
title: 'RAG 到底难在哪：检索、分块与评估'
titleEn: 'What Makes RAG Hard: Retrieval, Chunking, and Evaluation'
description: 'RAG 的瓶颈几乎从来不在生成，而在检索。把分块、混合检索、重排序和评估这四件事讲透，比堆框架有用得多。'
descriptionEn: "RAG's bottleneck is almost never generation — it's retrieval. Chunking, hybrid search, reranking, and evaluation, explained properly."
pubDate: 2026-08-24
tags: ['RAG', 'LLM', '检索']
---

RAG（Retrieval-Augmented Generation）的原理一句话就能说完：先在知识库里检索相关片段，再把片段塞进上下文让模型基于事实回答。

但把它做对，难点全在"检索"这两个字上。我见过的大部分失败案例，问题都不在提示词，而在于检索回来的东西根本不对——模型再强也只能基于错误材料编出流畅的废话。

## 什么时候不该用 RAG

先泼一盆冷水。RAG 不是所有"知识问答"的默认解：

- **知识是结构化的、字段明确的**（订单状态、库存数量）：直接查数据库，别绕道模型。
- **知识总量很小**（几万字）：全文塞进上下文就行，检索反而引入误差。
- **需要跨文档推理、多跳检索**：基础 RAG 做不好，要么上 Agent，要么老实做图结构。

判断标准很简单：如果"把全部资料读完再回答"是可行的，RAG 的收益就不大；如果资料量远超上下文，RAG 才是刚需。

## 分块：最容易被低估的环节

分块决定了检索的上限。检索只能召回你切出来的块，块切得不好，后面再优化也是白搭。

常见策略和它们的真实代价：

| 策略 | 优点 | 问题 |
| --- | --- | --- |
| 固定长度切分 | 实现最简单 | 一句话被切成两半，语义断裂 |
| 按段落/标题递归切分 | 保留结构，效果好 | 依赖文档本身结构清晰 |
| 语义切分（按 embedding 相似度） | 边界更自然 | 成本高，长文档慢 |
| 父子块（小块检索、大块喂给模型） | 精度与上下文兼顾 | 索引结构复杂一些 |

我目前更倾向**父子块**：用 200–300 字的小块建索引做检索，命中后返回它所属的 1000 字大块给模型。小块让相似度计算更聚焦，大块保证喂给模型的上下文是完整的一段。

一个容易忘的点：**分块时要带上来源元数据**（文档标题、章节、URL）。没有元数据，模型给出的答案无法溯源，用户也就无法验证。

## 检索：单一向量检索不够用

向量检索擅长语义相似，但对专有名词、编号、代码标识符很弱。比如查询"报错 E1024 怎么解决"，向量检索很可能召回一堆讲"错误处理"的文档，而真正包含 `E1024` 的那篇排在后面。

生产可用的方案基本是**混合检索 + 重排序**：

```
查询 → 改写/扩展 → 向量检索 + BM25 关键词检索 → 融合 → Reranker → Top-K
```

- **BM25** 负责精确匹配，兜住专有名词和编号。
- **向量检索**负责语义泛化，处理"意思一样但用词不同"。
- **融合**常用 RRF（Reciprocal Rank Fusion），不需要调权重，工程上很省事。
- **Reranker**（如 BGE-Reranker、Cohere Rerank）对候选集重新打分，通常能带来最明显的一次精度提升。

## 一个最小可用的实现

用 LangChain 的 LCEL 拼一个带重排序的问答链，比老式的 `RetrievalQA` 更清楚每个环节在做什么：

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=40,
    separators=['\n## ', '\n### ', '\n\n', '。', '\n', ' '],
)
chunks = splitter.split_documents(documents)

vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings(model='text-embedding-3-small'))
retriever = vectorstore.as_retriever(search_kwargs={'k': 8})

prompt = ChatPromptTemplate.from_messages([
    ('system', '只根据给定资料回答；资料不足时直接说不知道，不要编造。'),
    ('human', '资料：\n{context}\n\n问题：{question}'),
])

def format_docs(docs):
    return '\n\n---\n\n'.join(d.page_content for d in docs)

chain = (
    {'context': retriever | format_docs, 'question': RunnablePassthrough()}
    | prompt
    | ChatOpenAI(model='gpt-4o-mini', temperature=0)
    | StrOutputParser()
)

print(chain.invoke('RAG 的分块为什么影响效果？'))
```

这段代码能跑，但**不要直接上线**：缺了重排序、缺了引用来源、缺了"检索不到就拒答"的兜底。

## 评估：没有评估就没有优化

RAG 的评估要拆成两段，混在一起会得出错误结论：

- **检索侧**：Recall@K、MRR、命中率。用一批"问题 → 应当命中的文档"标注对来测。
- **生成侧**：忠实度（是否只用了给定资料）、答案相关性、拒答准确率。
- **端到端**：RAGAS、TruLens 这类框架能一次给出多个指标。

实践里最有用的不是某个分数，而是**错误归因**：每次答错，先判断是"没检索到"还是"检索到了但没用对"。前者去改分块和检索，后者去改提示词和上下文组织。分不清这两件事，优化就会变成随机尝试。

## 几个反复出现的坑

- **上下文塞太满**：Top-K 从 5 加到 20，效果反而变差。长上下文里模型会忽略中段信息，噪声也会干扰判断。宁可少而准。
- **查询和文档用不同模型编码**：embedding 模型必须一致，换模型要全量重建索引。
- **索引不更新**：文档改了、索引没重建，模型会自信地给出过期答案。
- **没有拒答机制**：检索为空时模型照样强行作答，这是幻觉的最大来源。

## 小结

RAG 的工程量 80% 在数据侧：怎么切、怎么索引、怎么评估。模型只是最后一环，且通常不是瓶颈。

把分块做扎实、把混合检索和重排序加上、把评估拆成检索与生成两段——这三件事做到位，一个"能用"的 RAG 基本就成立了。
