---
title: '前端接入大模型：流式输出、状态机与失败处理'
titleEn: 'Connecting the Frontend to LLMs: Streaming, State Machines, and Failure Handling'
description: '把 AI 能力做得"能用"，前端要做的不只是调接口。流式输出的正确写法、对话状态机、以及那些上线后才发现的坑。'
descriptionEn: 'Making AI features actually usable is more than calling an API. The right way to stream, the conversation state machine, and the bugs you only meet after shipping.'
pubDate: 2026-07-30
tags: ['Frontend', 'AI', 'JavaScript']
---

模型能力由后端决定，但用户感知到的"快不快、稳不稳、像不像人"，几乎全在前端。

这篇文章不讲怎么选模型，只讲一件具体的事：**怎么把一个流式对话接口接好**。

## 流式输出的两种方式

- **SSE（Server-Sent Events）**：服务端 `text/event-stream`，浏览器原生支持，单向推送，最常用。
- **fetch + ReadableStream**：直接读响应体的流，POST 请求也能用，控制力更强。

很多 SDK 的"流式"其实就是第二种。自己手写一遍，才知道中间有多少细节。

## 一个能上线的读取循环

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
      throw new Error(`请求失败：${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // stream: true 保证多字节汉字不会在分片处被截断
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() ?? ''; // 最后一段可能不完整，留到下次

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
          // 单个分片解析失败不该终止整个流
        }
      }
    }

    onDone();
  } catch (err) {
    if (err.name === 'AbortError') return; // 用户主动停止，不算错误
    onError(err);
  }
}
```

这里有三个必须处理的点，缺一个都会在真实环境翻车：

1. **`decoder.decode(value, { stream: true })`**：不加这个参数，跨越分片边界的汉字会被解成乱码（`�`）。
2. **按 `\n\n` 切事件，并保留残余 buffer**：TCP 分片和 SSE 事件边界没有任何对应关系。
3. **`AbortController`**：用户点"停止生成"时，必须真的掐断请求，而不是停止渲染。

## 状态机比一堆布尔值可靠

新手常写 `isLoading`、`isDone`、`hasError` 三个布尔量，然后组合出 8 种状态，其中 5 种是非法的。用状态机只需要四个状态：

```
idle → streaming → done
              ↘ error
```

对应的关键约束：

- `streaming` 期间禁用发送按钮，避免并发请求把消息顺序打乱。
- `error` 状态下保留用户输入，允许重试，不要清空。
- 重试要能复用上一次的上下文，而不是让用户重打一遍。

## 性能：不要每来一个字就重排整个 DOM

流式输出的第一版很容易写成"每次 delta 都重新渲染整段 Markdown"。在长回答里，这会造成明显的卡顿和闪烁。

三个有效手段：

- **按帧合并**：把 delta 累积到 buffer，用 `requestAnimationFrame` 每帧渲染一次。
- **增量解析**：只把新增部分转成 HTML 追加，而不是整段重解析。
- **代码块延后高亮**：流式过程中的未闭合代码块不高亮，等 `done` 后再统一处理。

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

## 上线后才发现的坑

- **代理超时**：Nginx 默认 60s 无响应会断流，长回答会被拦腰截断。需要关闭 proxy buffering 并放宽超时。
- **重试风暴**：前端自动重试 + 用户手动点击，会同时打出多个请求。要么加请求级去重，要么只允许一个在途请求。
- **移动端切后台**：iOS 上切后台一段时间后流会静默中断，需要检测并提示"生成已中断，点击继续"。
- **Markdown 注入**：模型输出的内容必须经过 sanitize 再 `innerHTML`，否则一个 `<img onerror>` 就是 XSS。

## 安全边界

前端永远不该持有 API Key，也不该直接调用模型厂商接口。标准做法是由自己的后端代理：鉴权、限流、日志、内容过滤都在后端完成，前端只面对一个受控的 `/api/chat`。

## 小结

流式输出本身不难，难的是把它做得稳定：分片解码、事件边界、中断、重试、渲染节流。这些细节决定了一个 AI 产品是"能演示"还是"能上线"。
