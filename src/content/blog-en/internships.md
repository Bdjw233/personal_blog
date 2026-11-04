Since 2022 I've held six roles: part-time IT support, frontend, full-stack, embedded, security ops, and LLM data. Very different domains, one thing in common: each stint was short, so I had to get productive fast.

This post skips the usual "work hard" and "be proactive" platitudes. Everything here is concrete and operational.

## 1. Draw the map before you touch the code

For my first two days in a new codebase I write no business code. I only do three things:

1. **Find the entry point**: where a request enters, which layers it passes through, and which table it finally lands in.
2. **Trace one path end to end**: take the simplest feature and walk it from a click to a database write, printing breakpoints or logs along the way.
3. **Draw a diagram**: modules, dependencies, data flow. Hand-drawn is fine. Drawing it will show you exactly which concepts you're missing.

Without that map, changing code is changing blind. With it, you at least know who a change can hurt.

## 2. Read code from the data, not from `main`

Beginners start reading from `main` or the router file and drown in framework boilerplate. I prefer starting from the **data structures**:

- Table schemas / API response shapes / core object definitions
- Then where that data gets written and where it gets read
- Only then the business logic

Data structures are stable; business logic changes. Understand the stable part first and the moving parts become just combinations of it.

## 3. How to ask a good question

Asking questions is normal as an intern, but the quality of the question determines whether people keep answering.

The bad version: "It doesn't run. What do I do?"

A good question carries four things:

- What I'm trying to do
- What I've tried
- What I observed (the full error, reproduction steps)
- What I *think* the cause might be

The fourth one matters most. Even a wrong guess shows you've thought about it. A question that carries a hypothesis lets the other person resolve it in one sentence instead of debugging from scratch.

## 4. Replace "done" with "delivered"

This is where I've eaten the most crow. Early on I'd ship a feature as soon as it ran, then get asked:

- Did you handle the edge cases?
- What does the user see on failure?
- How does anyone verify it's correct?

Later I set a delivery checklist. After finishing a feature I must be able to answer:

| Question | What it means |
| --- | --- |
| How to verify | A reproducible verification step, or a test |
| What happens on failure | Error messages, retries, degradation |
| Who's affected | Which modules change, who needs to know |
| How to roll back | How to get back to the previous version |

Answer all four and "done" becomes "delivered".

## 5. Output forces input

At the end of every internship I write a retrospective: what I did, what I ran into, what I'd do differently next time. Writing it exposes all the places where I only *thought* I understood something.

That's part of why I started this blog — **if you can't write it clearly, you haven't thought it through**.

## 6. Cross-domain experience is an asset — if you can transfer it

Embedded to frontend, security ops to data: they look unrelated. But what actually carries over is:

- **Debugging**: the method is the same everywhere — narrow the scope, binary search, compare working vs broken.
- **Engineering habits**: version control, logging, tests, documentation.
- **Working with people**: asking for requirements clearly, reporting progress clearly, raising risks early.

Tech stacks go stale. These three don't.

## For anyone hunting their first internship

- **One complete project beats five clones**: a single project you took from requirements to launch and can justify every decision is worth more than five tutorial copies.
- **Don't shy away from grunt work**: data labeling, inspection rounds, copy edits — those hide the most direct understanding of the business.
- **Record your output**: three lines a week — what I did, what I solved, what I learned. That's your interview material.
- **Interviews are two-way**: ask what the team is doing, what you'll own, whether someone will mentor you. The cost of asymmetric information is usually paid by the intern.

## Wrapping up

Ramping up fast isn't talent; it's a process: draw the map, read from the data, ask with a hypothesis, close to a delivery standard, and test your understanding through writing.

It won't make you the smartest person in the room, but it will make sure you don't waste a single stint.
