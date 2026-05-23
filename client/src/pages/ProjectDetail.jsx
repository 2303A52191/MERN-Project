import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { SkeletonKanban, SkeletonText } from '../components/common/Skeleton';
import {
  FolderKanban,
  KanbanSquare,
  List,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  MessageSquare,
  Trash2,
  Paperclip,
  CheckCircle,
  Tag,
  AlertTriangle,
  Send,
  X,
  User as UserIcon,
} from 'lucide-react';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Task creation form state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskTagInput, setTaskTagInput] = useState('');
  const [taskTags, setTaskTags] = useState([]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  // Task Details Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  // Kanban Drag over status styling helper
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.success) {
        setProject(response.data.data);
      }
    } catch (error) {
      console.error('[Fetch Project Error]', error);
      showToast('Failed to load project details', 'error');
    }
  };

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      // Build search params
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterPriority) params.priority = filterPriority;
      if (filterAssignee) params.assignee = filterAssignee;

      const response = await api.get(`/tasks/project/${projectId}`, { params });
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('[Fetch Tasks Error]', error);
    } finally {
      setTasksLoading(false);
    }
  }, [projectId, searchQuery, filterPriority, filterAssignee]);

  const fetchTeammates = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setTeammates(response.data.data);
      }
    } catch (error) {
      console.error('[Teammates load error]', error);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchProjectDetails(), fetchTeammates()]);
      setLoading(false);
    };
    initPage();
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Task Creation Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) {
      showToast('Please provide a task title', 'warning');
      return;
    }

    try {
      const response = await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        project: projectId,
        status: taskStatus,
        priority: taskPriority,
        assignee: taskAssignee || undefined,
        dueDate: taskDueDate || undefined,
        tags: taskTags,
      });

      if (response.data.success) {
        showToast(`Task "${taskTitle}" successfully created`, 'success');
        setIsTaskModalOpen(false);
        // Reset states
        setTaskTitle('');
        setTaskDesc('');
        setTaskStatus('Todo');
        setTaskPriority('Medium');
        setTaskAssignee('');
        setTaskDueDate('');
        setTaskTags([]);
        setTaskTagInput('');
        // Reload list
        fetchTasks();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  // Kanban HTML5 Drag & Drop event helpers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Reset indicator states
    setDraggedTaskId(null);
    setDragOverColumn(null);

    // Optimistic UI update: immediately change local React state
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: targetStatus } : t
    );
    setTasks(updatedTasks);

    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status: targetStatus });
      if (response.data.success) {
        showToast('Task status updated', 'success');
      } else {
        // Fallback on failure
        setTasks(originalTasks);
      }
    } catch (error) {
      console.error('[Patch Status Error]', error);
      showToast('Failed to update task status', 'error');
      setTasks(originalTasks);
    }
  };

  // Task Details Modal triggers
  const handleOpenDetailModal = async (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const response = await api.get(`/tasks/${task._id}`);
      if (response.data.success) {
        setSelectedTask(response.data.data);
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error('[Load Details Error]', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Add Comment Handler
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post('/comments', {
        taskId: selectedTask._id,
        content: newComment,
      });

      if (response.data.success) {
        setComments((prev) => [response.data.data, ...prev]);
        setNewComment('');
        showToast('Comment added', 'success');
      }
    } catch (error) {
      showToast('Failed to post comment', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        showToast('Task removed', 'success');
        setIsDetailModalOpen(false);
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleAddTag = () => {
    if (taskTagInput.trim() && !taskTags.includes(taskTagInput.trim())) {
      setTaskTags((prev) => [...prev, taskTagInput.trim()]);
      setTaskTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTaskTags((prev) => prev.filter((t) => t !== tag));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonText lines={2} />
        <SkeletonKanban />
      </div>
    );
  }

  // Priority color badges mapping
  const priorityBadges = {
    Low: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    Medium: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    High: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Urgent: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const kanbanColumns = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];

  return (
    <div className="space-y-8">
      {/* 1. Page Header & View Toggle switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-darkBorder">
        <div className="min-w-0">
          <Link
            to="/projects"
            className="text-xs font-bold uppercase tracking-wider text-primary-500 dark:text-primary-400 hover:underline"
          >
            &larr; Back to projects
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight truncate mt-1">
            {project?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
            {project?.description || 'No project description added.'}
          </p>
        </div>

        {/* View togglers & action buttons */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* View selector switch */}
          <div className="flex items-center rounded-xl p-1 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/50">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-darkCard text-primary-500 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-darkCard text-primary-500 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              List View
            </button>
          </div>

          {/* New task button */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white hover:text-primary-300 font-bold rounded-xl text-xs border border-slate-700 hover:border-primary-500 shadow-md shadow-slate-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* 2. Global Filter & Search parameters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-darkBorder bg-white/30 dark:bg-darkCard/25 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-darkBorder bg-white/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-semibold"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative shrink-0 min-w-[150px]">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-darkBorder bg-white/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-semibold cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="relative shrink-0 min-w-[170px]">
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-darkBorder bg-white/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-semibold cursor-pointer"
          >
            <option value="">All Assignees</option>
            <option value={user?.id}>Assigned to Me</option>
            {project?.members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Main Tasks View Area */}
      {tasksLoading ? (
        <SkeletonKanban />
      ) : viewMode === 'kanban' ? (
        /* KANBAN GRID columns mapping */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 overflow-x-auto pb-4">
          {kanbanColumns.map((colName) => {
            const columnTasks = tasks.filter((t) => t.status === colName);
            const isDraggingOver = dragOverColumn === colName;

            return (
              <div
                key={colName}
                onDragOver={(e) => handleDragOver(e, colName)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDrop(e, colName)}
                className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all select-none min-h-[500px] ${
                  isDraggingOver
                    ? 'bg-primary-500/5 border-primary-500/40 dark:border-primary-500/30 shadow-neon-indigo'
                    : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-darkBorder/40'
                }`}
              >
                {/* Column header title */}
                <div className="flex items-center justify-between font-bold text-sm tracking-wide">
                  <span className="text-slate-700 dark:text-slate-300">{colName}</span>
                  <span className="flex items-center justify-center w-5.5 h-5.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards Lists */}
                <div className="flex-grow flex flex-col gap-3">
                  {columnTasks.length > 0 ? (
                    columnTasks.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenDetailModal(task)}
                        className={`p-4 rounded-xl border border-slate-200/50 dark:border-darkBorder bg-white dark:bg-darkCard hover:border-primary-500/35 transition-all shadow-sm cursor-grab active:cursor-grabbing ${
                          draggedTaskId === task._id ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        {/* Tags list */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2.5">
                            {task.tags.slice(0, 2).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="text-xs font-bold leading-snug tracking-tight text-slate-800 dark:text-slate-200 line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Footer cards details */}
                        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 dark:border-darkBorder/40">
                          {/* Priority badge */}
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              priorityBadges[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Assignee initials/avatar */}
                          {task.assignee ? (
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-6 h-6 rounded-lg object-cover ring-2 ring-primary-500/10"
                              title={`Assigned to ${task.assignee.name}`}
                            />
                          ) : (
                            <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                              <UserIcon className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-grow flex items-center justify-center border border-dashed border-slate-200/50 dark:border-darkBorder/40 rounded-xl p-4 text-[10px] text-slate-400 text-center font-semibold">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW custom table mapping */
        <Table
          columns={[
            {
              header: 'Task Title',
              accessor: 'title',
              render: (row) => (
                <div
                  onClick={() => handleOpenDetailModal(row)}
                  className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-500 cursor-pointer"
                >
                  {row.title}
                </div>
              ),
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (row) => (
                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                  {row.status}
                </span>
              ),
            },
            {
              header: 'Priority',
              accessor: 'priority',
              render: (row) => (
                <span
                  className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    priorityBadges[row.priority]
                  }`}
                >
                  {row.priority}
                </span>
              ),
            },
            {
              header: 'Assignee',
              accessor: 'assignee',
              render: (row) =>
                row.assignee ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={row.assignee.avatar}
                      alt={row.assignee.name}
                      className="w-5.5 h-5.5 rounded-lg object-cover"
                    />
                    <span className="text-xs font-bold">{row.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Unassigned</span>
                ),
            },
            {
              header: 'Due Date',
              accessor: 'dueDate',
              render: (row) =>
                row.dueDate ? (
                  <span className="text-xs text-slate-400 font-semibold">
                    {new Date(row.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">-</span>
                ),
            },
          ]}
          data={tasks}
          emptyMessage="No tasks found matching current search parameters"
        />
      )}

      {/* 4. REUSABLE Task creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Implement Drag and Drop API"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <textarea
              placeholder="Provide a detailed description of the deliverables..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workflow Column
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Backlog">Backlog</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Priority Level
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assignee
            </label>
            <select
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold"
            >
              <option value="">Unassigned</option>
              {project?.members?.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Due Date
            </label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold"
            />
          </div>

          {/* Tags entry */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Labels / Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Press add..."
                value={taskTagInput}
                onChange={(e) => setTaskTagInput(e.target.value)}
                className="flex-grow px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-bold text-xs"
              >
                Add
              </button>
            </div>
            {taskTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {taskTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[10px] font-extrabold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full border border-primary-500/10"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3 hover:text-rose-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200/50 dark:border-darkBorder">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 text-white hover:text-primary-300 border border-slate-800 hover:border-primary-500 font-bold text-xs transition-all cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. HIGH-FIDELITY TASK DETAIL & DISCUSSION MODAL */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Task Workspace Detail" size="lg">
        {detailLoading ? (
          <SkeletonText lines={4} />
        ) : selectedTask ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Context Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Opened in project Workspace: <span className="text-primary-400">{project?.name}</span>
                </p>
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Task Scopes & Specifications
                </h4>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedTask.description || 'No detailed specifications provided for this task.'}
                </div>
              </div>

              {/* Label tags list */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Labels / Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussion comments section */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-500" /> Collaboration thread ({comments.length})
                </h4>

                {/* Add new comment form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type details or updates on progress..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="flex-grow px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-700 text-white hover:text-primary-300 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="p-3 rounded-lg border border-slate-200/50 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-950 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.user?.avatar}
                              alt={comment.user?.name}
                              className="w-5 h-5 rounded-lg object-cover"
                            />
                            <span className="text-xs font-bold text-slate-750 dark:text-slate-200">
                              {comment.user?.name}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No collaboration comments yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Parameters Panel */}
            <div className="space-y-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950 self-start w-full">
              
              {/* Status */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Workflow Status
                </span>
                <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20">
                  {selectedTask.status}
                </span>
              </div>

              {/* Priority */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Priority level
                </span>
                <span
                  className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${
                    priorityBadges[selectedTask.priority]
                  }`}
                >
                  {selectedTask.priority}
                </span>
              </div>

              {/* Assignee */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Assignee
                </span>
                {selectedTask.assignee ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedTask.assignee.avatar}
                      alt={selectedTask.assignee.name}
                      className="w-7 h-7 rounded-lg object-cover ring-2 ring-primary-500/10"
                    />
                    <div>
                      <p className="text-xs font-bold">{selectedTask.assignee.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{selectedTask.assignee.role}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold">Unassigned</p>
                )}
              </div>

              {/* Due date */}
              {selectedTask.dueDate && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Target due Date
                  </span>
                  <p className="text-xs font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Creator details */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-darkBorder/80">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Reported by
                </span>
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedTask.creator?.avatar}
                    alt={selectedTask.creator?.name}
                    className="w-5.5 h-5.5 rounded-lg object-cover"
                  />
                  <span className="text-xs font-bold">{selectedTask.creator?.name}</span>
                </div>
              </div>

              {/* Delete task control trigger */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-darkBorder/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask._id)}
                  className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-rose-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>
              </div>

            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ProjectDetail;
