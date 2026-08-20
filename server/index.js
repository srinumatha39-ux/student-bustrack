import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDB } from './db/connect.js';
import Admin from './models/Admin.js';
import Driver from './models/Driver.js';
import Student from './models/Student.js';
import Bus from './models/Bus.js';
import TripSession from './models/TripSession.js';
import IssueReport from './models/IssueReport.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas on Startup
let isMongoConnected = false;
connectDB().then(connected => {
  isMongoConnected = Boolean(connected);
});

// Seed Fallback / Initial Data Helper if DB is empty
const seedInitialDataIfNeeded = async () => {
  if (!isMongoConnected) return;

  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const password_hash = await bcrypt.hash('admin123', 10);
      await Admin.create({
        college_id: 'ADM-101',
        password_hash,
        college_name: 'St. Marys Engineering College',
        name: 'Main Administrator',
        security_code: 'SEC-ADM-101'
      });
      console.log('🌱 Seeded initial Admin user into MongoDB Atlas');
    }

    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
      const password_hash = await bcrypt.hash('driver123', 10);
      await Driver.create({
        driver_id: 'DRV-01',
        college_id: 'ADM-101',
        name: 'Ramesh Kumar',
        password_hash,
        secret_key: 'SEC-DRV-01',
        assigned_bus_id: 'b1'
      });
      console.log('🌱 Seeded initial Driver into MongoDB Atlas');
    }

    const busCount = await Bus.countDocuments();
    if (busCount === 0) {
      await Bus.create({
        bus_id: 'b1',
        college_id: 'ADM-101',
        bus_number: 'AP-31-1234',
        bus_name: 'Campus Shuttle #1',
        route: 'Anakapalle → College Campus',
        estimated_journey_time: 60,
        is_active: false,
        current_driver_id: 'DRV-01',
        stops: [
          { id: 'st1', stop_name: 'Anakapalle Ring Road', latitude: 17.6896, longitude: 83.0024, stop_order: 1 },
          { id: 'st2', stop_name: 'Main Road Junction', latitude: 17.7021, longitude: 83.0210, stop_order: 2 },
          { id: 'st3', stop_name: 'Railway Station Gate', latitude: 17.7180, longitude: 83.0450, stop_order: 3 },
          { id: 'st4', stop_name: 'College Campus Gate', latitude: 17.7342, longitude: 83.0780, stop_order: 4 }
        ]
      });
      console.log('🌱 Seeded initial Bus into MongoDB Atlas');
    }
  } catch (err) {
    console.error('Error seeding initial MongoDB data:', err.message);
  }
};

// Fallback In-Memory DB (used if MongoDB Atlas is not yet connected or URI is placeholder)
let memoryDb = {
  admins: [],
  drivers: [],
  students: [],
  buses: [
    {
      id: 'b1',
      bus_id: 'b1',
      bus_number: 'AP-31-1234',
      bus_name: 'Campus Shuttle #1',
      route_name: 'Anakapalle → College Campus',
      start_point: 'Anakapalle Main Bus Stand',
      destination: 'College Gate 1',
      estimated_time: 60,
      max_speed: 60,
      status: 'INACTIVE',
      assigned_driver_id: 'd1',
      driver_name: 'Ramesh Kumar',
      stops: [
        { id: 'st1', stop_name: 'Anakapalle Ring Road', latitude: 17.6896, longitude: 83.0024, stop_order: 1 },
        { id: 'st2', stop_name: 'Main Road Junction', latitude: 17.7021, longitude: 83.0210, stop_order: 2 },
        { id: 'st3', stop_name: 'Railway Station Gate', latitude: 17.7180, longitude: 83.0450, stop_order: 3 },
        { id: 'st4', stop_name: 'College Campus Gate', latitude: 17.7342, longitude: 83.0780, stop_order: 4 }
      ]
    }
  ],
  active_trips: {},
  reports: []
};

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart College Bus Tracking Backend API Operational',
    database: isMongoConnected ? 'MongoDB Atlas Connected' : 'In-Memory Fallback'
  });
});

