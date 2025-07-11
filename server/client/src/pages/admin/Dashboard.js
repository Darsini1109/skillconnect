import React from 'react';
import { TrendingUp, Users, BookOpen, AlertCircle, Activity } from 'lucide-react';

export const Dashboard = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats.monthlyGrowth.users}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Skills',
      value: stats.totalSkills.toLocaleString(),
      icon: BookOpen,
      color: 'bg-emerald-500',
      change: `+${stats.monthlyGrowth.skills}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Pending Content',
      value: stats.pendingContent.toLocaleString(),
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: `+${stats.monthlyGrowth.content}%`,
      changeColor: 'text-yellow-600'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: Activity,
      color: 'bg-green-500',
      change: '+2%',
      changeColor: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className={`text-sm font-medium ${stat.changeColor}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">Interactive chart visualization</p>
              <p className="text-sm text-gray-500">User growth trends over time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Distribution</h3>
          <div className="h-64 bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">Skill category breakdown</p>
              <p className="text-sm text-gray-500">Distribution across categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { user: 'John Smith', action: 'created a new skill', time: '2 hours ago', type: 'skill' },
            { user: 'Sarah Johnson', action: 'approved content', time: '3 hours ago', type: 'approval' },
            { user: 'Michael Chen', action: 'joined the platform', time: '5 hours ago', type: 'user' },
            { user: 'Emma Davis', action: 'completed certification', time: '1 day ago', type: 'achievement' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'skill' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'approval' ? 'bg-green-100 text-green-600' :
                  activity.type === 'user' ? 'bg-purple-100 text-purple-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {activity.type === 'skill' ? <BookOpen className="h-4 w-4" /> :
                   activity.type === 'approval' ? <Activity className="h-4 w-4" /> :
                   activity.type === 'user' ? <Users className="h-4 w-4" /> :
                   <TrendingUp className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};