import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import Card3DTilt from './Card3DTilt';
import { Bus, ArrowLeft, KeyRound, UserCheck, ShieldCheck, AlertCircle, User, UserPlus, Building, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DriverFormCard({ onBack }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const { collegesList, selectedCollege, setSelectedCollege, fetchRegisteredColleges } = useCollege();

  // Form states
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [name, setName] = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState(null);
  const { loginDriver, registerDriver, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegisteredColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!selectedCollege || selectedCollege === 'ALL' || selectedCollege === 'NONE') {
        setError('Please select a registered College!');
        return;
      }
      const res = await registerDriver(driverId, name, password, secretKey, selectedCollege);
      if (res.success) navigate('/driver/dashboard');
    } else if (mode === 'forgot') {
      if (password !== confirmPassword) {
        setError('New Password and Confirm Password do not match!');
        return;
      }
      const res = await api.post('/api/auth/driver/reset-password', {
        driver_id: driverId,
        secret_key: secretKey,
        new_password: password
      });
      if (res && res.success) {
        setSuccessMsg('Driver password reset successful! You can now sign in.');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setError(res?.message || 'Password reset failed. Verify Driver ID & Admin Secret Key.');
      }
    } else {
      const res = await loginDriver(driverId, password, secretKey);
      if (res.success) navigate('/driver/dashboard');
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
        className="w-full max-h-[85vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl shadow-amber-500/20 border-t-4 border-t-amber-500 text-white scrollbar-thin"
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
            {mode === 'signup' ? 'New Driver Enrollment' : mode === 'forgot' ? 'Reset Driver Password' : 'Driver Portal'}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner border border-amber-500/30">
            {mode === 'signup' ? <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" /> : mode === 'forgot' ? <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" /> : <Bus className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {mode === 'signup' ? 'Driver Enrollment' : mode === 'forgot' ? 'Reset Driver Password' : 'Driver Authentication'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' ? 'Enroll driver account with Admin-issued Secret Key' : mode === 'forgot' ? 'Verify your Driver ID & Admin Secret Key to reset password' : 'Select Admin-registered college & sign in'}
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
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Select Admin-Registered College <span className="text-rose-400">*</span></span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-xs font-bold text-amber-300 focus:ring-2 focus:ring-amber-500"
                >
                  {collegesList.length === 0 ? (
                    <option value="NONE" className="bg-slate-900 text-slate-400">
                      No Registered Colleges Yet (Create Admin Account)
                    </option>
                  ) : (
                    collegesList.map((col) => (
                      <option key={col.id} value={col.college_id} className="bg-slate-900 text-white font-medium">
                        {col.name} ({col.college_id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Driver Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Driver ID / Operator ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                placeholder="Enter Driver ID (e.g. DRV-01)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Admin Secret Key <span className="text-rose-400">*</span></span>
              <span className="text-[10px] font-normal text-slate-400">Issued by Admin</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter college security code created by Admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{mode === 'forgot' ? 'New Password' : 'Password'} <span className="text-rose-400">*</span></span>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
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
                placeholder={mode === 'forgot' ? 'Enter new password' : 'Enter password'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {mode === 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Confirm New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Enroll Driver Account' : mode === 'forgot' ? 'Reset Driver Password' : 'Sign In as Driver'}
            </button>

            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="w-full block text-center py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              >
                New Driver? Enroll Here
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full block text-center py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              >
                Back to Driver Sign In
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </Card3DTilt>
  );
}