// ------------------------------------------
// ADMIN AUTHENTICATION
// ------------------------------------------
app.post('/api/auth/admin/register', async (req, res) => {
  try {
    const { college_id, password, college_name, name, security_code } = req.body;
    
    if (isMongoConnected) {
      const existing = await Admin.findOne({ college_id });
      if (existing) return res.status(400).json({ success: false, message: 'Admin ID already registered.' });

      const password_hash = await bcrypt.hash(password, 10);
      const admin = await Admin.create({ college_id, password_hash, college_name, name, security_code });
      return res.json({ success: true, user: { role: 'admin', id: admin._id, college_id: admin.college_id, name: admin.name } });
    }

    // In-memory fallback
    const password_hash = await bcrypt.hash(password, 10);
    const newAdmin = { id: 'adm_' + Date.now(), college_id, password_hash, name, college_name };
    memoryDb.admins.push(newAdmin);
    res.json({ success: true, user: { role: 'admin', id: newAdmin.id, college_id: newAdmin.college_id, name: newAdmin.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { college_id, password } = req.body;

    if (isMongoConnected) {
      const admin = await Admin.findOne({ college_id });
      if (admin && (await bcrypt.compare(password, admin.password_hash))) {
        return res.json({ success: true, user: { role: 'admin', id: admin._id, college_id: admin.college_id, name: admin.name } });
      }
      return res.status(401).json({ success: false, message: 'Invalid Admin ID or Password.' });
    }

    // Fallback logic
    let admin = memoryDb.admins.find(a => a.college_id === college_id);
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (isMatch) return res.json({ success: true, user: { role: 'admin', id: admin.id, college_id: admin.college_id, name: admin.name } });
    } else if (college_id === 'ADM-101' && password === 'admin123') {
      return res.json({ success: true, user: { role: 'admin', id: '1', college_id: 'ADM-101', name: 'Main Administrator' } });
    }

    res.status(401).json({ success: false, message: 'Invalid Admin ID or Password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ------------------------------------------
// DRIVER AUTHENTICATION & MANAGEMENT
// ------------------------------------------
app.post('/api/auth/driver/register', async (req, res) => {
  try {
    const { driver_id, name, password, secret_key } = req.body;

    if (isMongoConnected) {
      const existing = await Driver.findOne({ driver_id });
      if (existing) return res.status(400).json({ success: false, message: 'Driver ID already registered.' });

      const password_hash = await bcrypt.hash(password, 10);
      const driver = await Driver.create({ driver_id, name, password_hash, secret_key, college_id: 'ADM-101' });
      return res.json({
        success: true,
        user: { role: 'driver', id: driver._id, driver_id: driver.driver_id, name: driver.name, assigned_bus_id: driver.assigned_bus_id }
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newDriver = { id: 'd_' + Date.now(), driver_id, name, password_hash, secret_key, assigned_bus_id: 'b1' };
    memoryDb.drivers.push(newDriver);
    res.json({ success: true, user: { role: 'driver', id: newDriver.id, driver_id: newDriver.driver_id, name: newDriver.name, assigned_bus_id: 'b1' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/driver/login', async (req, res) => {
  try {
    const { driver_id, password, secret_key } = req.body;

    if (isMongoConnected) {
      const driver = await Driver.findOne({ driver_id, secret_key });
      if (driver && (await bcrypt.compare(password, driver.password_hash))) {
        const assignedBus = await Bus.findOne({ bus_id: driver.assigned_bus_id });
        return res.json({
          success: true,
          user: {
            role: 'driver',
            id: driver._id,
            driver_id: driver.driver_id,
            name: driver.name,
            assigned_bus_id: driver.assigned_bus_id,
            assigned_bus: assignedBus || null
          }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid Driver ID, Password, or Secret Key.' });
    }

    let driver = memoryDb.drivers.find(d => d.driver_id === driver_id && d.secret_key === secret_key);
    if (driver) {
      const isMatch = await bcrypt.compare(password, driver.password_hash);
      if (isMatch) {
        return res.json({ success: true, user: { role: 'driver', id: driver.id, driver_id: driver.driver_id, name: driver.name, assigned_bus_id: driver.assigned_bus_id } });
      }
    } else if (driver_id === 'DRV-01' && password === 'driver123' && secret_key === 'SEC-DRV-01') {
      return res.json({ success: true, user: { role: 'driver', id: 'd1', driver_id: 'DRV-01', name: 'Ramesh Kumar', assigned_bus_id: 'b1' } });
    }

    res.status(401).json({ success: false, message: 'Invalid Driver ID, Password, or Secret Key.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/drivers', async (req, res) => {
  if (isMongoConnected) {
    const drivers = await Driver.find().lean();
    return res.json(drivers.map(d => ({ id: d._id, ...d })));
  }
  res.json(memoryDb.drivers);
});

app.post('/api/drivers', async (req, res) => {
  try {
    const { driver_id, name, password, secret_key, assigned_bus_id } = req.body;
    const password_hash = await bcrypt.hash(password || 'driver123', 10);

    if (isMongoConnected) {
      const driver = await Driver.create({ driver_id, name, password_hash, secret_key, assigned_bus_id: assigned_bus_id || 'b1' });
      return res.json({ success: true, driver });
    }

    const newDriver = { id: 'd_' + Date.now(), driver_id, name, password_hash, secret_key, assigned_bus_id: assigned_bus_id || 'b1', status: 'INACTIVE' };
    memoryDb.drivers.push(newDriver);
    res.json({ success: true, driver: newDriver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  if (isMongoConnected) {
    await Driver.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  }
  memoryDb.drivers = memoryDb.drivers.filter(d => d.id !== req.params.id);
  res.json({ success: true });
});

// ------------------------------------------
// STUDENT AUTHENTICATION & MANAGEMENT
// ------------------------------------------
app.post('/api/auth/student/register', async (req, res) => {
  try {
    const { roll_number, college_id, name, password, secret_key } = req.body;

    if (isMongoConnected) {
      const existing = await Student.findOne({ roll_no: roll_number });
      if (existing) return res.status(400).json({ success: false, message: 'Roll Number already registered.' });

      const password_hash = await bcrypt.hash(password, 10);
      const student = await Student.create({ roll_no: roll_number, college_id, name, password_hash, secret_key });
      return res.json({
        success: true,
        user: { role: 'student', id: student._id, roll_number: student.roll_no, name: student.name, college_id: student.college_id }
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newStudent = { id: 's_' + Date.now(), roll_number, college_id, name, password_hash, secret_key };
    memoryDb.students.push(newStudent);
    res.json({ success: true, user: { role: 'student', id: newStudent.id, roll_number, name, college_id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/student/login', async (req, res) => {
  try {
    const { roll_number, password, secret_key } = req.body;

    if (isMongoConnected) {
      const student = await Student.findOne({ roll_no: roll_number, secret_key });
      if (student && (await bcrypt.compare(password, student.password_hash))) {
        return res.json({
          success: true,
          user: { role: 'student', id: student._id, roll_number: student.roll_no, name: student.name, college_id: student.college_id }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid Roll Number, Password, or Secret Pass Key.' });
    }

    let student = memoryDb.students.find(s => s.roll_number === roll_number && s.secret_key === secret_key);
    if (student) {
      const isMatch = await bcrypt.compare(password, student.password_hash);
      if (isMatch) return res.json({ success: true, user: { role: 'student', id: student.id, roll_number: student.roll_number, name: student.name, college_id: student.college_id } });
    } else if (roll_number === '21001A0501' && password === 'student123' && secret_key === 'SEC-STU-01') {
      return res.json({ success: true, user: { role: 'student', id: 's1', roll_number: '21001A0501', name: 'Ananya Sharma', college_id: 'STU-2024-01' } });
    }

    res.status(401).json({ success: false, message: 'Invalid Roll Number, Password, or Secret Pass Key.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/students', async (req, res) => {
  if (isMongoConnected) {
    const students = await Student.find().lean();
    return res.json(students.map(s => ({ id: s._id, roll_number: s.roll_no, ...s })));
  }
  res.json(memoryDb.students);
});

app.post('/api/students', async (req, res) => {
  try {
    const { roll_number, college_id, name, password, secret_key } = req.body;
    const password_hash = await bcrypt.hash(password || 'student123', 10);

    if (isMongoConnected) {
      const student = await Student.create({ roll_no: roll_number, college_id, name, password_hash, secret_key });
      return res.json({ success: true, student });
    }

    const newStudent = { id: 's_' + Date.now(), roll_number, college_id, name, password_hash, secret_key };
    memoryDb.students.push(newStudent);
    res.json({ success: true, student: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  if (isMongoConnected) {
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  }
  memoryDb.students = memoryDb.students.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// ------------------------------------------
// BUS MANAGEMENT ROUTES
// ------------------------------------------
app.get('/api/buses', async (req, res) => {
  if (isMongoConnected) {
    const buses = await Bus.find().lean();
    return res.json(buses.map(b => ({ id: b._id, bus_id: b.bus_id, route_name: b.route, ...b })));
  }
  res.json(memoryDb.buses);
});

app.post('/api/buses', async (req, res) => {
  try {
    const bus_id = 'b_' + Date.now();
    const { bus_number, bus_name, route_name, start_point, destination, estimated_time, stops } = req.body;

    if (isMongoConnected) {
      const newBus = await Bus.create({
        bus_id,
        bus_number,
        bus_name,
        route: route_name || `${start_point} → ${destination}`,
        estimated_journey_time: estimated_time || 60,
        stops: stops || []
      });
      io.emit('buses-updated', await Bus.find().lean());
      return res.json({ success: true, bus: newBus });
    }

    const newBus = { id: bus_id, bus_id, ...req.body, status: 'INACTIVE', stops: stops || [] };
    memoryDb.buses.push(newBus);
    io.emit('buses-updated', memoryDb.buses);
    res.json({ success: true, bus: newBus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/buses/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
      io.emit('buses-updated', await Bus.find().lean());
      return res.json({ success: true, bus });
    }

    const idx = memoryDb.buses.findIndex(b => b.id === req.params.id);
    if (idx !== -1) {
      memoryDb.buses[idx] = { ...memoryDb.buses[idx], ...req.body };
      io.emit('buses-updated', memoryDb.buses);
      res.json({ success: true, bus: memoryDb.buses[idx] });
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/buses/:id', async (req, res) => {
  if (isMongoConnected) {
    await Bus.findByIdAndDelete(req.params.id);
    io.emit('buses-updated', await Bus.find().lean());
    return res.json({ success: true });
  }

  memoryDb.buses = memoryDb.buses.filter(b => b.id !== req.params.id);
  io.emit('buses-updated', memoryDb.buses);
  res.json({ success: true });
});

// ------------------------------------------
// ISSUE REPORTS (WITH 24H TTL INDEX)
// ------------------------------------------
app.get('/api/reports', async (req, res) => {
  if (isMongoConnected) {
    const reports = await IssueReport.find().sort({ createdAt: -1 }).lean();
    return res.json(reports.map(r => ({ id: r._id, description: r.message, ...r })));
  }
  res.json(memoryDb.reports);
});

app.post('/api/reports', async (req, res) => {
  try {
    const report_id = 'r_' + Date.now();
    const { bus_id, bus_number, driver_id, driver_name, issue_type, description, latitude, longitude } = req.body;

    if (isMongoConnected) {
      const report = await IssueReport.create({
        report_id,
        bus_id: bus_id || bus_number || 'b1',
        driver_id: driver_id || 'DRV-01',
        message: description || issue_type,
        issue_type: issue_type || 'MECHANICAL BREAKDOWN',
        latitude,
        longitude
      });
      io.emit('new-report', report);
      return res.json({ success: true, report });
    }

    const report = {
      id: report_id,
      bus_number,
      driver_id,
      driver_name,
      issue_type,
      description,
      latitude,
      longitude,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    memoryDb.reports.unshift(report);
    io.emit('new-report', report);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/reports/:id/resolve', async (req, res) => {
  if (isMongoConnected) {
    const report = await IssueReport.findByIdAndUpdate(req.params.id, { status: 'RESOLVED' }, { new: true });
    io.emit('reports-updated', await IssueReport.find().lean());
    return res.json({ success: true, report });
  }

  const report = memoryDb.reports.find(r => r.id === req.params.id);
  if (report) {
    report.status = 'RESOLVED';
    io.emit('reports-updated', memoryDb.reports);
    res.json({ success: true, report });
  } else {
    res.status(404).json({ message: 'Report not found' });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  if (isMongoConnected) {
    await IssueReport.findByIdAndDelete(req.params.id);
    io.emit('reports-updated', await IssueReport.find().lean());
    return res.json({ success: true });
  }

  memoryDb.reports = memoryDb.reports.filter(r => r.id !== req.params.id);
  io.emit('reports-updated', memoryDb.reports);
  res.json({ success: true });
});

// ==========================================
// SOCKET.IO REALTIME EVENTS & TRIP SESSIONS
// ==========================================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('active-trips', memoryDb.active_trips);

  // Driver starts trip
  socket.on('start-trip', async (data) => {
    const { bus_id, driver_id, initial_location } = data;
    const trip_id = 'trip_' + Date.now();

    if (isMongoConnected) {
      try {
        await TripSession.create({
          trip_id,
          bus_id: bus_id || 'b1',
          driver_id: driver_id || 'DRV-01',
          start_time: new Date(),
          live_location: initial_location || { latitude: 17.6896, longitude: 83.0024, speed: 45 }
        });
        await Bus.findOneAndUpdate({ bus_id }, { is_active: true });
      } catch (err) {
        console.error('Trip session save error:', err.message);
      }
    }

    const tripData = {
      trip_id,
      bus_id,
      driver_id,
      start_time: new Date().toISOString(),
      status: 'LIVE',
      location: initial_location || { latitude: 17.6896, longitude: 83.0024, speed: 45 }
    };
    memoryDb.active_trips[bus_id] = tripData;
    io.emit('bus-status-changed', { bus_id, status: 'LIVE', trip: tripData });
  });

  // Driver streams GPS coordinate update
  socket.on('location-update', async (data) => {
    const { bus_id, latitude, longitude, speed, isDemo } = data;

    if (isMongoConnected) {
      try {
        await TripSession.findOneAndUpdate(
          { bus_id, end_time: null },
          { live_location: { latitude, longitude, speed: speed || 40 } }
        );
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    }

    if (memoryDb.active_trips[bus_id]) {
      memoryDb.active_trips[bus_id].location = { latitude, longitude, speed: speed || 40, updated_at: new Date().toISOString(), isDemo };
    } else {
      memoryDb.active_trips[bus_id] = {
        bus_id,
        status: 'LIVE',
        location: { latitude, longitude, speed: speed || 40, updated_at: new Date().toISOString(), isDemo }
      };
    }
    io.emit('bus-location-changed', { bus_id, latitude, longitude, speed: speed || 40, updated_at: new Date().toISOString(), isDemo });
  });

  // Driver stops trip
  socket.on('stop-trip', async (data) => {
    const { bus_id } = data;

    if (isMongoConnected) {
      try {
        await TripSession.findOneAndUpdate({ bus_id, end_time: null }, { end_time: new Date() });
        await Bus.findOneAndUpdate({ bus_id }, { is_active: false });
      } catch (err) {
        console.error('Stop trip error:', err.message);
      }
    }

    delete memoryDb.active_trips[bus_id];
    io.emit('bus-status-changed', { bus_id, status: 'INACTIVE' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Smart Bus Server running on port ${PORT}`);
});
