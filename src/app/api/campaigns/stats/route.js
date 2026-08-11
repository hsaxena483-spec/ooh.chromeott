import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM campaign_locations');
    client.release();
    
    const campaigns = result.rows;
    const total_spots = campaigns.length;
    
    const brand_counts = {};
    const media_type_counts = {};
    const area_brand_counts_map = {};
    
    const unique_areas = new Set();
    const unique_brands = new Set();
    
    campaigns.forEach(c => {
      const m_type = c.media_type || 'Unknown';
      media_type_counts[m_type] = (media_type_counts[m_type] || 0) + 1;
      
      const area_name = c.area === 'Kolkata' ? 'Kolkata City' : (c.area || 'Unknown');
      unique_areas.add(area_name);
      
      let brands_list = c.brands || [];
      if (brands_list.length === 0) {
        brands_list = [c.brand || 'No Brand'];
      }
      
      if (!area_brand_counts_map[area_name]) {
        area_brand_counts_map[area_name] = {};
      }
      
      brands_list.forEach(b => {
        brand_counts[b] = (brand_counts[b] || 0) + 1;
        unique_brands.add(b);
        area_brand_counts_map[area_name][b] = (area_brand_counts_map[area_name][b] || 0) + 1;
      });
    });
    
    // Format area-wise brand data for Recharts (stacked bar chart)
    const area_brand_counts = [];
    Object.entries(area_brand_counts_map).forEach(([area, b_counts]) => {
      const row = { area };
      Object.entries(b_counts).forEach(([b, count]) => {
        row[b] = count;
      });
      area_brand_counts.push(row);
    });
    
    // Sort areas by total spots count descending (sum of brand counts in each area)
    area_brand_counts.sort((a, b) => {
      const sumA = Object.entries(a).reduce((sum, [key, val]) => key !== 'area' ? sum + val : sum, 0);
      const sumB = Object.entries(b).reduce((sum, [key, val]) => key !== 'area' ? sum + val : sum, 0);
      return sumB - sumA;
    });
    
    return NextResponse.json({
      total_spots,
      total_brands: unique_brands.size,
      total_areas: unique_areas.size,
      brand_counts,
      media_type_counts,
      area_brand_counts,
      areas: Array.from(unique_areas),
      brands: Array.from(unique_brands),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Database connection failed: ' + error.message }, { status: 500 });
  }
}
