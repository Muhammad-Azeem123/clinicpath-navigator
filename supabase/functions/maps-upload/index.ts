import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MapData {
  name: string;
  floors: Array<{
    id: string;
    name: string;
    locations: Array<{
      id: string;
      name: string;
      x: number;
      y: number;
      type?: string;
      room?: string;
    }>;
    connections: Array<{
      from: string;
      to: string;
      distance?: number;
    }>;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('Processing map upload request...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { name, mapData } = body;

    if (!name || !mapData) {
      return new Response(
        JSON.stringify({ error: 'Missing name or mapData' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate JSON structure
    if (!validateMapStructure(mapData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid map data structure' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Uploading map: ${name}`);

    // Insert the new map
    const { data: newMap, error: insertError } = await supabase
      .from('maps')
      .insert({
        name,
        data: mapData,
        version: 1
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting map:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save map' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set as current map
    const { error: updateError } = await supabase
      .rpc('set_current_map', { map_id: newMap.id });

    if (updateError) {
      console.error('Error setting current map:', updateError);
    }

    console.log('Map uploaded successfully:', newMap.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        map: newMap,
        message: 'Map uploaded and set as current successfully' 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

function validateMapStructure(mapData: any): mapData is MapData {
  if (!mapData || typeof mapData !== 'object') return false;
  if (!mapData.name || typeof mapData.name !== 'string') return false;
  if (!Array.isArray(mapData.floors)) return false;

  return mapData.floors.every((floor: any) => {
    if (!floor.id || !floor.name) return false;
    if (!Array.isArray(floor.locations)) return false;
    if (!Array.isArray(floor.connections)) return false;

    const validLocations = floor.locations.every((loc: any) => 
      loc.id && loc.name && typeof loc.x === 'number' && typeof loc.y === 'number'
    );

    const validConnections = floor.connections.every((conn: any) => 
      conn.from && conn.to
    );

    return validLocations && validConnections;
  });
}