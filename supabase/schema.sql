-- ============================================================
-- SMART COLLEGE BUS TRACKING SYSTEM - DATABASE SCHEMA
-- PostgreSQL / Supabase Migration File
-- ============================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    secret_key_hash VARCHAR(255) NOT NULL,
    assigned_bus_id UUID,
    status VARCHAR(20) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_TRIP')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    college_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    secret_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BUSES TABLE
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number VARCHAR(30) UNIQUE NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    start_point VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    estimated_time INT NOT NULL DEFAULT 60, -- In minutes
    status VARCHAR(20) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LIVE', 'MAINTENANCE')),
    assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    max_speed INT DEFAULT 60
);

-- Foreign Key Constraint update for drivers.assigned_bus_id
ALTER TABLE public.drivers 
ADD CONSTRAINT fk_driver_assigned_bus 
FOREIGN KEY (assigned_bus_id) REFERENCES public.buses(id) ON DELETE SET NULL;

-- 5. BUS STOPS TABLE
CREATE TABLE IF NOT EXISTS public.bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    stop_order INT NOT NULL
);

-- 6. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

-- 7. BUS LOCATIONS TABLE (Real-time telemetry history)
CREATE TABLE IF NOT EXISTS public.bus_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0.0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED'))
);

-- INDEXES FOR FAST TELEMETRY & QUERIES
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus_id ON public.bus_locations(bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_timestamp ON public.bus_locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trips_bus_id_status ON public.trips(bus_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- INITIAL SEED DATA FOR QUICK TESTING
INSERT INTO public.admins (college_id, password_hash)
VALUES ('ADM-101', 'admin123')
ON CONFLICT (college_id) DO NOTHING;

INSERT INTO public.buses (bus_number, route_name, start_point, destination, estimated_time, status, max_speed)
VALUES 
('AP-31-1234', 'Anakapalle → College Campus', 'Anakapalle', 'College Gate', 60, 'LIVE', 55),
('AP-31-5678', 'Gajuwaka → College Campus', 'Gajuwaka', 'College Gate', 45, 'INACTIVE', 60)
ON CONFLICT (bus_number) DO NOTHING;
