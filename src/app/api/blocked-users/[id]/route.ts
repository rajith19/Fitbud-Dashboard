// src/app/api/blocked-users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: blockId } = await params;

    if (!blockId) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }

    // Check if the block exists and user owns it
    const { data: block, error: fetchError } = await supabase
      .from("UserBlocks")
      .select("id, user_id")
      .eq("id", blockId)
      .single();

    if (fetchError || !block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    // Check if user owns this block
    if (block.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the block
    const { error: deleteError } = await supabase.from("UserBlocks").delete().eq("id", blockId);

    if (deleteError) {
      console.error("Error deleting block:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Block removed successfully" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: blockId } = await params;
    // Note: UserBlocks table doesn't have a reason field, so we don't need to parse it
    // const body = await request.json();

    if (!blockId) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }

    // Check if the block exists and user owns it
    const { data: block, error: fetchError } = await supabase
      .from("UserBlocks")
      .select("id, user_id")
      .eq("id", blockId)
      .single();

    if (fetchError || !block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    // Check if user owns this block
    if (block.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Note: UserBlocks table doesn't have a reason field in your schema
    // So we'll just return the existing block data
    const { data, error: selectError } = await supabase
      .from("UserBlocks")
      .select(
        `
        id,
        created_at,
        blocker:UserProfiles!user_id(id, full_name, email),
        blocked:UserProfiles!blocked_user_id(id, full_name, email)
      `
      )
      .eq("id", blockId)
      .single();

    if (selectError) {
      console.error("Error fetching block:", selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
