---
title: '提示工程：把"许愿"变成"规格说明"'
titleEn: 'Prompt Engineering: Turning Wishes into Specifications'
description: '提示词写得好的标志，不是模型偶尔给出惊艳答案，而是它稳定地不给错答案。这篇讲结构、约束、示例与评测。'
descriptionEn: "A good prompt isn't one that occasionally dazzles — it's one that reliably avoids wrong answers. Structure, constraints, examples, and evaluation."
pubDate: 2026-06-12
tags: ['Prompt Engineering', 'LLM']
---

很多人对提示工程的理解还停留在"换个说法试试"。但真正让它变成工程的那一步，是把提示词当成**接口契约**来写：输入是什么、输出必须长什么样、边界在哪、失败时怎么办。

## 一个可复用的结构

不管任务多简单，我都会按这五段组织：

```
角色 / 任务 / 约束 / 输出格式 / 示例
```

- **角色**：不是"你是一位资深专家"这种空话，而是告诉它**依据什么知识作答**、**站在谁的立场**。比如"你是电商客服，只能依据下面的订单信息回答，不能承诺退款时限"。
- **任务**：一句话说清要做什么。多个任务就拆成多次调用。
- **约束**：不能做什么、资料不足时怎么办。这一条决定了下限。
- **输出格式**：字段、类型、长度、语言。能用 schema 就别用自然语言描述。
- **示例**：给 1–3 个输入输出对，比写 10 行规则更有效。

## 为什么示例比规则管用

大模型对"模式"的敏感度远高于对"条款"的敏感度。你写"回答要简洁"，它可能给出三行；你给一个两句话的示例，它立刻就能对齐。

但示例也有代价：**示例会引入偏差**。如果三个示例都是"是"，模型倾向于回答"是"。所以示例要覆盖边界情况，尤其是"应该拒答"的那一种。

## 结构化输出：别让模型自由发挥

只要下游要解析，就不该让它输出自然语言。两种做法：

1. **JSON Schema / Structured Outputs**：由 API 保证结构合法。
2. **Tool Calling**：把"输出"定义成一次函数调用，参数即字段。

```python
from openai import OpenAI

client = OpenAI()

schema = {
    'type': 'object',
    'properties': {
        'sentiment': {'type': 'string', 'enum': ['positive', 'neutral', 'negative']},
        'confidence': {'type': 'number'},
        'reason': {'type': 'string', 'maxLength': 120},
    },
    'required': ['sentiment', 'confidence', 'reason'],
    'additionalProperties': False,
}

resp = client.chat.completions.create(
    model='gpt-4o-mini',
    messages=[
        {'role': 'system', 'content': '判断评论情感。无法判断时 sentiment 取 neutral，confidence 低于 0.5。'},
        {'role': 'user', 'content': '物流太慢了，等了一周。'},
    ],
    response_format={'type': 'json_schema', 'json_schema': {'name': 'sentiment', 'schema': schema}},
)
print(resp.choices[0].message.content)
```

有了 schema，"模型输出格式不稳定"这个问题就从提示词里彻底消失了。

## 思维链：该用和不该用

CoT（让模型先推理再作答）在数学、多步逻辑、需要权衡的任务上确实有效。但在两类场景里是负收益：

- **简单的抽取/分类**：多出的推理步骤只会增加出错面和 token 成本。
- **新一代推理模型**：模型内部已经在做长思考，外部再要求"一步步想"反而会干扰它。

判断方法很朴素：同一批测试样本，加 CoT 和不加 CoT 各跑一遍，看准确率和延迟。不要因为某篇论文说有效就默认有效。

## 迭代方法：先有评测集

提示词优化最忌讳"改一版看一眼感觉不错就上线"。可行的流程是：

1. 收集 30–50 条真实输入，人工标注期望输出（包含 5–10 条应当拒答的）。
2. 写一个脚本，批量跑提示词，对比输出与标注。
3. 每次只改一个变量，记录分数变化。
4. 分数不再提升时停下——继续调只会过拟合这批样本。

这套流程听起来笨，但它能回答一个关键问题：**这次改动是真的变好了，还是只是这条样本变好了**。

## 五个常见错误

- **指令互相冲突**："尽量详细"和"不超过 50 字"同时出现，模型只能随机取舍。
- **否定式指令**："不要提及价格"经常失效，因为模型必须先激活"价格"这个概念。改成正面表述："只讨论功能与使用方法"。
- **把所有规则塞进 system**：规则超过一定长度后，模型对后半段的遵守率明显下降。该用代码约束的（长度、格式、枚举）就别交给提示词。
- **没有失败路径**：没告诉模型"资料不足时怎么办"，它就一定会编。
- **把提示词当秘密**：提示词应该进版本库，和代码一起 review。它就是这个系统的接口定义。

## 小结

提示工程的终点不是"更会说话"，而是**把模糊需求翻译成模型能稳定执行的规格**。角色、约束、格式、示例、评测——这五件事做完，提示词就从玄学变成了工程。
