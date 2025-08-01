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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown="timerange"]')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const MetricCard = ({ title, value, subtitle, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
  }) => (
      <div className="glass-card rounded-xl p-6 group hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {trend && (
              <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </div>
          )}
        </div>
        <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
  );

  // No Data State Component
  const NoDataState = () => (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="glass-effect rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📊 No Records Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No service tasks were found for {getTimeRangeText(timeRange)}.
            Try selecting a different time range or check if any tasks have been created.
          </p>
          <div className="space-y-3">
            <button
                onClick={() => setTimeRange('1y')}
                className="glass-button w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 text-sm font-medium hover:scale-105"
            >
              📅 View Last Year
            </button>
            <button
                onClick={fetchData}
                className="glass-button w-full text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm hover:scale-105"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
  );

  if (error) {
    return (
        <div className="min-h-screen py-8 relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 glass-effect rounded-full floating-element opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-15"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="glass-card rounded-xl border border-red-200 dark:border-red-800 p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="glass-effect rounded-full w-12 h-12 flex items-center justify-center border border-red-200 dark:border-red-800">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">⚠️ Error loading dashboard</h3>
                  <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
                  <button
                      onClick={fetchData}
                      className="glass-button mt-3 bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 text-sm hover:scale-105"
                  >
                    🔄 Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen py-8 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-40 h-40 glass-effect rounded-full floating-element opacity-10"></div>
        <div className="absolute top-1/2 right-10 w-32 h-32 glass-effect rounded-full floating-slow opacity-15"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 glass-effect rounded-full floating-fast opacity-20"></div>
        <div className="absolute top-20 right-1/4 w-28 h-28 glass-effect rounded-full floating-element opacity-12"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="glass-card rounded-xl p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📊 Reports & Analytics</h1>
                <p className="text-gray-600 dark:text-gray-300">Service performance and business insights</p>
                {metrics?.dataSource && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 glass-effect px-2 py-1 rounded-full inline-block">
                      Data source: {metrics.dataSource === 'daily_metrics' ? 'Aggregated metrics' : 'Real-time calculation'}
                    </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative" data-dropdown="timerange">
                  <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="glass-button px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white backdrop-blur-md border border-white/20 dark:border-gray-600/30 cursor-pointer min-w-[140px] text-left"
                      disabled={loading}
                  >
                    {timeRangeOptions.find(option => option.value === timeRange)?.label}
                  </button>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                        className={`w-4 h-4 text-gray-400 dark:text-gray-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 glass-modal rounded-lg shadow-xl border border-white/20 dark:border-gray-600/30 min-w-full z-50">
                        <div className="py-1">
                          {timeRangeOptions.map((option) => (
                              <button
                                  key={option.value}
                                  onClick={() => {
                                    setTimeRange(option.value);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                                      timeRange === option.value
                                          ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/20'
                                  }`}
                              >
                                {option.label}
                              </button>
                          ))}
                        </div>
                      </div>
                  )}
                </div>

                <button
                    onClick={() => window.print()}
                    className="glass-button bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 hover:scale-105"
                    disabled={loading}
                >
                  📤 Export Report
                </button>
              </div>
            </div>
          </div>

          {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="glass-card rounded-xl p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300 mt-4 block">Loading dashboard data...</span>
                </div>
              </div>
          )}

          {/* Show No Data State when there are no records */}
          {!loading && !hasAnyData() && (
              <div className="glass-card rounded-xl">
                <NoDataState />
              </div>
          )}

          {/* Show Dashboard when there is data */}
          {!loading && hasAnyData() && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <MetricCard
                      title="📋 Total Tasks"
                      value={metrics?.totalTasks || 0}
                  />
                  <MetricCard
                      title="✅ Completed"
                      value={metrics?.completedTasks || 0}
                      subtitle={`${metrics?.completionRate || 0}% completion rate`}
                  />
                  <MetricCard
                      title="⏱️ Avg Turnaround"
                      value={`${metrics?.avgTurnaroundTime || 0} days`}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Status Distribution */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      📈 Current Status Distribution
                    </h3>
                    {statusDistribution.length > 0 ? (
                        <div className="space-y-4">
                          {statusDistribution.map((item, index) => (
                              <div key={index} className="glass-effect rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.status}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} ({item.percentage}%)</span>
                                    <div className="w-16 glass-dark rounded-full h-2">
                                      <div
                                          className={`h-2 rounded-full ${item.color}`}
                                          style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                          <div className="glass-effect rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">📊 No status data available for this time range</p>
                        </div>
                    )}
                  </div>

                  {/* Service Types Breakdown */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      🔧 Service Types
                    </h3>
                    {serviceTypes.length > 0 ? (
                        <div className="space-y-3">
                          {serviceTypes.map((service, index) => (
                              <div key={index} className="glass-effect rounded-lg p-3">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.type}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{service.count} ({service.percentage}%)</span>
                                  </div>
                                  <div className="w-full glass-dark rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${service.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                          <div className="glass-effect rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">🔧 No service type data available for this time range</p>
                        </div>
                    )}
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="mt-8 glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                    ⚡ Performance Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 glass-effect rounded-xl border border-blue-200 dark:border-blue-800 group hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{metrics?.avgTurnaroundTime || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">⏱️ Avg Days to Complete</div>
                      <div className="mt-3 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="text-center p-6 glass-effect rounded-xl border border-green-200 dark:border-green-800 group hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{metrics?.completionRate || 0}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">✅ Completion Rate</div>
                      <div className="mt-3 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="text-center p-6 glass-effect rounded-xl border border-purple-200 dark:border-purple-800 group hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{metrics?.totalTasks || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">📋 Total Tasks</div>
                      <div className="mt-3 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </>
          )}
        </div>
      </div>
  );
}