import { useEffect, useState } from 'react';
import type { EditTaskInput, NewTaskInput, Task, TaskPriority } from '../types';
import { DEFAULT_PROJECTS } from '../types';

export type TaskFormMode =
  | { kind: 'create' }
  | { kind: 'edit'; task: Task };

interface Props {
  open: boolean;
  mode: TaskFormMode;
  onClose: () => void;
  onSubmit: (input: NewTaskInput | EditTaskInput) => void;
}

const PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export function TaskFormDialog({ open, mode, onClose, onSubmit }: Props) {
  const isEdit = mode.kind === 'edit';
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode.kind === 'edit') {
      setTitle(mode.task.title);
      setProject(mode.task.project);
      setPriority(mode.task.priority);
    } else {
      setTitle('');
      setProject(DEFAULT_PROJECTS[0]);
      setPriority('medium');
    }
  }, [open, mode]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedProject = project.trim();
    if (!trimmedTitle) {
      setError('任务标题不能为空');
      return;
    }
    if (trimmedTitle.length > 100) {
      setError('任务标题不能超过 100 字符');
      return;
    }
    if (!trimmedProject) {
      setError('项目不能为空');
      return;
    }
    if (trimmedProject.length > 50) {
      setError('项目名不能超过 50 字符');
      return;
    }
    onSubmit({ title: trimmedTitle, project: trimmedProject, priority });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold mb-4">
          {isEdit ? '编辑任务' : '新建任务'}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">任务标题 *</label>
            <input
              autoFocus
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：整理本周客户例会纪要"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">所属项目 *</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              list="pm-task-board-projects"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="输入或选择项目"
              maxLength={60}
            />
            <datalist id="pm-task-board-projects">
              {DEFAULT_PROJECTS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">优先级</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={
                    'px-3 py-1.5 rounded-lg text-sm border ' +
                    (priority === p.value
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50')
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-brand-600 text-white hover:bg-brand-700"
            >
              {isEdit ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
