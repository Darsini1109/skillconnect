import React from 'react';
import { Server, Database, Wifi, HardDrive, Cpu, MemoryStick, AlertTriangle, CheckCircle } from 'lucide-react';

export const SystemMonitoring = ({ metrics }) => {
  const getStatusColor = (usage) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (usage) => {
    if (usage < 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const systemStats = [
    {
      title: 'CPU Usage',
      value: `${metrics.cpuUsage}%`,
      icon: Cpu,
      usage: metrics.cpuUsage,
      color: getStatusColor(metrics.cpuUsage)
    },
    {
      title: 'Memory Usage',
      value: `${metrics.memoryUsage}%`,
      icon: MemoryStick,
      usage: metrics.memoryUsage,
      color: getStatusColor(metrics.memoryUsage)
    },
    {
      title: 'Disk Usage',
      value: `${metrics.diskUsage}%`,
      icon: HardDrive,
      usage: metrics.diskUsage,
      color: getStatusColor(metrics.diskUsage)
    },
    {
      title: 'Server Uptime',
      value: metrics.serverUptime,
      icon: Server,
      usage: 99.9,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">System Monitoring</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stat.color}`}
                      style={{ width: `${stat.usage}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  {getStatusIcon(stat.usage)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="text-sm font-medium text-gray-900">{metrics.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium text-gray-900">{metrics.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Skills</span>
              <span className="text-sm font-medium text-gray-900">{metrics.totalSkills.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Reviews</span>
              <span className="text-sm font-medium text-gray-900">{metrics.pendingReviews.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Database</span>
              </div>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">API Services</span>
              </div>
              <span className="text-sm font-medium text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Web Server</span>
              </div>
              <span className="text-sm font-medium text-green-600">Running</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3">
            {[
              { time: '2 min ago', event: 'System backup completed', type: 'success' },
              { time: '15 min ago', event: 'User login spike detected', type: 'info' },
              { time: '1 hour ago', event: 'Database optimization completed', type: 'success' },
              { time: '2 hours ago', event: 'Cache cleared successfully', type: 'info' }
            ].map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.event}</p>
                  <p className="text-xs text-gray-500">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Performance</h3>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Server className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">Performance metrics chart</p>
              <p className="text-sm text-gray-500">Real-time server monitoring</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="h-64 bg-gradient-to-br from-orange-50 to-red-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">Activity monitoring chart</p>
              <p className="text-sm text-gray-500">User engagement metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};