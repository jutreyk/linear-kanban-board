import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, AlertTriangle, ArrowDown, Minus, Trash2, Plus, Search, Sparkles } from 'lucide-react';
import { create } from 'zustand';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type ColumnId = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  identifier: string;
  title: string;
  columnId: ColumnId;
  priority: Priority;
  assignee: { name: string; avatar: string };
  labels: string[];
}

export interface Column {
  id: ColumnId;
  title: string;
}

const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Бэклог' },
  { id: 'todo', title: 'К выполнению' },
  { id: 'in-progress', title: 'В работе' },
  { id: 'done', title: 'Готово' }
];

interface KanbanState {
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  moveTask: (taskId: string, targetColumn: ColumnId) => void;
  addTask: (title: string, columnId: ColumnId, priority: Priority) => void;
  deleteTask: (taskId: string) => void;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    identifier: 'ENG-204',
    title: 'Миграция сервиса аутентификации на Zero-Trust шлюз',
    columnId: 'done',
    priority: 'urgent',
    assignee: { name: 'Аркадий', avatar: 'АГ' },
    labels: ['Безопасность', 'Бэкенд']
  },
  {
    id: 'task-2',
    identifier: 'ENG-205',
    title: 'Потоковая передача котировок и биржевого стакана через WebSockets',
    columnId: 'in-progress',
    priority: 'high',
    assignee: { name: 'Аркадий', avatar: 'АГ' },
    labels: ['Трейдинг', 'Финтех']
  },
  {
    id: 'task-3',
    identifier: 'ENG-206',
    title: 'Оптимизация алгоритма посева турнирных сеток Double-Elimination',
    columnId: 'in-progress',
    priority: 'medium',
    assignee: { name: 'Разработка', avatar: 'РЗ' },
    labels: ['Алгоритмы']
  },
  {
    id: 'task-4',
    identifier: 'ENG-207',
    title: 'Оптимизация рендеринга графиков для плавности 120 FPS',
    columnId: 'todo',
    priority: 'high',
    assignee: { name: 'Фронтенд', avatar: 'ФР' },
    labels: ['Производительность']
  },
  {
    id: 'task-5',
    identifier: 'ENG-208',
    title: 'Конфигурация многоэтапной сборки Dockerfile с non-root пользователем',
    columnId: 'backlog',
    priority: 'low',
    assignee: { name: 'Инфраструктура', avatar: 'ИН' },
    labels: ['Девопс']
  }
];

const STORAGE_KEY = 'linear_kanban_tasks_v1';

const loadStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
};

const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
};

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: loadStoredTasks(),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  moveTask: (taskId, targetColumn) =>
    set((state) => {
      const updated = state.tasks.map((t) => (t.id === taskId ? { ...t, columnId: targetColumn } : t));
      saveTasks(updated);
      return { tasks: updated };
    }),
  addTask: (title, columnId, priority) =>
    set((state) => {
      const nextId = state.tasks.length + 210;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        identifier: `ENG-${nextId}`,
        title,
        columnId,
        priority,
        assignee: { name: 'Аркадий', avatar: 'АГ' },
        labels: ['Задача']
      };
      const updated = [newTask, ...state.tasks];
      saveTasks(updated);
      return { tasks: updated };
    }),
  deleteTask: (taskId) =>
    set((state) => {
      const updated = state.tasks.filter((t) => t.id !== taskId);
      saveTasks(updated);
      return { tasks: updated };
    })
}));

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
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

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'high': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'medium': return <Minus className="w-3.5 h-3.5 text-blue-400" />;
      case 'low': return <ArrowDown className="w-3.5 h-3.5 text-slate-500" />;
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
          className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500 p-0.5 rounded transition"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <h3 className="text-xs font-medium text-linear-text leading-snug mb-3">{task.title}</h3>

      <div className="flex items-center justify-between pt-1 border-t border-linear-border/60">
        <div className="flex gap-1">
          {task.labels.map((lbl) => (
            <span key={lbl} className="px-1.5 py-0.5 rounded text-[10px] bg-linear-subtle text-slate-400 border border-linear-border font-medium">
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

const KanbanColumn: React.FC<{ column: Column; tasks: Task[] }> = ({ column, tasks }) => {
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

  const getStatusDot = (id: ColumnId) => {
    switch (id) {
      case 'backlog': return 'bg-slate-500';
      case 'todo': return 'bg-amber-400';
      case 'in-progress': return 'bg-linear-purple';
      case 'done': return 'bg-emerald-400';
    }
  };

  return (
    <section
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] max-w-[320px] rounded-xl flex flex-col bg-linear-bg/80 border transition ${
        isOver ? 'border-linear-purple/60 bg-linear-subtle/50' : 'border-linear-border/40'
      }`}
    >
      <div className="p-3 flex items-center justify-between border-b border-linear-border/40 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusDot(column.id)}`} />
          <h2 className="text-xs font-semibold text-linear-text">{column.title}</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-linear-card border border-linear-border text-linear-muted">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          className="text-linear-muted hover:text-white hover:bg-linear-card p-1 rounded transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[300px]">
        {isAdding && (
          <form onSubmit={handleCreate} className="p-2 rounded-lg bg-linear-card border border-linear-purple/50 space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Название задачи..."
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
                <option value="urgent">Срочно</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white">
                  Отмена
                </button>
                <button type="submit" className="px-2.5 py-0.5 text-[11px] font-medium bg-linear-purple hover:bg-linear-purpleHover text-white rounded">
                  Создать
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

export const App: React.FC = () => {
  const { tasks, moveTask, searchQuery, setSearchQuery } = useKanbanStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    let targetColumnId: ColumnId | undefined;

    if (COLUMNS.some((c) => c.id === over.id)) {
      targetColumnId = over.id as ColumnId;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetColumnId = overTask.columnId;
    }

    if (targetColumnId) moveTask(activeTaskId, targetColumnId);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-linear-bg text-linear-text">
      <header className="h-14 border-b border-linear-border px-6 flex items-center justify-between select-none bg-linear-bg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-linear-purple flex items-center justify-center font-bold text-white text-xs">
              L
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Инженерный спринт</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-linear-subtle border border-linear-border text-linear-muted font-mono">
              Активен
            </span>
          </div>
          <div className="h-4 w-px bg-linear-border" />
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-linear-muted" />
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 bg-linear-subtle border border-linear-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-linear-text placeholder-linear-muted focus:outline-none focus:border-linear-purple/80"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-purple/15 text-linear-purple border border-linear-purple/30 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Linear Board</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-auto flex gap-4">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter((t) => t.columnId === column.id)}
            />
          ))}
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

export default App;
