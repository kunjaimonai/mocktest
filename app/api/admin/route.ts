// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME ;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

    // Verify credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        message: "Login successful" 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid username or password" 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error" 
      },
      { status: 500 }
    );
  }
}