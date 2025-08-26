-- Create hospitals table to store hospital information
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  floors INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  version TEXT DEFAULT '1.0.0',
  checksum TEXT
);

-- Create nodes table for navigation points
CREATE TABLE public.nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  floor INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entry', 'corridor', 'elevator', 'stairs', 'room')),
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, node_id)
);

-- Create edges table for connections between nodes
CREATE TABLE public.edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  from_node TEXT NOT NULL,
  to_node TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('walk', 'elevator', 'stairs')),
  weight REAL NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table for destinations
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  name TEXT NOT NULL,
  node_id TEXT NOT NULL,
  floor INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, room_id)
);

-- Enable Row Level Security
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (hospitals are public)
CREATE POLICY "Hospitals are publicly readable" 
ON public.hospitals FOR SELECT 
USING (true);

CREATE POLICY "Nodes are publicly readable" 
ON public.nodes FOR SELECT 
USING (true);

CREATE POLICY "Edges are publicly readable" 
ON public.edges FOR SELECT 
USING (true);

CREATE POLICY "Rooms are publicly readable" 
ON public.rooms FOR SELECT 
USING (true);

-- Create policies for admin management (for now, anyone can manage - will add auth later)
CREATE POLICY "Anyone can manage hospitals" 
ON public.hospitals FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage nodes" 
ON public.nodes FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage edges" 
ON public.edges FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage rooms" 
ON public.rooms FOR ALL 
USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_nodes_hospital_floor ON public.nodes(hospital_id, floor);
CREATE INDEX idx_edges_hospital_nodes ON public.edges(hospital_id, from_node, to_node);
CREATE INDEX idx_rooms_hospital_floor ON public.rooms(hospital_id, floor);
CREATE INDEX idx_rooms_search ON public.rooms USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Insert demo data
INSERT INTO public.hospitals (building_id, name, floors, version) 
VALUES ('clinicpath-demo', 'ClinicPath Demo Hospital', ARRAY[1,2,5], '1.0.0');

-- Get the hospital ID for foreign key references
WITH demo_hospital AS (
  SELECT id FROM public.hospitals WHERE building_id = 'clinicpath-demo'
)
INSERT INTO public.nodes (hospital_id, node_id, x, y, floor, type, label)
SELECT h.id, node_data.node_id, node_data.x, node_data.y, node_data.floor, node_data.type, node_data.label
FROM demo_hospital h,
(VALUES
  ('n1', 80, 260, 1, 'entry', 'Main Entrance'),
  ('n2', 200, 260, 1, 'corridor', NULL),
  ('n3', 320, 260, 1, 'corridor', NULL),
  ('nE1', 200, 180, 1, 'elevator', 'Elevator A'),
  ('nS1', 320, 180, 1, 'stairs', 'Stairs A'),
  ('n4', 80, 260, 2, 'corridor', NULL),
  ('n5', 200, 260, 2, 'corridor', NULL),
  ('n6', 320, 260, 2, 'corridor', NULL),
  ('nE2', 200, 180, 2, 'elevator', 'Elevator A'),
  ('nS2', 320, 180, 2, 'stairs', 'Stairs A'),
  ('n7', 420, 260, 2, 'corridor', NULL),
  ('n8', 80, 260, 5, 'corridor', NULL),
  ('n9', 200, 260, 5, 'corridor', NULL),
  ('n10', 320, 260, 5, 'corridor', NULL),
  ('nE5', 200, 180, 5, 'elevator', 'Elevator A'),
  ('nS5', 320, 180, 5, 'stairs', 'Stairs A')
) AS node_data(node_id, x, y, floor, type, label);

-- Insert edge data
WITH demo_hospital AS (
  SELECT id FROM public.hospitals WHERE building_id = 'clinicpath-demo'
)
INSERT INTO public.edges (hospital_id, from_node, to_node, kind, weight)
SELECT h.id, edge_data.from_node, edge_data.to_node, edge_data.kind, edge_data.weight
FROM demo_hospital h,
(VALUES
  ('n1', 'n2', 'walk', 12),
  ('n2', 'n3', 'walk', 12),
  ('n2', 'nE1', 'walk', 8),
  ('n3', 'nS1', 'walk', 10),
  ('nE1', 'nE2', 'elevator', 10),
  ('nS1', 'nS2', 'stairs', 18),
  ('n4', 'n5', 'walk', 12),
  ('n5', 'n6', 'walk', 12),
  ('n5', 'nE2', 'walk', 8),
  ('n6', 'n7', 'walk', 10),
  ('nE2', 'nE5', 'elevator', 10),
  ('nS2', 'nS5', 'stairs', 18),
  ('n8', 'n9', 'walk', 12),
  ('n9', 'n10', 'walk', 12),
  ('n9', 'nE5', 'walk', 8),
  ('n10', 'nS5', 'walk', 10)
) AS edge_data(from_node, to_node, kind, weight);

-- Insert room data
WITH demo_hospital AS (
  SELECT id FROM public.hospitals WHERE building_id = 'clinicpath-demo'
)
INSERT INTO public.rooms (hospital_id, room_id, name, node_id, floor, category, description)
SELECT h.id, room_data.room_id, room_data.name, room_data.node_id, room_data.floor, room_data.category, room_data.description
FROM demo_hospital h,
(VALUES
  ('rMainDesk', 'Main Desk', 'n1', 1, 'info', 'Main information and reception desk'),
  ('rPharmacy', 'Pharmacy', 'n3', 1, 'pharmacy', 'Hospital pharmacy and medication dispensing'),
  ('rLab', 'Laboratory', 'n7', 2, 'lab', 'Medical laboratory and testing facility'),
  ('rRoom10', 'Room 10', 'n10', 5, 'ward', 'Patient room 10'),
  ('rICU', 'ICU', 'n6', 2, 'icu', 'Intensive Care Unit')
) AS room_data(room_id, name, node_id, floor, category, description);