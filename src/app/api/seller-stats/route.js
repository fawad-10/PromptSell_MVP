import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request) {
  try {
    // Authenticate via Authorization header (Bearer token)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a seller
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (profile.role !== "seller") {
      return NextResponse.json(
        { error: "Only sellers can access seller statistics" },
        { status: 403 }
      );
    }

    // Fetch seller's prompts using admin client to bypass RLS
    const { data: prompts, error: promptsError } = await supabaseAdmin
      .from("prompts")
      .select("id,title,description,price,is_public,type,created_at")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (promptsError) {
      console.error("Error fetching prompts:", promptsError);
      return NextResponse.json(
        { error: "Failed to fetch prompts" },
        { status: 500 }
      );
    }

    // Fetch completed purchases for these prompts
    const promptIds = (prompts || []).map((p) => p.id);
    let purchases = [];
    if (promptIds.length > 0) {
      const { data: pData, error: purchasesError } = await supabaseAdmin
        .from("purchases")
        .select("id,prompt_id,user_id,amount,created_at,status")
        .in("prompt_id", promptIds)
        .eq("status", "completed");
      if (purchasesError) {
        console.error("Error fetching purchases:", purchasesError);
        return NextResponse.json(
          { error: "Failed to fetch purchases" },
          { status: 500 }
        );
      }
      purchases = pData || [];
    }

    // Aggregate stats
    const totalPrompts = prompts?.length || 0;
    const publicPrompts = prompts?.filter((p) => p.is_public)?.length || 0;

    // Calculate total value based on prompt price * number of sales
    const totalValue =
      prompts?.reduce((sum, prompt) => {
        const promptSales = purchases.filter(
          (p) => p.prompt_id === prompt.id
        ).length;
        return sum + Number(prompt.price || 0) * promptSales;
      }, 0) || 0;

    const salesByPrompt = new Map();
    const uniqueCustomers = new Set();
    for (const purchase of purchases) {
      uniqueCustomers.add(purchase.user_id);
      const key = purchase.prompt_id;
      const prompt = prompts.find((p) => p.id === purchase.prompt_id);
      const promptPrice = prompt ? Number(prompt.price) : 0;

      const entry = salesByPrompt.get(key) || {
        salesCount: 0,
        revenueCents: 0,
        lastSoldAt: null,
      };
      entry.salesCount += 1;
      entry.revenueCents += promptPrice * 100; // Convert dollars to cents
      if (
        !entry.lastSoldAt ||
        new Date(purchase.created_at) > new Date(entry.lastSoldAt)
      ) {
        entry.lastSoldAt = purchase.created_at;
      }
      salesByPrompt.set(key, entry);
    }

    const enrichedPrompts = (prompts || []).map((p) => {
      const agg = salesByPrompt.get(p.id) || {
        salesCount: 0,
        revenueCents: 0,
        lastSoldAt: null,
      };
      return {
        ...p,
        salesCount: agg.salesCount,
        revenue: Math.round(agg.revenueCents) / 100,
        lastSoldAt: agg.lastSoldAt,
        isNew:
          Date.now() - new Date(p.created_at).getTime() <
          1000 * 60 * 60 * 24 * 14, // last 14 days
      };
    });

    // Calculate total revenue based on prompt prices
    const totalRevenueCents = purchases.reduce((sum, purchase) => {
      const prompt = prompts.find((p) => p.id === purchase.prompt_id);
      const promptPrice = prompt ? Number(prompt.price) : 0;
      return sum + promptPrice * 100; // Convert dollars to cents
    }, 0);

    const totalRevenue = Math.round(totalRevenueCents) / 100;
    const totalCustomers = uniqueCustomers.size;
    const totalSalesCount = purchases.length;
    const newPromptsCount = enrichedPrompts.filter((p) => p.isNew).length;
    const oldPromptsCount = totalPrompts - newPromptsCount;

    return NextResponse.json({
      success: true,
      stats: {
        totalPrompts,
        publicPrompts,
        totalValue,
        totalSales: totalSalesCount,
        totalRevenue,
        totalCustomers,
        newPromptsCount,
        oldPromptsCount,
      },
      prompts: enrichedPrompts,
      recentPurchases: purchases
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10),
    });
  } catch (error) {
    console.error("Error in seller-stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
