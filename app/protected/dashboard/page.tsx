// app/protected/dashboard/page.tsx
'use client';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';

interface ServiceTask {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    bikeModel: string; // Maps to itemModel in backend
    serialNumber: string;
    serviceType: string;
    status: 'FUTURE' | 'IN_SHOP' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED' | 'ON_HOLD';
    createdAt: string;
    notes: string;
    estimatedCost?: string;
    actualCost?: string;
    priority?: string;
    assignedTo?: string;
}

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<ServiceTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draggedTask, setDraggedTask] = useState<ServiceTask | null>(null);
    const [collapsedCards, setCollapsedCards] = useState(new Set());
    const [editingCard, setEditingCard] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Delete confirmation state
    const [deleteConfirmTask, setDeleteConfirmTask] = useState<ServiceTask | null>(null);
    const [deleting, setDeleting] = useState(false);

    const router = useRouter();

    const statuses = [
        {key: 'FUTURE', label: 'Future', color: 'bg-gray-100 border-gray-300'},
        {key: 'IN_SHOP', label: 'In Shop', color: 'bg-blue-50 border-blue-300'},
        {key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300'},
        {key: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-300'},
        {key: 'CLOSED', label: 'Closed', color: 'bg-gray-50 border-gray-200'}
    ];

    // Load service tasks from API
    const loadServiceTasks = async () => {
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
            setTasks(data.serviceJobs || []); // API returns serviceJobs for UI compatibility

        } catch (err) {
            console.error('Error loading service tasks:', err);
            setError(err instanceof Error ? err.message : 'Failed to load service tasks');
        } finally {
            setLoading(false);
        }
    };

    // Update service task status via API
    const updateServiceTaskStatus = async (taskId: string, newStatus: string, fromStatus?: string) => {
        try {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    fromStatus: fromStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            return await response.json();
        } catch (err) {
            console.error('Error updating status:', err);
            throw err;
        }
    };

    // Update service task details via API
    const updateServiceTask = async (taskId: string, data: any) => {
        try {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    };

    // Delete service task via API
    const deleteServiceTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete service task');
            }

            return await response.json();
        } catch (err) {
            console.error('Error deleting service task:', err);
            throw err;
        }
    };

    useEffect(() => {
        loadServiceTasks();
    }, []);

    const toggleCardCollapse = (taskId: string) => {
        setCollapsedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const startEditing = (task: ServiceTask) => {
        setEditingCard(task.id);
        setEditFormData({
            customerName: task.customerName,
            email: task.email,
            phone: task.phone,
            bikeModel: task.bikeModel,
            serialNumber: task.serialNumber,
            serviceType: task.serviceType,
            notes: task.notes,
            estimatedCost: task.estimatedCost,
            priority: task.priority
        });
        setIsEditModalOpen(true);
    };

    const cancelEditing = () => {
        setEditingCard(null);
        setEditFormData({});
        setIsEditModalOpen(false);
    };

    const saveEdit = async () => {
        if (!editingCard) return;

        try {
            setUpdating(true);
            await updateServiceTask(editingCard, editFormData);

            // Reload data to get fresh state
            await loadServiceTasks();

            setEditingCard(null);
            setEditFormData({});
            setIsEditModalOpen(false);
        } catch (err) {
            alert('Failed to update service task. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    // Delete confirmation and execution
    const confirmDelete = (task: ServiceTask) => {
        setDeleteConfirmTask(task);
    };

    const cancelDelete = () => {
        setDeleteConfirmTask(null);
    };

    const executeDelete = async () => {
        if (!deleteConfirmTask) return;

        try {
            setDeleting(true);
            await deleteServiceTask(deleteConfirmTask.id);

            // Remove task from local state
            setTasks(prev => prev.filter(task => task.id !== deleteConfirmTask.id));

            // Clear collapsed state for deleted task
            setCollapsedCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(deleteConfirmTask.id);
                return newSet;
            });

            setDeleteConfirmTask(null);
        } catch (err) {
            alert('Failed to delete service task. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleEditInputChange = (field: string, value: string) => {
        setEditFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDragStart = (e: React.DragEvent, task: ServiceTask) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        const originalStatus = draggedTask.status;

        // Optimistically update UI
        setTasks(prev => prev.map(task =>
            task.id === draggedTask.id
                ? {...task, status: newStatus as any}
                : task
        ));

        try {
            await updateServiceTaskStatus(draggedTask.id, newStatus, originalStatus);
        } catch (err) {
            // Revert on error
            setTasks(prev => prev.map(task =>
                task.id === draggedTask.id
                    ? {...task, status: originalStatus}
                    : task
            ));
            alert('Failed to update status. Please try again.');
        } finally {
            setDraggedTask(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const printLabel = async (task: ServiceTask) => {
        try {
            const response = await fetch('/api/labels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    };

    const createNewServiceTask = () => {
        router.push('/protected/intake');
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'URGENT':
                return 'text-red-600 dark:text-red-400';
            case 'HIGH':
                return 'text-orange-600 dark:text-orange-400';
            case 'LOW':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const TaskCard = ({ task }: { task: ServiceTask }) => {
        const isCollapsed = collapsedCards.has(task.id);
        const [isMenuOpen, setIsMenuOpen] = useState(false);

        // Close menu when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Element;
                if (!target.closest(`[data-menu-id="${task.id}"]`)) {
                    setIsMenuOpen(false);
                }
            };

            if (isMenuOpen) {
                document.addEventListener('click', handleClickOutside);
                return () => document.removeEventListener('click', handleClickOutside);
            }
        }, [isMenuOpen, task.id]);

        const handleMenuAction = (action: () => void) => {
            action();
            setIsMenuOpen(false);
        };

        return (
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                className="glass-card rounded-lg p-4 cursor-move hover:shadow-lg transition-all duration-300 group relative"
            >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{task.customerName}</h3>
                        {task.priority && task.priority !== 'NORMAL' && (
                            <span className={`inline-block text-xs font-medium px-2 py-1 mt-1 rounded-full glass-effect ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                        )}
                    </div>

                    {/* Three-Dot Menu */}
                    <div className="relative flex-shrink-0" data-menu-id={task.id}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="glass-button text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center w-8 h-8"
                            title="Actions"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 glass-modal rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 min-w-[160px] z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() => handleMenuAction(() => toggleCardCollapse(task.id))}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <span>{isCollapsed ? '📖' : '📕'}</span>
                                        <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
                                    </button>

                                    <button
                                        onClick={() => handleMenuAction(() => startEditing(task))}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <span>✏️</span>
                                        <span>Edit Task</span>
                                    </button>

                                    <button
                                        onClick={() => handleMenuAction(() => printLabel(task))}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <span>🖨️</span>
                                        <span>Print Label</span>
                                    </button>

                                    <hr className="my-1 border-gray-200 dark:border-gray-600" />

                                    <button
                                        onClick={() => handleMenuAction(() => confirmDelete(task))}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <span>🗑️</span>
                                        <span>Delete Task</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapsed View */}
                {isCollapsed ? (
                    <div className="space-y-1">
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                            <strong>{task.serviceType}</strong>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">#{task.id.slice(-8)}</div>
                    </div>
                ) : (
                    /* Expanded View */
                    <>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                            <div><strong>Service:</strong> {task.serviceType}</div>
                            {task.bikeModel && <div><strong>Item:</strong> {task.bikeModel}</div>}
                            <div><strong>Phone:</strong> {task.phone}</div>
                            <div><strong>Created:</strong> {formatDate(task.createdAt)}</div>
                            {task.estimatedCost && (
                                <div><strong>Est. Cost:</strong> ${task.estimatedCost}</div>
                            )}
                            {task.assignedTo && (
                                <div><strong>Assigned:</strong> {task.assignedTo}</div>
                            )}
                        </div>

                        {task.notes && (
                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.notes}</p>
                            </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">#{task.id.slice(-8)}</span>
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-112px)] relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute top-20 left-20 w-32 h-32 glass-effect rounded-full floating-element opacity-20"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-15"></div>

                <div className="glass-card rounded-xl p-8 text-center max-w-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading service tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-112px)] relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute top-20 left-20 w-28 h-28 glass-effect rounded-full floating-element opacity-20"></div>
                <div className="absolute bottom-20 right-20 w-36 h-36 glass-effect rounded-full floating-slow opacity-15"></div>

                <div className="text-center">
                    <div className="glass-card rounded-xl p-8 max-w-md border border-red-200 dark:border-red-800">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Data</h3>
                        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                        <button
                            onClick={loadServiceTasks}
                            className="glass-button bg-red-600 dark:bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-10 left-10 w-40 h-40 glass-effect rounded-full floating-element opacity-10"></div>
            <div className="absolute top-1/2 right-10 w-32 h-32 glass-effect rounded-full floating-slow opacity-15"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 glass-effect rounded-full floating-fast opacity-20"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div className="glass-card rounded-xl p-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Service Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-300">Drag and drop service tasks to update their status</p>
                        </div>
                        <button
                            onClick={loadServiceTasks}
                            className="glass-button text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-4 py-2 rounded-lg transition-all duration-200"
                        >
                            🔄 Refresh Data
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {statuses.map(status => {
                        const count = tasks.filter(task => task.status === status.key).length;
                        return (
                            <div key={status.key} className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{status.label}</div>
                                <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {statuses.map(status => {
                        const statusTasks = tasks.filter(task => task.status === status.key);

                        return (
                            <div
                                key={status.key}
                                className="glass-effect rounded-xl border-2 border-dashed border-opacity-30 h-[600px] flex flex-col relative overflow-hidden"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status.key)}
                                style={{
                                    borderColor: status.key === 'FUTURE' ? '#6b7280' :
                                        status.key === 'IN_SHOP' ? '#3b82f6' :
                                            status.key === 'IN_PROGRESS' ? '#f59e0b' :
                                                status.key === 'COMPLETED' ? '#10b981' : '#6b7280'
                                }}
                            >
                                {/* Column Header */}
                                <div className="p-4 flex-shrink-0 glass-dark rounded-t-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="font-semibold text-gray-800 dark:text-white flex items-center">
                                            <span className="w-3 h-3 rounded-full mr-2"
                                                  style={{
                                                      backgroundColor: status.key === 'FUTURE' ? '#6b7280' :
                                                          status.key === 'IN_SHOP' ? '#3b82f6' :
                                                              status.key === 'IN_PROGRESS' ? '#f59e0b' :
                                                                  status.key === 'COMPLETED' ? '#10b981' : '#6b7280'
                                                  }}></span>
                                            {status.label}
                                        </h2>
                                        <span className="glass-effect text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Cards Container */}
                                <div className="flex-1 px-4 pb-4 overflow-y-auto">
                                    <div className="space-y-3">
                                        {statusTasks.map(task => (
                                            <TaskCard key={task.id} task={task}/>
                                        ))}
                                    </div>

                                    {statusTasks.length === 0 && (
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
                    })}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        ⚡ Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <button
                            onClick={createNewServiceTask}
                            className="glass-button bg-blue-600 dark:bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 font-medium"
                        >
                            ➕ New Task
                        </button>
                        <button className="glass-button bg-green-600 dark:bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 font-medium">
                            🖨️ Print All
                        </button>
                        <button
                            onClick={() => router.push('/protected/reports')}
                            className="glass-button bg-purple-600 dark:bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-medium"
                        >
                            📊 Reports
                        </button>
                        <button className="glass-button bg-gray-600 dark:bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 font-medium">
                            📤 Export
                        </button>
                        <button
                            onClick={() => setCollapsedCards(new Set())}
                            className="glass-button bg-orange-600 dark:bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-all duration-200 font-medium"
                        >
                            📖 Expand
                        </button>
                        <button
                            onClick={() => setCollapsedCards(new Set(tasks.map(task => task.id)))}
                            className="glass-button bg-yellow-600 dark:bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-all duration-200 font-medium"
                        >
                            📕 Collapse
                        </button>
                    </div>
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-modal rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 glass-dark rounded-t-xl">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">✏️ Edit Service Task</h2>
                                <button
                                    onClick={cancelEditing}
                                    className="glass-button text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white text-2xl p-2 rounded-lg transition-all duration-200"
                                    disabled={updating}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Customer Information Section */}
                                <div className="glass-effect rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">👤 Customer Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                                            <input
                                                type="text"
                                                value={editFormData.customerName || ''}
                                                onChange={(e) => handleEditInputChange('customerName', e.target.value)}
                                                className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                disabled={updating}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                                            <input
                                                type="tel"
                                                value={editFormData.phone || ''}
                                                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                                                className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                disabled={updating}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Read-only)</label>
                                            <input
                                                type="email"
                                                value={editFormData.email || ''}
                                                className="glass-dark w-full px-3 py-2 rounded-lg text-gray-900 dark:text-white"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Item Information Section */}
                                <div className="glass-effect rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">🚲 Item Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Model/Brand</label>
                                            <input
                                                type="text"
                                                value={editFormData.bikeModel || ''}
                                                onChange={(e) => handleEditInputChange('bikeModel', e.target.value)}
                                                className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                disabled={updating}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                                            <input
                                                type="text"
                                                value={editFormData.serialNumber || ''}
                                                onChange={(e) => handleEditInputChange('serialNumber', e.target.value)}
                                                className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                disabled={updating}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Service Information Section */}
                                <div className="glass-effect rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">🔧 Service Information</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type *</label>
                                                <select
                                                    value={editFormData.serviceType || ''}
                                                    onChange={(e) => handleEditInputChange('serviceType', e.target.value)}
                                                    className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                    disabled={updating}
                                                >
                                                    <option value="">Select a service type</option>
                                                    <option value="Basic Tune-Up">Basic Tune-Up</option>
                                                    <option value="Full Service">Full Service</option>
                                                    <option value="Brake Adjustment">Brake Adjustment</option>
                                                    <option value="Gear Adjustment">Gear Adjustment</option>
                                                    <option value="Wheel True">Wheel True</option>
                                                    <option value="Chain/Cassette Replacement">Chain/Cassette Replacement</option>
                                                    <option value="Flat Tire Repair">Flat Tire Repair</option>
                                                    <option value="Custom Build">Custom Build</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                                <select
                                                    value={editFormData.priority || 'NORMAL'}
                                                    onChange={(e) => handleEditInputChange('priority', e.target.value)}
                                                    className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                    disabled={updating}
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="NORMAL">Normal</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editFormData.estimatedCost || ''}
                                                onChange={(e) => handleEditInputChange('estimatedCost', e.target.value)}
                                                className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                disabled={updating}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
                                            <textarea
                                                value={editFormData.notes || ''}
                                                onChange={(e) => handleEditInputChange('notes', e.target.value)}
                                                rows={4}
                                                className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                                placeholder="Enter any additional notes about the service request..."
                                                disabled={updating}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600 glass-dark rounded-b-xl">
                                <button
                                    onClick={cancelEditing}
                                    className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="glass-button px-6 py-2 bg-blue-600 dark:bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                                    disabled={updating}
                                >
                                    {updating ? '⏳ Saving...' : '💾 Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-modal rounded-xl shadow-2xl max-w-md w-full">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-600 glass-dark rounded-t-xl">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">🗑️ Delete Service Task</h2>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 w-12 h-12 mx-auto glass-effect rounded-full flex items-center justify-center border border-red-200 dark:border-red-800">
                                        <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        Are you sure you want to delete this service task?
                                    </p>
                                    <div className="glass-effect rounded-lg p-4 mt-4">
                                        <p className="font-semibold text-gray-900 dark:text-white">{deleteConfirmTask.customerName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{deleteConfirmTask.serviceType}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{deleteConfirmTask.bikeModel}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">#{deleteConfirmTask.id.slice(-8)}</p>
                                    </div>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-4 font-medium">
                                        ⚠️ This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600 glass-dark rounded-b-xl">
                                <button
                                    onClick={cancelDelete}
                                    className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="glass-button px-6 py-2 bg-red-600 dark:bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-all duration-200"
                                    disabled={deleting}
                                >
                                    {deleting ? '⏳ Deleting...' : '🗑️ Delete Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}