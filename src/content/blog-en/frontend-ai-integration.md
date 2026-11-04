The model's capability is decided on the backend, but how "fast, stable, and human" a product feels to a user is almost entirely the frontend's job.

This post isn't about which model to pick — it's about one concrete task: wiring up a streaming chat endpoint properly.

## Two ways to stream

- **SSE (Server-Sent Events)**: the server sends `text/event-stream`; browsers support it natively. One-directional push, the most common choice.
- **fetch + ReadableStream**: read the response body as a stream directly. Works with POST too, and gives you more control.

Most SDK "streaming" is really the second one under the hood. Writing it once by hand is how you learn how many details are hiding in it.

## A read loop you can actually ship

```javascript
export async function streamChat({ messages, signal, onDelta, onDone, onError }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
      signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // stream: true keeps multi-byte characters from being mangled at chunk boundaries
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() ?? ''; // the last chunk may be incomplete; keep it for next round

      for (const raw of events) {
        const line = raw.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;

        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          onDone();
          return;
        }

        try {
          const json = JSON.parse(data);
          if (json.delta) onDelta(json.delta);
        } catch {
          // a single bad chunk shouldn't kill the whole stream
        }
      }
    }

    onDone();
  } catch (err) {
    if (err.name === 'AbortError') return; // user cancelled; not an error
    onError(err);
  }
}
```

Three things here are non-negotiable — miss any one and it falls over in production:

1. **`decoder.decode(value, { stream: true })`**: without that flag, multi-byte characters that span chunk boundaries come out garbled (`�`).
2. **Split events on `\n\n` and keep the leftover buffer**: TCP chunking has no relationship to SSE event boundaries.
3. **`AbortController`**: when the user hits "stop generating", you must actually kill the request — not just stop rendering.

## A state machine beats a pile of booleans

Beginners tend to write three booleans — `isLoading`, `isDone`, `hasError` — and combine them into eight states, five of which are illegal. A state machine needs only four:

```
idle → streaming → done
              ↘ error
```

The constraints that matter:

- Disable the send button while `streaming`, so concurrent requests can't scramble message order.
- In the `error` state, keep the user's input and allow a retry — don't clear it.
- Retry should reuse the previous context instead of making the user type everything again.

## Performance: don't re-render the whole DOM on every token

The first version of streaming always ends up "re-render the entire markdown on every delta". On long answers that produces visible jank and flicker.

Three effective moves:

- **Batch per frame**: accumulate deltas in a buffer and render once per `requestAnimationFrame`.
- **Incremental parsing**: append only the new portion as HTML rather than re-parsing the whole thing.
- **Delay code-block highlighting**: don't highlight unclosed code blocks mid-stream; do it once after `done`.

```javascript
let pending = '';
let raf = 0;

function push(delta) {
  pending += delta;
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    render(pending);
    pending = '';
  });
}
```

## Gotchas I only found after shipping

- **Proxy timeouts**: Nginx cuts idle streams after 60s by default, chopping long answers in half. Disable proxy buffering and relax the timeout.
- **Retry storms**: automatic retries plus manual clicks fire multiple requests at once. Either dedupe at the request level or allow only one in-flight request.
- **Mobile backgrounding**: on iOS, a stream silently dies after the app is backgrounded. Detect it and offer "generation was interrupted — tap to continue".
- **Markdown injection**: anything the model outputs must be sanitized before `innerHTML`, or a single `<img onerror>` becomes XSS.

## The security boundary

The frontend should never hold an API key or call a model vendor directly. The standard approach is a backend you control that proxies the call — auth, rate limiting, logging, and content filtering all happen server-side, and the frontend only ever talks to a controlled `/api/chat`.

## Wrapping up

Streaming itself isn't hard; making it *stable* is. Chunk decoding, event boundaries, cancellation, retries, render throttling — those details are what separate an AI feature that "demos well" from one that can ship.
