import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request) {
  try {
    const { email, id } = await request.json();
    
    if (!email || !id) {
      return NextResponse.json({ valid: false, error: 'Email and ID are required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Check if the user exists in the database
    const result = await client.query(
      'SELECT id FROM users WHERE id = $1 AND email = $2',
      [id, email]
    );
    
    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false, message: 'User record not found in database' });
    }

  } catch (error) {
    console.error('Error during token/user verification:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
