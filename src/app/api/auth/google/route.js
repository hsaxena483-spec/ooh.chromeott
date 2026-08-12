import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request) {
  try {
    const { credential } = await request.json();
    
    if (!credential) {
      return NextResponse.json({ error: 'Google ID token is required' }, { status: 400 });
    }

    // 1. Verify token with Google's tokeninfo API
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const googleRes = await fetch(googleVerifyUrl);
    
    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error('Google token verification failed:', errText);
      return NextResponse.json({ error: 'Invalid Google ID token' }, { status: 401 });
    }
    
    const googleUser = await googleRes.json();
    const { sub: google_id, email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // 2. Ensure users table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(100) UNIQUE,
        email VARCHAR(150) UNIQUE,
        name VARCHAR(150),
        picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Check if user already exists
    let userResult = await client.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [google_id, email]);
    let user;

    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
      // Update name/picture if changed
      if (user.name !== name || user.picture !== picture) {
        const updateResult = await client.query(
          'UPDATE users SET name = $1, picture = $2 WHERE id = $3 RETURNING *',
          [name, picture, user.id]
        );
        user = updateResult.rows[0];
      }
    } else {
      // 4. Create new user
      const insertResult = await client.query(
        'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
        [google_id, email, name, picture]
      );
      user = insertResult.rows[0];
    }

    client.release();

    // 5. Generate a simple secure session token
    const token = `token_${user.id}_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });

  } catch (error) {
    console.error('Error during Google authentication:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
