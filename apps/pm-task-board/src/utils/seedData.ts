import type { Task } from '../types';
import { createTask } from './taskOps';

/**
 * 首次进入且无任何任务时的种子示例，便于直接看到看板效果。
 */
export function buildSeedTasks(now: number = Date.now()): Task[] {
  // 构造若干具有不同 status/project/priority 的示例；createdAt/updatedAt 按需微调
  const base = now;
  const t1 = createTask(
    { title: '整理本周客户例会纪要', project: '奔驰', priority: 'high' },
    base - 1000 * 60 * 60 * 24 * 2,
  );
  const t2 = createTask(
    { title: '撰写 Q4 交付节奏方案初稿', project: '宝马', priority: 'medium' },
    base - 1000 * 60 * 60 * 24 * 3,
  );
  const t3 = createTask(
    { title: '同步法务合同评审进度', project: '奔驰', priority: 'low' },
    base - 1000 * 60 * 60 * 24,
  );
  const t4 = createTask(
    { title: '盘点下周演示环境资源', project: '宝马', priority: 'medium' },
    base - 1000 * 60 * 60 * 12,
  );
  // 直接在内存里改好 status/updatedAt，模拟此前已有进度
  return [
    { ...t1, status: 'done', updatedAt: base - 1000 * 60 * 60 * 2 }, // 今天完成
    { ...t2, status: 'doing', updatedAt: base - 1000 * 60 * 30 },
    { ...t3, status: 'todo', updatedAt: t3.createdAt },
    { ...t4, status: 'doing', updatedAt: base - 1000 * 60 * 60 * 2 },
  ];
}
