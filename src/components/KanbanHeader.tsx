import React from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useKanbanStore } from '../store/kanbanStore';

export const KanbanHeader: React.FC = () => {
  const { searchQuery, setSearchQuery } = useKanbanStore();

  return (
    <header className="h-14 border-b border-linear-border px-6 flex items-center justify-between select-none bg-linear-bg">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-linear-purple flex items-center justify-center font-bold text-white text-xs">
            L
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">Engineering Sprint 42</span>
          <span className="px-2 py-0.5 rounded text-[11px] bg-linear-subtle border border-linear-border text-linear-muted font-mono">
            Active
          </span>
        </div>

        <div className="h-4 w-px bg-linear-border" />

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-linear-muted" />
          <input
            type="text"
            placeholder="Filter issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 bg-linear-subtle border border-linear-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-linear-text placeholder-linear-muted focus:outline-none focus:border-linear-purple/80"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-linear-border bg-linear-card hover:bg-linear-subtle text-xs text-linear-muted hover:text-white transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Display</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-purple/15 text-linear-purple border border-linear-purple/30 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Linear Style Core</span>
        </div>
      </div>
    </header>
  );
};
