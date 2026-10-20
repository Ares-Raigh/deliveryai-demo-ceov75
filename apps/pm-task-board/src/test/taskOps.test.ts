import { describe, expect, it } from 'vitest';
import { changeTaskStatus, createTask, editTask } from '../utils/taskOps';
import type { Task } from '../types';

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: '写周报',
  project: '奔驰',
  priority: 'medium',
  status: 'todo',
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  ...overrides,
});

describe('changeTaskStatus', () => {
  it('切换到不同状态时返回新对象，status 变更且 updatedAt 刷新，原对象不可变', () => {
    const original = baseTask();
    const snapshot = { ...original };
    const now = 1_700_000_100_000;
    const next = changeTaskStatus(original, 'doing', now);

    // 返回新对象，原对象未被修改
    expect(next).not.toBe(original);
    expect(original).toEqual(snapshot);

    expect(next.status).toBe('doing');
    expect(next.updatedAt).toBe(now);
    // 其他字段保留
    expect(next.id).toBe(original.id);
    expect(next.title).toBe(original.title);
    expect(next.project).toBe(original.project);
    expect(next.priority).toBe(original.priority);
    expect(next.createdAt).toBe(original.createdAt);
  });

  it('目标状态与当前相同时返回新对象但不更新 updatedAt', () => {
    const t = baseTask({ status: 'done' });
    const next = changeTaskStatus(t, 'done', t.updatedAt + 999);
    expect(next).not.toBe(t);
    expect(next.status).toBe('done');
    expect(next.updatedAt).toBe(t.updatedAt); // 不变
  });
});

describe('createTask / editTask 校验', () => {
  it('createTask 标题为空抛错', () => {
    expect(() => createTask({ title: '   ', project: '宝马', priority: 'high' })).toThrow(
      '任务标题不能为空',
    );
  });

  it('editTask 修改标题和项目并刷新 updatedAt，且不改变 status', () => {
    const t = baseTask({ status: 'doing' });
    const now = t.updatedAt + 1000;
    const edited = editTask(t, { title: '新标题', project: '宝马', priority: 'high' }, now);
    expect(edited).not.toBe(t);
    expect(edited.title).toBe('新标题');
    expect(edited.project).toBe('宝马');
    expect(edited.priority).toBe('high');
    expect(edited.status).toBe('doing');
    expect(edited.updatedAt).toBe(now);
  });
});
