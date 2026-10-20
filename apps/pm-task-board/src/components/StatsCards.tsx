import type { Stats } from '../utils/stats';

interface Props {
  stats: Stats;
}

export function StatsCards({ stats }: Props) {
  const rateText = stats.completionRate === null ? '—' : `${stats.completionRate}%`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="text-xs text-slate-500 uppercase tracking-wide">任务总数</div>
        <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</div>
        <div className="mt-1 text-xs text-slate-500">包含待办 / 进行中 / 已完成</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="text-xs text-slate-500 uppercase tracking-wide">本周完成率</div>
        <div className="mt-2 text-3xl font-semibold text-brand-600">{rateText}</div>
        <div className="mt-1 text-xs text-slate-500">
          本周已完成 {stats.weekDoneCount} / 本周涉及 {stats.weekInvolvedCount}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="text-xs text-slate-500 uppercase tracking-wide">按项目分布</div>
        <div className="mt-2 space-y-1">
          {stats.projectDistribution.length === 0 ? (
            <div className="text-slate-400 text-sm">暂无任务</div>
          ) : (
            stats.projectDistribution.map((p) => (
              <div key={p.project} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{p.project}</span>
                <span className="text-slate-500">{p.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
