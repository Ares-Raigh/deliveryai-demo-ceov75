/**
 * 生成简单唯一 ID：时间戳 + 随机串。不依赖 crypto（兼容非安全上下文）。
 */
export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}`;
}
