import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { promptTemplateType, amount, currency = "usd" } = await request.json();

    // Validate required fields
    if (!promptTemplateType || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: promptTemplateType, amount" },
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already owns this seller prompt
    const { data: hasAccess, error: ownershipError } = await supabase.rpc(
      "user_owns_seller_prompt",
      {
        user_uuid: user.id,
        prompt_template_type: promptTemplateType,
      }
    );

    if (ownershipError) {
      console.error("Error checking ownership:", ownershipError);
      return NextResponse.json(
        { error: "Failed to check prompt ownership" },
        { status: 500 }
      );
    }

    if (hasAccess) {
      return NextResponse.json(
        { error: "You already own this prompt" },
        { status: 400 }
      );
    }

    // Get the template details to verify it exists and is public
    const { data: template, error: templateError } = await supabaseAdmin
      .from("prompt_templates")
      .select("id, type, prompt_id, price, is_public, seller_id")
      .eq("type", promptTemplateType)
      .eq("is_public", true)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Prompt template not found or not available for purchase" },
        { status: 404 }
      );
    }

    // Create purchase record using admin client
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: user.id,
        prompt_id: template.prompt_id,
        product_type: promptTemplateType,
        status: "completed",
        amount: amount,
        currency: currency,
        stripe_session_id: `manual_purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Error creating purchase:", purchaseError);
      return NextResponse.json(
        { error: "Failed to create purchase record" },
        { status: 500 }
      );
    }

    // Get seller information
    const { data: sellerProfile, error: sellerError } = await supabaseAdmin
      .from("profiles")
      .select("display_name, username")
      .eq("id", template.seller_id)
      .single();

    return NextResponse.json({
      success: true,
      message: "Prompt purchased successfully",
      purchase: {
        id: purchase.id,
        prompt_id: purchase.prompt_id,
        product_type: purchase.product_type,
        amount: purchase.amount,
        currency: purchase.currency,
        status: purchase.status,
        created_at: purchase.created_at,
      },
      template: {
        id: template.id,
        type: template.type,
        price: template.price,
        seller: sellerProfile ? {
          display_name: sellerProfile.display_name,
          username: sellerProfile.username,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error in purchase-seller-prompt API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


