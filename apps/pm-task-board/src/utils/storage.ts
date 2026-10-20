import type { Task } from '../types';
import { STORAGE_KEYS, STORAGE_VERSION } from '../types';

export interface StorageLoadResult {
  tasks: Task[];
  warning: string | null; // 持久化不可用或解析失败时的提示文案
}

function canUseLocalStorage(): boolean {
  try {
    const k = '__pm_tb_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadTasks(): StorageLoadResult {
  if (typeof window === 'undefined') {
    return { tasks: [], warning: null };
  }
  if (!canUseLocalStorage()) {
    return { tasks: [], warning: '当前浏览器未启用 LocalStorage（隐私模式/被禁用），数据仅在本次会话内有效。' };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.tasks);
    if (!raw) {
      // 写入版本号
      window.localStorage.setItem(STORAGE_KEYS.version, String(STORAGE_VERSION));
      return { tasks: [], warning: null };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { tasks: [], warning: '本地数据格式异常，已按空数据启动。' };
    }
    // 基本字段过滤，避免脏数据导致运行时错误
    const tasks: Task[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as Task).id === 'string' &&
        typeof (item as Task).title === 'string' &&
        typeof (item as Task).project === 'string'
      ) {
        tasks.push(item as Task);
      }
    }
    return { tasks, warning: null };
  } catch (err) {
    return {
      tasks: [],
      warning: `读取本地数据失败：${(err as Error).message}，已按空数据启动。`,
    };
  }
}

export function saveTasks(tasks: readonly Task[]): string | null {
  if (typeof window === 'undefined') return null;
  if (!canUseLocalStorage()) {
    return 'LocalStorage 不可用，数据未持久化。';
  }
  try {
    window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    window.localStorage.setItem(STORAGE_KEYS.version, String(STORAGE_VERSION));
    return null;
  } catch (err) {
    return `写入本地数据失败：${(err as Error).message}`;
  }
}
