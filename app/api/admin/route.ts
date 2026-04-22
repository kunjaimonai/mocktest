// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, jsonNoStore } from "@/lib/api-guard";

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request, "api-admin-login", 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME ;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

    // Verify credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return jsonNoStore({ 
        success: true, 
        message: "Login successful" 
      });
    } else {
      return jsonNoStore(
        { 
          success: false, 
          message: "Invalid username or password" 
        },
        401
      );
    }
  } catch (error) {
    return jsonNoStore(
      { 
        success: false, 
        message: "Server error" 
      },
      500
    );
  }
}