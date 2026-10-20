import type { Task, TaskStatus, NewTaskInput, EditTaskInput } from '../types';
import { generateId } from './id';

/**
 * 纯函数：创建新任务，默认 status=todo，时间戳统一为 now。
 */
export function createTask(input: NewTaskInput, now: number = Date.now()): Task {
  const title = input.title.trim();
  const project = input.project.trim();
  if (!title) throw new Error('任务标题不能为空');
  if (title.length > 100) throw new Error('任务标题不能超过 100 字符');
  if (!project) throw new Error('项目不能为空');
  if (project.length > 50) throw new Error('项目名不能超过 50 字符');
  return {
    id: generateId(),
    title,
    project,
    priority: input.priority,
    status: 'todo',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 纯函数：切换任务状态，返回新对象，更新 updatedAt。
 * - 若 nextStatus 与当前 status 相同，仍返回新对象但不更新时间（幂等、不打断排序语义），
 *   调用方可视情况不替换。
 */
export function changeTaskStatus(
  task: Task,
  nextStatus: TaskStatus,
  now: number = Date.now(),
): Task {
  if (task.status === nextStatus) {
    return { ...task };
  }
  return {
    ...task,
    status: nextStatus,
    updatedAt: now,
  };
}

/**
 * 纯函数：编辑任务（title/project/priority），不允许通过此函数修改 status。
 */
export function editTask(task: Task, patch: EditTaskInput, now: number = Date.now()): Task {
  const title = patch.title.trim();
  const project = patch.project.trim();
  if (!title) throw new Error('任务标题不能为空');
  if (title.length > 100) throw new Error('任务标题不能超过 100 字符');
  if (!project) throw new Error('项目不能为空');
  if (project.length > 50) throw new Error('项目名不能超过 50 字符');
  return {
    ...task,
    title,
    project,
    priority: patch.priority,
    updatedAt: now,
  };
}

/**
 * 按 updatedAt 倒序（最近更新在前）。
 */
export function sortTasksByUpdatedAtDesc(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function groupByStatus(tasks: readonly Task[]): Record<TaskStatus, Task[]> {
  const sorted = sortTasksByUpdatedAtDesc(tasks);
  return {
    todo: sorted.filter((t) => t.status === 'todo'),
    doing: sorted.filter((t) => t.status === 'doing'),
    done: sorted.filter((t) => t.status === 'done'),
  };
}
