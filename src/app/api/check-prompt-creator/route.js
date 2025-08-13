import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { promptType } = await request.json();

    if (!promptType) {
      return NextResponse.json(
        { error: "Prompt type is required" },
        { status: 400 }
      );
    }

    // Extract the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a Supabase client to verify the token
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY
    );

    // Verify the user token
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

    // Check if this is a seller prompt
    if (!promptType.startsWith("seller_")) {
      return NextResponse.json(
        { isCreator: false, message: "Not a seller prompt" },
        { status: 200 }
      );
    }

    // Query the prompt_templates table to check if the user is the creator
    const { data: promptTemplate, error: queryError } = await supabaseAdmin
      .from("prompt_templates")
      .select("seller_id")
      .eq("type", promptType)
      .single();

    if (queryError) {
      console.error("Error querying prompt template:", queryError);
      return NextResponse.json(
        { error: "Failed to check prompt creator" },
        { status: 500 }
      );
    }

    if (!promptTemplate) {
      return NextResponse.json(
        { isCreator: false, message: "Prompt template not found" },
        { status: 200 }
      );
    }

    // Check if the current user is the creator
    const isCreator = promptTemplate.seller_id === user.id;

    return NextResponse.json({
      isCreator,
      message: isCreator
        ? "User is the creator of this prompt"
        : "User is not the creator of this prompt",
    });
  } catch (error) {
    console.error("Error in check-prompt-creator API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
