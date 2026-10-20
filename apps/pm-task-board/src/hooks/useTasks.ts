import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditTaskInput, NewTaskInput, Task, TaskStatus } from '../types';
import { changeTaskStatus, createTask, editTask } from '../utils/taskOps';
import { loadTasks, saveTasks } from '../utils/storage';
import { buildSeedTasks } from '../utils/seedData';

export interface UseTasksResult {
  tasks: Task[];
  storageWarning: string | null;
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, patch: EditTaskInput) => void;
  moveToStatus: (id: string, next: TaskStatus) => void;
  removeTask: (id: string) => void;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const hydrated = useRef(false);

  // 初始化：从 LocalStorage 加载；首次无数据时填充种子示例
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const { tasks: loaded, warning } = loadTasks();
    if (loaded.length === 0 && warning === null) {
      const seed = buildSeedTasks();
      setTasks(seed);
      const saveWarn = saveTasks(seed);
      setStorageWarning(saveWarn);
    } else {
      setTasks(loaded);
      setStorageWarning(warning);
    }
  }, []);

  // 持久化
  useEffect(() => {
    if (!hydrated.current) return;
    const warn = saveTasks(tasks);
    if (warn) setStorageWarning(warn);
  }, [tasks]);

  const addTask = useCallback((input: NewTaskInput) => {
    setTasks((prev) => {
      const task = createTask(input);
      return [task, ...prev];
    });
  }, []);

  const updateTask = useCallback((id: string, patch: EditTaskInput) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? editTask(t, patch) : t)),
    );
  }, []);

  const moveToStatus = useCallback((id: string, next: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? changeTaskStatus(t, next) : t)),
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return useMemo(
    () => ({ tasks, storageWarning, addTask, updateTask, moveToStatus, removeTask }),
    [tasks, storageWarning, addTask, updateTask, moveToStatus, removeTask],
  );
}
