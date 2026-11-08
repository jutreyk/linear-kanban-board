import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, AlertTriangle, ArrowDown, Minus, Trash2, Calendar, CheckSquare, Zap } from 'lucide-react';
import type { Task, Priority } from '../../types/kanban';
import { useKanbanStore } from '../../store/useKanbanStore';

export interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onSelect?: (t: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay = false, onSelect }) => {
  const deletetask = useKanbanStore((s) => s.deletetask);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task }
  });

  const cardstyle = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease',
    opacity: isDragging ? 0.25 : 1
  };

  const getprioricon = (p: Priority) => {
    switch (p) {
      case 'urgent': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'high': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'medium': return <Minus className="w-3.5 h-3.5 text-blue-400" />;
      case 'low': return <ArrowDown className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const isoverdueflag = React.useMemo(() => {
    if (!task.dueDate || task.columnId === 'done') return false;
    return new Date(task.dueDate) < new Date('2026-11-08');
  }, [task.dueDate, task.columnId]);

  const donesubtaskscnt = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalsubtaskscnt = task.subtasks?.length || 0;

  return (
    <article
      ref={setNodeRef}
      style={cardstyle}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="button"
      onClick={() => onSelect?.(task)}
      className={`group relative rounded-lg border bg-linear-card p-3 select-none focus:outline-none transition-all duration-200 ${
        isOverlay
          ? 'rotate-2 scale-105 shadow-2xl border-linear-purple ring-2 ring-linear-purple/30 bg-linear-card/95 cursor-grabbing z-50'
          : isDragging
          ? 'border-dashed border-linear-purple/40 bg-linear-subtle/30 cursor-grabbing'
          : 'border-linear-border shadow-xs hover:border-linear-borderHover hover:shadow-md cursor-pointer focus:ring-1 focus:ring-linear-purple'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-linear-muted">
          {getprioricon(task.priority)}
          <span>{task.identifier}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20 font-semibold">
            <Zap className="w-2.5 h-2.5" />
            {task.points || 1}pt
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deletetask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500 p-0.5 rounded transition"
            aria-label="Удалить задачу"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <h3 className="text-xs font-medium text-linear-text leading-snug mb-3">{task.title}</h3>

      <div className="flex items-center gap-2 mb-2.5">
        {task.dueDate && (
          <time
            dateTime={task.dueDate}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              isoverdueflag
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-linear-subtle text-slate-400 border-linear-border'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{task.dueDate.slice(5)}</span>
          </time>
        )}

        {totalsubtaskscnt > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-linear-subtle text-slate-400 border border-linear-border">
            <CheckSquare className="w-3 h-3 text-linear-purple" />
            <span>
              {donesubtaskscnt}/{totalsubtaskscnt}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-linear-border/60">
        <div className="flex gap-1 flex-wrap">
          {task.labels.map((lbl) => (
            <span key={lbl} className="px-1.5 py-0.5 rounded text-[10px] bg-linear-subtle text-slate-400 border border-linear-border font-medium">
              {lbl}
            </span>
          ))}
        </div>
        <div className="w-5 h-5 rounded-full bg-linear-purple/20 border border-linear-purple/40 text-[9px] font-bold text-linear-purple flex items-center justify-center shrink-0">
          {task.assignee.avatar}
        </div>
      </div>
    </article>
  );
};
