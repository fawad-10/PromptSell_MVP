"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import PromptCard from "../../components/PromptCard";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  checkCurrentUserOwnership,
  PROMPT_PRICES,
  isSellerPrompt,
} from "../../lib/ownership";
import { useAuth } from "../../contexts/AuthContext";

export default function BrowsePage() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [ownership, setOwnership] = useState({
    ownedPrompts: [],
    isAdmin: false,
  });
  const [userProfile, setUserProfile] = useState(null);

  // Categories that match actual prompt_templates types
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "seo_blog", name: "SEO Blog Post" },
    { id: "email_sequence", name: "Email Marketing" },
    { id: "ad_copy", name: "Ad Copy" },
    // Add "My Prompts" option only for sellers
    ...(userProfile?.role === "seller"
      ? [{ id: "my_prompts", name: "My Prompts" }]
      : []),
  ];

  const fetchPrompts = useCallback(async () => {
    try {
      // Try seller prompts API first (includes own private prompts if authed)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const resp = await fetch("/api/available-seller-prompts", {
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
      });

      if (!resp.ok) {
        throw new Error("Failed to fetch prompts");
      }

      const sellerPayload = await resp.json();
      const sellerTemplates = sellerPayload?.prompts || [];

      // Also fetch traditional templates directly for now
      const { data: traditional, error: tError } = await supabase
        .from("prompt_templates")
        .select("id,type,title,template,is_admin_only,created_at")
        .in("type", ["seo_blog", "email_sequence", "ad_copy"])
        .order("created_at", { ascending: false });
      if (tError) {
        console.warn("Error fetching traditional templates:", tError);
      }

      // Transform seller templates with backend-stored properties
      const sellerTransformed = sellerTemplates.map((tpl) => ({
        id: tpl.id,
        title: tpl.title,
        description: tpl.prompt?.description || "Seller prompt",
        content: tpl.template,
        price: tpl.price ?? 19.99,
        type: tpl.type,
        author_name:
          tpl.seller?.display_name || tpl.seller?.username || "Seller",
        created_at: tpl.created_at,
        seller_id: tpl.seller?.id, // Add seller ID for ownership checking
        is_my_prompt: tpl.seller?.id === user?.id, // Check if this is the current user's prompt
      }));

      // Transform traditional templates
      const traditionalTransformed = (traditional || []).map((template) => ({
        id: template.id,
        title: template.title,
        description: `Professional ${template.type.replace("_", " ")} template`,
        content: template.template,
        price: PROMPT_PRICES[template.type]?.price || 19.99,
        type: template.type,
        author_name: "PromptSell",
        created_at: template.created_at,
        is_admin_only: template.is_admin_only,
        seller_id: null, // Traditional prompts don't have a seller
        is_my_prompt: false, // Traditional prompts are never "my prompts"
      }));

      setPrompts([...sellerTransformed, ...traditionalTransformed]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const filterPrompts = useCallback(() => {
    let filtered = prompts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter by prompt type
    if (selectedCategory === "my_prompts") {
      // Filter to show only prompts created by the current seller
      filtered = filtered.filter((prompt) => prompt.is_my_prompt);
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter((prompt) => prompt.type === selectedCategory);
    }

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  useEffect(() => {
    if (user) {
      checkCurrentUserOwnership().then(setOwnership);
    }
  }, [user]);

  // Fetch user profile to check if they're a seller
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role, display_name, username")
            .eq("id", user.id)
            .single();

          if (!error && profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Refresh ownership status when URL changes (after purchase)
  useEffect(() => {
    const refreshOwnership = async () => {
      if (user) {
        const newOwnership = await checkCurrentUserOwnership();
        setOwnership(newOwnership);
      }
    };

    // Refresh ownership status
    refreshOwnership();
  }, [user]); // Refresh when user changes

  useEffect(() => {
    filterPrompts();
  }, [filterPrompts]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-[#f7f7f7] py-8'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dbf73] mx-auto'></div>
              <p className='mt-4 fiverr-text-light'>Loading prompts...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#f7f7f7] py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold fiverr-text mb-4'>
              Find the perfect AI prompt
            </h1>
            <p className='text-lg fiverr-text-light'>
              Browse thousands of high-quality prompts from experts
            </p>
          </div>

          {/* Search and Filters */}
          <div className='bg-white rounded-lg shadow-sm border border-[#e4e5e7] p-6 mb-8'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* Search */}
              <div className='flex-1'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search prompts...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full px-4 py-3 pl-10 fiverr-search text-sm'
                  />
                  <svg
                    className='absolute left-3 top-3.5 h-4 w-4 text-[#74767e]'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className='lg:w-64'>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className='w-full px-4 py-3 fiverr-search text-sm'
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold fiverr-text'>
                {filteredPrompts.length} prompts found
              </h2>
              {/* <div className='flex items-center space-x-2'>
                <span className='text-sm fiverr-text-light'>Sort by:</span>
                <select className='text-sm fiverr-search px-3 py-1'>
                  <option>Best selling</option>
                  <option>Newest arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div> */}
            </div>

            {filteredPrompts.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-24 h-24 fiverr-gradient rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-12 h-12 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold fiverr-text mb-2'>
                  No prompts found
                </h3>
                <p className='fiverr-text-light'>
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isOwned={
                      // User owns the prompt if:
                      // 1. They purchased it (traditional or seller prompt)
                      // 2. They are admin
                      // 3. They created the seller prompt (can use their own prompts)
                      ownership.ownedPrompts.includes(prompt.type) ||
                      ownership.isAdmin ||
                      prompt.is_my_prompt
                    }
                    showOwnership={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
