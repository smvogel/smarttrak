// hooks/useDragAndDrop.ts
import React, { useState, useCallback } from 'react';
import { ServiceTask, TaskStatus } from '@/types/service';

interface UseDragAndDropReturn {
    draggedTask: ServiceTask | null;
    handleDragStart: (e: React.DragEvent, task: ServiceTask) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (
        e: React.DragEvent,
        newStatus: TaskStatus,
        onStatusUpdate: (taskId: string, newStatus: TaskStatus, fromStatus?: TaskStatus) => Promise<void>,
        setTasks: React.Dispatch<React.SetStateAction<ServiceTask[]>>
    ) => Promise<void>;
}

export const useDragAndDrop = (): UseDragAndDropReturn => {
    const [draggedTask, setDraggedTask] = useState<ServiceTask | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, task: ServiceTask) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(async (
        e: React.DragEvent,
        newStatus: TaskStatus,
        onStatusUpdate: (taskId: string, newStatus: TaskStatus, fromStatus?: TaskStatus) => Promise<void>,
        setTasks: React.Dispatch<React.SetStateAction<ServiceTask[]>>
    ) => {
        e.preventDefault();

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        const originalStatus = draggedTask.status;

        // Optimistically update UI
        setTasks(prev => prev.map(task =>
            task.id === draggedTask.id
                ? { ...task, status: newStatus }
                : task
        ));

        try {
            await onStatusUpdate(draggedTask.id, newStatus, originalStatus);
        } catch (err) {
            // Revert on error
            setTasks(prev => prev.map(task =>
                task.id === draggedTask.id
                    ? { ...task, status: originalStatus }
                    : task
            ));
            alert('Failed to update status. Please try again.');
        } finally {
            setDraggedTask(null);
        }
    }, [draggedTask]);

    return {
        draggedTask,
        handleDragStart,
        handleDragOver,
        handleDrop
    };
};