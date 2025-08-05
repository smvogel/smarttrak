// app/protected/dashboard/page.tsx (Alternative Approach)
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Import all the refactored pieces
import { ServiceTask, EditFormData, TaskStatus } from '@/types/service';
import { TASK_STATUSES } from '@/constants/kanban';
import { useServiceTasks } from '@/hooks/useServiceTasks';
import { useTaskActions } from '@/hooks/useTaskActions';
import TaskCard from '../../../components/TaskCard';
import EditTaskModal from '../../../components/EditTaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function KanbanBoard() {
    const router = useRouter();

    // Main data and actions
    const {
        tasks,
        loading,
        error,
        loadTasks,
        updateTaskStatus,
        updateTask,
        deleteTask,
        printLabel,
        setTasks
    } = useServiceTasks();

    // UI state management
    const { collapsedCards, toggleCardCollapse, expandAll, collapseAll } = useTaskActions();

    // Drag and drop state
    const [draggedTask, setDraggedTask] = useState<ServiceTask | null>(null);

    // Modal state
    const [editingTask, setEditingTask] = useState<ServiceTask | null>(null);
    const [editFormData, setEditFormData] = useState<EditFormData>({} as EditFormData);
    const [updating, setUpdating] = useState(false);
    const [deleteConfirmTask, setDeleteConfirmTask] = useState<ServiceTask | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Memoized task groups for performance
    const tasksByStatus = useMemo(() => {
        return TASK_STATUSES.reduce((acc, status) => {
            acc[status.key] = tasks.filter(task => task.status === status.key);
            return acc;
        }, {} as Record<TaskStatus, ServiceTask[]>);
    }, [tasks]);

    // Drag and drop handlers
    const handleDragStart = useCallback((e: React.DragEvent, task: ServiceTask) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, newStatus: TaskStatus) => {
        e.preventDefault();

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        const originalStatus = draggedTask.status;

        // Optimistically update UI immediately
        setTasks(prev => prev.map(task =>
            task.id === draggedTask.id
                ? { ...task, status: newStatus }
                : task
        ));

        try {
            // Update the backend
            await updateTaskStatus(draggedTask.id, newStatus, originalStatus);
            console.log('Status updated successfully');
        } catch (err) {
            console.error('Failed to update status:', err);
            // Revert the optimistic update on error
            setTasks(prev => prev.map(task =>
                task.id === draggedTask.id
                    ? { ...task, status: originalStatus }
                    : task
            ));
            alert('Failed to update status. Please try again.');
        } finally {
            setDraggedTask(null);
        }
    }, [draggedTask, updateTaskStatus, setTasks]);

    // Edit modal handlers
    const startEditing = useCallback((task: ServiceTask) => {
        setEditingTask(task);
        setEditFormData({
            customerName: task.customerName,
            email: task.email,
            phone: task.phone,
            bikeModel: task.bikeModel,
            serialNumber: task.serialNumber,
            serviceType: task.serviceType,
            notes: task.notes,
            estimatedCost: task.estimatedCost || '',
            priority: task.priority || 'NORMAL'
        });
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingTask(null);
        setEditFormData({} as EditFormData);
    }, []);

    const saveEdit = useCallback(async () => {
        if (!editingTask) return;

        try {
            setUpdating(true);
            await updateTask(editingTask.id, editFormData);

            // Update local state immediately instead of reloading
            setTasks(prev => prev.map(task =>
                task.id === editingTask.id
                    ? { ...task, ...editFormData }
                    : task
            ));

            cancelEditing();
        } catch (err) {
            console.error('Failed to update task:', err);
            alert('Failed to update service task. Please try again.');
        } finally {
            setUpdating(false);
        }
    }, [editingTask, editFormData, updateTask, setTasks, cancelEditing]);

    const handleEditInputChange = useCallback((field: string, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Delete handlers
    const confirmDelete = useCallback((task: ServiceTask) => {
        setDeleteConfirmTask(task);
    }, []);

    const cancelDelete = useCallback(() => {
        setDeleteConfirmTask(null);
    }, []);

    const executeDelete = useCallback(async () => {
        if (!deleteConfirmTask) return;

        try {
            setDeleting(true);
            await deleteTask(deleteConfirmTask.id);
            // Task is already removed from state by the deleteTask function
            cancelDelete();
        } catch (err) {
            console.error('Failed to delete task:', err);
            alert('Failed to delete service task. Please try again.');
        } finally {
            setDeleting(false);
        }
    }, [deleteConfirmTask, deleteTask, cancelDelete]);

    // Quick actions
    const createNewServiceTask = useCallback(() => {
        router.push('/protected/intake');
    }, [router]);

    const navigateToReports = useCallback(() => {
        router.push('/protected/reports');
    }, [router]);

    const expandAllCards = useCallback(() => {
        expandAll();
    }, [expandAll]);

    const collapseAllCards = useCallback(() => {
        collapseAll(tasks.map(task => task.id));
    }, [collapseAll, tasks]);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={loadTasks} />;
    }

    return (
        <div className="p-6 relative overflow-hidden">
            {/* Floating decorative elements */}
            <FloatingElements />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <Header onRefresh={loadTasks} />

                {/* Stats Summary */}
                <StatsGrid tasksByStatus={tasksByStatus} />

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {TASK_STATUSES.map(status => (
                        <KanbanColumn
                            key={status.key}
                            status={status}
                            tasks={tasksByStatus[status.key]}
                            collapsedCards={collapsedCards}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status.key)}
                            onTaskDragStart={(e, task) => handleDragStart(e, task)}
                            onToggleCollapse={toggleCardCollapse}
                            onEditTask={startEditing}
                            onDeleteTask={confirmDelete}
                            onPrintLabel={printLabel}
                        />
                    ))}
                </div>

                {/* Quick Actions */}
                <QuickActions
                    onNewTask={createNewServiceTask}
                    onReports={navigateToReports}
                    onExpandAll={expandAllCards}
                    onCollapseAll={collapseAllCards}
                />

                {/* Modals */}
                <EditTaskModal
                    isOpen={!!editingTask}
                    task={editingTask}
                    formData={editFormData}
                    updating={updating}
                    onClose={cancelEditing}
                    onSave={saveEdit}
                    onInputChange={handleEditInputChange}
                />

                <DeleteConfirmModal
                    isOpen={!!deleteConfirmTask}
                    task={deleteConfirmTask}
                    deleting={deleting}
                    onCancel={cancelDelete}
                    onConfirm={executeDelete}
                />
            </div>
        </div>
    );
}

