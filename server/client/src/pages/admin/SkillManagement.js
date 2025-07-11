import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { SkillTree } from '../components/SkillTree';

export const SkillManagement = ({ skills, onSkillsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || skill.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || skill.level === levelFilter;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
  };

  const handleApproveSkill = (skillId) => {
    const updatedSkills = skills.map(skill => 
      skill.id === skillId ? { ...skill, status: 'active' } : skill
    );
    onSkillsChange(updatedSkills);
  };

  const handleRejectSkill = (skillId) => {
    const updatedSkills = skills.map(skill => 
      skill.id === skillId ? { ...skill, status: 'rejected' } : skill
    );
    onSkillsChange(updatedSkills);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Skill Management</h1>
        <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Skill Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Skills</p>
          <p className="text-2xl font-semibold text-gray-900">{skills.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Active Skills</p>
          <p className="text-2xl font-semibold text-green-600">
            {skills.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {skills.filter(s => s.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Endorsements</p>
          <p className="text-2xl font-semibold text-blue-600">
            {skills.reduce((sum, skill) => sum + skill.endorsements, 0)}
          </p>
        </div>
      </div>

      {/* Skill Tree */}
      <SkillTree skills={filteredSkills} onSkillClick={handleSkillClick} />

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedSkill.name}</h2>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus className="h-6 w-6 transform rotate-45" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{selectedSkill.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-gray-900">{selectedSkill.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="text-gray-900 capitalize">{selectedSkill.level}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Created by</p>
                  <p className="text-gray-900">{selectedSkill.createdBy}</p>
                </div>
                
                {selectedSkill.prerequisites.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Prerequisites</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSkill.prerequisites.map((prereq, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSkill.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedSkill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedSkill.status}
                  </span>
                  
                  {selectedSkill.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          handleRejectSkill(selectedSkill.id);
                          setSelectedSkill(null);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          handleApproveSkill(selectedSkill.id);
                          setSelectedSkill(null);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};