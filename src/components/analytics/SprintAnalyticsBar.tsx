import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { SprintStats } from '../../types/kanban';

export interface SprintAnalyticsBarProps {
  stats: SprintStats;
}

export const SprintAnalyticsBar: React.FC<SprintAnalyticsBarProps> = ({ stats }) => {
  return (
    <section className="px-6 py-2.5 border-b border-linear-border/60 bg-linear-card/60 select-none">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-white font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-linear-purple" />
            <span>Прогресс спринта:</span>
            <span className="text-linear-purple font-bold">{stats.percentval}%</span>
          </div>
          <span className="text-[11px] text-linear-muted font-mono">
            ({stats.donepoints} из {stats.totalpoints} pt выполнено)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-linear-muted flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Готово: <strong className="text-white">{stats.donepoints}pt</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-linear-purple" />
            В работе: <strong className="text-white">{stats.inprogresspoints}pt</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            К выполнению: <strong className="text-white">{stats.todopoints}pt</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Бэклог: <strong className="text-white">{stats.backlogpoints}pt</strong>
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-linear-subtle rounded-full mt-2 overflow-hidden flex">
        {stats.totalpoints > 0 && (
          <>
            <div
              style={{ width: `${(stats.donepoints / stats.totalpoints) * 100}%` }}
              className="h-full bg-emerald-400 transition-all duration-300"
            />
            <div
              style={{ width: `${(stats.inprogresspoints / stats.totalpoints) * 100}%` }}
              className="h-full bg-linear-purple transition-all duration-300"
            />
            <div
              style={{ width: `${(stats.todopoints / stats.totalpoints) * 100}%` }}
              className="h-full bg-amber-400 transition-all duration-300"
            />
            <div
              style={{ width: `${(stats.backlogpoints / stats.totalpoints) * 100}%` }}
              className="h-full bg-slate-600 transition-all duration-300"
            />
          </>
        )}
      </div>
    </section>
  );
};
