import { create } from 'zustand';
import type { Task, ColumnId } from '../types/kanban';

interface KanbanState {
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  moveTask: (taskId: string, targetColumn: ColumnId) => void;
  addTask: (title: string, columnId: ColumnId, priority: Task['priority']) => void;
  deleteTask: (taskId: string) => void;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    identifier: 'ENG-204',
    title: 'Migrate auth service to Zero-Trust architecture',
    columnId: 'done',
    priority: 'urgent',
    assignee: { name: 'Arkadiy G.', avatar: 'AG' },
    labels: ['Security', 'Backend']
  },
  {
    id: 'task-2',
    identifier: 'ENG-205',
    title: 'Implement WebSockets live order-book depth streaming',
    columnId: 'in-progress',
    priority: 'high',
    assignee: { name: 'Arkadiy G.', avatar: 'AG' },
    labels: ['Trading', 'Fintech']
  },
  {
    id: 'task-3',
    identifier: 'ENG-206',
    title: 'Tune Double-Elimination tournament bracket seeding algorithm',
    columnId: 'in-progress',
    priority: 'medium',
    assignee: { name: 'Core Team', avatar: 'CT' },
    labels: ['Algorithms']
  },
  {
    id: 'task-4',
    identifier: 'ENG-207',
    title: 'Refactor canvas viewport matrix calculations for 120 FPS zoom/pan',
    columnId: 'todo',
    priority: 'high',
    assignee: { name: 'UI Team', avatar: 'UI' },
    labels: ['Performance', 'Frontend']
  },
  {
    id: 'task-5',
    identifier: 'ENG-208',
    title: 'Setup multi-stage Alpine Docker build with non-root security context',
    columnId: 'backlog',
    priority: 'low',
    assignee: { name: 'DevOps', avatar: 'DO' },
    labels: ['Infra']
  }
];

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: INITIAL_TASKS,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  moveTask: (taskId, targetColumn) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, columnId: targetColumn } : t
      )
    })),
  addTask: (title, columnId, priority) =>
    set((state) => {
      const nextId = state.tasks.length + 210;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        identifier: `ENG-${nextId}`,
        title,
        columnId,
        priority,
        assignee: { name: 'Arkadiy G.', avatar: 'AG' },
        labels: ['Feature']
      };
      return { tasks: [newTask, ...state.tasks] };
    }),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }))
}));
