// hooks/useServiceTasks.ts
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceTask, TaskStatus } from '@/types/service';

interface UseServiceTasksReturn {
    tasks: ServiceTask[];
    loading: boolean;
    error: string | null;
    loadTasks: () => Promise<void>;
    updateTaskStatus: (taskId: string, newStatus: TaskStatus, fromStatus?: TaskStatus) => Promise<void>;
    updateTask: (taskId: string, data: Partial<ServiceTask>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    printLabel: (task: ServiceTask) => Promise<void>;
    setTasks: React.Dispatch<React.SetStateAction<ServiceTask[]>>;
}

export const useServiceTasks = (): UseServiceTasksReturn => {
    const [tasks, setTasks] = useState<ServiceTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/service-tasks');

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/auth/login');
                    return;
                }
                throw new Error('Failed to load service tasks');
            }

            const data = await response.json();
            setTasks(data.serviceJobs || []);
        } catch (err) {
            console.error('Error loading service tasks:', err);
            setError(err instanceof Error ? err.message : 'Failed to load service tasks');
        } finally {
            setLoading(false);
        }
    }, [router]);

    const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus, fromStatus?: TaskStatus) => {
        try {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, fromStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            return await response.json();
        } catch (err) {
            console.error('Error updating status:', err);
            throw err;
        }
    }, []);

    const updateTask = useCallback(async (taskId: string, data: Partial<ServiceTask>) => {
        try {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update service task');
            }

            return await response.json();
        } catch (err) {
            console.error('Error updating service task:', err);
            throw err;
        }
    }, []);

    const deleteTask = useCallback(async (taskId: string) => {
        try {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete service task');
            }

            setTasks(prev => prev.filter(task => task.id !== taskId));
            return await response.json();
        } catch (err) {
            console.error('Error deleting service task:', err);
            throw err;
        }
    }, []);

    const printLabel = useCallback(async (task: ServiceTask) => {
        try {
            const response = await fetch('/api/labels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: task.id,
                    labelType: 'SERVICE_TAG',
                    printerName: 'Default Printer'
                }),
            });

            if (response.ok) {
                alert(`Label printed for ${task.customerName}'s ${task.bikeModel}`);
            } else {
                alert('Label printing failed. Please try again.');
            }
        } catch (err) {
            console.error('Error printing label:', err);
            alert('Label printing failed. Please try again.');
        }
    }, []);

    return {
        tasks,
        loading,
        error,
        loadTasks,
        updateTaskStatus,
        updateTask,
        deleteTask,
        printLabel,
        setTasks
    };
};