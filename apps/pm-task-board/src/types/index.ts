export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

export type NewTaskInput = Pick<Task, 'title' | 'project' | 'priority'>;
export type EditTaskInput = Pick<Task, 'title' | 'project' | 'priority'>;

export const DEFAULT_PROJECTS: readonly string[] = ['奔驰', '宝马'] as const;

export const STORAGE_KEYS = {
  tasks: 'pm-task-board:tasks',
  version: 'pm-task-board:version',
} as const;

export const STORAGE_VERSION = 1;
