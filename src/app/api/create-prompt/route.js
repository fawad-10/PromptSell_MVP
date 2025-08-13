import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabase";

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
      isPublic = true,
    } = await request.json();

    // Validate required fields
    if (!title || !description || !content || !price || !type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, content, price, type",
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
    // Use supabaseAdmin if available, otherwise fall back to regular client
    const clientToUse = supabaseAdmin || supabaseWithAuth;
    const { data: profile, error: profileError } = await clientToUse
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
        { error: "Only sellers can create prompts" },
        { status: 403 }
      );
    }

    // Step 1: Get or create product type
    const { data: productTypeId, error: productTypeError } =
      await clientToUse.rpc("get_or_create_product_type", {
        type_name: type,
        type_display_name: typeDisplayName,
        type_description: typeDescription,
        type_category: category,
        creator_id: user.id,
      });

    if (productTypeError) {
      console.error("Error creating product type:", productTypeError);
      return NextResponse.json(
        { error: "Failed to create product type" },
        { status: 500 }
      );
    }

    // Step 2: Create the prompt in prompts table using admin client
    const { data: newPrompt, error: insertError } = await clientToUse
      .from("prompts")
      .insert({
        title,
        description,
        content,
        price: parseFloat(price),
        type,
        product_type_id: productTypeId,
        is_public: isPublic,
        author_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating prompt:", insertError);
      return NextResponse.json(
        { error: "Failed to create prompt" },
        { status: 500 }
      );
    }

    // Step 3: Create corresponding template in prompt_templates table
    const { data: newTemplate, error: templateError } = await clientToUse
      .from("prompt_templates")
      .insert({
        type: `seller_${newPrompt.id}`, // Unique type for seller prompts
        title: title,
        template: content,
        is_admin_only: false, // Seller prompts are accessible to buyers
        seller_id: user.id, // Track which seller created this
        prompt_id: newPrompt.id, // Link to the original prompt
        price: parseFloat(price),
        is_public: isPublic,
      })
      .select()
      .single();

    if (templateError) {
      console.error("Error creating prompt template:", templateError);
      // If template creation fails, we should clean up the prompt
      await clientToUse.from("prompts").delete().eq("id", newPrompt.id);

      return NextResponse.json(
        { error: "Failed to create prompt template" },
        { status: 500 }
      );
    }

    // Step 4: Verify the linking was successful
    const { data: verification, error: verifyError } = await clientToUse
      .from("prompt_templates")
      .select("id, type, prompt_id, seller_id")
      .eq("id", newTemplate.id)
      .single();

    if (verifyError || !verification) {
      console.error("Error verifying prompt template creation:", verifyError);
      return NextResponse.json(
        { error: "Failed to verify prompt creation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prompt created and linked successfully",
      prompt: {
        id: newPrompt.id,
        title: newPrompt.title,
        description: newPrompt.description,
        price: newPrompt.price,
        type: newPrompt.type,
        is_public: newPrompt.is_public,
        author_id: newPrompt.author_id,
        created_at: newPrompt.created_at,
      },
      template: {
        id: newTemplate.id,
        type: newTemplate.type,
        prompt_id: newTemplate.prompt_id,
        seller_id: newTemplate.seller_id,
        price: newTemplate.price,
        is_public: newTemplate.is_public,
      },
      linking: {
        prompt_id: newPrompt.id,
        template_id: newTemplate.id,
        seller_id: user.id,
        template_type: `seller_${newPrompt.id}`,
      },
    });
  } catch (error) {
    console.error("Error in create-prompt API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
