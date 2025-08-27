-- Drop existing tables
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE; 
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- Create new tables for the hospital navigation system
CREATE TABLE floors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  floor_id TEXT NOT NULL REFERENCES floors(id),
  room TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE location_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id TEXT NOT NULL REFERENCES locations(id),
  to_location_id TEXT NOT NULL REFERENCES locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id TEXT NOT NULL REFERENCES locations(id),
  to_location_id TEXT NOT NULL REFERENCES locations(id),
  distance INTEGER NOT NULL,
  estimated_time TEXT NOT NULL,
  accessibility TEXT NOT NULL,
  steps TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Floors are publicly readable" ON floors FOR SELECT USING (true);
CREATE POLICY "Anyone can manage floors" ON floors FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Locations are publicly readable" ON locations FOR SELECT USING (true);
CREATE POLICY "Anyone can manage locations" ON locations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Connections are publicly readable" ON location_connections FOR SELECT USING (true);
CREATE POLICY "Anyone can manage connections" ON location_connections FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Routes are publicly readable" ON routes FOR SELECT USING (true);
CREATE POLICY "Anyone can manage routes" ON routes FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data from the JSON
INSERT INTO floors (id, name) VALUES 
  ('floor_ground', 'Ground Floor'),
  ('floor_1', 'First Floor'),
  ('floor_2', 'Second Floor');

-- Insert locations
INSERT INTO locations (id, name, x, y, floor_id, room, type) VALUES 
  -- Ground Floor
  ('loc_main_entrance', 'Main Entrance', 45, 10, 'floor_ground', 'Entrance Hall', 'start'),
  ('loc_parking_a', 'Parking Area A', 5, 10, 'floor_ground', 'Parking Zone A', 'start'),
  ('loc_parking_b', 'Parking Area B', 95, 10, 'floor_ground', 'Parking Zone B', 'start'),
  ('loc_emergency_entrance', 'Emergency Entrance', 5, 40, 'floor_ground', 'Emergency Entry', 'start'),
  ('loc_reception', 'Main Reception', 50, 20, 'floor_ground', 'Lobby', 'start'),
  ('loc_ed', 'Emergency Department', 15, 60, 'floor_ground', 'ED Zone', NULL),
  ('loc_er', 'Emergency Room', 10, 30, 'floor_ground', 'ER-101', NULL),
  ('loc_pharmacy', 'Pharmacy', 80, 30, 'floor_ground', 'Pharmacy-101', NULL),
  ('loc_elev_g', 'Elevator 1', 50, 50, 'floor_ground', 'Elevator', NULL),
  ('loc_stairs_g', 'Stairs', 55, 45, 'floor_ground', 'Stairwell', NULL),
  -- First Floor
  ('loc_cafeteria', 'Cafeteria', 80, 50, 'floor_1', 'Cafeteria', NULL),
  ('loc_cardiology', 'Cardiology', 20, 70, 'floor_1', 'Cardio Dept', NULL),
  ('loc_neurology', 'Neurology', 20, 30, 'floor_1', 'Neuro Dept', NULL),
  ('loc_pediatrics', 'Pediatrics', 80, 80, 'floor_1', 'Pediatrics Ward', NULL),
  ('loc_elev_1', 'Elevator 1', 50, 50, 'floor_1', 'Elevator', NULL),
  ('loc_stairs_1', 'Stairs', 55, 45, 'floor_1', 'Stairwell', NULL),
  -- Second Floor
  ('loc_ophthalmology', 'Ophthalmology', 20, 50, 'floor_2', 'Ophthalmology Dept', NULL),
  ('loc_internal', 'Internal Medicine', 80, 50, 'floor_2', 'Internal Med', NULL),
  ('loc_elev_2', 'Elevator 1', 50, 50, 'floor_2', 'Elevator', NULL),
  ('loc_stairs_2', 'Stairs', 55, 45, 'floor_2', 'Stairwell', NULL);

