// Unified API & Data Access Service with Built-in Offline / Demo Mode Fallback

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Initial Demo Seed Data
const INITIAL_DEMO_DATA = {
  buses: [
    {
      id: 'b1',
      bus_number: 'AP-31-1234',
      bus_name: 'Campus Express #1',
      route_name: 'Anakapalle → College Campus',
      start_point: 'Anakapalle Main Bus Stand',
      destination: 'College Gate 1',
      estimated_time: 60,
      max_speed: 60,
      status: 'LIVE',
      assigned_driver_id: 'd1',
      driver_name: 'Ramesh Kumar',
      stops: [
        { id: 'st1', stop_name: 'Anakapalle Ring Road', latitude: 17.6896, longitude: 83.0024, stop_order: 1 },
        { id: 'st2', stop_name: 'Main Road Junction', latitude: 17.7021, longitude: 83.0210, stop_order: 2 },
        { id: 'st3', stop_name: 'Railway Station Gate', latitude: 17.7180, longitude: 83.0450, stop_order: 3 },
        { id: 'st4', stop_name: 'College Campus Gate', latitude: 17.7342, longitude: 83.0780, stop_order: 4 }
      ]
    },
    {
      id: 'b2',
      bus_number: 'AP-31-5678',
      bus_name: 'Metropolitan Shuttle #2',
      route_name: 'Gajuwaka → College Campus',
      start_point: 'Gajuwaka Center',
      destination: 'College Gate 1',
      estimated_time: 45,
      max_speed: 65,
      status: 'INACTIVE',
      assigned_driver_id: 'd2',
      driver_name: 'Srinivas Rao',
      stops: [
        { id: 'st5', stop_name: 'Gajuwaka Bus Stop', latitude: 17.6800, longitude: 83.2010, stop_order: 1 },
        { id: 'st6', stop_name: 'Steel Plant Flyover', latitude: 17.6950, longitude: 83.1800, stop_order: 2 },
        { id: 'st7', stop_name: 'Kurmannapalem Junction', latitude: 17.7100, longitude: 83.1500, stop_order: 3 },
        { id: 'st8', stop_name: 'College Campus Gate', latitude: 17.7342, longitude: 83.0780, stop_order: 4 }
      ]
    }
  ],
  admins: [
    { id: '1', college_id: 'ADM-101', password: 'admin123', name: 'Main Administrator', college_name: 'St. Marys Engineering College', security_code: 'SEC-ADM-101' }
  ],
  drivers: [
    { id: 'd1', driver_id: 'DRV-01', name: 'Ramesh Kumar', password: 'driver123', secret_key: 'SEC-DRV-01', assigned_bus_id: 'b1', status: 'ON_TRIP' },
    { id: 'd2', driver_id: 'DRV-02', name: 'Srinivas Rao', password: 'driver123', secret_key: 'SEC-DRV-02', assigned_bus_id: 'b2', status: 'INACTIVE' }
  ],
  students: [
    { id: 's1', roll_number: '21001A0501', college_id: 'STU-2024-01', name: 'Ananya Sharma', password: 'student123', secret_key: 'SEC-STU-01' },
    { id: 's2', roll_number: '21001A0502', college_id: 'STU-2024-02', name: 'Vikram Verma', password: 'student123', secret_key: 'SEC-STU-02' }
  ],
  reports: [
    {
      id: 'r1',
      driver_id: 'DRV-01',
      driver_name: 'Ramesh Kumar',
      bus_number: 'AP-31-1234',
      issue_type: 'Traffic',
      description: 'Heavy traffic blockage near Railway Station junction.',
      latitude: 17.7180,
      longitude: 83.0450,
      date: new Date().toISOString().split('T')[0],
      time: '08:30 AM',
      status: 'PENDING'
    }
  ]
};

function getLocalData(key) {
  const stored = localStorage.getItem(`bus_app_${key}`);
  if (!stored) {
    localStorage.setItem(`bus_app_${key}`, JSON.stringify(INITIAL_DEMO_DATA[key]));
    return INITIAL_DEMO_DATA[key];
  }
  return JSON.parse(stored);
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
    const id = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, signal: controller.signal });
    clearTimeout(id);

    if (res.ok) {
      return await res.json();
    }
    throw new Error('API server response not ok');
  } catch (err) {
    return fallbackLocalHandler(endpoint, method, body);
  }
}

function fallbackLocalHandler(endpoint, method, body) {
  // ADMIN AUTH & SIGN UP
  if (endpoint === '/api/auth/admin/login') {
    const admins = getLocalData('admins');
    const admin = admins.find(a => a.college_id === body.college_id && a.password === body.password);
    if (admin) {
      return { success: true, user: { role: 'admin', id: admin.id, college_id: admin.college_id, name: admin.name || 'Admin', college_name: admin.college_name } };
    }
    return { success: false, message: 'Invalid Admin ID or Password. Try ADM-101 / admin123' };
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
    return { success: true, user: { role: 'admin', id: newAdmin.id, college_id: newAdmin.college_id, name: newAdmin.name, college_name: newAdmin.college_name } };
  }

  // DRIVER AUTH & SIGN UP
  if (endpoint === '/api/auth/driver/login') {
    const drivers = getLocalData('drivers');
    const buses = getLocalData('buses');
    const driver = drivers.find(d => d.driver_id === body.driver_id && d.password === body.password && d.secret_key === body.secret_key);
    if (driver) {
      const bus = buses.find(b => b.id === driver.assigned_bus_id);
      return { success: true, user: { role: 'driver', id: driver.id, driver_id: driver.driver_id, name: driver.name, assigned_bus_id: driver.assigned_bus_id, assigned_bus: bus } };
    }
    return { success: false, message: 'Invalid Driver Credentials. Try DRV-01 / driver123 / SEC-DRV-01' };
  }

  if (endpoint === '/api/auth/driver/register') {
    const drivers = getLocalData('drivers');
    if (drivers.some(d => d.driver_id === body.driver_id)) {
      return { success: false, message: 'Driver ID already registered!' };
    }
    const newDriver = { id: 'd_' + Date.now(), driver_id: body.driver_id, name: body.name, password: body.password, secret_key: body.secret_key, assigned_bus_id: 'b1', status: 'INACTIVE' };
    drivers.push(newDriver);
    setLocalData('drivers', drivers);
    const buses = getLocalData('buses');
    return { success: true, user: { role: 'driver', id: newDriver.id, driver_id: newDriver.driver_id, name: newDriver.name, assigned_bus_id: 'b1', assigned_bus: buses[0] } };
  }

  // STUDENT AUTH & SIGN UP
  if (endpoint === '/api/auth/student/login') {
    const students = getLocalData('students');
    const student = students.find(s => (s.roll_number === body.roll_number || s.college_id === body.roll_number) && s.password === body.password && s.secret_key === body.secret_key);
    if (student) {
      return { success: true, user: { role: 'student', id: student.id, roll_number: student.roll_number, college_id: student.college_id, name: student.name } };
    }
    return { success: false, message: 'Invalid Student Credentials. Try 21001A0501 / student123 / SEC-STU-01' };
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
