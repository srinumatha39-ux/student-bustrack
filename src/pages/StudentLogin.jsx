import React from 'react';
import StudentFormCard from '../components/StudentFormCard';
import TowHitchAnimation from '../components/TowHitchAnimation';

export default function StudentLogin() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative z-10">
      <TowHitchAnimation type="student" onComplete={() => {}}>
        <StudentFormCard />
      </TowHitchAnimation>
    </div>
  );
}
