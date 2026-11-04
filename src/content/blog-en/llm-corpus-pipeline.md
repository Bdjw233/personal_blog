A model's ceiling is set by data and compute together, but data is usually what separates good from great. The same web scrape, the same fine-tune — how carefully you process the corpus can move the result by a whole tier.

I spent eight months at Whale Cloud in a big-data / LLM-data role doing exactly this: corpus curation, cleaning, and preprocessing. This post follows the pipeline in order, spelling out the concrete steps, the judgment calls, and the traps I hit along the way.

## What a pipeline actually looks like

The most important mindset shift is to treat the corpus as a data pipeline, not a one-off script. The whole chain splits into five stages:

**Collection → Normalization → Deduplication → Filtering → Mixing & packing**

Every stage should produce an intermediate artifact that is verifiable and rollback-able. That way, when training quality drops, you can locate whether "dedup was too aggressive" or "one source's noise wasn't cleaned" — instead of staring at a pile of already-mixed data with no idea where it went wrong.

## 1. Normalization: make the same thing look the same

Normalization isn't about making things pretty; it's about forcing every downstream rule to face a finite set of forms.

Common dirt you'll meet:

| Type | Example | Handling |
| --- | --- | --- |
| Full-width / half-width mix | `ＡＩ（２０２５）` | Unicode NFKC normalization |
| Extra whitespace & newlines | 5 blank lines in a row, trailing spaces | Collapse whitespace, keep paragraph boundaries |
| HTML residue | `&nbsp;`, stray `<div>` fragments | Decode entities, then strip tags |
| Control characters | `\x00`, zero-width spaces | Filter by allow-list |
| Encoding corruption | `æ–‡æœ¬` | Detect and drop — don't try to repair |

One easy-to-miss point: **normalization must happen before deduplication**. Otherwise the same document in two spellings counts as two documents, your dedup rate looks artificially low, and training sees the same content twice.

## 2. Deduplication: three layers, not one cut

Dedup has the highest payoff and is the easiest to overdo. I usually do three layers:

1. **Exact dedup**: hash the normalized text with SHA-1 and drop repeats. Nearly free — run it first.
2. **Near-duplicate dedup**: SimHash or MinHash + LSH. Reposts, template pages, and the same document published many times all get caught here.
3. **Paragraph-level dedup**: the disclaimers, nav text, and copyright footers that repeat across long documents.

A lot of people skip the third layer. If a document is 80% body and 20% boilerplate footer, document-level dedup alone leaves those footers repeating across thousands of documents — and the model memorizes them as high-frequency "knowledge".

The trap here is the threshold. Set SimHash's Hamming distance too loose and different articles on the same topic get merged, and your data volume cliffs; too tight and template pages survive. My approach: hand-label 200 pairs, plot the precision/recall curve, then pick the threshold — never guess a number by feel.

## 3. Filtering: rules first, a model as the safety net

Order filtering rules by cost, cheapest first:

- **Length**: documents that are too short (< 50 chars) or too long (> 50k chars) are usually not normal content.
- **Language**: a lightweight language detector drops documents in the wrong language. For multilingual corpora, keep the language label — don't discover mid-mixing that another language leaked in.
- **Symbol ratio**: too high a share of punctuation, digits, or special characters usually means table residue or garbage.
- **Repeated n-gram ratio**: too many internal repeats is usually a scraping accident.
- **Perplexity**: score documents with a small model to drop obviously incoherent text. Expensive, so it goes last.

Rules are fast, explainable, and rollback-able; the downside is they over-kill. So every rule should record **how many it dropped and why**, and you should periodically sample what got dropped. A rule of mine — "drop if digits > 30%" — once wiped the financial-data sections out of a batch of technical documents, and I only found out after two rounds of training.

## 4. Preprocessing: sample construction and mixing

Clean doesn't mean trainable. You still have to build samples to match the training objective:

- **Truncate by token, not character**. A Chinese character is roughly 0.6–1 token; mixed with English, character-based truncation produces weird length distributions.
- **Concatenation & packing**: packing several short samples into one sequence raises throughput, but separate them with a delimiter and handle the attention mask so the model doesn't learn "two unrelated texts belong together".
- **Mixing**: sample different sources by weight. The right ratio of code / encyclopedia / dialogue / web is task-dependent and usually needs a few small ablation runs to pin down.
- **Debiasing**: one over-represented source makes the model's voice monotonous — everything reads like it was written by the same person.

## 5. Reproducibility: let scripts do the repetition

The most time-consuming part of a pipeline isn't the algorithms — it's the repeated manual checking. My answer was to turn every decision into a script and validation rule:

```python
import hashlib
import unicodedata

def normalize(text: str) -> str:
    text = unicodedata.normalize('NFKC', text)
    text = text.replace('​', '').replace('﻿', '')
    lines = [line.strip() for line in text.splitlines()]
    return '\n'.join([line for line in lines if line])

def exact_hash(text: str) -> str:
    return hashlib.sha1(text.encode('utf-8')).hexdigest()

def dedup(docs):
    seen, kept, dropped = set(), [], 0
    for doc in docs:
        h = exact_hash(normalize(doc))
        if h in seen:
            dropped += 1
            continue
        seen.add(h)
        kept.append(doc)
    return kept, dropped

docs, dropped = dedup(raw_docs)
print(f'kept {len(docs)}, dropped {dropped} duplicates')
```

Every script prints a report: input count, kept count, the drop distribution per rule, and a token-length histogram. Those numbers are the dataset's "checkup" — more convincing than any verbal description.

## Retrospective

Three pieces of advice if you're just starting out with corpora:

1. **Measure before you change**. Draw the data distribution first, learn where the dirt is, then write rules.
2. **Make everything rollback-able**. Persist each stage's output separately with a version number. Being able to step back is far cheaper than re-running the whole thing.
3. **Manual sampling is non-negotiable**. Automated metrics only tell you "how much changed", not "whether it changed for the better". Read at least 100 samples every round.

Corpus work sounds unglamorous, but it's the foundation the model stands on. Turning data that "runs" into data that "ships" was the biggest thing I took away from that internship.
