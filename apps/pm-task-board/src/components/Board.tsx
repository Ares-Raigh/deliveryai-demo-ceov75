import { useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { groupByStatus } from '../utils/taskOps';

interface Props {
  tasks: Task[];
  onMove: (id: string, next: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: Array<{ status: TaskStatus; label: string; accent: string }> = [
  { status: 'todo', label: '待办', accent: 'text-slate-700' },
  { status: 'doing', label: '进行中', accent: 'text-brand-600' },
  { status: 'done', label: '已完成', accent: 'text-emerald-600' },
];

export function Board({ tasks, onMove, onEdit, onDelete }: Props) {
  const grouped = groupByStatus(tasks);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const list = grouped[col.status];
        const isOver = dragOver === col.status;
        return (
          <div
            key={col.status}
            className={
              'rounded-xl border bg-slate-50 p-3 min-h-[200px] transition-colors ' +
              (isOver ? 'border-brand-500 bg-brand-50/60' : 'border-slate-200')
            }
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOver !== col.status) setDragOver(col.status);
            }}
            onDragLeave={() => {
              if (dragOver === col.status) setDragOver(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain');
              setDragOver(null);
              if (id) onMove(id, col.status);
            }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className={`text-sm font-semibold ${col.accent}`}>{col.label}</div>
              <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                {list.length}
              </div>
            </div>
            <div className="space-y-2">
              {list.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">
                  拖入任务或点击按钮移动到此处
                </div>
              ) : (
                list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onMove={(next) => onMove(t.id, next)}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t.id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', t.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragOver(null)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
