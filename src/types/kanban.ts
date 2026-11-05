export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type ColumnId = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  identifier: string; // e.g. LIN-104
  title: string;
  description?: string;
  columnId: ColumnId;
  priority: Priority;
  assignee: {
    name: string;
    avatar: string;
  };
  labels: string[];
}

export interface Column {
  id: ColumnId;
  title: string;
}
