import { NextResponse } from "next/server";

export async function POST(req) {
  // Webhook functionality removed - payments will be handled directly in checkout flow
  console.log("Webhook endpoint called but functionality removed");

  return NextResponse.json({
    received: true,
    message:
      "Webhook functionality removed - payments handled in checkout flow",
  });
}
