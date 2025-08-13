import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request) {
  try {
    const {
      title,
      description,
      content,
      price,
      type,
      typeDisplayName,
      typeDescription,
      category = "custom",
      isPublic = false,
      draftId = null, // If provided, update existing draft
    } = await request.json();

    // Validate required fields
    if (!title || !content || !type) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, content, type",
        },
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
        { error: "Only sellers can save drafts" },
        { status: 403 }
      );
    }

    let result;
    let message;

    if (draftId) {
      // Update existing draft
      const { data: updatedDraft, error: updateError } = await supabaseAdmin
        .from("prompt_drafts")
        .update({
          title,
          description,
          content,
          price: price ? parseFloat(price) : null,
          type,
          type_display_name: typeDisplayName,
          type_description: typeDescription,
          category,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draftId)
        .eq("seller_id", user.id)
        .eq("status", "draft") // Only allow updates to draft status
        .select()
        .single();

      if (updateError) {
        console.error("Error updating draft:", updateError);
        return NextResponse.json(
          { error: "Failed to update draft" },
          { status: 500 }
        );
      }

      result = updatedDraft;
      message = "Draft updated successfully";
    } else {
      // Create new draft
      const { data: newDraft, error: insertError } = await supabaseAdmin
        .from("prompt_drafts")
        .insert({
          seller_id: user.id,
          title,
          description,
          content,
          price: price ? parseFloat(price) : null,
          type,
          type_display_name: typeDisplayName,
          type_description: typeDescription,
          category,
          is_public: isPublic,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating draft:", insertError);
        return NextResponse.json(
          { error: "Failed to create draft" },
          { status: 500 }
        );
      }

      result = newDraft;
      message = "Draft saved successfully";
    }

    return NextResponse.json({
      success: true,
      message,
      draft: {
        id: result.id,
        title: result.title,
        description: result.description,
        content: result.content,
        price: result.price,
        type: result.type,
        type_display_name: result.type_display_name,
        type_description: result.type_description,
        category: result.category,
        is_public: result.is_public,
        status: result.status,
        version: result.version,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    });
  } catch (error) {
    console.error("Error in save-draft API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
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
        { error: "Only sellers can view drafts" },
        { status: 403 }
      );
    }

    // Get drafts using the database function
    const { data: drafts, error: draftsError } = await supabaseAdmin.rpc(
      "get_seller_drafts",
      {
        seller_uuid: user.id,
        include_published: false, // Only get draft status
      }
    );

    if (draftsError) {
      console.error("Error fetching drafts:", draftsError);
      return NextResponse.json(
        { error: "Failed to fetch drafts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      drafts: drafts || [],
    });
  } catch (error) {
    console.error("Error in get-drafts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
