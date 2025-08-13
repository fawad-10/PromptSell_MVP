import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request) {
  try {
    // Optional auth to include own private prompts
    const authHeader = request.headers.get("authorization");
    let authedUserId = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_KEY
      );
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      authedUserId = user?.id || null;
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sellerId = searchParams.get("sellerId");

    // Build the query
    let query = supabaseAdmin
      .from("prompt_templates")
      .select(
        `
        id,
        type,
        title,
        template,
        price,
        is_public,
        prompt_id,
        seller_id,
        created_at,
        prompts!inner(
          id,
          description,
          created_at
        ),
        profiles!inner(
          id,
          display_name,
          username
        )
      `
      )
      .like("type", "seller_%");

    // Public or own
    if (authedUserId) {
      query = query.or(`is_public.eq.true,seller_id.eq.${authedUserId}`);
    } else {
      query = query.eq("is_public", true);
    }

    // Apply filters
    if (category) {
      query = query.eq("prompts.type", category);
    }
    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }
    if (sellerId) {
      query = query.eq("seller_id", sellerId);
    }

    // Execute the query
    const { data: templates, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching seller prompts:", error);
      return NextResponse.json(
        { error: "Failed to fetch seller prompts" },
        { status: 500 }
      );
    }

    // Transform the data to a cleaner format
    const formattedPrompts =
      templates?.map((template) => ({
        id: template.id,
        type: template.type,
        title: template.title,
        template: template.template,
        price: template.price,
        is_public: template.is_public,
        created_at: template.created_at,
        prompt: {
          id: template.prompts.id,
          description: template.prompts.description,
          created_at: template.prompts.created_at,
        },
        seller: {
          id: template.profiles.id,
          display_name: template.profiles.display_name,
          username: template.profiles.username,
        },
      })) || [];

    return NextResponse.json({
      success: true,
      prompts: formattedPrompts,
      total: formattedPrompts.length,
    });
  } catch (error) {
    console.error("Error in available-seller-prompts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
