import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import Card3DTilt from './Card3DTilt';
import { MapPin, ArrowLeft, KeyRound, ShieldCheck, AlertCircle, User, UserPlus, Hash, Building, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentFormCard({ onBack }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const { collegesList, selectedCollege, setSelectedCollege, unlockCollegeWithCode, fetchRegisteredColleges } = useCollege();

  // Form states
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState(null);
  const { loginStudent, registerStudent, loading, error, setError } = useAuth();
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
        setError('Please select an Admin-registered College!');
        return;
      }
      if (!secretKey) {
        setError('You must enter the College Security Code created by the Admin!');
        return;
      }

      const codeRes = await unlockCollegeWithCode(selectedCollege, secretKey);
      if (!codeRes.success) {
        setError(codeRes.message || 'Incorrect Security Code for this College!');
        return;
      }

      const res = await registerStudent(rollNumber, selectedCollege, name, password, secretKey);
      if (res.success) navigate('/student/dashboard');
    } else if (mode === 'forgot') {
      if (password !== confirmPassword) {
        setError('New Password and Confirm Password do not match!');
        return;
      }
      const res = await api.post('/api/auth/student/reset-password', {
        roll_number: rollNumber,
        secret_key: secretKey,
        new_password: password
      });
      if (res && res.success) {
        setSuccessMsg('Student password reset successful! You can now sign in.');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setError(res?.message || 'Password reset failed. Verify Roll Number & College Security Code.');
      }
    } else {
      const codeRes = await unlockCollegeWithCode(selectedCollege, secretKey);
      if (!codeRes.success) {
        setError(codeRes.message || 'Incorrect Security Code for this College!');
        return;
      }

      const res = await loginStudent(rollNumber, password, secretKey);
      if (res.success) navigate('/student/dashboard');
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
        className="w-full max-h-[85vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-sky-500/40 shadow-2xl shadow-sky-500/20 border-t-4 border-t-sky-500 text-white scrollbar-thin"
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-500/20 px-2.5 py-1 rounded-full border border-sky-500/30">
            {mode === 'signup' ? 'New Passenger Sign Up' : mode === 'forgot' ? 'Reset Student Password' : 'Student Portal'}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-inner border border-sky-500/30">
            {mode === 'signup' ? <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" /> : mode === 'forgot' ? <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" /> : <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {mode === 'signup' ? 'Student Registration' : mode === 'forgot' ? 'Reset Student Password' : 'Student Authentication'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' ? 'Requires College Security Code created by Admin' : mode === 'forgot' ? 'Verify Roll Number & College Security Code to reset password' : 'Enter College Security Code to unlock bus tracking'}
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
                <Building className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-sky-500/40 text-xs font-bold text-sky-300 focus:ring-2 focus:ring-sky-500"
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
                Student Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Roll No / Student ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter Roll Number"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>College Security Code <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-amber-300 font-semibold">Created by Admin</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter Security Code created by Admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs font-semibold text-sky-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
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
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Register Student Account' : mode === 'forgot' ? 'Reset Student Password' : 'Unlock & Sign In as Student'}
            </button>

            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="w-full block text-center py-2 rounded-xl text-xs font-bold text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
              >
                New Student? Enroll Here
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full block text-center py-2 rounded-xl text-xs font-bold text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
              >
                Back to Student Sign In
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </Card3DTilt>
  );
}
