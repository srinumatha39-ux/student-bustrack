import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card3DTilt from './Card3DTilt';
import { MapPin, ArrowLeft, KeyRound, ShieldCheck, AlertCircle, User, UserPlus, Hash, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentFormCard({ onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Clean production form state
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const { loginStudent, registerStudent, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const res = await registerStudent(rollNumber, collegeId, name, password, secretKey);
      if (res.success) navigate('/student/dashboard');
    } else {
      const res = await loginStudent(rollNumber, password, secretKey);
      if (res.success) navigate('/student/dashboard');
    }
  };

  const toggleMode = () => {
    setError(null);
    setIsSignUp(!isSignUp);
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
            {isSignUp ? 'New Passenger Sign Up' : 'Passenger Portal'}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-inner border border-sky-500/30">
            {isSignUp ? <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" /> : <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {isSignUp ? 'Student Transit Enrollment' : 'Passenger Authentication'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? 'Register student roll number & access code' : 'Access live campus shuttle tracking and predictive ETAs'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
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
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              College ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="Enter College ID"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isSignUp ? 'Create Password' : 'Password'} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create password' : 'Enter password'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Security Pass Code <span className="text-rose-400">*</span></span>
              <span className="text-[10px] font-normal text-slate-400">Issued by Administration</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter security pass code"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs font-semibold text-sky-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Enroll Passenger Account' : 'Sign In as Passenger'}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              className="w-full block text-center py-2 rounded-xl text-xs font-bold text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
            >
              {isSignUp ? 'Already registered? Sign In' : "New Passenger? Enroll Here"}
            </button>
          </div>
        </form>
      </motion.div>
    </Card3DTilt>
  );
}
