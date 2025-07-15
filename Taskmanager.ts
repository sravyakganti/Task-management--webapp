import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit3, Trash2, Calendar, User, BarChart3, CheckCircle, Clock, AlertCircle, Users, Target, TrendingUp } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Setup project structure', description: 'Initialize React app with routing', status: 'completed', priority: 'high', assignee: 'Alice', dueDate: '2024-01-15', project: 'Website Redesign' },
    { id: 2, title: 'Design user interface', description: 'Create wireframes and mockups', status: 'in-progress', priority: 'high', assignee: 'Bob', dueDate: '2024-01-20', project: 'Website Redesign' },
    { id: 3, title: 'Implement authentication', description: 'Add login and registration', status: 'todo', priority: 'medium', assignee: 'Charlie', dueDate: '2024-01-25', project: 'Website Redesign' },
    { id: 4, title: 'Database optimization', description: 'Optimize queries and indexing', status: 'in-progress', priority: 'medium', assignee: 'Diana', dueDate: '2024-01-22', project: 'Performance' },
    { id: 5, title: 'Write documentation', description: 'Create API documentation', status: 'todo', priority: 'low', assignee: 'Eve', dueDate: '2024-01-30', project: 'Documentation' }
  ]);

  const [projects] = useState(['Website Redesign', 'Performance', 'Documentation', 'Bug Fixes']);
  const [teamMembers] = useState(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']);
  const [activeView, setActiveView] = useState('board');
  const [selectedProject, setSelectedProject] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [onlineUsers] = useState(['Alice', 'Bob', 'Charlie']);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    project: ''
  });

  // Memoized constants to prevent recreation on every render
  const statusColumns = useMemo(() => [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500', icon: Clock },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500', icon: AlertCircle },
    { id: 'completed', title: 'Completed', color: 'bg-green-500', icon: CheckCircle }
  ], []);

  const priorityColors = useMemo(() => ({
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }), []);

  // Memoized filtered tasks to prevent recalculation
  const filteredTasks = useMemo(() => {
    return selectedProject === 'all' 
      ? tasks 
      : tasks.filter(task => task.project === selectedProject);
  }, [tasks, selectedProject]);

  // Memoized task statistics
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length;
    const todo = filteredTasks.filter(t => t.status === 'todo').length;
    
    return { 
      total, 
      completed, 
      inProgress, 
      todo, 
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0 
    };
  }, [filteredTasks]);

  // Memoized project breakdown data
  const projectBreakdown = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.project === project);
      const completed = projectTasks.filter(task => task.status === 'completed').length;
      const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;
      
      return {
        name: project,
        total: projectTasks.length,
        completed,
        progress
      };
    });
  }, [tasks, projects]);

  // Memoized team performance data
  const teamPerformance = useMemo(() => {
    return teamMembers.map(member => {
      const memberTasks = tasks.filter(task => task.assignee === member);
      const completed = memberTasks.filter(task => task.status === 'completed').length;
      
      return {
        name: member,
        total: memberTasks.length,
        completed,
        rate: memberTasks.length > 0 ? ((completed / memberTasks.length) * 100).toFixed(0) : 0
      };
    });
  }, [tasks, teamMembers]);

  // Memoized tasks grouped by status for board view
  const tasksByStatus = useMemo(() => {
    const grouped = {};
    statusColumns.forEach(column => {
      grouped[column.id] = filteredTasks.filter(task => task.status === column.id);
    });
    return grouped;
  }, [filteredTasks, statusColumns]);

  // Optimized event handlers using useCallback
  const handleAddTask = useCallback(() => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask
      };
      setTasks(prev => [...prev, task]);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '', project: '' });
      setShowTaskModal(false);
    }
  }, [newTask]);

  const handleUpdateTask = useCallback(() => {
    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setEditingTask(null);
      setShowTaskModal(false);
    }
  }, [editingTask]);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, status) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(prev => prev.map(task => 
        task.id === draggedTask.id ? { ...task, status } : task
      ));
      setDraggedTask(null);
    }
  }, [draggedTask]);

  const handleModalClose = useCallback(() => {
    setShowTaskModal(false);
    setEditingTask(null);
  }, []);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  }, []);

  // Memoized TaskCard component to prevent unnecessary re-renders
  const TaskCard = React.memo(({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={() => handleEditTask(task)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit3 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {task.project}
        </span>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>{task.assignee}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{task.dueDate}</span>
        </div>
      </div>
    </div>
  ));

  // Memoized StatsCard component
  const StatsCard = React.memo(({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color.replace('text-', 'text-').split('-')[0]}-500`} />
      </div>
    </div>
  ));

  // Memoized ProjectBreakdownItem component
  const ProjectBreakdownItem = React.memo(({ project }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-900">{project.name}</span>
          <span className="text-sm text-gray-600">{project.completed}/{project.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  ));

  // Memoized TeamMemberCard component
  const TeamMemberCard = React.memo(({ member }) => (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {member.name[0]}
        </div>
        <span className="font-medium text-gray-900">{member.name}</span>
      </div>
      <div className="text-sm text-gray-600">
        <p>Tasks: {member.total}</p>
        <p>Completed: {member.completed}</p>
        <p>Rate: {member.rate}%</p>
      </div>
    </div>
  ));

  // Memoized TaskModal component
  const TaskModal = React.memo(() => {
    const currentTask = editingTask || newTask;
    const isEditing = !!editingTask;
    
    const handleInputChange = useCallback((field, value) => {
      if (isEditing) {
        setEditingTask(prev => ({ ...prev, [field]: value }));
      } else {
        setNewTask(prev => ({ ...prev, [field]: value }));
      }
    }, [isEditing]);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h3>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={currentTask.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <textarea
              placeholder="Task description"
              value={currentTask.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <select
                value={currentTask.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={currentTask.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <select
                value={currentTask.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Assignee</option>
                {teamMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={currentTask.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={currentTask.project}
              onChange={(e) => handleInputChange('project', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={isEditing ? handleUpdateTask : handleAddTask}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Update' : 'Add'} Task
            </button>
            <button
              onClick={handleModalClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">{onlineUsers.length} online</span>
                <div className="flex -space-x-2">
                  {onlineUsers.slice(0, 3).map(user => (
                    <div key={user} className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                      {user[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('board')}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    activeView === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    activeView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
              </div>
              
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusColumns.map(column => {
              const Icon = column.icon;
              const columnTasks = tasksByStatus[column.id];
              
              return (
                <div
                  key={column.id}
                  className="bg-gray-100 rounded-lg p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${column.color}`}>
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard title="Total Tasks" value={stats.total} icon={Target} color="text-gray-900" />
              <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} color="text-green-600" />
              <StatsCard title="In Progress" value={stats.inProgress} icon={AlertCircle} color="text-blue-600" />
              <StatsCard title="Completion Rate" value={`${stats.completionRate}%`} icon={TrendingUp} color="text-purple-600" />
            </div>
            
            {/* Project Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Project Breakdown</h3>
              <div className="space-y-4">
                {projectBreakdown.map(project => (
                  <ProjectBreakdownItem key={project.name} project={project} />
                ))}
              </div>
            </div>
            
            {/* Team Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamPerformance.map(member => (
                  <TeamMemberCard key={member.name} member={member} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showTaskModal && <TaskModal />}
    </div>
  );
};

export default TaskManager; 