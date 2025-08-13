"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import CheckoutButton from "../../components/CheckoutButton";
import { useSearchParams } from "next/navigation";

// Available prompt types (matches actual prompt_templates data)
const promptTypes = [
  {
    id: "seo_blog",
    name: "SEO Blog Post",
    description:
      "Expert-level SEO blog post generator with comprehensive optimization",
    icon: "📝",
  },
  {
    id: "email_sequence",
    name: "Email Marketing",
    description: "Expert email marketing sequence generator for conversions",
    icon: "📧",
  },
  {
    id: "ad_copy",
    name: "Ad Copy",
    description: "High-converting ad copy generator for all platforms",
    icon: "🎯",
  },
];

export default function GeneratePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    topic: "",
    type: "seo_blog",
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);
  const [selectedPromptData, setSelectedPromptData] = useState(null);
  const [isPromptCreator, setIsPromptCreator] = useState(false);

  // Handle URL parameters when component mounts
  useEffect(() => {
    const type = searchParams.get("type");
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const content = searchParams.get("content");
    const price = searchParams.get("price");
    const author = searchParams.get("author");

    if (type || title) {
      // Set the prompt type in background and clear topic for user input
      setFormData((prev) => ({
        ...prev,
        type: type || prev.type,
        topic: "", // Always start with empty topic for user to input
      }));

      // Store selected prompt data for display
      if (title) {
        setSelectedPromptData({
          title,
          description,
          content,
          price,
          author,
          type,
        });
      }

      // Check ownership for the prompt type
      if (type) {
        checkPromptOwnership(type);
      }

      // Check if user is the creator of this seller prompt
      if (type && type.startsWith("seller_")) {
        checkIfUserIsPromptCreator(type);
      }
    }
  }, [searchParams]);

  const checkPromptOwnership = async (promptType) => {
    if (!user) return;

    try {
      const { supabase } = await import("../../lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated. Please sign in again.");
        return;
      }

      const response = await fetch("/api/check-ownership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ promptType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to check ownership");
        return;
      }

      if (!data.hasAccess) {
        setError(
          `You don't own the ${promptType.replace(
            "_",
            " "
          )} template. Please purchase it first.`
        );
        setRequiresUpgrade(true);
      } else {
        // Clear any previous errors if user now has access
        setError("");
        setRequiresUpgrade(false);
      }
    } catch (error) {
      console.error("Error checking ownership:", error);
      setError("Failed to verify prompt ownership");
    }
  };

  const checkIfUserIsPromptCreator = async (promptType) => {
    if (!user) return;

    try {
      const { supabase } = await import("../../lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // For seller prompts, check if the current user is the creator
      if (promptType.startsWith("seller_")) {
        const response = await fetch("/api/check-prompt-creator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ promptType }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsPromptCreator(data.isCreator);
        }
      }
    } catch (error) {
      console.error("Error checking prompt creator:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRequiresUpgrade(false);

    console.log("Submitting form with data:", formData);

    try {
      // Get the access token from Supabase
      const { supabase } = await import("../../lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      const requestData = {
        type: formData.type,
        topic: formData.topic,
      };

      console.log("Sending request data:", requestData);

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPurchase || data.requiresUpgrade) {
          setRequiresUpgrade(true);
          setError(data.message || "Prompt purchase required");
        } else {
          throw new Error(data.error || "Failed to generate prompt");
        }
        return;
      }

      setGeneratedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get the selected prompt type - either from hardcoded types or dynamic seller prompts
  const selectedPromptType =
    promptTypes.find((type) => type.id === formData.type) ||
    (selectedPromptData
      ? {
          id: selectedPromptData.type,
          name:
            selectedPromptData.title ||
            selectedPromptData.type.replace(/_/g, " "),
          description:
            selectedPromptData.description || "Custom prompt template",
          icon: "📝",
        }
      : null);

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-5xl font-extrabold text-green-700 mb-4 tracking-tight drop-shadow-sm'>
              AI Content Generator
            </h1>
            <p className='text-lg text-gray-700'>
              Enter your topic and get high-quality, customized content
            </p>
          </div>

          {/* Selected Prompt Info */}
          {selectedPromptData && (
            <div className='card p-6 mb-8 bg-green-50 border-green-200'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-green-800'>
                  Selected Prompt: {selectedPromptData.title}
                </h3>
                <div className='flex items-center gap-3'>
                  <span className='text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full'>
                    {selectedPromptType?.name ||
                      selectedPromptData.type.replace(/_/g, " ")}
                  </span>
                  <span className='text-sm text-green-600 font-medium'>
                    ${selectedPromptData.price}
                  </span>
                </div>
              </div>
              <p className='text-gray-700 mb-3'>
                {selectedPromptData.description}
              </p>
              <div className='flex items-center text-sm text-gray-600'>
                <span>By {selectedPromptData.author}</span>
              </div>
            </div>
          )}

          <div className='grid lg:grid-cols-2 gap-8'>
            {/* Input Form */}
            <div className='card p-8'>
              <h2 className='text-2xl font-semibold text-green-800 mb-6'>
                Generate Your Content
              </h2>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Topic Input */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Enter Your Topic *
                  </label>
                  <textarea
                    name='topic'
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder='e.g., Best Home Workouts for Busy Professionals'
                    rows={4}
                    className='w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 resize-none'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Describe your topic in detail. The more specific, the better
                    your content will be.
                  </p>
                </div>

                <button
                  type='submit'
                  disabled={loading || !formData.topic.trim()}
                  className='w-full btn btn-primary bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <div className='flex items-center justify-center space-x-2'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    "Generate Content"
                  )}
                </button>
              </form>

              {error && (
                <div className='mt-4'>
                  {requiresUpgrade && !isPromptCreator ? (
                    <div className='p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <svg
                            className='w-6 h-6 text-blue-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                            />
                          </svg>
                        </div>
                        <div className='flex-1'>
                          <h3 className='text-lg font-semibold text-blue-800 mb-2'>
                            🔒 Prompt Purchase Required
                          </h3>
                          <p className='text-blue-700 mb-4'>{error}</p>
                          <div className='grid sm:grid-cols-2 gap-3 mb-4 text-sm'>
                            <div className='flex items-center space-x-2'>
                              <span className='text-green-600'>✓</span>
                              <span>Unlimited uses of this template</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <span className='text-green-600'>✓</span>
                              <span>One-time purchase</span>
                            </div>
                          </div>
                          <div className='max-w-sm'>
                            <CheckoutButton
                              promptType={formData.type}
                              amount={
                                formData.type === "seo_blog"
                                  ? 2999
                                  : formData.type === "email_sequence"
                                  ? 2499
                                  : 1999
                              }
                              title={selectedPromptType?.name}
                              description={selectedPromptType?.description}
                            >
                              <div className='flex items-center justify-center space-x-2'>
                                <span>Buy {selectedPromptType?.name}</span>
                                <span className='font-bold'>
                                  $
                                  {formData.type === "seo_blog"
                                    ? "29.99"
                                    : formData.type === "email_sequence"
                                    ? "24.99"
                                    : "19.99"}
                                </span>
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
                            </CheckoutButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : requiresUpgrade && isPromptCreator ? (
                    <div className='p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <svg
                            className='w-6 h-6 text-green-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                        </div>
                        <div className='flex-1'>
                          <h3 className='text-lg font-semibold text-green-800 mb-2'>
                            ✅ You're the Creator of This Prompt!
                          </h3>
                          <p className='text-green-700 mb-4'>
                            Since you created this prompt, you can use it
                            without purchasing. However, you still need to enter
                            a topic to generate content.
                          </p>
                          <div className='grid sm:grid-cols-2 gap-3 mb-4 text-sm'>
                            <div className='flex items-center space-x-2'>
                              <span className='text-green-600'>✓</span>
                              <span>You own this prompt</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <span className='text-green-600'>✓</span>
                              <span>No purchase needed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <p className='text-red-700'>{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generated Content */}
            <div className='card p-8'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-semibold text-green-800'>
                  Generated Content
                </h2>
                {selectedPromptType && (
                  <div className='flex items-center space-x-2 text-sm bg-blue-100 px-3 py-1 rounded-full'>
                    <span>{selectedPromptType.icon}</span>
                    <span className='font-medium text-blue-700'>
                      {selectedPromptType.name}
                    </span>
                  </div>
                )}
              </div>

              {generatedPrompt ? (
                <div className='space-y-4'>
                  <div className='bg-gray-50 p-4 rounded-lg border'>
                    <pre className='whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed'>
                      {generatedPrompt}
                    </pre>
                  </div>
                  <div className='flex space-x-3'>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPrompt);
                        // You could add a toast notification here
                      }}
                      className='btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                        />
                      </svg>
                      <span>Copy to Clipboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedPrompt("");
                        setFormData((prev) => ({ ...prev, topic: "" }));
                      }}
                      className='btn btn-sm bg-gray-500 text-white hover:bg-gray-600'
                    >
                      Generate New
                    </button>
                  </div>

                  {/* Premium Upgrade Section */}
                  {/* <div className='mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200'>
                    <div className='flex items-start space-x-4'>
                      <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                        <svg
                          className='w-6 h-6 text-green-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                          🚀 Love what you generated? Upgrade to Premium!
                        </h3>
                        <p className='text-gray-600 mb-4'>
                          Get unlimited generations, access to all premium
                          templates, and priority support. Perfect for content
                          creators, marketers, and businesses.
                        </p>
                        <div className='grid sm:grid-cols-3 gap-3 mb-4 text-sm'>
                          <div className='flex items-center space-x-2'>
                            <span className='text-green-600'>✓</span>
                            <span>Unlimited generations</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-green-600'>✓</span>
                            <span>All template types</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-green-600'>✓</span>
                            <span>Priority support</span>
                          </div>
                        </div>
                        <div className='max-w-sm'>
                          <CheckoutButton />
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              ) : (
                <div className='text-center py-12 text-gray-500'>
                  <div className='text-4xl mb-4'>
                    {selectedPromptType?.icon || "📝"}
                  </div>
                  <p className='text-lg font-medium mb-2'>
                    {selectedPromptData
                      ? "Ready to generate your content"
                      : "Ready to generate content"}
                  </p>
                  <p className='text-sm'>
                    {selectedPromptData
                      ? "Enter your topic above to get started"
                      : "Browse prompts or enter your topic to get started"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
