export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type ColumnId = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  identifier: string;
  title: string;
  columnId: ColumnId;
  priority: Priority;
  points: number;
  assignee: { name: string; avatar: string };
  labels: string[];
  dueDate?: string;
  subtasks: Subtask[];
}

export interface Column {
  id: ColumnId;
  title: string;
}

export interface SprintStats {
  totalpoints: number;
  donepoints: number;
  inprogresspoints: number;
  todopoints: number;
  backlogpoints: number;
  percentval: number;
}