// Supporting Components (same as before)
const LoadingState = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] relative overflow-hidden">
        <FloatingElements />
        <div className="glass-card rounded-xl p-8 text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading service tasks...</p>
        </div>
    </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] relative overflow-hidden">
        <FloatingElements />
        <div className="text-center">
            <div className="glass-card rounded-xl p-8 max-w-md border border-red-200 dark:border-red-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Data</h3>
                <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="glass-button bg-red-600 dark:bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 font-medium"
                >
                    Try Again
                </button>
            </div>
        </div>
    </div>
);

const FloatingElements = () => (
    <>
        <div className="absolute top-10 left-10 w-40 h-40 glass-effect rounded-full floating-element opacity-10"></div>
        <div className="absolute top-1/2 right-10 w-32 h-32 glass-effect rounded-full floating-slow opacity-15"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 glass-effect rounded-full floating-fast opacity-20"></div>
    </>
);

const Header = ({ onRefresh }: { onRefresh: () => void }) => (
    <div className="mb-8">
        <div className="flex justify-between items-center">
            <div className="glass-card rounded-xl p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Service Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">Drag and drop service tasks to update their status</p>
            </div>
            <button
                onClick={onRefresh}
                className="glass-button text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-4 py-2 rounded-lg transition-all duration-200"
            >
                🔄 Refresh Data
            </button>
        </div>
    </div>
);

interface StatsGridProps {
    tasksByStatus: Record<TaskStatus, ServiceTask[]>;
}

const StatsGrid = ({ tasksByStatus }: StatsGridProps) => (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {TASK_STATUSES.map(status => {
            const count = tasksByStatus[status.key]?.length || 0;
            return (
                <div key={status.key} className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-all duration-300">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{status.label}</div>
                    <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            );
        })}
    </div>
);

interface KanbanColumnProps {
    status: any;
    tasks: ServiceTask[];
    collapsedCards: Set<string>;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onTaskDragStart: (e: React.DragEvent, task: ServiceTask) => void;
    onToggleCollapse: (taskId: string) => void;
    onEditTask: (task: ServiceTask) => void;
    onDeleteTask: (task: ServiceTask) => void;
    onPrintLabel: (task: ServiceTask) => void;
}

const KanbanColumn = ({
                          status,
                          tasks,
                          collapsedCards,
                          onDragOver,
                          onDrop,
                          onTaskDragStart,
                          onToggleCollapse,
                          onEditTask,
                          onDeleteTask,
                          onPrintLabel
                      }: KanbanColumnProps) => (
    <div
        className="glass-effect rounded-xl border-2 border-dashed border-opacity-30 h-[600px] flex flex-col relative overflow-hidden"
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{ borderColor: status.borderColor }}
    >
        {/* Column Header */}
        <div className="p-4 flex-shrink-0 glass-dark rounded-t-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800 dark:text-white flex items-center">
                    <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.borderColor }}
                    ></span>
                    {status.label}
                </h2>
                <span className="glass-effect text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                    {tasks.length}
                </span>
            </div>
        </div>

        {/* Cards Container */}
        <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="space-y-3">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        isCollapsed={collapsedCards.has(task.id)}
                        onToggleCollapse={() => onToggleCollapse(task.id)}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task)}
                        onPrintLabel={() => onPrintLabel(task)}
                        onDragStart={(e) => onTaskDragStart(e, task)}
                    />
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-12">
                    <div className="glass-effect rounded-xl p-6 text-gray-400 dark:text-gray-500 text-sm">
                        <div className="text-2xl mb-2">📋</div>
                        Drop tasks here
                    </div>
                </div>
            )}
        </div>
    </div>
);

interface QuickActionsProps {
    onNewTask: () => void;
    onReports: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

const QuickActions = ({ onNewTask, onReports, onExpandAll, onCollapseAll }: QuickActionsProps) => (
    <div className="mt-8 glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <ActionButton onClick={onNewTask} className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
                ➕ New Task
            </ActionButton>
            <ActionButton className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600">
                🖨️ Print All
            </ActionButton>
            <ActionButton onClick={onReports} className="bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600">
                📊 Reports
            </ActionButton>
            <ActionButton className="bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600">
                📤 Export
            </ActionButton>
            <ActionButton onClick={onExpandAll} className="bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600">
                📖 Expand
            </ActionButton>
            <ActionButton onClick={onCollapseAll} className="bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 dark:hover:bg-yellow-600">
                📕 Collapse
            </ActionButton>
        </div>
    </div>
);

interface ActionButtonProps {
    onClick?: () => void;
    className: string;
    children: React.ReactNode;
}

const ActionButton = ({ onClick, className, children }: ActionButtonProps) => (
    <button
        onClick={onClick}
        className={`glass-button text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium ${className}`}
    >
        {children}
    </button>
);