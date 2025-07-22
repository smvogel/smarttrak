'use client';
import { useState } from 'react';

export default function ReportingDashboard() {
  // Sample data - in real app this would come from API
  const [timeRange, setTimeRange] = useState('30d');

  // Mock metrics data
  const metrics = {
    totalTasks: 156,
    completedTasks: 142,
    avgTurnaroundTime: 2.3
  };

  // Mock chart data - removed daily volume and recent tasks

  const serviceTypes = [
    { type: 'Basic Tune-Up', count: 45, percentage: 29 },
    { type: 'Full Service', count: 32, percentage: 21 },
    { type: 'Brake Adjustment', count: 28, percentage: 18 },
    { type: 'Flat Tire Repair', count: 25, percentage: 16 },
    { type: 'Gear Adjustment', count: 15, percentage: 10 },
    { type: 'Other', count: 11, percentage: 7 }
  ];

  const statusDistribution = [
    { status: 'Completed', count: 142, color: 'bg-green-500' },
    { status: 'In Progress', count: 8, color: 'bg-yellow-500' },
    { status: 'In Shop', count: 4, color: 'bg-blue-500' },
    { status: 'Future', count: 2, color: 'bg-gray-500' }
  ];

  const MetricCard = ({ title, value, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Service performance and business insights</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard 
            title="Total Tasks" 
            value={metrics.totalTasks} 
            trend={8} 
          />
          <MetricCard 
            title="Completed" 
            value={metrics.completedTasks} 
            subtitle={`${Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}% completion rate`}
            trend={5} 
          />
          <MetricCard 
            title="Avg Turnaround" 
            value={`${metrics.avgTurnaroundTime} days`} 
            trend={-12} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status Distribution</h3>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{item.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / metrics.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Types Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Types</h3>
            <div className="space-y-3">
              {serviceTypes.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{service.type}</span>
                      <span className="text-sm text-gray-600">{service.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.1</div>
              <div className="text-sm text-gray-600 mt-1">Avg Days to Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}