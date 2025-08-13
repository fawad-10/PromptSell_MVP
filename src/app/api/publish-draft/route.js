import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { draftId } = await request.json();

    if (!draftId) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the token
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get the current user using the token
    const {
      data: { user },
      error: authError,
    } = await supabaseWithAuth.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is a seller
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (profile.role !== "seller") {
      return NextResponse.json(
        { error: "Only sellers can publish drafts" },
        { status: 403 }
      );
    }

    // Publish the draft using the database function
    const { data: publishResult, error: publishError } =
      await supabaseAdmin.rpc("publish_prompt_draft", {
        draft_id: draftId,
        seller_uuid: user.id,
      });

    if (publishError) {
      console.error("Error publishing draft:", publishError);
      return NextResponse.json(
        { error: "Failed to publish draft" },
        { status: 500 }
      );
    }

    if (!publishResult || publishResult.length === 0) {
      return NextResponse.json(
        { error: "Failed to publish draft" },
        { status: 500 }
      );
    }

    const result = publishResult[0];

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to publish draft" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      prompt: {
        id: result.prompt_id,
        template_id: result.template_id,
      },
    });
  } catch (error) {
    console.error("Error in publish-draft API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
