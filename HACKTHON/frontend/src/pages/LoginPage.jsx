import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Lock, User, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('customer');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      toast.success(`Authenticated as ${user.fullName || user.username}`);
      
      setTimeout(() => {
        switch (user.role) {
          case 'ADMIN': navigate('/admin'); break;
          case 'SERVICE_CENTER_MANAGER': navigate('/manager'); break;
          case 'MECHANIC': navigate('/mechanic'); break;
          default: navigate('/customer'); break;
        }
      }, 400);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (uname) => {
    setUsername(uname);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-white selection:text-black">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { 
            background: '#09090B', 
            color: '#FFFFFF', 
            border: '1px solid rgba(255,255,255,0.15)' 
          } 
        }} 
      />

      {/* Decorative fine white line design in background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            MechX
          </span>
        </Link>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Sign In
        </h1>
        <p className="mt-1.5 text-xs text-neutral-400">
          Enter your credentials to access the automotive management console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#09090B] py-8 px-6 sm:px-8 rounded-2xl border border-white/15 shadow-2xl">
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-white transition-all"
                />
                <User className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <span className="text-[11px] text-neutral-400 hover:text-white cursor-pointer transition-colors">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-white transition-all"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clean White Divider Line */}
          <div className="my-6 flex items-center justify-between">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="px-3 text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Demo Accounts</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Clean 4 Single Demo Accounts */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectAccount('customer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                username === 'customer' 
                  ? 'bg-white/10 border-white text-white' 
                  : 'bg-black/50 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Customer</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">customer</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAccount('mechanic')}
              className={`p-3 rounded-xl border text-left transition-all ${
                username === 'mechanic' 
                  ? 'bg-white/10 border-white text-white' 
                  : 'bg-black/50 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Mechanic</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">mechanic</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAccount('manager')}
              className={`p-3 rounded-xl border text-left transition-all ${
                username === 'manager' 
                  ? 'bg-white/10 border-white text-white' 
                  : 'bg-black/50 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Manager</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">manager</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAccount('admin')}
              className={`p-3 rounded-xl border text-left transition-all ${
                username === 'admin' 
                  ? 'bg-white/10 border-white text-white' 
                  : 'bg-black/50 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Administrator</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">admin</div>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:underline font-medium">
              Create account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
