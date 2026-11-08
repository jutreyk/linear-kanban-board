import { create } from 'zustand';
import type { Task, Column, Priority, ColumnId } from '../types/kanban';

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Бэклог' },
  { id: 'todo', title: 'К выполнению' },
  { id: 'in-progress', title: 'В работе' },
  { id: 'done', title: 'Готово' }
];

export const ESTIMATION_POINTS = [1, 2, 3, 5, 8] as const;

export interface KanbanState {
  tasks: Task[];
  searchquery: string;
  selectedpriority: Priority | 'all';
  selectedlabel: string | 'all';
  setsearchquery: (q: string) => void;
  setselectedpriority: (p: Priority | 'all') => void;
  setselectedlabel: (l: string | 'all') => void;
  movetask: (taskid: string, targetcol: ColumnId) => void;
  addtask: (titleval: string, colval: ColumnId, priorval: Priority, ptsval: number, dateval?: string) => void;
  updatetask: (taskid: string, patchdata: Partial<Task>) => void;
  deletetask: (taskid: string) => void;
  resettodefault: () => void;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    identifier: 'ENG-204',
    title: 'Миграция сервиса аутентификации на Zero-Trust шлюз',
    columnId: 'done',
    priority: 'urgent',
    points: 5,
    assignee: { name: 'Аркадий', avatar: 'АГ' },
    labels: ['Безопасность', 'Бэкенд'],
    dueDate: '2026-11-04',
    subtasks: [
      { id: 'st-1', title: 'Настройка mTLS сертификатов', completed: true },
      { id: 'st-2', title: 'Валидация JWT клаймов', completed: true }
    ]
  },
  {
    id: 'task-2',
    identifier: 'ENG-205',
    title: 'Потоковая передача котировок и биржевого стакана через WebSockets',
    columnId: 'in-progress',
    priority: 'high',
    points: 8,
    assignee: { name: 'Аркадий', avatar: 'АГ' },
    labels: ['Трейдинг', 'Финтех'],
    dueDate: '2026-11-12',
    subtasks: [
      { id: 'st-3', title: 'Буферизация тиков в кольцевой буфер', completed: true },
      { id: 'st-4', title: 'Плавный рендеринг глубины стакана', completed: false }
    ]
  },
  {
    id: 'task-3',
    identifier: 'ENG-206',
    title: 'Оптимизация алгоритма посева турнирных сеток Double-Elimination',
    columnId: 'in-progress',
    priority: 'medium',
    points: 3,
    assignee: { name: 'Разработка', avatar: 'РЗ' },
    labels: ['Алгоритмы'],
    dueDate: '2026-11-15',
    subtasks: [
      { id: 'st-5', title: 'Балансировка сетки лузеров', completed: false }
    ]
  },
  {
    id: 'task-4',
    identifier: 'ENG-207',
    title: 'Оптимизация рендеринга графиков для плавности 120 FPS',
    columnId: 'todo',
    priority: 'high',
    points: 5,
    assignee: { name: 'Фронтенд', avatar: 'ФР' },
    labels: ['Производительность'],
    dueDate: '2026-11-18',
    subtasks: [
      { id: 'st-6', title: 'Использование OffscreenCanvas', completed: false },
      { id: 'st-7', title: 'Профилирование в Chrome DevTools', completed: false }
    ]
  },
  {
    id: 'task-5',
    identifier: 'ENG-208',
    title: 'Конфигурация многоэтапной сборки Dockerfile с non-root пользователем',
    columnId: 'backlog',
    priority: 'low',
    points: 2,
    assignee: { name: 'Инфраструктура', avatar: 'ИН' },
    labels: ['Девопс'],
    dueDate: '2026-11-25',
    subtasks: []
  }
];

const STORAGE_KEY = 'linear_kanban_tasks_v4';

const loadstoredtasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.removeItem('linear_kanban_tasks_v1');
      localStorage.removeItem('linear_kanban_tasks_v2');
      localStorage.removeItem('linear_kanban_tasks_v3');
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
};

const savetasksdata = (tasksarr: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksarr));
  } catch {}
};

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: loadstoredtasks(),
  searchquery: '',
  selectedpriority: 'all',
  selectedlabel: 'all',
  setsearchquery: (q) => set({ searchquery: q }),
  setselectedpriority: (p) => set({ selectedpriority: p }),
  setselectedlabel: (l) => set({ selectedlabel: l }),
  movetask: (taskid, targetcol) =>
    set((state) => {
      const nexttasks = state.tasks.map((t) => (t.id === taskid ? { ...t, columnId: targetcol } : t));
      savetasksdata(nexttasks);
      return { tasks: nexttasks };
    }),
  addtask: (titleval, colval, priorval, ptsval, dateval) =>
    set((state) => {
      const tempid = state.tasks.length + 210;
      const newitem: Task = {
        id: `task-${Date.now()}`,
        identifier: `ENG-${tempid}`,
        title: titleval,
        columnId: colval,
        priority: priorval,
        points: ptsval || 3,
        assignee: { name: 'Аркадий', avatar: 'АГ' },
        labels: ['Задача'],
        dueDate: dateval,
        subtasks: []
      };
      const nexttasks = [newitem, ...state.tasks];
      savetasksdata(nexttasks);
      return { tasks: nexttasks };
    }),
  updatetask: (taskid, patchdata) =>
    set((state) => {
      const nexttasks = state.tasks.map((t) => (t.id === taskid ? { ...t, ...patchdata } : t));
      savetasksdata(nexttasks);
      return { tasks: nexttasks };
    }),
  deletetask: (taskid) =>
    set((state) => {
      const nexttasks = state.tasks.filter((t) => t.id !== taskid);
      savetasksdata(nexttasks);
      return { tasks: nexttasks };
    }),
  resettodefault: () => {
    savetasksdata(INITIAL_TASKS);
    set({ tasks: INITIAL_TASKS });
  }
}));
