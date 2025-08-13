import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { promptType } = await req.json();

    // Get the authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY
    );

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    // Use our database function to check ownership
    const { data: hasAccess, error } = await supabase.rpc("user_owns_prompt", {
      user_uuid: user.id,
      prompt_type: promptType,
    });

    if (error) {
      console.error("Error checking ownership:", error);
      return NextResponse.json(
        { error: "Failed to check ownership" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasAccess,
      isAdmin,
      message: hasAccess
        ? isAdmin
          ? "Admin access granted"
          : "Access granted - prompt owned"
        : "Access denied - prompt not purchased",
    });
  } catch (error) {
    console.error("Error in check-ownership API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
