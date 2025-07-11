export const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-01-20',
    skillsCount: 12,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'moderator',
    status: 'active',
    joinDate: '2024-01-10',
    lastLogin: '2024-01-19',
    skillsCount: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3e2?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'user',
    status: 'suspended',
    joinDate: '2024-01-05',
    lastLogin: '2024-01-18',
    skillsCount: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-01-12',
    lastLogin: '2024-01-20',
    skillsCount: 15,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@example.com',
    role: 'admin',
    status: 'active',
    joinDate: '2023-12-20',
    lastLogin: '2024-01-20',
    skillsCount: 20,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
  }
];

export const mockSkills = [
  {
    id: '1',
    name: 'React Development',
    category: 'Frontend',
    level: 'intermediate',
    prerequisites: ['JavaScript', 'HTML/CSS'],
    description: 'Build modern web applications with React',
    status: 'active',
    createdBy: 'John Smith',
    createdAt: '2024-01-15',
    endorsements: 45
  },
  {
    id: '2',
    name: 'Machine Learning',
    category: 'Data Science',
    level: 'advanced',
    prerequisites: ['Python', 'Statistics'],
    description: 'Implement ML algorithms and models',
    status: 'active',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10',
    endorsements: 32
  },
  {
    id: '3',
    name: 'UI/UX Design',
    category: 'Design',
    level: 'beginner',
    prerequisites: [],
    description: 'Create user-friendly interfaces',
    status: 'pending',
    createdBy: 'Emma Davis',
    createdAt: '2024-01-18',
    endorsements: 8
  },
  {
    id: '4',
    name: 'Node.js Backend',
    category: 'Backend',
    level: 'intermediate',
    prerequisites: ['JavaScript', 'Express.js'],
    description: 'Build scalable server-side applications',
    status: 'active',
    createdBy: 'Michael Chen',
    createdAt: '2024-01-12',
    endorsements: 28
  }
];

export const mockContentItems = [
  {
    id: '1',
    title: 'Advanced React Patterns',
    type: 'tutorial',
    author: 'John Smith',
    status: 'pending',
    submittedAt: '2024-01-20',
    category: 'Frontend',
    flagCount: 0
  },
  {
    id: '2',
    title: 'Python for Data Science',
    type: 'course',
    author: 'Sarah Johnson',
    status: 'approved',
    submittedAt: '2024-01-19',
    category: 'Data Science',
    flagCount: 2
  },
  {
    id: '3',
    title: 'Mobile App Development',
    type: 'skill',
    author: 'Michael Chen',
    status: 'rejected',
    submittedAt: '2024-01-18',
    category: 'Mobile',
    flagCount: 5
  }
];

export const mockSystemMetrics = {
  totalUsers: 1247,
  activeUsers: 892,
  totalSkills: 156,
  pendingReviews: 23,
  serverUptime: '99.9%',
  memoryUsage: 68,
  cpuUsage: 34,
  diskUsage: 45
};

export const mockDashboardStats = {
  totalUsers: 1247,
  totalSkills: 156,
  pendingContent: 23,
  systemHealth: 98,
  monthlyGrowth: {
    users: 12,
    skills: 8,
    content: 15
  }
};