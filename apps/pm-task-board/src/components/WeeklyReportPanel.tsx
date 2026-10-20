import { useMemo, useState } from 'react';
import type { Task } from '../types';
import { formatWeeklyReport } from '../utils/weeklyReport';

interface Props {
  tasks: Task[];
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

async function copyText(text: string): Promise<void> {
  // 优先 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // 降级：execCommand
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    if (!ok) throw new Error('execCommand copy 返回 false');
  } finally {
    document.body.removeChild(textarea);
  }
}

export function WeeklyReportPanel({ tasks, onToast }: Props) {
  const [markdown, setMarkdown] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const now = useMemo(() => new Date(), [generatedAt]);

  const handleGenerate = () => {
    const md = formatWeeklyReport(tasks, new Date());
    setMarkdown(md);
    setGeneratedAt(new Date());
  };

  const handleCopy = async () => {
    if (!markdown) {
      onToast('请先生成周报', 'info');
      return;
    }
    try {
      await copyText(markdown);
      onToast('周报已复制到剪贴板', 'success');
    } catch (err) {
      onToast(`复制失败：${(err as Error).message}，可手动选中文本复制`, 'error');
    }
  };

  // 占位展示：未生成时提示；生成后显示 monospaced 预览
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="text-base font-semibold text-slate-900">本周周报</div>
          <div className="text-xs text-slate-500">
            {generatedAt
              ? `生成于 ${generatedAt.toLocaleString()}（${now.toLocaleDateString()} 时的数据快照）`
              : '点击下方按钮基于当前看板生成本周 Markdown 周报'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700"
          >
            一键生成周报
          </button>
          <button
            onClick={handleCopy}
            disabled={!markdown}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            复制
          </button>
        </div>
      </div>
      <pre className="mono text-sm bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap break-words min-h-[180px] text-slate-800">
{markdown || '（点击“一键生成周报”后，这里会展示本周已完成与进行中任务的 Markdown 预览。）'}
      </pre>
    </div>
  );
}
