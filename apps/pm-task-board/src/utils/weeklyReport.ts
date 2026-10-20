import type { Task, TaskPriority } from '../types';
import { formatDate, getWeekRange } from './dateUtils';

export interface WeeklyReportOptions {
  now?: Date | number;
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

/**
 * 周报纳入规则（详见 README）：
 * - 仅纳入 status === 'done' 或 'doing' 的任务；
 * - 任务的 updatedAt 必须落在本周窗口内（周一 00:00:00 ~ now），代表本周内有状态/字段动作；
 * - todo 一律不纳入。
 */
export function collectWeeklyReportTasks(
  tasks: readonly Task[],
  now: Date | number = new Date(),
): { done: Task[]; doing: Task[] } {
  const { start, end } = getWeekRange(now);
  const inRange = (ts: number) => ts >= start && ts <= end;
  const done: Task[] = [];
  const doing: Task[] = [];
  for (const t of tasks) {
    if (!inRange(t.updatedAt)) continue;
    if (t.status === 'done') done.push(t);
    else if (t.status === 'doing') doing.push(t);
  }
  const byUpdatedDesc = (a: Task, b: Task) => b.updatedAt - a.updatedAt;
  done.sort(byUpdatedDesc);
  doing.sort(byUpdatedDesc);
  return { done, doing };
}

function renderSection(title: string, items: readonly Task[], withPriority: boolean): string {
  const lines: string[] = [`## ${title}`];
  if (items.length === 0) {
    lines.push('- 无');
    return lines.join('\n');
  }
  for (const t of items) {
    const suffix = withPriority ? `（优先级：${PRIORITY_LABEL[t.priority]}）` : '';
    lines.push(`- [${t.project}] ${t.title}${suffix}`);
  }
  return lines.join('\n');
}

/**
 * 纯函数：生成周报 Markdown。便于单元测试。
 */
export function formatWeeklyReport(
  tasks: readonly Task[],
  now: Date | number = new Date(),
): string {
  const { startDate, endDate } = getWeekRange(now);
  const { done, doing } = collectWeeklyReportTasks(tasks, now);
  const header = `# 周报（${formatDate(startDate)} ~ ${formatDate(endDate)}）`;
  const doneSection = renderSection('本周已完成', done, false);
  const doingSection = renderSection('进行中', doing, true);
  return `${header}\n\n${doneSection}\n\n${doingSection}\n`;
}
