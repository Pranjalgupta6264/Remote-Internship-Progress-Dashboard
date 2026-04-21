'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskCard } from './KanbanTaskCard';
import { Task, TaskStatus } from '@/types';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface KanbanBoardProps {
  initialTasks: Task[];
}

const COLUMNS = [
  { id: TaskStatus.TODO, title: 'To Do' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { id: TaskStatus.REVIEW, title: 'Review' },
  { id: TaskStatus.DONE, title: 'Completed' }
];

export function AdvancedKanban({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setTasks(initialTasks), 0);
    return () => clearTimeout(timeout);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isOverATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const overIndex = prev.findIndex(t => t.id === overId);

        if (prev[activeIndex].status !== prev[overIndex].status) {
          const updatedTasks = [...prev];
          updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: prev[overIndex].status };
          return arrayMove(updatedTasks, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Dropping a task over a column
    if (isOverAColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const updatedTasks = [...prev];
        updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: overId as TaskStatus };
        
        // When dropping on an empty column, it moved to the end by default if we use arrayMove(activeIndex, activeIndex)
        return arrayMove(updatedTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const targetTask = tasks.find(t => t.id === activeId);
    
    if (!targetTask) return;

    // Sync with backend
    try {
      await api.patch(`/tasks/${activeId}`, { status: targetTask.status });
    } catch {
      toast.error('Failed to sync changes with server');
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-8 overflow-x-auto pb-10 h-full scrollbar-hide px-2">
          {COLUMNS.map(col => (
            <KanbanColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              tasks={tasks.filter(t => t.status === col.id)} 
            />
          ))}
        </div>

        <DragOverlay adjustScale={true}>
          {activeTask ? (
            <div className="w-80">
              <KanbanTaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
