import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { User, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      showToast('Registration successful! Welcome to TaskFlow AI.', 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/45 via-slate-950 to-slate-950 px-4 overflow-hidden">
      
      {/* Neon glowing elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-500/15 blur-[120px] glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-500/15 blur-[120px] glow-pulse" />

      {/* Registration Card */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/60 border border-slate-700 bg-slate-900/90 backdrop-blur-2xl p-8 md:p-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-brand-500 text-white shadow-neon-indigo mb-4">
            <span className="text-2xl font-extrabold">T</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Create Account
          </h2>
          <p className="text-slate-300 text-sm font-semibold">
            Join the premium project management workspace
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full name field */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="Enter your email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* User Role Selection field (Admin / Manager / Team Member) */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Workspace Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium text-sm appearance-none cursor-pointer"
              >
                <option className="bg-slate-900 text-white" value="Team Member">
                  Team Member (Default)
                </option>
                <option className="bg-slate-900 text-white" value="Manager">
                  Manager
                </option>
                <option className="bg-slate-900 text-white" value="Admin">
                  Admin
                </option>
              </select>
            </div>
          </div>

          {/* Submit register button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 px-4 bg-slate-950 hover:bg-slate-900 text-white hover:text-indigo-300 font-extrabold rounded-xl border border-indigo-500/50 hover:border-indigo-400 shadow-md shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Registering...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Workspace Account
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Foot link */}
        <div className="mt-8 text-center text-sm font-medium">
          <p className="text-slate-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-extrabold underline decoration-2 transition-colors"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
