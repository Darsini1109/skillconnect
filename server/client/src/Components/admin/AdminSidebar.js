import React from 'react';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Shield, 
  Activity, 
  GitBranch,
  X,
  Home
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'skills', label: 'Skill Management', icon: BookOpen },
  { id: 'content', label: 'Content Moderation', icon: Shield },
  { id: 'system', label: 'System Monitoring', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const AdminSidebar = ({ 
  currentPage, 
  onPageChange, 
  sidebarOpen, 
  onCloseSidebar 
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">SkillConnect</span>
          </div>
          <button
            onClick={onCloseSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    onCloseSidebar();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">System Status</p>
            <p className="text-xs text-blue-700">All systems operational</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
