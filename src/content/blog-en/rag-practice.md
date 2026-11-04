RAG (Retrieval-Augmented Generation) can be summed up in one sentence: retrieve relevant chunks from a knowledge base, then stuff them into the context so the model answers from facts.

But making it work is all in that one word — *retrieval*. Most of the failures I've seen aren't prompt problems; the retrieved material is simply wrong, and even a strong model just produces fluent nonsense on top of bad material.

## When not to use RAG

Some cold water first. RAG isn't the default answer to every "knowledge Q&A":

- **Structured, field-level knowledge** (order status, inventory count): query the database directly — don't route through a model.
- **Very small knowledge bases** (a few tens of thousands of characters): put everything in context; retrieval just adds error.
- **Cross-document, multi-hop reasoning**: basic RAG can't do it. Either reach for an agent or build a graph properly.

The test is simple: if "read everything and answer" is feasible, RAG's benefit is small; if the corpus is far larger than the context window, RAG is genuinely necessary.

## Chunking: the most underrated step

Chunking sets the ceiling for retrieval. Retrieval can only return the chunks you cut; cut them badly and everything downstream is wasted effort.

The common strategies and their real costs:

| Strategy | Pros | Cons |
| --- | --- | --- |
| Fixed-length | Simplest to implement | A sentence split in half breaks semantics |
| Paragraph / heading recursive | Preserves structure, works well | Depends on the source being well-structured |
| Semantic (embedding-similarity) | More natural boundaries | Expensive, slow on long documents |
| Parent-child (retrieve small, feed large) | Precision and context together | A bit more index complexity |

I lean toward **parent-child**: index small 200–300-character chunks for retrieval, and when one hits, return its enclosing ~1000-character block to the model. Small chunks keep similarity focused; large chunks keep the context fed to the model coherent.

One easy-to-forget point: **carry source metadata when chunking** (document title, section, URL). Without it the model's answer can't be traced, so the user can't verify it.

## Retrieval: a single vector search isn't enough

Vector search is good at semantic similarity and weak on proper nouns, IDs, and code identifiers. Ask "how do I fix error E1024" and it will likely surface a pile of "error handling" docs while the one containing `E1024` ranks behind them.

A production-grade setup is basically **hybrid retrieval + reranking**:

```
query → rewrite/expand → vector search + BM25 keyword search → fusion → Reranker → Top-K
```

- **BM25** handles exact matches — proper nouns and IDs.
- **Vector search** handles semantic generalization — "same meaning, different words".
- **Fusion** is usually RRF (Reciprocal Rank Fusion); it needs no weight tuning, which is a nice engineering win.
- **Reranker** (BGE-Reranker, Cohere Rerank, etc.) rescoring the candidates is usually the single most visible accuracy jump.

## A minimal working implementation

Assembling a reranked QA chain with LangChain's LCEL is clearer about what each stage does than the old `RetrievalQA`:

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
    ('system', 'Answer only from the given material; if it is insufficient, say you do not know — do not fabricate.'),
    ('human', 'Material:\n{context}\n\nQuestion: {question}'),
])

def format_docs(docs):
    return '\n\n---\n\n'.join(d.page_content for d in docs)

chain = (
    {'context': retriever | format_docs, 'question': RunnablePassthrough()}
    | prompt
    | ChatOpenAI(model='gpt-4o-mini', temperature=0)
    | StrOutputParser()
)

print(chain.invoke('Why does chunking affect RAG quality?'))
```

This runs, but **don't ship it as-is**: it's missing reranking, missing citations, and missing the "refuse when nothing was retrieved" fallback.

## Evaluation: no evaluation, no optimization

RAG evaluation must be split in two — mixing them gives you wrong conclusions:

- **Retrieval side**: Recall@K, MRR, hit rate. Test with labeled "question → should-hit document" pairs.
- **Generation side**: faithfulness (did it only use the given material), answer relevance, refusal accuracy.
- **End-to-end**: RAGAS, TruLens, and similar give several metrics at once.

In practice the most useful thing isn't any single score — it's **error attribution**. Every wrong answer, first ask: was it "didn't retrieve" or "retrieved but used badly"? The former means fix chunking/retrieval; the latter means fix the prompt and context organization. Confuse the two and optimization becomes random guessing.

## A few recurring traps

- **Over-stuffing context**: going from Top-5 to Top-20 often makes it *worse*. In long contexts the model ignores the middle, and noise clouds its judgment. Prefer fewer and precise.
- **Different models for query vs document**: the embedding model must be consistent; changing it means a full index rebuild.
- **Stale index**: documents change, the index doesn't, and the model confidently serves expired answers.
- **No refusal mechanism**: when retrieval comes back empty, the model still forces an answer — the single biggest source of hallucination.

## Wrapping up

Eighty percent of RAG's engineering is on the data side: how to chunk, how to index, how to evaluate. The model is the last link, and usually not the bottleneck.

Get chunking solid, add hybrid retrieval plus a reranker, and split evaluation into retrieval vs generation — do those three and a "usable" RAG is basically there.
