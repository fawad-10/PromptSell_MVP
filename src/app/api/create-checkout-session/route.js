import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Get request body to determine what product to purchase
    const { promptType, amount, title, description } = await req.json();

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

    // Check if user already owns this prompt using the unified function
    const { data: ownsPrompt, error: ownershipError } = await supabase.rpc(
      "user_owns_prompt",
      {
        user_uuid: user.id,
        prompt_type: promptType || "seo_blog",
      }
    );

    if (ownershipError) {
      console.error("Error checking ownership:", ownershipError);
    }

    if (ownsPrompt && promptType) {
      return NextResponse.json(
        {
          error:
            "You already own this prompt template. No need to purchase again.",
        },
        { status: 400 }
      );
    }

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get product details dynamically from the database
    let product = null;
    let promptId = null;

    // Check if this is a seller prompt
    if (promptType && promptType.startsWith("seller_")) {
      // Fetch seller prompt details
      const { data: sellerPrompt, error: sellerError } = await supabase
        .from("prompt_templates")
        .select(
          `
          id,
          title,
          price,
          prompt_id,
          prompts!inner(
            id,
            title,
            description
          ),
          profiles!inner(
            display_name,
            username
          )
        `
        )
        .eq("type", promptType)
        .eq("is_public", true)
        .single();

      if (sellerError || !sellerPrompt) {
        return NextResponse.json(
          { error: "Seller prompt not found or not available" },
          { status: 404 }
        );
      }

      product = {
        name: sellerPrompt.title || sellerPrompt.prompts.title,
        description:
          sellerPrompt.prompts.description ||
          `Created by ${sellerPrompt.profiles.display_name}`,
        price: Math.round(sellerPrompt.price * 100), // Convert to cents
      };
      promptId = sellerPrompt.prompt_id;
    } else {
      // Handle traditional prompts - fetch from database
      const { data: traditionalPrompt, error: traditionalError } =
        await supabase
          .from("prompt_templates")
          .select("id, title, price")
          .eq("type", promptType || "seo_blog")
          .eq("is_admin_only", false)
          .single();

      if (traditionalPrompt) {
        product = {
          name: traditionalPrompt.title,
          description: `Professional ${(promptType || "seo_blog")
            .replace("_", " ")
            .toUpperCase()} template`,
          price: traditionalPrompt.price
            ? Math.round(traditionalPrompt.price * 100)
            : amount || 2999, // Fallback to provided amount or default
        };
      } else {
        // Fallback to hardcoded values for traditional prompts
        const fallbackProducts = {
          seo_blog: {
            name: title || "SEO Blog Post Generator",
            description:
              description ||
              "Expert-level SEO blog post generator with comprehensive optimization",
            price: amount || 2999,
          },
          email_sequence: {
            name: title || "Email Marketing Sequence Generator",
            description:
              description ||
              "Expert email marketing sequence generator for conversions",
            price: amount || 2499,
          },
          ad_copy: {
            name: title || "High-Converting Ad Copy Generator",
            description:
              description ||
              "High-converting ad copy generator for all platforms",
            price: amount || 1999,
          },
        };

        product = fallbackProducts[promptType] ||
          fallbackProducts.seo_blog || {
            name: title || "AI Prompt Template",
            description: description || "Professional AI prompt template",
            price: amount || 1999,
          };
      }
    }

    // Ensure we have a valid product
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        username: profile?.username || "",
        display_name: profile?.display_name || "",
        product_type: promptType || "seo_blog",
        prompt_id: promptId || null, // Include prompt_id for seller prompts
        is_seller_prompt: promptType?.startsWith("seller_") ? "true" : "false",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
