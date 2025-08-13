import { createClient } from "@supabase/supabase-js";

// POST: Trigger a payout for the logged-in user (mock logic)
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

    // Get user's payout method
    const { data: payout, error } = await supabase
      .from("payout_methods")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (error || !payout)
      return Response.json(
        { error: "No payout method found" },
        { status: 400 }
      );

    // TODO: Calculate payout amount for user (e.g., based on sales minus fees)
    const payoutAmount = 100; // mock amount

    // MOCK: Simulate payout logic
    // --- Replace this block with real PayPal/bank API integration ---
    if (payout.method === "paypal") {
      // Call PayPal Payouts API here
      // Example: await sendPaypalPayout(payout.paypal_email, payoutAmount);
    } else if (payout.method === "bank") {
      // Call bank transfer API here
      // Example: await sendBankTransfer(payout.bank_account, payout.bank_routing, payoutAmount);
    }
    // -------------------------------------------------------------

    // Respond with mock success
    return Response.json({
      success: true,
      message: "Payout initiated (mock)",
    });
  } catch (error) {
    console.error("Error in payout request API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
