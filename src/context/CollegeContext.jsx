import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CollegeContext = createContext();

export function CollegeProvider({ children }) {
  const [collegesList, setCollegesList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(() => {
    return localStorage.getItem('selected_college_id') || 'ALL';
  });

  // Track unlocked college security codes in student session
  const [unlockedSecurityCodes, setUnlockedSecurityCodes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unlocked_college_security_codes')) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchRegisteredColleges();
  }, []);

  useEffect(() => {
    localStorage.setItem('selected_college_id', selectedCollege);
  }, [selectedCollege]);

  useEffect(() => {
    localStorage.setItem('unlocked_college_security_codes', JSON.stringify(unlockedSecurityCodes));
  }, [unlockedSecurityCodes]);

  const fetchRegisteredColleges = async (newSelectedId = null) => {
    try {
      const data = await api.get('/api/colleges');
      if (Array.isArray(data)) {
        setCollegesList(data);
        if (newSelectedId) {
          setSelectedCollege(newSelectedId);
        } else if (data.length > 0 && (selectedCollege === 'ALL' || selectedCollege === 'NONE' || !data.some(c => c.college_id === selectedCollege))) {
          setSelectedCollege(data[0].college_id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch registered colleges:', err);
    }
  };

  const unlockCollegeWithCode = async (college_id, security_code) => {
    try {
      const res = await api.post('/api/colleges/verify-code', { college_id, security_code });
      if (res && res.success) {
        setUnlockedSecurityCodes(prev => ({
          ...prev,
          [college_id]: security_code
        }));
        return { success: true };
      }
      return { success: false, message: res?.message || 'Incorrect Security Code.' };
    } catch (err) {
      return { success: false, message: 'Invalid College Security Code.' };
    }
  };

  const isCollegeUnlocked = (college_id) => {
    if (!college_id) return true;
    return Boolean(unlockedSecurityCodes[college_id]);
  };

  const currentCollegeObj = collegesList.find(c => c.college_id === selectedCollege) || collegesList[0] || {
    id: 'NONE',
    college_id: 'NONE',
    name: 'No Registered Colleges Yet',
    security_code: ''
  };

  return (
    <CollegeContext.Provider
      value={{
        selectedCollege,
        setSelectedCollege,
        currentCollegeObj,
        collegesList,
        fetchRegisteredColleges,
        unlockCollegeWithCode,
        isCollegeUnlocked,
        unlockedSecurityCodes
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
}
