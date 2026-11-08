import React, { useState } from 'react';
import { X, Trash2, CheckSquare, Square } from 'lucide-react';
import type { Task, Column, Priority, ColumnId, Subtask } from '../../types/kanban';
import { useKanbanStore, ESTIMATION_POINTS } from '../../store/useKanbanStore';

export interface TaskDetailModalProps {
  task: Task;
  columns: Column[];
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, columns, onClose }) => {
  const updatetask = useKanbanStore((s) => s.updatetask);

  const [edittitleval, setedittitleval] = useState(task.title);
  const [editcolval, seteditcolval] = useState<ColumnId>(task.columnId);
  const [editpriorval, seteditpriorval] = useState<Priority>(task.priority);
  const [editptsval, seteditptsval] = useState<number>(task.points || 3);
  const [editdateval, seteditdateval] = useState(task.dueDate || '');
  const [newtaginputval, setnewtaginputval] = useState('');
  const [newsubtaskval, setnewsubtaskval] = useState('');

  const titlesavehandler = () => {
    if (!edittitleval.trim()) return;
    updatetask(task.id, { title: edittitleval.trim() });
  };

  const togglesubtaskhandler = (stid: string) => {
    const nextsubtasks = (task.subtasks || []).map((st) =>
      st.id === stid ? { ...st, completed: !st.completed } : st
    );
    updatetask(task.id, { subtasks: nextsubtasks });
  };

  const addsubtaskhandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsubtaskval.trim()) return;
    const newstitem: Subtask = {
      id: `st-${Date.now()}`,
      title: newsubtaskval.trim(),
      completed: false
    };
    const nextsubtasks = [...(task.subtasks || []), newstitem];
    updatetask(task.id, { subtasks: nextsubtasks });
    setnewsubtaskval('');
  };

  const removesubtaskhandler = (stid: string) => {
    const nextsubtasks = (task.subtasks || []).filter((st) => st.id !== stid);
    updatetask(task.id, { subtasks: nextsubtasks });
  };

  const addtaghandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newtaginputval.trim()) return;
    const tagtrimmed = newtaginputval.trim();
    if (task.labels.includes(tagtrimmed)) return;
    const nextlabels = [...task.labels, tagtrimmed];
    updatetask(task.id, { labels: nextlabels });
    setnewtaginputval('');
  };

  const removetaghandler = (tagitem: string) => {
    const nextlabels = task.labels.filter((l) => l !== tagitem);
    updatetask(task.id, { labels: nextlabels });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-linear-border bg-linear-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-linear-border bg-linear-bg/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-linear-muted font-bold">{task.identifier}</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Детализация задачи</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-linear-subtle transition"
            aria-label="Закрыть окно"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-[11px] font-semibold text-linear-muted uppercase tracking-wider mb-1.5">
              Название задачи
            </label>
            <input
              type="text"
              value={edittitleval}
              onChange={(e) => setedittitleval(e.target.value)}
              onBlur={titlesavehandler}
              className="w-full bg-linear-subtle border border-linear-border rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-linear-purple"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-linear-muted uppercase tracking-wider mb-1.5">
                Колонка
              </label>
              <select
                value={editcolval}
                onChange={(e) => {
                  const val = e.target.value as ColumnId;
                  seteditcolval(val);
                  updatetask(task.id, { columnId: val });
                }}
                className="w-full bg-linear-subtle border border-linear-border text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-linear-muted uppercase tracking-wider mb-1.5">
                Приоритет
              </label>
              <select
                value={editpriorval}
                onChange={(e) => {
                  const val = e.target.value as Priority;
                  seteditpriorval(val);
                  updatetask(task.id, { priority: val });
                }}
                className="w-full bg-linear-subtle border border-linear-border text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="urgent">Срочно</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-linear-muted uppercase tracking-wider mb-1.5">
                Оценка (pt)
              </label>
              <select
                value={editptsval}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  seteditptsval(val);
                  updatetask(task.id, { points: val });
                }}
                className="w-full bg-linear-subtle border border-linear-border text-xs text-amber-300 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                {ESTIMATION_POINTS.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}pt
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-linear-muted uppercase tracking-wider mb-1.5">
                Срок сдачи
              </label>
              <input
                type="date"
                value={editdateval}
                onChange={(e) => {
                  const val = e.target.value;
                  seteditdateval(val);
                  updatetask(task.id, { dueDate: val || undefined });
                }}
                className="w-full bg-linear-subtle border border-linear-border text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-linear-muted uppercase tracking-wider mb-1.5">
              Теги и метки
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {task.labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-linear-subtle text-slate-300 border border-linear-border"
                >
                  <span>{lbl}</span>
                  <button
                    type="button"
                    onClick={() => removetaghandler(lbl)}
                    className="hover:text-red-400 text-slate-500"
                    aria-label={`Удалить тег ${lbl}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={addtaghandler} className="flex gap-2">
              <input
                type="text"
                placeholder="Добавить тег..."
                value={newtaginputval}
                onChange={(e) => setnewtaginputval(e.target.value)}
                className="flex-1 bg-linear-subtle border border-linear-border rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-linear-purple"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-linear-card hover:bg-linear-subtle border border-linear-border text-xs text-slate-200 rounded-lg transition"
              >
                Добавить
              </button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-linear-muted uppercase tracking-wider">
                Подзадачи (чеклист)
              </label>
              <span className="text-[11px] font-mono text-linear-muted">
                {(task.subtasks || []).filter((s) => s.completed).length}/{(task.subtasks || []).length}
              </span>
            </div>

            <div className="space-y-1.5 mb-3">
              {(task.subtasks || []).map((st) => (
                <div
                  key={st.id}
                  className="group flex items-center justify-between p-2 rounded-lg bg-linear-subtle/50 border border-linear-border/40 hover:border-linear-border transition"
                >
                  <button
                    type="button"
                    onClick={() => togglesubtaskhandler(st.id)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-4 h-4 text-linear-purple shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        st.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removesubtaskhandler(st.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5 rounded transition"
                    aria-label="Удалить подзадачу"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addsubtaskhandler} className="flex gap-2">
              <input
                type="text"
                placeholder="Новая подзадача..."
                value={newsubtaskval}
                onChange={(e) => setnewsubtaskval(e.target.value)}
                className="flex-1 bg-linear-subtle border border-linear-border rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-linear-purple"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-linear-card hover:bg-linear-subtle border border-linear-border text-xs text-slate-200 rounded-lg transition"
              >
                Добавить
              </button>
            </form>
          </div>
        </div>

        <div className="p-3 border-t border-linear-border bg-linear-bg/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Исполнитель: <span className="text-slate-300">{task.assignee.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-linear-purple hover:bg-linear-purpleHover text-white rounded-lg shadow transition"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
