import React from 'react';
import AdminFormCard from '../components/AdminFormCard';
import TowHitchAnimation from '../components/TowHitchAnimation';

export default function AdminLogin() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative z-10">
      <TowHitchAnimation type="driver" onComplete={() => {}}>
        <AdminFormCard />
      </TowHitchAnimation>
    </div>
  );
}
