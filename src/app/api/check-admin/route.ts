import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  console.log('Checking admin status for user ID:', userId);

  if (!userId) {
    return NextResponse.json(
      { isAdmin: false, error: 'No user ID provided' },
      { status: 400 }
    );
  }

  try {
    // Check if user exists and has admin role
    // For this implementation, we'll check if they have an admin field in the database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ isAdmin: false });
    }

    console.log('Found user with email:', user.email);

    // For simplicity, let's consider specific email addresses as admins
    // In a real app, you'd have a proper role system
    const adminEmails = ['venti.sillly@gmail.com', 'adubge@gmail.com'];
    
    // Convert both stored email and admin emails to lowercase for case-insensitive comparison
    const userEmail = user.email?.toLowerCase() || '';
    console.log('Comparing lowercase user email:', userEmail);
    console.log('With admin emails:', adminEmails.map(e => e.toLowerCase()));
    
    const isAdmin = adminEmails.some(email => email.toLowerCase() === userEmail);
    console.log('Is admin result:', isAdmin);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
} 