import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import { SkeletonCard } from '../components/common/Skeleton';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  ChevronRight,
  TrendingUp,
  Trash2,
  Edit2,
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isPrivileged = user?.role === 'Admin' || user?.role === 'Manager';

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('[Projects Fetch Error]', error);
      showToast('Failed to load workspace projects', 'error');
    }
  };

  const fetchTeammates = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setTeammates(response.data.data);
      }
    } catch (error) {
      console.error('[Teammates Fetch Error]', error);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchTeammates()]);
      setLoading(false);
    };
    initPage();
  }, [showToast]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Please provide a project title', 'warning');
      return;
    }

    try {
      const response = await api.post('/projects', {
        name,
        description,
        dueDate: dueDate || undefined,
        members: selectedMembers,
      });

      if (response.data.success) {
        showToast(`Workspace project "${name}" created successfully`, 'success');
        setIsModalOpen(false);
        // Reset fields
        setName('');
        setDescription('');
        setDueDate('');
        setSelectedMembers([]);
        // Reload list
        fetchProjects();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation(); // Avoid navigating on card click
    if (!window.confirm('Are you sure you want to delete this project? This will permanently delete all associated tasks.')) {
      return;
    }

    try {
      const response = await api.delete(`/projects/${id}`);
      if (response.data.success) {
        showToast('Project deleted successfully', 'success');
        fetchProjects();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  const toggleMemberSelection = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Project Workspaces</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage projects, view status configurations, and coordinate team hubs.
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-primary-300 font-bold rounded-xl border border-slate-700 hover:border-primary-500 shadow-md shadow-slate-950/50 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* 2. Projects Grid Lists */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isOwner = project.owner?._id === user?.id || project.owner === user?.id;
            const canDelete = isPrivileged || isOwner;

            return (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="group relative flex flex-col justify-between p-6 rounded-2xl glass-panel-dark border border-slate-700 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg"
              >
                <div>
                  {/* Status Badge & Header Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        project.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : project.status === 'On Hold'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                      }`}
                    >
                      {project.status}
                    </span>

                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteProject(project._id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                    {project.name}
                  </h3>

                  {/* Project Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-2.5 leading-relaxed font-medium">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer Info details */}
                <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    {project.dueDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(project.dueDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {project.members?.length || 0} members
                    </span>
                  </div>

                  <span className="p-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl glass-panel-dark border border-slate-700 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-slate-400 mb-4 border border-slate-200/20">
            <FolderKanban className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Projects Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
            There are no workspace modules initiated yet. Let's create one to launch Kanban boards.
          </p>
          {isPrivileged && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-4 py-3 mt-6 bg-slate-900 hover:bg-slate-800 text-white hover:text-primary-300 font-bold rounded-xl border border-slate-700 hover:border-primary-500 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create First Project
            </button>
          )}
        </div>
      )}

      {/* 3. Reusable Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate Project Workspace">
        <form onSubmit={handleCreateProject} className="space-y-5">
          {/* Project name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. TaskFlow Marketing Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-semibold text-sm"
            />
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <textarea
              placeholder="Provide context or scopes for the project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium text-sm"
            />
          </div>

          {/* Due date input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-semibold text-sm"
            />
          </div>

          {/* Assign Members list */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assign Team Members
            </label>
            <div className="border border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-950 rounded-xl p-3.5 max-h-40 overflow-y-auto space-y-2.5">
              {teammates.length > 0 ? (
                teammates
                  .filter((t) => t.id !== user?.id)
                  .map((teammate) => {
                    const isSelected = selectedMembers.includes(teammate.id);
                    return (
                      <div
                        key={teammate.id}
                        onClick={() => toggleMemberSelection(teammate.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary-500/10 text-primary-500 border border-primary-500/25'
                            : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <img
                          src={teammate.avatar}
                          alt={teammate.name}
                          className="w-7 h-7 rounded-lg object-cover ring-2 ring-primary-500/5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{teammate.name}</p>
                          <p className="text-[10px] text-slate-400 truncate uppercase font-semibold">
                            {teammate.role}
                          </p>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-xs text-slate-400">No other team members registered.</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/50 dark:border-darkBorder">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white hover:text-primary-300 border border-slate-800 hover:border-primary-500 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Launch Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
