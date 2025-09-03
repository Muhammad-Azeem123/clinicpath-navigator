-- Create maps table to store uploaded map configurations
CREATE TABLE public.maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for now)
CREATE POLICY "Maps are publicly readable" 
ON public.maps 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage maps" 
ON public.maps 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to set current map
CREATE OR REPLACE FUNCTION public.set_current_map(map_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Set all maps to not current
  UPDATE public.maps SET is_current = FALSE;
  
  -- Set the specified map as current
  UPDATE public.maps SET is_current = TRUE WHERE id = map_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update timestamps
CREATE TRIGGER update_maps_updated_at
BEFORE UPDATE ON public.maps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();