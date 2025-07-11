import React, { useState } from 'react';
import { CheckCircle, XCircle, Flag, Clock, Filter, Search } from 'lucide-react';

export const ContentModeration = ({ 
  contentItems, 
  onContentItemsChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApprove = (itemId) => {
    const updatedItems = contentItems.map(item => 
      item.id === itemId ? { ...item, status: 'approved' } : item
    );
    onContentItemsChange(updatedItems);
  };

  const handleReject = (itemId) => {
    const updatedItems = contentItems.map(item => 
      item.id === itemId ? { ...item, status: 'rejected' } : item
    );
    onContentItemsChange(updatedItems);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'skill': return 'bg-blue-100 text-blue-800';
      case 'course': return 'bg-purple-100 text-purple-800';
      case 'tutorial': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Content Moderation</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {contentItems.filter(item => item.status === 'pending').length} pending reviews
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="skill">Skills</option>
            <option value="course">Courses</option>
            <option value="tutorial">Tutorials</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-semibold text-gray-900">{contentItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {contentItems.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-semibold text-green-600">
            {contentItems.filter(i => i.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Flagged</p>
          <p className="text-2xl font-semibold text-red-600">
            {contentItems.filter(i => i.flagCount > 0).length}
          </p>
        </div>
      </div>

      {/* Content Items */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="space-y-4 p-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>by {item.author}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.submittedAt}</span>
                    {item.flagCount > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1 text-red-600">
                          <Flag className="h-4 w-4" />
                          <span>{item.flagCount} flags</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {item.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(item.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
                
                {item.status !== 'pending' && (
                  <div className="flex items-center space-x-2">
                    {item.status === 'approved' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Approved</span>
                      </div>
                    )}
                    {item.status === 'rejected' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Rejected</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};