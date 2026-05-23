import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';
import { SkeletonCard } from '../components/common/Skeleton';
import { Users2, Mail, ShieldCheck, ShieldAlert, BadgeCheck } from 'lucide-react';

const Team = () => {
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchTeammates = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users');
        if (response.data.success) {
          setTeammates(response.data.data);
        }
      } catch (error) {
        console.error('[Teammates load error]', error);
        showToast('Failed to load workspace team members', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTeammates();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Team Collaboration Hub</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore all users registered in this TaskFlow workspace directory.
        </p>
      </div>

      {/* Teammates Grids */}
      {teammates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teammates.map((teammate) => {
            const isAdmin = teammate.role === 'Admin';
            const isManager = teammate.role === 'Manager';

            return (
              <div
                key={teammate.id}
                className="group relative flex flex-col items-center text-center p-6 rounded-2xl glass-panel-dark border border-slate-700 hover:border-indigo-500/50 transition-all duration-200 shadow-sm"
              >
                {/* Visual glow frame on hover */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-primary-500/5 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Avatar Ring */}
                <div className="relative mb-4">
                  <img
                    src={teammate.avatar}
                    alt={teammate.name}
                    className="w-18 h-18 rounded-2xl object-cover ring-4 ring-primary-500/10 shadow-md"
                  />
                  {isAdmin ? (
                    <span className="absolute -bottom-1 -right-1 p-1 bg-rose-500 text-white rounded-lg shadow border border-slate-900">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </span>
                  ) : isManager ? (
                    <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-white rounded-lg shadow border border-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-lg shadow border border-slate-900">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  {teammate.name}
                </h3>
                <span
                  className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 mt-1.5 rounded ${
                    isAdmin
                      ? 'bg-rose-500/10 text-rose-500'
                      : isManager
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  {teammate.role}
                </span>

                {/* Mail contact info */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-6 pt-4 border-t border-slate-700 w-full justify-center">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-full">{teammate.email}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl glass-panel-dark border border-slate-700 text-center">
          <Users2 className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-bold">No Teammates</h3>
        </div>
      )}
    </div>
  );
};

export default Team;