-- Insert connections
INSERT INTO location_connections (from_location_id, to_location_id) VALUES 
  -- Ground Floor connections
  ('loc_main_entrance', 'loc_reception'),
  ('loc_parking_a', 'loc_main_entrance'),
  ('loc_parking_b', 'loc_main_entrance'),
  ('loc_emergency_entrance', 'loc_ed'),
  ('loc_reception', 'loc_ed'),
  ('loc_reception', 'loc_pharmacy'),
  ('loc_reception', 'loc_elev_g'),
  ('loc_reception', 'loc_stairs_g'),
  ('loc_reception', 'loc_main_entrance'),
  ('loc_ed', 'loc_er'),
  ('loc_ed', 'loc_reception'),
  ('loc_ed', 'loc_elev_g'),
  ('loc_ed', 'loc_emergency_entrance'),
  ('loc_er', 'loc_ed'),
  ('loc_er', 'loc_reception'),
  ('loc_pharmacy', 'loc_reception'),
  ('loc_elev_g', 'loc_reception'),
  ('loc_elev_g', 'loc_ed'),
  ('loc_elev_g', 'loc_elev_1'),
  ('loc_stairs_g', 'loc_reception'),
  ('loc_stairs_g', 'loc_stairs_1'),
  -- First Floor connections
  ('loc_cafeteria', 'loc_elev_1'),
  ('loc_cafeteria', 'loc_pediatrics'),
  ('loc_cafeteria', 'loc_stairs_1'),
  ('loc_cardiology', 'loc_neurology'),
  ('loc_cardiology', 'loc_elev_1'),
  ('loc_neurology', 'loc_cardiology'),
  ('loc_neurology', 'loc_elev_1'),
  ('loc_pediatrics', 'loc_cafeteria'),
  ('loc_pediatrics', 'loc_elev_1'),
  ('loc_elev_1', 'loc_cafeteria'),
  ('loc_elev_1', 'loc_cardiology'),
  ('loc_elev_1', 'loc_pediatrics'),
  ('loc_elev_1', 'loc_elev_g'),
  ('loc_elev_1', 'loc_elev_2'),
  ('loc_elev_1', 'loc_stairs_1'),
  ('loc_stairs_1', 'loc_cafeteria'),
  ('loc_stairs_1', 'loc_elev_1'),
  ('loc_stairs_1', 'loc_stairs_g'),
  ('loc_stairs_1', 'loc_stairs_2'),
  -- Second Floor connections
  ('loc_ophthalmology', 'loc_elev_2'),
  ('loc_ophthalmology', 'loc_internal'),
  ('loc_internal', 'loc_elev_2'),
  ('loc_internal', 'loc_ophthalmology'),
  ('loc_elev_2', 'loc_ophthalmology'),
  ('loc_elev_2', 'loc_internal'),
  ('loc_elev_2', 'loc_elev_1'),
  ('loc_elev_2', 'loc_stairs_2'),
  ('loc_stairs_2', 'loc_elev_2'),
  ('loc_stairs_2', 'loc_stairs_1');

-- Insert predefined routes
INSERT INTO routes (from_location_id, to_location_id, distance, estimated_time, accessibility, steps) VALUES 
  ('loc_main_entrance', 'loc_cardiology', 150, '3-5 minutes', 'Wheelchair Accessible', 
   ARRAY['Enter through the Main Entrance', 'Head straight to Reception Desk (20m)', 'Turn right towards elevators', 'Take Elevator 1 to First Floor', 'Exit elevator and walk left', 'Arrive at Cardiology (Room 201-205)']),
  ('loc_emergency_entrance', 'loc_ed', 30, '1 minute', 'Wheelchair Accessible',
   ARRAY['Enter through Emergency Entrance', 'Walk forward to Emergency Department', 'Arrive at Emergency Department (ED Zone)']),
  ('loc_reception', 'loc_pharmacy', 40, '1-2 minutes', 'Wheelchair Accessible',
   ARRAY['From Main Reception, walk right', 'Follow corridor for 40m', 'Arrive at Pharmacy (Room 101)']),
  ('loc_cafeteria', 'loc_pediatrics', 60, '2-3 minutes', 'Wheelchair Accessible',
   ARRAY['From Cafeteria, walk straight towards corridor', 'Follow signs to Pediatrics Ward', 'Arrive at Pediatrics']);

-- Create indexes for better performance
CREATE INDEX idx_locations_floor ON locations(floor_id);
CREATE INDEX idx_connections_from ON location_connections(from_location_id);
CREATE INDEX idx_connections_to ON location_connections(to_location_id);
CREATE INDEX idx_routes_from ON routes(from_location_id);
CREATE INDEX idx_routes_to ON routes(to_location_id);