import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { Column, Task, Priority, ColumnId } from '../../types/kanban';
import { useKanbanStore, ESTIMATION_POINTS } from '../../store/useKanbanStore';
import { TaskCard } from './TaskCard';

export interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isDraggingActive?: boolean;
  onSelectTask?: (t: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  isDraggingActive = false,
  onSelectTask
}) => {
  const addtask = useKanbanStore((s) => s.addtask);
  const [isaddingmode, setisaddingmode] = useState(false);
  const [tasktitleinput, settasktitleinput] = useState('');
  const [taskpriorselect, settaskpriorselect] = useState<Priority>('medium');
  const [taskptsselect, settaskptsselect] = useState<number>(3);
  const [taskdateinput, settaskdateinput] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id }
  });

  const submithandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasktitleinput.trim()) return;
    addtask(tasktitleinput.trim(), column.id, taskpriorselect, taskptsselect, taskdateinput || undefined);
    settasktitleinput('');
    settaskptsselect(3);
    settaskdateinput('');
    setisaddingmode(false);
  };

  const getstatuscolordot = (cid: ColumnId) => {
    switch (cid) {
      case 'backlog': return 'bg-slate-500';
      case 'todo': return 'bg-amber-400';
      case 'in-progress': return 'bg-linear-purple';
      case 'done': return 'bg-emerald-400';
    }
  };

  const columnpointssum = React.useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.points || 0), 0);
  }, [tasks]);

  return (
    <section
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] max-w-[320px] rounded-xl flex flex-col bg-linear-bg/80 border transition-all duration-200 ${
        isOver
          ? 'border-linear-purple ring-2 ring-linear-purple/30 bg-linear-purple/5 shadow-lg'
          : isDraggingActive
          ? 'border-dashed border-linear-border/80 bg-linear-subtle/20'
          : 'border-linear-border/40'
      }`}
    >
      <div className="p-3 flex items-center justify-between border-b border-linear-border/40 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getstatuscolordot(column.id)}`} />
          <h2 className="text-xs font-semibold text-linear-text">{column.title}</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-linear-card border border-linear-border text-linear-muted">
            {tasks.length}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium">
            {columnpointssum}pt
          </span>
        </div>
        <button
          type="button"
          onClick={() => setisaddingmode((v) => !v)}
          className="text-linear-muted hover:text-white hover:bg-linear-card p-1 rounded transition"
          aria-label="Добавить задачу в колонку"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[300px]">
        {isaddingmode && (
          <form onSubmit={submithandler} className="p-2 rounded-lg bg-linear-card border border-linear-purple/50 space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Название задачи..."
              value={tasktitleinput}
              onChange={(e) => settasktitleinput(e.target.value)}
              className="w-full bg-linear-subtle border border-linear-border rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center justify-between pt-1 gap-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <select
                  value={taskpriorselect}
                  onChange={(e) => settaskpriorselect(e.target.value as Priority)}
                  className="bg-linear-subtle border border-linear-border text-[11px] text-slate-300 rounded px-1.5 py-0.5"
                >
                  <option value="urgent">Срочно</option>
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </select>

                <select
                  value={taskptsselect}
                  onChange={(e) => settaskptsselect(Number(e.target.value))}
                  className="bg-linear-subtle border border-linear-border text-[11px] text-amber-300 font-mono rounded px-1.5 py-0.5"
                >
                  {ESTIMATION_POINTS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}pt
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={taskdateinput}
                  onChange={(e) => settaskdateinput(e.target.value)}
                  className="bg-linear-subtle border border-linear-border text-[11px] text-slate-300 rounded px-1.5 py-0.5 max-w-[105px]"
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setisaddingmode(false)}
                  className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 text-[11px] font-medium bg-linear-purple hover:bg-linear-purpleHover text-white rounded"
                >
                  Создать
                </button>
              </div>
            </div>
          </form>
        )}

        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
        ))}
      </div>
    </section>
  );
};
