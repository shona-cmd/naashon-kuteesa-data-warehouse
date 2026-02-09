import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organizationName } = await request.json();

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create organization
    const organizations = await sql`
      INSERT INTO organizations (name, created_at)
      VALUES (${organizationName}, NOW())
      RETURNING id
    `;

    const organizationId = organizations[0].id;

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await sql`
      INSERT INTO users (name, email, password, role, organization_id, created_at, updated_at)
      VALUES (${name}, ${email}, ${hashedPassword}, 'admin', ${organizationId}, NOW(), NOW())
    `;

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
