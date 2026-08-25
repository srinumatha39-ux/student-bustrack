// Unified API & Data Access Service with Dynamic Cross-Device Host Resolution & HTTPS Mixed-Content Prevention

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    // Prevent HTTPS Mixed Content Blocking on Vercel production!
    if (window.location.protocol === 'https:') {
      return window.location.origin;
    }
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
  }
  return 'http://localhost:5000';
};

const API_BASE = getApiBase();

function getLocalData(key) {
  const stored = localStorage.getItem(`bus_app_${key}`);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function setLocalData(key, data) {
  localStorage.setItem(`bus_app_${key}`, JSON.stringify(data));
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, signal: controller.signal });
    clearTimeout(id);

    // Return backend JSON response directly for both success and HTTP 4xx validation errors!
    if (res.ok || (res.status >= 400 && res.status < 500)) {
      return await res.json();
    }
    
    throw new Error(`Server error ${res.status}`);
  } catch (err) {
    console.warn(`[API] Connection to ${API_BASE}${endpoint} failed. Using fallback local storage.`);
    return fallbackLocalHandler(endpoint, method, body);
  }
}

function fallbackLocalHandler(endpoint, method, body) {
  // COLLEGES LIST & SECURITY VERIFICATION
  if (endpoint === '/api/colleges') {
    const admins = getLocalData('admins');
    const colleges = getLocalData('colleges');

    const adminColleges = admins
      .filter(a => a.college_id && a.college_name)
      .map(a => ({
        id: a.college_id,
        college_id: a.college_id,
        name: a.college_name,
        security_code: a.security_code
      }));

    const combined = [...colleges];
    adminColleges.forEach(ac => {
      if (!combined.some(c => c.college_id === ac.college_id)) {
        combined.push(ac);
      }
    });

    return combined;
  }

  if (endpoint === '/api/colleges/verify-code') {
    const admins = getLocalData('admins');
    const colleges = getLocalData('colleges');

    const matchAdmin = admins.find(a => a.college_id === body?.college_id);
    const matchCol = colleges.find(c => c.college_id === body?.college_id);

    const validCode = matchAdmin?.security_code || matchCol?.security_code;
    if (validCode && validCode === body?.security_code) {
      return { success: true, message: 'Security Code Verified!' };
    }
    return { success: false, message: 'Incorrect Security Code for this College.' };
  }

  // ADMIN RESET PASSWORD
  if (endpoint === '/api/auth/admin/reset-password') {
    const admins = getLocalData('admins');
    const admin = admins.find(a => a.college_id === body.college_id && a.security_code === body.security_code);
    if (admin) {
      admin.password = body.new_password;
      setLocalData('admins', admins);
      return { success: true, message: 'Admin password reset successfully! You can now sign in.' };
    }
    return { success: false, message: 'Invalid College ID or Security Code verification failed.' };
  }

  // DRIVER RESET PASSWORD
  if (endpoint === '/api/auth/driver/reset-password') {
    const drivers = getLocalData('drivers');
    const driver = drivers.find(d => d.driver_id === body.driver_id && d.secret_key === body.secret_key);
    if (driver) {
      driver.password = body.new_password;
      setLocalData('drivers', drivers);
      return { success: true, message: 'Driver password reset successfully! You can now sign in.' };
    }
    return { success: false, message: 'Invalid Driver ID or Admin Secret Key verification failed.' };
  }

  // STUDENT RESET PASSWORD
  if (endpoint === '/api/auth/student/reset-password') {
    const students = getLocalData('students');
    const student = students.find(s => (s.roll_number === body.roll_number || s.college_id === body.roll_number) && s.secret_key === body.secret_key);
    if (student) {
      student.password = body.new_password;
      setLocalData('students', students);
      return { success: true, message: 'Student password reset successfully! You can now sign in.' };
    }
    return { success: false, message: 'Invalid Roll Number or College Security Code verification failed.' };
  }

  // ADMIN AUTH & SIGN UP
  if (endpoint === '/api/auth/admin/login') {
    const admins = getLocalData('admins');
    const admin = admins.find(a => a.college_id === body.college_id && a.password === body.password);
    if (admin) {
      return { success: true, user: { role: 'admin', id: admin.id, college_id: admin.college_id, name: admin.name || 'Admin', college_name: admin.college_name } };
    }
    return { success: false, message: 'Invalid Admin ID or Password.' };
  }

  if (endpoint === '/api/auth/admin/register') {
    const admins = getLocalData('admins');
    if (admins.some(a => a.college_id === body.college_id)) {
      return { success: false, message: 'College ID / Admin ID already exists!' };
    }
    const newAdmin = {
      id: 'a_' + Date.now(),
      college_id: body.college_id,
      password: body.password,
      name: body.name,
      college_name: body.college_name,
      security_code: body.security_code
    };
    admins.push(newAdmin);
    setLocalData('admins', admins);

    const colleges = getLocalData('colleges');
    colleges.push({ id: body.college_id, college_id: body.college_id, name: body.college_name, security_code: body.security_code });
    setLocalData('colleges', colleges);

    return { success: true, user: { role: 'admin', id: newAdmin.id, college_id: newAdmin.college_id, name: newAdmin.name, college_name: newAdmin.college_name } };
  }

  // DRIVER AUTH & SIGN UP
  if (endpoint === '/api/auth/driver/login') {
    const drivers = getLocalData('drivers');
    const buses = getLocalData('buses');
    const driver = drivers.find(d => d.driver_id === body.driver_id && d.password === body.password && d.secret_key === body.secret_key);
    if (driver) {
      const bus = buses.find(b => b.id === driver.assigned_bus_id);
      return { success: true, user: { role: 'driver', id: driver.id, driver_id: driver.driver_id, name: driver.name, college_id: driver.college_id, assigned_bus_id: driver.assigned_bus_id, assigned_bus: bus } };
    }
    return { success: false, message: 'Invalid Driver Credentials.' };
  }

  if (endpoint === '/api/auth/driver/register') {
    const drivers = getLocalData('drivers');
    if (drivers.some(d => d.driver_id === body.driver_id)) {
      return { success: false, message: 'Driver ID already registered!' };
    }
    const newDriver = { id: 'd_' + Date.now(), driver_id: body.driver_id, name: body.name, password: body.password, secret_key: body.secret_key, college_id: body.college_id, assigned_bus_id: 'b1', status: 'INACTIVE' };
    drivers.push(newDriver);
    setLocalData('drivers', drivers);
    const buses = getLocalData('buses');
    return { success: true, user: { role: 'driver', id: newDriver.id, driver_id: newDriver.driver_id, name: newDriver.name, college_id: body.college_id, assigned_bus_id: 'b1', assigned_bus: buses[0] } };
  }

  // STUDENT AUTH & SIGN UP
  if (endpoint === '/api/auth/student/login') {
    const students = getLocalData('students');
    const student = students.find(s => (s.roll_number === body.roll_number || s.college_id === body.roll_number) && s.password === body.password && s.secret_key === body.secret_key);
    if (student) {
      return { success: true, user: { role: 'student', id: student.id, roll_number: student.roll_number, college_id: student.college_id, name: student.name } };
    }
    return { success: false, message: 'Invalid Student Credentials or Security Code.' };
  }

  if (endpoint === '/api/auth/student/register') {
    const students = getLocalData('students');
    if (students.some(s => s.roll_number === body.roll_number)) {
      return { success: false, message: 'Roll Number already registered!' };
    }
    const newStudent = { id: 's_' + Date.now(), roll_number: body.roll_number, college_id: body.college_id, name: body.name, password: body.password, secret_key: body.secret_key };
    students.push(newStudent);
    setLocalData('students', students);
    return { success: true, user: { role: 'student', id: newStudent.id, roll_number: newStudent.roll_number, college_id: newStudent.college_id, name: newStudent.name } };
  }

  // CRUD Routes
  if (endpoint === '/api/buses') {
    if (method === 'GET') return getLocalData('buses');
    if (method === 'POST') {
      const buses = getLocalData('buses');
      const newBus = { id: 'b_' + Date.now(), ...body, status: 'INACTIVE', stops: body.stops || [] };
      buses.push(newBus);
      setLocalData('buses', buses);
      return { success: true, bus: newBus };
    }
  }

  if (endpoint.startsWith('/api/buses/')) {
    const id = endpoint.split('/')[3];
    let buses = getLocalData('buses');
    if (method === 'PUT') {
      buses = buses.map(b => b.id === id ? { ...b, ...body } : b);
      setLocalData('buses', buses);
      return { success: true, bus: buses.find(b => b.id === id) };
    }
    if (method === 'DELETE') {
      buses = buses.filter(b => b.id !== id);
      setLocalData('buses', buses);
      return { success: true };
    }
  }

  if (endpoint === '/api/drivers') {
    if (method === 'GET') return getLocalData('drivers');
    if (method === 'POST') {
      const drivers = getLocalData('drivers');
      const newDriver = { id: 'd_' + Date.now(), ...body, status: 'INACTIVE' };
      drivers.push(newDriver);
      setLocalData('drivers', drivers);
      return { success: true, driver: newDriver };
    }
  }
  if (endpoint.startsWith('/api/drivers/')) {
    const id = endpoint.split('/')[3];
    let drivers = getLocalData('drivers');
    if (method === 'DELETE') {
      drivers = drivers.filter(d => d.id !== id);
      setLocalData('drivers', drivers);
      return { success: true };
    }
  }

  if (endpoint === '/api/students') {
    if (method === 'GET') return getLocalData('students');
    if (method === 'POST') {
      const students = getLocalData('students');
      const newStudent = { id: 's_' + Date.now(), ...body };
      students.push(newStudent);
      setLocalData('students', students);
      return { success: true, student: newStudent };
    }
  }
  if (endpoint.startsWith('/api/students/')) {
    const id = endpoint.split('/')[3];
    let students = getLocalData('students');
    if (method === 'DELETE') {
      students = students.filter(s => s.id !== id);
      setLocalData('students', students);
      return { success: true };
    }
  }

  if (endpoint === '/api/reports') {
    if (method === 'GET') return getLocalData('reports');
    if (method === 'POST') {
      const reports = getLocalData('reports');
      const report = {
        id: 'r_' + Date.now(),
        ...body,
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      reports.unshift(report);
      setLocalData('reports', reports);
      return { success: true, report };
    }
  }
  if (endpoint.includes('/reports/') && endpoint.endsWith('/resolve')) {
    const id = endpoint.split('/')[3];
    let reports = getLocalData('reports');
    reports = reports.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r);
    setLocalData('reports', reports);
    return { success: true };
  }
  if (endpoint.startsWith('/api/reports/') && method === 'DELETE') {
    const id = endpoint.split('/')[3];
    let reports = getLocalData('reports');
    reports = reports.filter(r => r.id !== id);
    setLocalData('reports', reports);
    return { success: true };
  }

  return { success: true };
}

export const api = {
  get: (url) => apiRequest(url, 'GET'),
  post: (url, body) => apiRequest(url, 'POST', body),
  put: (url, body) => apiRequest(url, 'PUT', body),
  delete: (url) => apiRequest(url, 'DELETE')
};
