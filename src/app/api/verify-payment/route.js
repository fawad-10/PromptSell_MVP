import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Check if this session has already been processed using admin client
    const { data: existingPurchase, error: checkError } = await supabaseAdmin
      .from("purchases")
      .select("id, status, amount, currency")
      .eq("stripe_session_id", sessionId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    // If a purchase already exists, return success immediately
    if (existingPurchase) {
      console.log("Payment already processed for session:", sessionId);
      return NextResponse.json({
        success: true,
        amount: existingPurchase.amount || session.amount_total,
        currency: existingPurchase.currency || session.currency,
        message: "Payment already processed",
        purchase_id: existingPurchase.id,
      });
    }

    // If there was an error checking (not just "no results"), log it
    if (checkError) {
      console.error("Error checking existing purchase:", checkError);
    }

    // Get or create the product type for the new dynamic system
    const productType = session.metadata.product_type || "seo_blog";

    let productTypeId = null;
    try {
      const { data: typeId, error: typeError } = await supabaseAdmin.rpc(
        "get_or_create_product_type",
        {
          type_name: productType,
          type_display_name: null,
          type_description: null,
          type_category: "custom",
          creator_id: null,
        }
      );

      if (!typeError) {
        productTypeId = typeId;
      }
    } catch (typeCreateError) {
      console.warn(
        "Could not create product type, will use legacy format:",
        typeCreateError
      );
    }

    // Prepare purchase data based on prompt type
    const purchaseData = {
      user_id: session.metadata.user_id || userId,
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      amount: session.amount_total,
      currency: session.currency,
      status: "completed",
      product_type: productType,
      product_type_id: productTypeId, // Add the new field
      metadata: {
        username: session.metadata.username || "",
        display_name: session.metadata.display_name || "",
        user_email: session.metadata.user_email || "",
        payment_intent: session.payment_intent,
        is_seller_prompt: session.metadata.is_seller_prompt || "false",
      },
    };

    // If this is a seller prompt, add the prompt_id
    if (session.metadata.prompt_id) {
      purchaseData.prompt_id = session.metadata.prompt_id;
    }

    // Save purchase to database using admin client to bypass RLS
    const { data: newPurchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert(purchaseData)
      .select()
      .single();

    if (purchaseError) {
      console.error("Error saving purchase:", purchaseError);

      // If it's a duplicate key error, it means another request beat us to it
      // Check again for the existing purchase and return that
      if (purchaseError.code === "23505") {
        console.log(
          "Duplicate purchase detected, checking for existing record..."
        );
        const { data: duplicatePurchase } = await supabaseAdmin
          .from("purchases")
          .select("id, amount, currency")
          .eq("stripe_session_id", sessionId)
          .single();

        if (duplicatePurchase) {
          return NextResponse.json({
            success: true,
            amount: duplicatePurchase.amount,
            currency: duplicatePurchase.currency,
            message: "Payment already processed (duplicate prevented)",
            purchase_id: duplicatePurchase.id,
          });
        }
      }

      return NextResponse.json(
        { error: "Failed to save purchase" },
        { status: 500 }
      );
    }

    // Note: No role updates needed for individual prompt purchases
    // Users remain as 'user' role and access is controlled by purchases table

    console.log(
      "Payment processed successfully for user:",
      session.metadata.user_id || userId
    );

    return NextResponse.json({
      success: true,
      amount: session.amount_total,
      currency: session.currency,
      message: "Payment processed successfully",
      purchase_id: newPurchase?.id,
      product_type: session.metadata.product_type || "seo_blog",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
