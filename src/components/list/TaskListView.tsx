import React from 'react';
import type { Task, Column } from '../../types/kanban';

export interface TaskListViewProps {
  tasks: Task[];
  columns: Column[];
  onSelectTask: (t: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, columns, onSelectTask }) => {
  return (
    <div className="flex-1 max-w-5xl mx-auto rounded-xl border border-linear-border bg-linear-card/60 overflow-hidden flex flex-col">
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-linear-border/60 bg-linear-bg/80 text-[11px] font-mono font-medium text-linear-muted uppercase tracking-wider select-none">
        <div className="col-span-2">Тикет</div>
        <div className="col-span-5">Название</div>
        <div className="col-span-2">Статус</div>
        <div className="col-span-1 text-center">Оценка</div>
        <div className="col-span-2 text-right">Дедлайн</div>
      </div>
      <div className="divide-y divide-linear-border/30 overflow-y-auto flex-1">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-linear-muted">Задачи не найдены</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-linear-subtle/40 cursor-pointer transition select-none text-xs group"
            >
              <div className="col-span-2 flex items-center gap-1.5 font-mono text-[11px] text-linear-muted">
                <span>{task.identifier}</span>
              </div>
              <div className="col-span-5 flex items-center gap-2 pr-2">
                <span className="font-medium text-white truncate">{task.title}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    task.columnId === 'done'
                      ? 'bg-emerald-400'
                      : task.columnId === 'in-progress'
                      ? 'bg-linear-purple'
                      : task.columnId === 'todo'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="text-slate-300 capitalize text-[11px]">
                  {columns.find((c) => c.id === task.columnId)?.title}
                </span>
              </div>
              <div className="col-span-1 text-center font-mono text-[11px] text-amber-300">
                {task.points || 1}pt
              </div>
              <div className="col-span-2 text-right font-mono text-[11px] text-slate-400">
                {task.dueDate ? task.dueDate.slice(5) : '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
