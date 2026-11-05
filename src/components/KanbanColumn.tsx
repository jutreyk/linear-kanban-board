import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { Column as ColumnType, Task, Priority } from '../types/kanban';
import { TaskCard } from './TaskCard';
import { useKanbanStore } from '../store/kanbanStore';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export const KanbanColumn: React.FC<ColumnProps> = ({ column, tasks }) => {
  const addTask = useKanbanStore((s) => s.addTask);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), column.id, priority);
    setNewTitle('');
    setIsAdding(false);
  };

  const getStatusDot = (id: ColumnType['id']) => {
    switch (id) {
      case 'backlog':
        return 'bg-slate-500';
      case 'todo':
        return 'bg-amber-400';
      case 'in-progress':
        return 'bg-linear-purple';
      case 'done':
        return 'bg-emerald-400';
    }
  };

  return (
    <section
      ref={setNodeRef}
      aria-label={`${column.title} column`}
      className={`flex-1 min-w-[280px] max-w-[320px] rounded-xl flex flex-col bg-linear-bg/80 border transition ${
        isOver ? 'border-linear-purple/60 bg-linear-subtle/50' : 'border-linear-border/40'
      }`}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-linear-border/40 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusDot(column.id)}`} />
          <h2 className="text-xs font-semibold tracking-tight text-linear-text">{column.title}</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-linear-card border border-linear-border text-linear-muted">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          aria-label={`Add issue to ${column.title}`}
          className="text-linear-muted hover:text-white hover:bg-linear-card p-1 rounded transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[300px]">
        {isAdding && (
          <form onSubmit={handleCreate} className="p-2 rounded-lg bg-linear-card border border-linear-purple/50 space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Issue title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-linear-subtle border border-linear-border rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center justify-between pt-1">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-linear-subtle border border-linear-border text-[11px] text-slate-300 rounded px-1.5 py-0.5"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 text-[11px] font-medium bg-linear-purple hover:bg-linear-purpleHover text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
};
