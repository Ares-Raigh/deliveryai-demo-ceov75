export interface WeekRange {
  start: number; // ms timestamp，周一 00:00:00.000
  end: number;   // ms timestamp，当前 now
  startDate: Date;
  endDate: Date;
}

/**
 * 返回浏览器本地时区的"本周"时间范围：周一 00:00:00.000 至 now。
 * 注意：getDay() 返回 0(周日)~6(周六)，周一为 1；将周日视为上周最后一天。
 */
export function getWeekRange(now: Date | number = new Date()): WeekRange {
  const d = typeof now === 'number' ? new Date(now) : new Date(now.getTime());
  const day = d.getDay(); // 0=Sun,1=Mon,...6=Sat
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - diffToMonday);
  return {
    start: monday.getTime(),
    end: d.getTime(),
    startDate: monday,
    endDate: new Date(d.getTime()),
  };
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isInThisWeek(ts: number, now: Date | number = new Date()): boolean {
  const { start, end } = getWeekRange(now);
  return ts >= start && ts <= end;
}
