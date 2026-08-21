import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import Card3DTilt from './Card3DTilt';
import { Shield, ArrowLeft, KeyRound, UserCheck, UserPlus, AlertCircle, User, Building, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminFormCard({ onBack }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const { fetchRegisteredColleges } = useCollege();

  // Form states
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');

  // Success / Error messages
  const [successMsg, setSuccessMsg] = useState(null);
  const { loginAdmin, registerAdmin, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Create Password and Confirm Password do not match!');
        return;
      }
      if (!collegeId || !collegeName || !securityCode) {
        setError('College ID, College Name, and Create Security Code are required!');
        return;
      }
      const res = await registerAdmin(collegeId, password, name, collegeName, securityCode);
      if (res.success) {
        await fetchRegisteredColleges(collegeId);
        navigate('/admin/dashboard');
      }
    } else if (mode === 'forgot') {
      if (password !== confirmPassword) {
        setError('New Password and Confirm Password do not match!');
        return;
      }
      const res = await api.post('/api/auth/admin/reset-password', {
        college_id: collegeId,
        security_code: securityCode,
        new_password: password
      });
      if (res && res.success) {
        setSuccessMsg('Password reset successful! You can now sign in.');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setError(res?.message || 'Password reset failed. Verify College ID & Security Code.');
      }
    } else {
      const res = await loginAdmin(collegeId, password);
      if (res.success) navigate('/admin/dashboard');
    }
  };

  const switchMode = (newMode) => {
    setError(null);
    setSuccessMsg(null);
    setMode(newMode);
  };

  return (
    <Card3DTilt depth={30} className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-h-[85vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 text-white scrollbar-thin"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            type="button"
            onClick={onBack || (() => navigate('/'))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portals
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
            {mode === 'signup' ? 'New College Admin Registration' : mode === 'forgot' ? 'Reset Admin Password' : 'Admin Portal'}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner border border-indigo-500/30">
            {mode === 'signup' ? <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" /> : mode === 'forgot' ? <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" /> : <Shield className="w-6 h-6 sm:w-7 sm:h-7" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {mode === 'signup' ? 'Register New College Account' : mode === 'forgot' ? 'Reset Admin Password' : 'Admin Authentication'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' ? 'Register your College into the multi-college network' : mode === 'forgot' ? 'Verify your College ID & Security Code to reset password' : 'Institutional administrator access only'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrator Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  College / University Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. St. Marys Engineering College"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              College ID / Admin ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="Enter unique College ID (e.g. STMARYS, AITAM)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {(mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>College Security Code <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-amber-300">Verification Code</span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  placeholder="Enter Security Code created during Admin sign up"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{mode === 'forgot' ? 'New Password' : mode === 'signup' ? 'Create Password' : 'Password'} <span className="text-rose-400">*</span></span>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'forgot' ? 'Enter new password' : mode === 'signup' ? 'Create strong password' : 'Enter password'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {(mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Confirm {mode === 'forgot' ? 'New' : ''} Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Register College & Admin Account' : mode === 'forgot' ? 'Reset Admin Password' : 'Sign In as Administrator'}
            </button>

            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="w-full block text-center py-2 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
              >
                New Admin? Register Your College Here
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full block text-center py-2 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
              >
                Back to Admin Sign In
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </Card3DTilt>
  );
}
