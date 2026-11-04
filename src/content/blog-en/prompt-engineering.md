A lot of people still think prompt engineering means "try a different wording". But the step that actually makes it *engineering* is treating the prompt as an **interface contract**: what goes in, what must come out, where the boundary is, and what happens on failure.

## A reusable structure

No matter how simple the task, I organize it into five parts:

```
Role / Task / Constraints / Output format / Examples
```

- **Role**: not "you are a senior expert" filler, but *what knowledge to answer from* and *whose position to stand in*. For example: "You are e-commerce support. Answer only from the order info below, and do not promise a refund deadline."
- **Task**: one sentence on what to do. Multiple tasks? Split them into multiple calls.
- **Constraints**: what not to do, and what to do when information is insufficient. This line sets the floor.
- **Output format**: fields, types, length, language. If a schema exists, don't describe it in prose.
- **Examples**: one to three input/output pairs beat ten lines of rules.

## Why examples beat rules

Models are far more sensitive to *patterns* than to *clauses*. You write "answer concisely" and it gives you three lines; you show a two-sentence example and it aligns instantly.

But examples have a cost: **they introduce bias**. If all three examples are "yes", the model leans "yes". So your examples should cover the edges — especially the "should refuse" one.

## Structured output: don't let the model improvise

If anything downstream has to parse the result, don't let it output natural language. Two options:

1. **JSON Schema / Structured Outputs**: the API guarantees the structure.
2. **Tool calling**: define "the output" as a function call whose parameters are the fields.

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
        {'role': 'system', 'content': 'Classify the sentiment. When unsure, use neutral and a confidence below 0.5.'},
        {'role': 'user', 'content': 'The delivery was so slow, I waited a week.'},
    ],
    response_format={'type': 'json_schema', 'json_schema': {'name': 'sentiment', 'schema': schema}},
)
print(resp.choices[0].message.content)
```

With a schema, "the output format is unstable" stops being a prompt problem entirely.

## Chain-of-thought: when to use it and when not

CoT (making the model reason before answering) genuinely helps on math, multi-step logic, and tasks that need trade-offs. But it's negative value in two cases:

- **Simple extraction/classification**: the extra reasoning steps only add failure surface and token cost.
- **Newer reasoning models**: the model already does long internal thinking; asking it to "think step by step" externally interferes with it.

The test is boring: run the same eval set with and without CoT and compare accuracy and latency. Don't default to it because a paper says it works.

## Iteration: start with an eval set

The worst thing you can do when tuning prompts is "change it, eyeball it, ship it". A workable loop is:

1. Collect 30–50 real inputs and hand-label the expected outputs (including 5–10 that should be refused).
2. Write a script that runs the prompt in batch and compares against the labels.
3. Change one variable at a time and record the score delta.
4. Stop when the score plateaus — beyond that you're just overfitting the sample.

The loop feels slow, but it answers the one question that matters: **did this change make it better, or just make this one sample better**.

## Five common mistakes

- **Conflicting instructions**: "be as detailed as possible" and "no more than 50 words" together force the model to pick one at random.
- **Negated instructions**: "don't mention the price" often fails because the model has to activate the concept "price" first. Rephrase positively: "only discuss features and usage".
- **Stuffing every rule into `system`**: past a certain length, compliance with the later half drops noticeably. Anything code can enforce (length, format, enums) shouldn't live in the prompt.
- **No failure path**: if you don't tell the model what to do when information is insufficient, it will invent something.
- **Treating prompts as secrets**: prompts belong in version control, reviewed alongside code. They *are* the interface definition of the system.

## Wrapping up

The endpoint of prompt engineering isn't "talking better" — it's **translating a vague requirement into a spec the model can execute reliably**. Role, constraints, format, examples, evaluation: do those five and prompts stop being mysticism and start being engineering.
