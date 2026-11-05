import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, AlertTriangle, ArrowDown, Minus, Trash2 } from 'lucide-react';
import type { Task } from '../types/kanban';
import { useKanbanStore } from '../store/kanbanStore';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const deleteTask = useKanbanStore((s) => s.deleteTask);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'high':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'medium':
        return <Minus className="w-3.5 h-3.5 text-blue-400" />;
      case 'low':
        return <ArrowDown className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="button"
      aria-label={`Task ${task.identifier}: ${task.title}`}
      className="group relative rounded-lg border border-linear-border bg-linear-card p-3 shadow-sm hover:border-linear-borderHover cursor-grab active:cursor-grabbing transition select-none focus:outline-none focus:ring-1 focus:ring-linear-purple"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-linear-muted">
          {getPriorityIcon(task.priority)}
          <span>{task.identifier}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          aria-label="Delete issue"
          className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500 p-0.5 rounded transition"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <h3 className="text-xs font-medium text-linear-text leading-snug mb-3">
        {task.title}
      </h3>

      <div className="flex items-center justify-between pt-1 border-t border-linear-border/60">
        <div className="flex gap-1">
          {task.labels.map((lbl) => (
            <span
              key={lbl}
              className="px-1.5 py-0.5 rounded text-[10px] bg-linear-subtle text-slate-400 border border-linear-border font-medium"
            >
              {lbl}
            </span>
          ))}
        </div>

        <div className="w-5 h-5 rounded-full bg-linear-purple/20 border border-linear-purple/40 text-[9px] font-bold text-linear-purple flex items-center justify-center">
          {task.assignee.avatar}
        </div>
      </div>
    </article>
  );
};
