import React from 'react';
import { Command, Plus, LayoutGrid, Download, AlertCircle } from 'lucide-react';
import type { Task } from '../../types/kanban';

export interface CommandPaletteProps {
  query: string;
  tasks: Task[];
  viewMode: 'board' | 'list';
  onQueryChange: (q: string) => void;
  onClose: () => void;
  onOpenCreate: () => void;
  onToggleView: () => void;
  onExportJson: () => void;
  onFilterUrgent: () => void;
  onSelectTask: (t: Task) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  query,
  tasks,
  viewMode,
  onQueryChange,
  onClose,
  onOpenCreate,
  onToggleView,
  onExportJson,
  onFilterUrgent,
  onSelectTask
}) => {
  const filteredtaskitems = React.useMemo(() => {
    if (!query.trim()) return [];
    const qlower = query.toLowerCase();
    return tasks
      .filter((t) => t.title.toLowerCase().includes(qlower) || t.identifier.toLowerCase().includes(qlower))
      .slice(0, 5);
  }, [tasks, query]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
      <div className="w-full max-w-xl rounded-xl border border-linear-border bg-linear-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-linear-border bg-linear-bg/80 gap-3">
          <Command className="w-4 h-4 text-linear-purple shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Введите команду или название задачи..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd
            onClick={onClose}
            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-linear-subtle border border-linear-border text-slate-400 cursor-pointer hover:text-white"
          >
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1 text-xs select-none">
          <div className="px-2 py-1 text-[10px] font-mono text-linear-muted uppercase tracking-wider">
            Быстрые действия
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linear-subtle text-slate-200 text-left transition"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-linear-purple" />
              <span>Создать новую задачу</span>
            </div>
            <kbd className="font-mono text-[10px] text-slate-500">C</kbd>
          </button>
          <button
            type="button"
            onClick={onToggleView}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linear-subtle text-slate-200 text-left transition"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
              <span>Переключить вид ({viewMode === 'board' ? 'на Список' : 'на Доску'})</span>
            </div>
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linear-subtle text-slate-200 text-left transition"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Экспортировать доску в JSON</span>
            </div>
          </button>
          <button
            type="button"
            onClick={onFilterUrgent}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linear-subtle text-slate-200 text-left transition"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Показать только срочные задачи</span>
            </div>
          </button>

          {filteredtaskitems.length > 0 && (
            <>
              <div className="px-2 pt-2 pb-1 text-[10px] font-mono text-linear-muted uppercase tracking-wider border-t border-linear-border/40 mt-1">
                Найденные задачи
              </div>
              {filteredtaskitems.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTask(t)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linear-subtle text-slate-200 text-left transition"
                >
                  <span className="truncate font-medium">{t.title}</span>
                  <span className="font-mono text-[10px] text-linear-muted ml-2 shrink-0">{t.identifier}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
