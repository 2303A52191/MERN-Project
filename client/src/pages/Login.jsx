import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      showToast('Welcome back to TaskFlow AI!', 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/45 via-slate-950 to-slate-950 px-4 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-500/15 blur-[120px] glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-500/15 blur-[120px] glow-pulse" />

      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/60 border border-slate-700 bg-slate-900/90 backdrop-blur-2xl p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-brand-500 text-white shadow-neon-indigo mb-4">
            <span className="text-2xl font-extrabold">T</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Sign In
          </h2>
          <p className="text-slate-300 text-sm font-semibold">
            Enter details to access your TaskFlow AI workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
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
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Password
              </label>
              <span className="text-xs text-primary-400 hover:text-primary-300 font-bold cursor-pointer transition-colors">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-slate-950 hover:bg-slate-900 text-white hover:text-indigo-300 font-extrabold rounded-xl border border-indigo-500/50 hover:border-indigo-400 shadow-md shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Access Platform
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium">
          <p className="text-slate-300">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-extrabold underline decoration-2 transition-colors"
            >
              Sign Up Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
