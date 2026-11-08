import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Column, Priority, ColumnId } from '../../types/kanban';
import { useKanbanStore, ESTIMATION_POINTS } from '../../store/useKanbanStore';

export interface QuickCreateModalProps {
  columns: Column[];
  onClose: () => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ columns, onClose }) => {
  const addtask = useKanbanStore((s) => s.addtask);

  const [quicktitleval, setquicktitleval] = useState('');
  const [quickcolval, setquickcolval] = useState<ColumnId>('todo');
  const [quickpriorval, setquickpriorval] = useState<Priority>('medium');
  const [quickptsval, setquickptsval] = useState<number>(3);
  const [quickdateval, setquickdateval] = useState('');

  const createhandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quicktitleval.trim()) return;
    addtask(quicktitleval.trim(), quickcolval, quickpriorval, quickptsval, quickdateval || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-linear-border bg-linear-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 py-3 border-b border-linear-border bg-linear-bg/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-linear-purple" />
            <h3 className="text-xs font-semibold text-white">Быстрое создание задачи</h3>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-linear-subtle border border-linear-border text-slate-400">
              шорткат C
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-linear-subtle transition"
            aria-label="Закрыть модальное окно"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={createhandler} className="p-4 space-y-4">
          <div>
            <input
              autoFocus
              type="text"
              placeholder="Что нужно сделать?"
              value={quicktitleval}
              onChange={(e) => setquicktitleval(e.target.value)}
              className="w-full bg-linear-subtle border border-linear-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-linear-purple"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-linear-border/60">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={quickcolval}
                onChange={(e) => setquickcolval(e.target.value as ColumnId)}
                className="bg-linear-subtle border border-linear-border text-xs text-slate-300 rounded-md px-2 py-1 focus:outline-none"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>

              <select
                value={quickpriorval}
                onChange={(e) => setquickpriorval(e.target.value as Priority)}
                className="bg-linear-subtle border border-linear-border text-xs text-slate-300 rounded-md px-2 py-1 focus:outline-none"
              >
                <option value="urgent">Срочно</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>

              <select
                value={quickptsval}
                onChange={(e) => setquickptsval(Number(e.target.value))}
                className="bg-linear-subtle border border-linear-border text-xs text-amber-300 font-mono rounded-md px-2 py-1 focus:outline-none"
              >
                {ESTIMATION_POINTS.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}pt
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={quickdateval}
                onChange={(e) => setquickdateval(e.target.value)}
                className="bg-linear-subtle border border-linear-border text-xs text-slate-300 rounded-md px-2 py-1 focus:outline-none max-w-[110px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium bg-linear-purple hover:bg-linear-purpleHover text-white rounded-lg shadow transition"
              >
                Создать задачу
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
