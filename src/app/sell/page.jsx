"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showBecomeSeller, setShowBecomeSeller] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState([
    "seo_blog",
    "email_sequence",
    "ad_copy",
    "social_media",
    "product_description",
  ]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    price: "",
    type: "",
    typeDisplayName: "",
    typeDescription: "",
    category: "custom",
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Draft state
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Seller stats state
  const [sellerStats, setSellerStats] = useState({
    totalPrompts: 0,
    totalSales: 0,
    totalViews: 0,
    totalCustomers: 0,
  });
  const [sellerPrompts, setSellerPrompts] = useState([]);

  const checkSellerStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, display_name, username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        return;
      }

      setUserProfile(profile);
      setIsSeller(profile?.role === "seller");
      setLoading(false);
    } catch (error) {
      console.error("Error checking seller status:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSellerStatus();
  }, [checkSellerStatus]);

  useEffect(() => {
    if (isSeller && user) {
      fetchSellerStats();
      fetchDrafts();
    }
  }, [isSeller, user]);

  const handleAddCustomCategory = () => {
    if (customCategory && !categories.includes(customCategory)) {
      setCategories([...categories, customCategory]);
      setCustomCategory("");
    }
  };

  const fetchDrafts = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/save-draft", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const saveDraft = async () => {
    if (!formData.title || !formData.content || !formData.type) {
      alert(
        "Please fill in at least title, content, and type to save as draft"
      );
      return;
    }

    setIsSavingDraft(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to save drafts");
        return;
      }

      const response = await fetch("/api/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          draftId: currentDraftId, // null for new draft, existing ID for update
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Draft saved successfully:", data);

        // Set the current draft ID for future updates
        setCurrentDraftId(data.draft.id);

        // Show success message
        alert("Draft saved successfully!");

        // Refresh drafts list
        fetchDrafts();
      } else {
        const errorData = await response.json();
        console.error("Error saving draft:", errorData.error);
        alert("Error saving draft: " + errorData.error);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadDraft = (draft) => {
    setFormData({
      title: draft.title || "",
      description: draft.description || "",
      content: draft.content || "",
      price: draft.price || "",
      type: draft.type || "",
      typeDisplayName: draft.type_display_name || "",
      typeDescription: draft.type_description || "",
      category: draft.category || "custom",
      isPublic: draft.is_public || false,
    });
    setCurrentDraftId(draft.id);
    setShowDrafts(false);
  };

  const publishDraft = async (draftId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to publish drafts");
        return;
      }

      const response = await fetch("/api/publish-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ draftId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Draft published successfully:", data);

        alert("Draft published successfully!");

        // Refresh stats and drafts
        fetchSellerStats();
        fetchDrafts();

        // Clear form if this was the current draft
        if (currentDraftId === draftId) {
          setFormData({
            title: "",
            description: "",
            content: "",
            price: "",
            type: "",
            typeDisplayName: "",
            typeDescription: "",
            category: "custom",
            isPublic: true,
          });
          setCurrentDraftId(null);
        }
      } else {
        const errorData = await response.json();
        console.error("Error publishing draft:", errorData.error);
        alert("Error publishing draft: " + errorData.error);
      }
    } catch (error) {
      console.error("Error publishing draft:", error);
      alert("Error publishing draft. Please try again.");
    }
  };

  const deleteDraft = async (draftId) => {
    if (
      !confirm(
        "Are you sure you want to delete this draft? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to delete drafts");
        return;
      }

      const response = await fetch("/api/delete-draft", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ draftId }),
      });

      if (response.ok) {
        alert("Draft deleted successfully!");

        // Refresh drafts list
        fetchDrafts();

        // Clear form if this was the current draft
        if (currentDraftId === draftId) {
          setFormData({
            title: "",
            description: "",
            content: "",
            price: "",
            type: "",
            typeDisplayName: "",
            typeDescription: "",
            category: "custom",
            isPublic: true,
          });
          setCurrentDraftId(null);
        }
      } else {
        const errorData = await response.json();
        console.error("Error deleting draft:", errorData.error);
        alert("Error deleting draft: " + errorData.error);
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Error deleting draft. Please try again.");
    }
  };

  const fetchSellerStats = async () => {
    try {
      // Get current auth token to call protected API
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/seller-stats", {
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSellerStats(data.stats);
        setSellerPrompts(data.prompts);
      } else {
        console.log("Failed to fetch seller stats");
      }
    } catch (error) {
      console.error("Error fetching seller stats:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to create prompts");
        return;
      }

      const response = await fetch("/api/create-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Prompt created successfully:", data);

        // Reset form
        setFormData({
          title: "",
          description: "",
          content: "",
          price: "",
          type: "",
          typeDisplayName: "",
          typeDescription: "",
          category: "custom",
          isPublic: true,
        });

        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Refresh stats
        fetchSellerStats();
      } else {
        const errorData = await response.json();
        console.error("Error creating prompt:", errorData.error);
        alert("Error creating prompt: " + errorData.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error creating prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-[#f7f7f7] flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Checking seller status...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If user is not a seller, show the become seller interface
  if (!isSeller) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center mb-8'>
              <h1 className='text-4xl font-bold text-green-700 mb-4'>
                Become a Seller
              </h1>
              <p className='text-lg text-gray-600'>
                Start selling your AI prompts and earn money on PromptSell
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-8'>
              {/* Benefits Card */}
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <h2 className='text-2xl font-bold text-green-700 mb-4'>
                  Why Become a Seller?
                </h2>
                <div className='space-y-4'>
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
                      <p className='font-medium text-gray-800'>
                        Earn Passive Income
                      </p>
                      <p className='text-sm text-gray-600'>
                        Set your own prices and earn from every sale
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
                      <p className='font-medium text-gray-800'>Global Reach</p>
                      <p className='text-sm text-gray-600'>
                        Sell to customers worldwide with our platform
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
                      <p className='font-medium text-gray-800'>
                        Easy Management
                      </p>
                      <p className='text-sm text-gray-600'>
                        Manage your prompts and track sales easily
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
                      <p className='font-medium text-gray-800'>
                        Secure Payments
                      </p>
                      <p className='text-sm text-gray-600'>
                        Get paid securely through our platform
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Restricted */}
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <h2 className='text-2xl font-bold text-red-700 mb-4'>
                  Seller Access Required
                </h2>
                <p className='text-gray-600 mb-6'>
                  This page is only accessible to users with seller accounts.
                  Seller status is assigned during signup and cannot be changed
                  later.
                </p>

                <div className='bg-blue-50 border border-blue-200 rounded-md p-4 mb-4'>
                  <h3 className='text-blue-800 font-semibold mb-2'>
                    Want to become a seller?
                  </h3>
                  <p className='text-blue-700 text-sm'>
                    You&apos;ll need to create a new account and select &quot;Seller&quot;
                    during the signup process.
                  </p>
                </div>

                <div className='space-y-3'>
                  <a
                    href='/signin'
                    className='block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center'
                  >
                    Create Seller Account
                  </a>
                  <a
                    href='/browse'
                    className='block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors text-center'
                  >
                    Browse Prompts Instead
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Seller interface
  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#f7f7f7] py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Seller Dashboard
            </h1>
            <p className='text-gray-600'>
              Welcome back, {userProfile?.display_name || userProfile?.username}
              ! Manage your prompts and track your earnings.
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className='mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
              Prompt created successfully! It&apos;s now available for purchase.
            </div>
          )}

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-green-100 rounded-lg'>
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
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Active Prompts
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {sellerStats.totalPrompts}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-blue-100 rounded-lg'>
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
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Sales
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${sellerStats.totalSales.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-yellow-100 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-yellow-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Views
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {sellerStats.totalViews}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-purple-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Customers</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {sellerStats.totalCustomers}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Create New Prompt */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-lg shadow p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-bold text-gray-900'>
                    {currentDraftId ? "Edit Draft" : "Create New Prompt"}
                  </h2>
                  {currentDraftId && (
                    <span className='text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
                      Editing Draft
                    </span>
                  )}
                </div>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Prompt Title
                    </label>
                    <input
                      type='text'
                      name='title'
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder='Enter a compelling title for your prompt'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Description
                    </label>
                    <textarea
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows='3'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder='Describe what your prompt does and its benefits'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Category
                    </label>
                    <div className='flex space-x-2'>
                      <select
                        name='type'
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      >
                        <option value=''>Select a category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </option>
                        ))}
                      </select>
                      <input
                        type='text'
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder='Enter custom category'
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      />
                      <button
                        type='button'
                        onClick={handleAddCustomCategory}
                        className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Product Type Details */}
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='text-lg font-medium text-gray-900 mb-3'>
                      Product Type Details (Optional)
                    </h3>
                    <p className='text-sm text-gray-600 mb-4'>
                      Customize how your prompt appears to buyers. Leave blank
                      to use category as the product type.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Product Type Display Name
                        </label>
                        <input
                          type='text'
                          name='typeDisplayName'
                          value={formData.typeDisplayName}
                          onChange={handleInputChange}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                          placeholder='e.g., "Advanced SEO Blog Generator"'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Product Category
                        </label>
                        <select
                          name='category'
                          value={formData.category}
                          onChange={handleInputChange}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                        >
                          <option value='custom'>Custom</option>
                          <option value='content'>Content Creation</option>
                          <option value='marketing'>Marketing</option>
                          <option value='ecommerce'>E-commerce</option>
                          <option value='business'>Business</option>
                          <option value='social'>Social Media</option>
                          <option value='education'>Education</option>
                        </select>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Product Type Description
                      </label>
                      <textarea
                        name='typeDescription'
                        value={formData.typeDescription}
                        onChange={handleInputChange}
                        rows='2'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                        placeholder='Describe what makes this product type unique...'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Price ($)
                    </label>
                    <input
                      type='number'
                      name='price'
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min='0.99'
                      step='0.01'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder='9.99'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Prompt Content
                    </label>
                    <textarea
                      name='content'
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      rows='6'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder='Enter your AI prompt here. Be specific and detailed to get the best results.'
                    />
                  </div>

                  <div className='flex items-center space-x-4'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        name='isPublic'
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        className='mr-2'
                      />
                      <span className='text-sm text-gray-700'>
                        Make this prompt public
                      </span>
                    </label>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50'
                    >
                      {isSubmitting ? "Creating..." : "Create Prompt"}
                    </button>
                    <button
                      type='button'
                      onClick={saveDraft}
                      disabled={isSavingDraft}
                      className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50'
                    >
                      {isSavingDraft
                        ? "Saving..."
                        : currentDraftId
                        ? "Update Draft"
                        : "Save as Draft"}
                    </button>
                    {currentDraftId && (
                      <button
                        type='button'
                        onClick={() => setCurrentDraftId(null)}
                        className='bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors'
                      >
                        New Draft
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Drafts Management */}
              <div className='bg-white rounded-lg shadow p-6 mt-8'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Drafts ({drafts.length})
                  </h2>
                  <button
                    onClick={() => setShowDrafts(!showDrafts)}
                    className='text-blue-600 hover:text-blue-800 font-medium'
                  >
                    {showDrafts ? "Hide Drafts" : "Show Drafts"}
                  </button>
                </div>

                {showDrafts && (
                  <div className='space-y-4'>
                    {drafts.length === 0 ? (
                      <p className='text-gray-500 text-center py-8'>
                        No drafts yet. Start creating your prompt and save it as
                        a draft!
                      </p>
                    ) : (
                      drafts.map((draft) => (
                        <div key={draft.id} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-start'>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-gray-900'>
                                {draft.title}
                              </h3>
                              <p className='text-sm text-gray-600 mt-1'>
                                {draft.description}
                              </p>
                              <div className='flex items-center space-x-4 mt-2'>
                                <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                                  {draft.type}
                                </span>
                                {draft.price && (
                                  <span className='text-sm font-medium text-green-600'>
                                    ${draft.price}
                                  </span>
                                )}
                                <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
                                  Draft v{draft.version}
                                </span>
                                <span className='text-xs text-gray-500'>
                                  {new Date(
                                    draft.updated_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className='flex space-x-2 ml-4'>
                              <button
                                onClick={() => loadDraft(draft)}
                                className='text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50'
                              >
                                Load
                              </button>
                              <button
                                onClick={() => publishDraft(draft.id)}
                                className='text-sm text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-50'
                              >
                                Publish
                              </button>
                              <button
                                onClick={() => deleteDraft(draft.id)}
                                className='text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50'
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Your Prompts */}
              {sellerPrompts.length > 0 && (
                <div className='bg-white rounded-lg shadow p-6 mt-8'>
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>
                    Your Prompts
                  </h2>
                  <div className='space-y-4'>
                    {sellerPrompts.map((prompt) => (
                      <div key={prompt.id} className='border rounded-lg p-4'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='font-semibold text-gray-900'>
                              {prompt.title}
                            </h3>
                            <p className='text-sm text-gray-600 mt-1'>
                              {prompt.description}
                            </p>
                            <div className='flex items-center space-x-4 mt-2'>
                              <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                                {prompt.type}
                              </span>
                              <span className='text-sm font-medium text-green-600'>
                                ${prompt.price}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  prompt.is_public
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {prompt.is_public ? "Public" : "Private"}
                              </span>
                            </div>
                          </div>
                          <div className='flex space-x-2'>
                            {/* <button className='text-sm text-blue-600 hover:text-blue-800'>
                              Edit
                            </button> */}
                            <button className='text-sm text-red-600 hover:text-red-800'>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Quick Actions */}
              <div className='bg-white rounded-lg shadow p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>
                  Quick Actions
                </h3>
                <div className='space-y-3'>
                  <button className='w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center'>
                      <svg
                        className='w-5 h-5 text-green-600 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
                      <span className='font-medium'>Create New Prompt</span>
                    </div>
                  </button>

                  <button className='w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center'>
                      <svg
                        className='w-5 h-5 text-blue-600 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                        />
                      </svg>
                      <span className='font-medium'>View Analytics</span>
                    </div>
                  </button>

                  <button className='w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center'>
                      <svg
                        className='w-5 h-5 text-purple-600 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                        />
                      </svg>
                      <span className='font-medium'>Payout Settings</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className='bg-green-50 rounded-lg p-6'>
                <h3 className='text-lg font-bold text-green-800 mb-3'>
                  💡 Seller Tips
                </h3>
                <div className='space-y-2 text-sm text-green-700'>
                  <p>• Write clear, detailed prompts for better results</p>
                  <p>• Use descriptive titles to attract buyers</p>
                  <p>• Set competitive prices to increase sales</p>
                  <p>• Respond quickly to customer questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
