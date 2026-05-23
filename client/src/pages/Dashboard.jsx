import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { SkeletonCard, SkeletonList } from '../components/common/Skeleton';
import {
  FolderKanban,
  CheckCircle2,
  AlertOctagon,
  Users2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('[Dashboard Stats Error]', error);
        showToast('Failed to load analytical metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Top metrics grids skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        {/* Main section skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <SkeletonList />
        </div>
      </div>
    );
  }

  // Pre-process chart data
  const statusData = Object.entries(stats?.statusBreakdown || {}).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  const priorityData = Object.entries(stats?.priorityBreakdown || {}).map(([key, val]) => ({
    name: key,
    tasks: val,
  }));

  // Colors mapping for charts
  const statusColors = {
    Backlog: '#64748b',
    Todo: '#6366f1',
    'In Progress': '#06b6d4',
    Review: '#a855f7',
    Done: '#10b981',
  };

  const priorityColors = {
    Low: '#94a3b8',
    Medium: '#6366f1',
    High: '#f59e0b',
    Urgent: '#ef4444',
  };

  // Top metric card metrics
  const summaryCards = [
    {
      title: 'Workspace Projects',
      value: stats?.projectsCount || 0,
      description: `${stats?.activeProjectsCount || 0} active modules`,
      icon: FolderKanban,
      colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Completed Tasks',
      value: stats?.completedTasksCount || 0,
      description: 'Marked as Done',
      icon: CheckCircle2,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Pending Tasks',
      value: stats?.pendingTasksCount || 0,
      description: 'Awaiting progress',
      icon: AlertOctagon,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Teammates',
      value: stats?.usersCount || 0,
      description: 'Collaborating users',
      icon: Users2,
      colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Dashboard Greeting Header */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-2xl shadow-indigo-950/60 backdrop-blur-2xl">
        {/* Glow circles inside header */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-primary-500/10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[150px] h-[150px] rounded-full bg-brand-500/5 blur-[50px] pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-white">
            Welcome Back, {user?.name.split(' ')[0]}! <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-sm text-slate-300 font-semibold mt-1.5">
            Here's an overview of your team's metrics and task progressions for today.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white transition-all self-start md:self-auto text-xs font-bold tracking-wider uppercase">
          <Zap className="w-4 h-4 fill-indigo-400" />
          TaskFlow AI Analytics
        </div>
      </div>

      {/* 2. Primary Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-panel-dark border border-slate-700 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-200 tracking-wide uppercase">
                  {card.title}
                </span>
                <span className={`p-2.5 rounded-xl border ${card.colorClass} transition-colors`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </span>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-2">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Performance Visualizer */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel-dark border border-slate-700">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            Priority Workload Distributions
          </h3>
          <div className="h-80 w-full">
            {stats?.tasksCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(9, 10, 15, 0.9)',
                      border: '1px solid rgba(30, 34, 53, 0.9)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="tasks" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-200">
                <FolderKanban className="w-12 h-12 stroke-[1.5] mb-2" />
                <p className="text-sm font-extrabold">No active tasks in your workspace to chart</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Status Share (Pie Chart) */}
        <div className="p-6 rounded-2xl glass-panel-dark border border-slate-700 flex flex-col justify-between">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-4">
            Workflow Status Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {stats?.tasksCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(9, 10, 15, 0.9)',
                      border: '1px solid rgba(30, 34, 53, 0.9)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-200">
                <FolderKanban className="w-10 h-10 stroke-[1.5] mb-2" />
                <p className="text-sm">No workflow data available</p>
              </div>
            )}
          </div>
          {/* Status color legends */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700">
            {Object.entries(statusColors).map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-slate-500 truncate">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Team Workload & Activity Feed Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Feed Container */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel-dark border border-slate-700">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-500" /> Recent Activities Feed
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {stats?.activities && stats.activities.length > 0 ? (
              stats.activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700 bg-white/20 dark:bg-slate-950"
                >
                  <img
                    src={activity.user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                    alt={activity.user?.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary-500/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {activity.user?.name || 'Deleted User'}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {new Date(activity.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 mt-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                      {activity.action}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {activity.details}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                No recent activity logged in this workspace
              </div>
            )}
          </div>
        </div>

        {/* Workspace Users/Teammates Panel */}
        <div className="p-6 rounded-2xl glass-panel-dark border border-slate-700">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6">
            Teammates List
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {stats?.teamMembersList && stats.teamMembersList.length > 0 ? (
              stats.teamMembersList.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={member.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                    alt={member.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-500/5"
                  />
                  <div className="min-w-0 flex-grow">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {member.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-slate-400">No teammates found</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
