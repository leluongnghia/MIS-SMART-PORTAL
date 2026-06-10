export const getScoreColorClass = (score: number | string): string => {
  const numScore = Number(score);
  if (isNaN(numScore)) return 'text-slate-800';
  if (numScore >= 80) return 'text-emerald-500';
  if (numScore >= 50) return 'text-amber-500';
  return 'text-rose-500';
};

export const getScoreColorDarkClass = (score: number | string): string => {
  const numScore = Number(score);
  if (isNaN(numScore)) return 'text-slate-300';
  if (numScore >= 80) return 'text-emerald-400';
  if (numScore >= 50) return 'text-amber-400';
  return 'text-rose-400';
};

export const getScoreBgClass = (score: number | string): string => {
  const numScore = Number(score);
  if (isNaN(numScore)) return 'bg-slate-500';
  if (numScore >= 80) return 'bg-emerald-500';
  if (numScore >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};
