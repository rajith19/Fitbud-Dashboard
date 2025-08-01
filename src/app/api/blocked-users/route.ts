// src/app/api/blocked-users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check admin status
    const { data: userProfile, error: profileError } = await supabase
      .from("UserProfiles")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // For now, we'll show all blocks to authenticated users
    // You can add role-based filtering here if needed
    // const isAdmin = userProfile.role === 'admin';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    // Use the get_all_user_blocks function to get comprehensive blocked user data
    const { data: blockedUsers, error } = await supabase.rpc("get_all_user_blocks", {
      search_term: search || null,
      limit_count: limit,
      offset_count: offset,
    });

    // Get total count using the same function without pagination
    const { data: totalData, error: countError } = await supabase.rpc("get_all_user_blocks", {
      search_term: search || null,
      limit_count: null,
      offset_count: null,
    });

    if (countError) {
      console.error("Error getting total count:", countError);
    }

    const count = totalData?.length || 0;

    if (error) {
      console.error("Error fetching blocked users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // The function already handles pagination, so we can return the data directly
    return NextResponse.json({
      data: blockedUsers || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { blocked_id } = body;

    if (!blocked_id) {
      return NextResponse.json({ error: "blocked_id is required" }, { status: 400 });
    }

    // Prevent self-blocking
    if (blocked_id === session.user.id) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    // Check if already blocked
    const { data: existing } = await supabase
      .from("UserBlocks")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("blocked_user_id", blocked_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "User is already blocked" }, { status: 409 });
    }

    // Create the block
    const { data, error } = await supabase
      .from("UserBlocks")
      .insert({
        user_id: session.user.id,
        blocked_user_id: blocked_id,
      })
      .select(
        `
        id,
        created_at,
        blocker:UserProfiles!user_id(id, full_name, email),
        blocked:UserProfiles!blocked_user_id(id, full_name, email)
      `
      )
      .single();

    if (error) {
      console.error("Error creating block:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
