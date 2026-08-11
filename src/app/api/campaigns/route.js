import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM campaign_locations ORDER BY campaign_id ASC');
    client.release();
    
    const campaigns = result.rows.map(c => ({
      id: c.id,
      campaign_id: c.campaign_id,
      state: c.state,
      city: c.city,
      media_type: c.media_type,
      brand: c.brand,
      brands: c.brands || [],
      location: c.location,
      area: c.area === 'Kolkata' ? 'Kolkata City' : c.area,
      road_name: c.road_name,
      latitude: c.latitude ? parseFloat(c.latitude) : null,
      longitude: c.longitude ? parseFloat(c.longitude) : null,
      photo_url: c.photo_url,
      map_link: c.map_link,
    }));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Database connection failed: ' + error.message }, { status: 500 });
  }
}
