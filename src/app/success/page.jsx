"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";

export default function SuccessPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const [promptDetails, setPromptDetails] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }

    processPayment();
  }, [sessionId, router]);

  const getTraditionalPromptTitle = (promptType) => {
    const titles = {
      seo_blog: "SEO Blog Post Generator",
      email_sequence: "Email Marketing Sequence Generator",
      ad_copy: "High-Converting Ad Copy Generator",
    };
    return titles[promptType] || "AI Prompt Template";
  };

  const getTraditionalPromptDescription = (promptType) => {
    const descriptions = {
      seo_blog:
        "Expert-level SEO blog post generator with comprehensive optimization",
      email_sequence:
        "Expert email marketing sequence generator for conversions",
      ad_copy: "High-converting ad copy generator for all platforms",
    };
    return descriptions[promptType] || "Professional AI prompt template";
  };

  const getTraditionalPromptContent = (promptType) => {
    const contents = {
      seo_blog:
        "Create a comprehensive SEO-optimized blog post about [TOPIC]. Include a compelling headline, meta description, introduction, main content with H2 and H3 headings, conclusion, and call-to-action. Focus on user intent and search engine optimization.",
      email_sequence:
        "Design an email marketing sequence for [TOPIC] with 5 emails: welcome, nurture, value, conversion, and follow-up. Each email should have a clear subject line, compelling content, and strategic call-to-action.",
      ad_copy:
        "Create high-converting ad copy for [TOPIC] including multiple headlines, ad descriptions, and call-to-action buttons. Focus on benefits, urgency, and conversion optimization.",
    };
    return (
      contents[promptType] ||
      "Generate professional content about [TOPIC] using best practices and industry standards."
    );
  };

  const getTraditionalPromptPrice = (promptType) => {
    const prices = {
      seo_blog: 29.99,
      email_sequence: 24.99,
      ad_copy: 19.99,
    };
    return prices[promptType] || 19.99;
  };

  const fetchSellerPromptDetails = async (promptType) => {
    try {
      const response = await fetch("/api/available-seller-prompts");
      if (response.ok) {
        const data = await response.json();
        const prompt = data.prompts.find((p) => p.type === promptType);
        if (prompt) {
          setPromptDetails((prev) => ({
            ...prev,
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            price: prompt.price,
            author: prompt.seller_name || prompt.seller_username,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching seller prompt details:", error);
    }
  };

  const processPayment = async () => {
    try {
      setProcessingPayment(true);

      // Verify the session with Stripe and update database
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment");
      }

      setSessionData({
        id: sessionId,
        amount: data.amount,
        currency: data.currency,
        status: "completed",
      });

      // Get prompt details from the response
      if (data.product_type) {
        setPromptDetails({
          type: data.product_type,
          // For seller prompts, we'll need to fetch additional details
          isSellerPrompt: data.product_type.startsWith("seller_"),
        });

        // If it's a seller prompt, fetch the complete details
        if (data.product_type.startsWith("seller_")) {
          await fetchSellerPromptDetails(data.product_type);
        } else {
          // For traditional prompts, set the basic details
          setPromptDetails((prev) => ({
            ...prev,
            title: getTraditionalPromptTitle(data.product_type),
            description: getTraditionalPromptDescription(data.product_type),
            content: getTraditionalPromptContent(data.product_type),
            price: getTraditionalPromptPrice(data.product_type),
            author: "PromptSell",
          }));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message);
      setLoading(false);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>
            {processingPayment ? "Processing your payment..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center'>
        <div className='max-w-md mx-auto text-center'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-10 h-10 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-red-700 mb-2'>
            Payment Error
          </h1>
          <p className='text-gray-600 mb-6'>{error}</p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link
              href={
                promptDetails
                  ? `/generate?type=${
                      promptDetails.type
                    }&title=${encodeURIComponent(
                      promptDetails.title || ""
                    )}&description=${encodeURIComponent(
                      promptDetails.description || ""
                    )}&content=${encodeURIComponent(
                      promptDetails.content || ""
                    )}&price=${
                      promptDetails.price || ""
                    }&author=${encodeURIComponent(promptDetails.author || "")}`
                  : "/generate"
              }
              className='btn bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition-colors'
            >
              Try Again
            </Link>
            <Link
              href='/browse'
              className='btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center transition-colors'
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='card bg-white shadow-2xl border border-green-200 p-8 rounded-2xl'>
          {/* Success Icon */}
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-10 h-10 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h1 className='text-4xl font-bold text-green-700 mb-2'>
              Payment Successful!
            </h1>
            <p className='text-lg text-gray-600'>
              Your prompt template is now available! 🎉
            </p>

            {/* Show purchased prompt details */}
            {promptDetails && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
                <h3 className='text-lg font-semibold text-blue-800 mb-2'>
                  Purchased: {promptDetails.title}
                </h3>
                <p className='text-blue-700 text-sm mb-2'>
                  {promptDetails.description}
                </p>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-blue-600 font-medium'>
                    By {promptDetails.author}
                  </span>
                  <span className='text-blue-600 font-medium'>
                    ${promptDetails.price}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Details */}
          <div className='bg-green-50 rounded-lg p-6 mb-8'>
            <h2 className='text-xl font-semibold text-green-800 mb-4'>
              Purchase Details
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Product:</span>
                <span className='font-medium'>Prompt Template</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Amount:</span>
                <span className='font-medium text-green-700'>
                  $
                  {sessionData?.amount
                    ? (sessionData.amount / 100).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Session ID:</span>
                <span className='font-mono text-sm text-gray-600'>
                  {sessionId?.substring(0, 20)}...
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Status:</span>
                <span className='font-medium text-green-600'>✅ Completed</span>
              </div>
            </div>
          </div>

          {/* Template Access */}
          <div className='mb-8'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              🚀 You now have access to:
            </h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Template Access</p>
                  <p className='text-sm text-gray-600'>
                    Use your purchased template
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>AI Generation</p>
                  <p className='text-sm text-gray-600'>
                    Generate content with your template
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Priority Support</p>
                  <p className='text-sm text-gray-600'>
                    Get help when you need it
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Early Access</p>
                  <p className='text-sm text-gray-600'>
                    New features before others
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link
              href={
                promptDetails
                  ? `/generate?type=${
                      promptDetails.type
                    }&title=${encodeURIComponent(
                      promptDetails.title || ""
                    )}&description=${encodeURIComponent(
                      promptDetails.description || ""
                    )}&content=${encodeURIComponent(
                      promptDetails.content || ""
                    )}&price=${
                      promptDetails.price || ""
                    }&author=${encodeURIComponent(promptDetails.author || "")}`
                  : "/generate"
              }
              className='flex-1 btn bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition-colors'
            >
              Start Generating Content
            </Link>
            <Link
              href='/browse'
              className='flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center transition-colors'
            >
              Browse Templates
            </Link>
          </div>

          {/* Footer Note */}
          <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
            <p className='text-sm text-gray-500'>
              A confirmation email has been sent to {user?.email}
            </p>
            <p className='text-xs text-gray-400 mt-2'>
              Need help? Contact us at support@promptsell.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
