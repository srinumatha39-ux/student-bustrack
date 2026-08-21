import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollege } from '../context/CollegeContext';
import Bus3DCanvas from '../components/Bus3DCanvas';
import TowHitchAnimation from '../components/TowHitchAnimation';
import Card3DTilt from '../components/Card3DTilt';
import Bus3DRealGraphic from '../components/Bus3DRealGraphic';
import AdminFormCard from '../components/AdminFormCard';
import DriverFormCard from '../components/DriverFormCard';
import StudentFormCard from '../components/StudentFormCard';
import { Shield, Bus, MapPin, ArrowRight, ShieldCheck, Activity, Award, Building2, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const { collegesList, selectedCollege, setSelectedCollege, currentCollegeObj } = useCollege();
  const [selectedPortal, setSelectedPortal] = useState(null); // 'admin' | 'driver' | 'student' | null

  const handleAdminClick = () => {
    setSelectedPortal('admin');
  };

  const handleDriverClick = () => {
    setSelectedPortal('driver');
  };

  const handleStudentClick = () => {
    setSelectedPortal('student');
  };

  const handleBackToPortals = () => {
    if (selectedPortal) {
      setSelectedPortal(null);
    } else if (window.history.length > 1) {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden flex flex-col justify-between p-4 sm:p-8">
      
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* FULLSCREEN ANIMATION MODE: Remove all extra background matter when any portal is selected */}
      {selectedPortal ? (
        <TowHitchAnimation
          key={selectedPortal}
          type={selectedPortal}
          onBack={handleBackToPortals}
        >
          {selectedPortal === 'admin' && <AdminFormCard onBack={handleBackToPortals} />}
          {selectedPortal === 'driver' && <DriverFormCard onBack={handleBackToPortals} />}
          {selectedPortal === 'student' && <StudentFormCard onBack={handleBackToPortals} />}
        </TowHitchAnimation>
      ) : (
        /* DYNAMIC ADMIN-CREATED COLLEGES LANDING PAGE */
        <div className="max-w-7xl mx-auto w-full relative z-10 my-auto py-8 space-y-12">
          
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 text-amber-300 text-xs font-bold border border-amber-400/30 backdrop-blur-md shadow-lg"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Multi-College Protected Transportation System</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
              >
                Smart College <br />
                <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                  Bus 3D Protected System
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-base sm:text-lg font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Only colleges created directly by Admins are shown. Students require the College Security Code created by the Admin to view bus locations.
              </motion.p>

              {/* Dynamic Admin-Created Colleges Dropdown Box */}
              <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2 max-w-xl mx-auto lg:mx-0 text-left">
                <label className="text-xs font-extrabold text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    ADMIN-REGISTERED COLLEGES
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    {collegesList.length} Active Colleges
                  </span>
                </label>

                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-xs font-bold text-white border border-slate-700 focus:ring-2 focus:ring-amber-500"
                >
                  {collegesList.length === 0 ? (
                    <option value="NONE" className="bg-slate-900 text-slate-400 font-medium">
                      No Registered Colleges Yet — Click Admin Login to Register College
                    </option>
                  ) : (
                    collegesList.map((col) => (
                      <option key={col.id} value={col.college_id} className="bg-slate-900 text-white font-medium">
                        {col.name} ({col.college_id})
                      </option>
                    ))
                  )}
                </select>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-medium">
                  <span>Selected: <strong className="text-white">{currentCollegeObj.name || 'None Selected'}</strong></span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> Security Code Protected
                  </span>
                </div>
              </div>

              {/* Enterprise Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Security Code Verification</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>GPS Location Access Control</span>
                </div>
              </div>
            </div>

            {/* Interactive WebGL 3D Bus Visualizer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl relative group"
            >
              <Bus3DCanvas autoRotate={true} />

              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Live 3D Shuttle Renderer</span>
                </div>
                <span className="text-[11px] text-amber-300 font-bold">{currentCollegeObj.name || 'Admin-Registered System'}</span>
              </div>
            </motion.div>

          </div>

          {/* Three Access Portals */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">Select Access Portal</h2>
              <p className="text-xs text-slate-400 font-medium">Admins register new colleges directly. Students use Admin security codes to view bus locations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              
              {/* 1. ADMIN LOGIN */}
              <Card3DTilt depth={30} onClick={handleAdminClick} className="cursor-pointer">
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/30 shadow-xl hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all flex flex-col justify-between h-full group">
                  <div>
                    <div className="w-20 h-14 mb-4 group-hover:scale-105 transition-transform">
                      <Bus3DRealGraphic isMoving={true} wheelsSpinning={true} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30 w-max mb-2">
                      Admin Registration
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2">ADMIN LOGIN / SIGN UP</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      Register your College directly, define your College Security Code, and manage fleet buses.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-indigo-400 font-bold text-xs">
                    <span>Register College or Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card3DTilt>

              {/* 2. DRIVER PORTAL */}
              <Card3DTilt depth={30} onClick={handleDriverClick} className="cursor-pointer">
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl p-8 border border-amber-500/30 shadow-xl hover:border-amber-400 hover:shadow-amber-500/20 transition-all flex flex-col justify-between h-full group border-t-4 border-t-amber-500">
                  <div>
                    <div className="w-20 h-14 mb-4 group-hover:scale-105 transition-transform">
                      <Bus3DRealGraphic isMoving={true} wheelsSpinning={true} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 w-max mb-2">
                      Driver Access
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2">DRIVER PORTAL</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      Select your Admin-created college, enter Admin secret key, and start live route tracking.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-amber-400 font-bold text-xs">
                    <span>Launch Driver Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card3DTilt>

              {/* 3. STUDENT LOGIN */}
              <Card3DTilt depth={30} onClick={handleStudentClick} className="cursor-pointer">
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl p-8 border border-sky-500/30 shadow-xl hover:border-sky-400 hover:shadow-sky-500/20 transition-all flex flex-col justify-between h-full group border-t-4 border-t-sky-500">
                  <div>
                    <div className="w-20 h-14 mb-4 group-hover:scale-105 transition-transform">
                      <Bus3DRealGraphic isMoving={true} wheelsSpinning={true} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 w-max mb-2">
                      Protected Student Access
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2">STUDENT LOGIN</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      Enter College Security Code created by Admin to unlock bus location markers on Mapbox 3D vector map.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-sky-400 font-bold text-xs">
                    <span>Unlock & Launch Student Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card3DTilt>

            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 font-medium py-4 border-t border-slate-900">
        Smart College Bus Tracking System &copy; {new Date().getFullYear()} — Admin-Created Multi-College Infrastructure
      </div>

    </div>
  );
}
