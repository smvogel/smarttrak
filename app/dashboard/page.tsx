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

  const statuses = [
    { key: 'FUTURE', label: 'Future', color: 'bg-gray-100 border-gray-300' },
    { key: 'IN_SHOP', label: 'In Shop', color: 'bg-blue-50 border-blue-300' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-300' },
    { key: 'CLOSED', label: 'Closed', color: 'bg-gray-50 border-gray-200' }
  ];

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

  const TaskCard = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{task.customerName}</h3>
        <button
          onClick={() => printLabel(task)}
          className="text-blue-600 hover:text-blue-800 text-xs"
          title="Print Label"
        >
          🖨️
        </button>
      </div>
      
      <div className="space-y-1 text-xs text-gray-600">
        <div><strong>Service:</strong> {task.serviceType}</div>
        {task.bikeModel && <div><strong>Bike:</strong> {task.bikeModel}</div>}
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
    </div>
  );

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
                className={`rounded-lg border-2 border-dashed ${status.color} min-h-96`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.key)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-800">{status.label}</h2>
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                      {statusTasks.length}
                    </span>
                  </div>
                  
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>
    </div>
  );
}