import { useMemo, useState } from 'react';
import { Board } from './components/Board';
import { StatsCards } from './components/StatsCards';
import { TaskFormDialog, type TaskFormMode } from './components/TaskFormDialog';
import { Toast } from './components/Toast';
import { WeeklyReportPanel } from './components/WeeklyReportPanel';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import type { Task } from './types';
import { computeStats } from './utils/stats';

export default function App() {
  const { tasks, storageWarning, addTask, updateTask, moveToStatus, removeTask } = useTasks();
  const { toast, show } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<TaskFormMode>({ kind: 'create' });

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const openCreate = () => {
    setDialogMode({ kind: 'create' });
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setDialogMode({ kind: 'edit', task });
    setDialogOpen(true);
  };

  const handleSubmit = (input: { title: string; project: string; priority: Task['priority'] }) => {
    try {
      if (dialogMode.kind === 'edit') {
        updateTask(dialogMode.task.id, input);
        show('任务已更新', 'success');
      } else {
        addTask(input);
        show('任务已创建', 'success');
      }
    } catch (err) {
      show((err as Error).message, 'error');
    }
  };

  const handleDelete = (id: string) => {
    removeTask(id);
    show('任务已删除', 'info');
  };

  const handleMove = (id: string, next: Task['status']) => {
    moveToStatus(id, next);
  };

  return (
    <div className="min-h-full">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">PM 任务看板</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              多客户项目任务管理 · 一键生成周报（数据仅存于浏览器 LocalStorage）
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
          >
            + 新建任务
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {storageWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2">
            {storageWarning}
          </div>
        )}
        <StatsCards stats={stats} />
        <WeeklyReportPanel tasks={tasks} onToast={show} />
        <Board tasks={tasks} onMove={handleMove} onEdit={openEdit} onDelete={handleDelete} />
      </main>

      <TaskFormDialog
        open={dialogOpen}
        mode={dialogMode}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <Toast toast={toast} />
    </div>
  );
}
