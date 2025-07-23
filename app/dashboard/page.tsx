'use client';
import { useState } from 'react';

export default function KanbanBoard() {
  // Sample data - in real app this would come from API
  const [tasks, setTasks] = useState([
    {
      id: '1',
      customerName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      bikeModel: 'Trek Domane AL 2',
      serialNumber: 'WTU123456789',
      serviceType: 'Basic Tune-Up',
      status: 'FUTURE',
      createdAt: '2024-01-15T10:30:00Z',
      notes: 'Customer reported chain skipping in 3rd gear'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(555) 987-6543',
      bikeModel: 'Specialized Allez',
      serialNumber: 'SP987654321',
      serviceType: 'Brake Adjustment',
      status: 'IN_SHOP',
      createdAt: '2024-01-14T14:20:00Z',
      notes: 'Front brake lever feels spongy'
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '(555) 456-7890',
      bikeModel: 'Giant Defy 3',
      serialNumber: 'GT456789123',
      serviceType: 'Full Service',
      status: 'IN_PROGRESS',
      createdAt: '2024-01-13T09:15:00Z',
      notes: 'Annual maintenance, clean and lube all components'
    },
    {
      id: '4',
      customerName: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '(555) 321-6547',
      bikeModel: 'Cannondale CAAD13',
      serialNumber: 'CD321654987',
      serviceType: 'Flat Tire Repair',
      status: 'COMPLETED',
      createdAt: '2024-01-12T16:45:00Z',
      notes: 'Rear tire puncture, replaced tube'
    }
  ]);

  const [draggedTask, setDraggedTask] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState(new Set());
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const statuses = [
    { key: 'FUTURE', label: 'Future', color: 'bg-gray-100 border-gray-300' },
    { key: 'IN_SHOP', label: 'In Shop', color: 'bg-blue-50 border-blue-300' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-300' },
    { key: 'CLOSED', label: 'Closed', color: 'bg-gray-50 border-gray-200' }
  ];

  const toggleCardCollapse = (taskId) => {
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

  const startEditing = (task) => {
    setEditingCard(task.id);
    setEditFormData({
      customerName: task.customerName,
      email: task.email,
      phone: task.phone,
      bikeModel: task.bikeModel,
      serialNumber: task.serialNumber,
      serviceType: task.serviceType,
      notes: task.notes
    });
    setIsEditModalOpen(true);
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setEditFormData({});
    setIsEditModalOpen(false);
  };

  const saveEdit = () => {
    // Update the task in the tasks array
    setTasks(prev => prev.map(task => 
      task.id === editingCard 
        ? { ...task, ...editFormData }
        : task
    ));
    
    // TODO: Update task in API
    console.log(`Updated task ${editingCard}:`, editFormData);
    
    setEditingCard(null);
    setEditFormData({});
    setIsEditModalOpen(false);
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      setTasks(prev => prev.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus }
          : task
      ));
      
      // TODO: Update task status in API
      console.log(`Updated task ${draggedTask.id} to status ${newStatus}`);
    }
    
    setDraggedTask(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const printLabel = (task) => {
    // TODO: Integrate with label printing system
    console.log('Printing label for task:', task.id);
    alert(`Printing label for ${task.customerName}'s ${task.bikeModel}`);
  };

  const TaskCard = ({ task }) => {
    const isCollapsed = collapsedCards.has(task.id);

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow duration-200"
      >
        {/* Card Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-sm flex-1">{task.customerName}</h3>
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
            <div className="text-xs text-gray-400">#{task.id}</div>
          </div>
        ) : (
          /* Expanded View */
          <>
            <div className="space-y-1 text-xs text-gray-600">
              <div><strong>Service:</strong> {task.serviceType}</div>
              {task.bikeModel && <div><strong>Item:</strong> {task.bikeModel}</div>}
              <div><strong>Phone:</strong> {task.phone}</div>
              <div><strong>Created:</strong> {formatDate(task.createdAt)}</div>
            </div>
            
            {task.notes && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 line-clamp-2">{task.notes}</p>
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs font-mono text-gray-400">#{task.id}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Dashboard</h1>
          <p className="text-gray-600">Drag and drop service tasks to update their status</p>
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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
              New Service Task
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
              Print All Labels
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200">
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

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
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

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Edit Service Task</h2>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={(e) => handleEditInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleEditInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={editFormData.serialNumber || ''}
                        onChange={(e) => handleEditInputChange('serialNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                      <select
                        value={editFormData.serviceType || ''}
                        onChange={(e) => handleEditInputChange('serviceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                      <textarea
                        value={editFormData.notes || ''}
                        onChange={(e) => handleEditInputChange('notes', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Enter any additional notes about the service request..."
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
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}