import { createClient } from "@supabase/supabase-js";

// POST: Save or update payout method for logged-in user
export async function POST(req) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the token
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
      return Response.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { method, paypal_email, bank_account, bank_routing } =
      await req.json();
    if (
      !method ||
      (method === "paypal" && !paypal_email) ||
      (method === "bank" && (!bank_account || !bank_routing))
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert payout method
    const { error } = await supabase.from("payout_methods").upsert(
      {
        user_id: user.id,
        method,
        paypal_email: method === "paypal" ? paypal_email : null,
        bank_account: method === "bank" ? bank_account : null,
        bank_routing: method === "bank" ? bank_routing : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: ["user_id"] }
    );

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in payout method API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
