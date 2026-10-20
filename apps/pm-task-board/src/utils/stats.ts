import type { Task } from '../types';
import { getWeekRange } from './dateUtils';

export interface Stats {
  total: number;
  weekDoneCount: number;
  weekInvolvedCount: number;
  completionRate: number | null; // 0~100，四舍五入整数；分母为 0 时 null
  projectDistribution: Array<{ project: string; count: number }>;
}

/**
 * 计算顶部三张统计卡所需的数据。
 * 本周完成率口径：
 *   分子：本周窗口内（按 getWeekRange）当前 status=done 且 updatedAt 在本周内的任务数
 *         （与周报"本周已完成"保持一致）；
 *   分母：本周涉及任务 = createdAt 或 updatedAt 落在本周窗口内的任务总数（不限 status）；
 *   取整：四舍五入到整数；分母为 0 时返回 null，UI 显示占位符。
 */
export function computeStats(tasks: readonly Task[], now: Date | number = new Date()): Stats {
  const { start, end } = getWeekRange(now);
  const inRange = (ts: number) => ts >= start && ts <= end;

  let weekDoneCount = 0;
  let weekInvolvedCount = 0;
  const projectMap = new Map<string, number>();

  for (const t of tasks) {
    // 项目分布统计全部任务
    projectMap.set(t.project, (projectMap.get(t.project) ?? 0) + 1);

    const involved = inRange(t.createdAt) || inRange(t.updatedAt);
    if (involved) {
      weekInvolvedCount += 1;
      if (t.status === 'done' && inRange(t.updatedAt)) {
        weekDoneCount += 1;
      }
    }
  }

  const completionRate =
    weekInvolvedCount === 0
      ? null
      : Math.round((weekDoneCount / weekInvolvedCount) * 100);

  const projectDistribution = Array.from(projectMap.entries())
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.project.localeCompare(b.project, 'zh-CN');
    });

  return {
    total: tasks.length,
    weekDoneCount,
    weekInvolvedCount,
    completionRate,
    projectDistribution,
  };
}
