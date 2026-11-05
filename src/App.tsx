import React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { KanbanHeader } from './components/KanbanHeader';
import { KanbanColumn } from './components/KanbanColumn';
import { TaskCard } from './components/TaskCard';
import { useKanbanStore } from './store/kanbanStore';
import type { Column, ColumnId, Task } from './types/kanban';

const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

export const App: React.FC = () => {
  const { tasks, moveTask, searchQuery } = useKanbanStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4
      }
    })
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    let targetColumnId: ColumnId | undefined;

    // Check if dropped directly onto column
    if (COLUMNS.some((c) => c.id === over.id)) {
      targetColumnId = over.id as ColumnId;
    } else {
      // Dropped onto another task
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetColumnId = overTask.columnId;
      }
    }

    if (targetColumnId) {
      moveTask(activeTaskId, targetColumnId);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-linear-bg text-linear-text">
      <KanbanHeader />

      <main className="flex-1 p-6 overflow-x-auto flex gap-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter((t) => t.columnId === column.id)}
            />
          ))}

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

export default App;
