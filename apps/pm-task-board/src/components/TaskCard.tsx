import { useState } from 'react';
import type { Task, TaskStatus } from '../types';

interface Props {
  task: Task;
  onMove: (next: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const PRIORITY_META: Record<Task['priority'], { label: string; cls: string }> = {
  high: { label: '高', cls: 'bg-rose-100 text-rose-700' },
  medium: { label: '中', cls: 'bg-amber-100 text-amber-700' },
  low: { label: '低', cls: 'bg-slate-100 text-slate-600' },
};

const STATUS_BUTTONS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'todo', label: '待办' },
  { status: 'doing', label: '进行中' },
  { status: 'done', label: '已完成' },
];

export function TaskCard({ task, onMove, onEdit, onDelete, onDragStart, onDragEnd }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const p = PRIORITY_META[task.priority];
  return (
    <div
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 hover:shadow-md transition-shadow"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-task-id={task.id}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-slate-900 text-sm leading-5 break-words">
          {task.title}
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${p.cls}`}>
          {p.label}
        </span>
      </div>
      <div className="mt-2 text-xs text-slate-500">项目：{task.project}</div>
      <div className="mt-3 flex flex-wrap gap-1">
        {STATUS_BUTTONS.map((b) => (
          <button
            key={b.status}
            onClick={() => onMove(b.status)}
            disabled={task.status === b.status}
            className={
              'text-xs px-2 py-1 rounded-md border ' +
              (task.status === b.status
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-brand-50 hover:border-brand-500 hover:text-brand-700')
            }
          >
            {b.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-2 text-xs">
        <button
          onClick={onEdit}
          className="text-slate-500 hover:text-brand-600"
        >
          编辑
        </button>
        {confirmingDelete ? (
          <>
            <button
              onClick={() => {
                setConfirmingDelete(false);
                onDelete();
              }}
              className="text-rose-600 font-medium"
            >
              确认删除
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-slate-500"
            >
              取消
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="text-slate-500 hover:text-rose-600"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}
