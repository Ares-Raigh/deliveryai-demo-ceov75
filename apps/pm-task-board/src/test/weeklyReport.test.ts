import { describe, expect, it } from 'vitest';
import { formatWeeklyReport } from '../utils/weeklyReport';
import type { Task } from '../types';

// 构造一个固定 "now"：2026-10-20(周二) 10:00 本地时间。
// 使用 UTC 构造后再换算成本地偏移，确保跨时区运行稳定。
function localNow(y: number, m: number, d: number, h = 10, min = 0): Date {
  // 直接用本地时区构造
  return new Date(y, m - 1, d, h, min, 0, 0);
}

// 生成本周一(2026-10-19) 00:00 本地时间
function makeTask(partial: Partial<Task> & Pick<Task, 'id' | 'status' | 'updatedAt'>): Task {
  return {
    title: '任务A',
    project: '奔驰',
    priority: 'medium',
    createdAt: partial.updatedAt - 10_000,
    ...partial,
  };
}

describe('formatWeeklyReport', () => {
  it('按"已完成/进行中"分组，正确添加项目前缀与进行中优先级后缀，todo 与非本周任务不纳入；空分组输出"无"', () => {
    // now 固定在 2026-10-20 周二 10:00，本周一 = 2026-10-19 00:00
    const now = localNow(2026, 10, 20, 10, 0);
    const monday = localNow(2026, 10, 19, 0, 0).getTime();
    const t1 = makeTask({
      id: '1',
      title: '整理奔驰本周例会纪要',
      project: '奔驰',
      priority: 'high',
      status: 'done',
      updatedAt: monday + 1000 * 60 * 60 * 10, // 周一 10:00
    });
    const t2 = makeTask({
      id: '2',
      title: '撰写宝马 Q4 节奏方案',
      project: '宝马',
      priority: 'medium',
      status: 'doing',
      updatedAt: monday + 1000 * 60 * 60 * 26, // 周二 02:00
    });
    const t3 = makeTask({
      id: '3',
      title: '待办项不应出现',
      project: '奔驰',
      priority: 'low',
      status: 'todo',
      updatedAt: monday + 1000 * 60 * 60 * 5,
    });
    // 上周任务（本周之前），即使 doing/done 也不纳入
    const t4 = makeTask({
      id: '4',
      title: '上周的遗留事项',
      project: '宝马',
      priority: 'low',
      status: 'done',
      updatedAt: monday - 1000 * 60 * 60 * 24, // 上周一之前
    });

    const md = formatWeeklyReport([t1, t2, t3, t4], now);
    // 日期范围：周一 2026-10-19 ~ 今日 2026-10-20
    expect(md).toContain('# 周报（2026-10-19 ~ 2026-10-20）');
    // 已完成分组
    expect(md).toContain('## 本周已完成');
    expect(md).toContain('- [奔驰] 整理奔驰本周例会纪要');
    // 已完成条目不显示优先级后缀
    expect(md).not.toContain('整理奔驰本周例会纪要（优先级');
    // 进行中分组
    expect(md).toContain('## 进行中');
    expect(md).toContain('- [宝马] 撰写宝马 Q4 节奏方案（优先级：中）');
    // todo 不出现
    expect(md).not.toContain('待办项不应出现');
    // 上周任务不出现
    expect(md).not.toContain('上周的遗留事项');
  });

  it('当某分组为空时保留分组标题并输出"无"', () => {
    const now = localNow(2026, 10, 20, 10, 0);
    const monday = localNow(2026, 10, 19, 0, 0).getTime();
    const onlyDoing = makeTask({
      id: 'a',
      title: '正在推进的事',
      project: '奔驰',
      priority: 'high',
      status: 'doing',
      updatedAt: monday + 1000 * 60 * 60,
    });
    const md = formatWeeklyReport([onlyDoing], now);
    expect(md).toMatch(/## 本周已完成\n- 无/);
    expect(md).toContain('- [奔驰] 正在推进的事（优先级：高）');
  });
});
