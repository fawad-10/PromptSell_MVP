"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice } from "@/lib/stripe";

export default function CheckoutButton({
  amount = 4999,
  currency = "usd",
  className = "",
  children,
  disabled = false,
  promptType = null, // New prop for individual prompt purchases
  title = null, // Product title
  description = null, // Product description
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!user) {
      setError("Please sign in to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get the access token from Supabase
      const { supabase } = await import("../lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          promptType,
          title,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes("already own")) {
          setError("You already own this template. No need to purchase again.");
        } else {
          throw new Error(data.error || "Failed to create checkout session");
        }
        return;
      }

      console.log("Checkout session created:", data.sessionId);

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full'>
      <button
        onClick={handleCheckout}
        disabled={loading || disabled}
        className={`w-full btn transition-all duration-200 min-h-[40px] md:min-h-[44px] ${
          loading || disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
        } text-white rounded-lg font-semibold text-sm md:text-base ${className}`}
      >
        {loading ? (
          <div className='flex items-center justify-center space-x-2'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
            <span>Processing...</span>
          </div>
        ) : (
          children || (
            <div className='flex items-center justify-center space-x-2'>
              <span>Purchase Template</span>
              <span className='font-bold'>{formatPrice(amount, currency)}</span>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 8l4 4m0 0l-4 4m4-4H3'
                />
              </svg>
            </div>
          )
        )}
      </button>

      {error && (
        <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}
    </div>
  );
}
