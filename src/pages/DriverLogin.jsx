import React from 'react';
import DriverFormCard from '../components/DriverFormCard';
import TowHitchAnimation from '../components/TowHitchAnimation';

export default function DriverLogin() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative z-10">
      <TowHitchAnimation type="driver" onComplete={() => {}}>
        <DriverFormCard />
      </TowHitchAnimation>
    </div>
  );
}
