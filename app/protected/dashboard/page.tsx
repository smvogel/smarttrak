// app/protected/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const statuses = [
    { key: 'FUTURE', label: 'Future', color: 'bg-gray-100 border-gray-300' },
    { key: 'IN_SHOP', label: 'In Shop', color: 'bg-blue-50 border-blue-300' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-300' },
    { key: 'CLOSED', label: 'Closed', color: 'bg-gray-50 border-gray-200' }
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
            ? { ...task, status: newStatus as any }
            : task
    ));

    try {
      await updateServiceTaskStatus(draggedTask.id, newStatus, originalStatus);
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
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const TaskCard = ({ task }: { task: ServiceTask }) => {
    const isCollapsed = collapsedCards.has(task.id);

    return (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow duration-200"
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{task.customerName}</h3>
              {task.priority && task.priority !== 'NORMAL' && (
                  <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              )}
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <button
                  onClick={() => toggleCardCollapse(task.id)}
                  className="text-gray-400 hover:text-gray-600 text-xs p-1"
                  title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? '📖' : '📕'}
              </button>
              <button
                  onClick={() => startEditing(task)}
                  className="text-gray-400 hover:text-blue-600 text-xs p-1"
                  title="Edit"
              >
                ✏️
              </button>
              <button
                  onClick={() => printLabel(task)}
                  className="text-gray-400 hover:text-green-600 text-xs p-1"
                  title="Print Label"
              >
                🖨️
              </button>
            </div>
          </div>

          {/* Collapsed View */}
          {isCollapsed ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">
                  <strong>{task.serviceType}</strong>
                </div>
                <div className="text-xs text-gray-400">#{task.id.slice(-8)}</div>
              </div>
          ) : (
              /* Expanded View */
              <>
                <div className="space-y-1 text-xs text-gray-600">
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
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 line-clamp-2">{task.notes}</p>
                    </div>
                )}

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <span className="text-xs font-mono text-gray-400">#{task.id.slice(-8)}</span>
                </div>
              </>
          )}
        </div>
    );
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service tasks...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                  onClick={loadServiceTasks}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Dashboard</h1>
                <p className="text-gray-600">Drag and drop service tasks to update their status</p>
              </div>
              <button
                  onClick={loadServiceTasks}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {statuses.map(status => {
              const count = tasks.filter(task => task.status === status.key).length;
              return (
                  <div key={status.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{status.label}</div>
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
                      className={`rounded-lg border-2 border-dashed ${status.color} h-[600px] flex flex-col`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status.key)}
                  >
                    <div className="p-4 flex-shrink-0">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-800">{status.label}</h2>
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                      {statusTasks.length}
                    </span>
                      </div>
                    </div>

                    <div className="flex-1 px-4 pb-4 overflow-y-auto">
                      <div className="space-y-3">
                        {statusTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                      </div>

                      {statusTasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            Drop tasks here
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <button
                  onClick={createNewServiceTask}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                New Service Task
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                Print All Labels
              </button>
              <button
                  onClick={() => router.push('/protected/reports')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
              >
                View Reports
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200">
                Export Data
              </button>
              <button
                  onClick={() => setCollapsedCards(new Set())}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-200"
              >
                Expand All
              </button>
              <button
                  onClick={() => setCollapsedCards(new Set(tasks.map(task => task.id)))}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition duration-200"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Service Task</h2>
                    <button
                        onClick={cancelEditing}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                        disabled={updating}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                    {/* Customer Information Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                          <input
                              type="text"
                              value={editFormData.customerName || ''}
                              onChange={(e) => handleEditInputChange('customerName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              disabled={updating}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                          <input
                              type="tel"
                              value={editFormData.phone || ''}
                              onChange={(e) => handleEditInputChange('phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              disabled={updating}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
                          <input
                              type="email"
                              value={editFormData.email || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                              disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Item Information Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Item Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Model/Brand</label>
                          <input
                              type="text"
                              value={editFormData.bikeModel || ''}
                              onChange={(e) => handleEditInputChange('bikeModel', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              disabled={updating}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                          <input
                              type="text"
                              value={editFormData.serialNumber || ''}
                              onChange={(e) => handleEditInputChange('serialNumber', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              disabled={updating}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service Information Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                            <select
                                value={editFormData.serviceType || ''}
                                onChange={(e) => handleEditInputChange('serviceType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={editFormData.priority || 'NORMAL'}
                                onChange={(e) => handleEditInputChange('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                          <input
                              type="number"
                              step="0.01"
                              value={editFormData.estimatedCost || ''}
                              onChange={(e) => handleEditInputChange('estimatedCost', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              disabled={updating}
                              placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                          <textarea
                              value={editFormData.notes || ''}
                              onChange={(e) => handleEditInputChange('notes', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              placeholder="Enter any additional notes about the service request..."
                              disabled={updating}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={cancelEditing}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={updating}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}