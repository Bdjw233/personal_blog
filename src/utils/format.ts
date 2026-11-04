/**
 * 日期与阅读时长工具
 */

/** 用 UTC 取值，避免不同时区构建时出现「差一天」 */
export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 中文按字数、英文按词数估算阅读时长（分钟）。
 * 中文 ~350 字/分钟，英文 ~220 词/分钟。
 */
export function readingTime(body: string): number {
  const cjk = (body.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (body.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9_]+/g) ?? []).length;
  const minutes = cjk / 350 + words / 220;
  return Math.max(1, Math.round(minutes));
}
