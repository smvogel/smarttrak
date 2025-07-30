'use client';
import { useState, useEffect } from 'react';

interface Metrics {
  totalTasks: number;
  completedTasks: number;
  avgTurnaroundTime: number;
  completionRate: number;
  dataSource?: string; // For debugging which data source was used
}

interface ServiceType {
  type: string;
  count: number;
  percentage: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  color: string;
  percentage: number;
}

export default function ReportingDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if we have any data
  const hasAnyData = () => {
    return metrics && (metrics.totalTasks > 0 || serviceTypes.length > 0 || statusDistribution.length > 0);
  };

  // Helper function to get time range display text
  const getTimeRangeText = (range: string) => {
    switch (range) {
      case '7d': return 'the last 7 days';
      case '30d': return 'the last 30 days';
      case '90d': return 'the last 90 days';
      case '1y': return 'the last year';
      default: return 'the selected time period';
    }
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);


      const [metricsRes, serviceTypesRes, statusRes] = await Promise.all([
        fetch(`/api/reports/metrics?timeRange=${timeRange}`),
        fetch(`/api/reports/service-types?timeRange=${timeRange}`),
        fetch(`/api/reports/status-distribution?timeRange=${timeRange}`)
      ]);



      const [metricsData, serviceTypesData, statusData] = await Promise.all([
        metricsRes.json(),
        serviceTypesRes.json(),
        statusRes.json()
      ]);

      setMetrics(metricsData);
      setServiceTypes(serviceTypesData.serviceTypes || []);
      setStatusDistribution(statusData.statusDistribution || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch data on component mount and when time range changes
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const MetricCard = ({ title, value, subtitle, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
  }) => (
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

  // No Data State Component
  const NoDataState = () => (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
          <p className="text-gray-500 mb-6">
            No service tasks were found for {getTimeRangeText(timeRange)}.
            Try selecting a different time range or check if any tasks have been created.
          </p>
          <div className="space-y-3">
            <button
                onClick={() => setTimeRange('1y')}
                className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition duration-200 text-sm font-medium"
            >
              View Last Year
            </button>
            <button
                onClick={fetchData}
                className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition duration-200 text-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
  );

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button
                      onClick={fetchData}
                      className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
                <p className="text-gray-600">Service performance and business insights</p>
                {metrics?.dataSource && (
                    <p className="text-xs text-blue-600 mt-1">
                      Data source: {metrics.dataSource === 'daily_metrics' ? 'Aggregated metrics' : 'Real-time calculation'}
                    </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    disabled={loading}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>

                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    disabled={loading}
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading dashboard data...</span>
              </div>
          )}

          {/* Show No Data State when there are no records */}
          {!loading && !hasAnyData() && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <NoDataState />
              </div>
          )}

          {/* Show Dashboard when there is data */}
          {!loading && hasAnyData() && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <MetricCard
                      title="Total Tasks"
                      value={metrics?.totalTasks || 0}
                  />
                  <MetricCard
                      title="Completed"
                      value={metrics?.completedTasks || 0}
                      subtitle={`${metrics?.completionRate || 0}% completion rate`}
                  />
                  <MetricCard
                      title="Avg Turnaround"
                      value={`${metrics?.avgTurnaroundTime || 0} days`}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Status Distribution */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status Distribution</h3>
                    {statusDistribution.length > 0 ? (
                        <div className="space-y-4">
                          {statusDistribution.map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${item.color}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-gray-500 mt-2">No status data available for this time range</p>
                        </div>
                    )}
                  </div>

                  {/* Service Types Breakdown */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Types</h3>
                    {serviceTypes.length > 0 ? (
                        <div className="space-y-3">
                          {serviceTypes.map((service, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">{service.type}</span>
                                    <span className="text-sm text-gray-600">{service.count} ({service.percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${service.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-gray-500 mt-2">No service type data available for this time range</p>
                        </div>
                    )}
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{metrics?.avgTurnaroundTime || 0}</div>
                      <div className="text-sm text-gray-600 mt-1">Avg Days to Complete</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metrics?.completionRate || 0}%</div>
                      <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{metrics?.totalTasks || 0}</div>
                      <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
                    </div>
                  </div>
                </div>
              </>
          )}
        </div>
      </div>
  );
}