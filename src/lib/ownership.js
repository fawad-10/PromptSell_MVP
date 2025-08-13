import { createClient } from "@supabase/supabase-js";

/**
 * Check which prompts a user owns using database function (supports both traditional and seller prompts)
 * @param {string} userId - The user's ID
 * @returns {Promise<{ownedPrompts: string[], isAdmin: boolean, purchaseDetails: Array}>}
 */
export async function checkPromptOwnership(userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    const isAdmin = profile?.role === "admin";

    // Use our enhanced database function to get owned prompt types (traditional + seller)
    const { data: ownedPromptData, error } = await supabase.rpc(
      "get_user_owned_prompt_types",
      { user_uuid: userId }
    );

    if (error) {
      console.error("Error checking prompt ownership:", error);
      return { ownedPrompts: [], isAdmin: false, purchaseDetails: [] };
    }

    const ownedPrompts = ownedPromptData?.map((p) => p.product_type) || [];
    const purchaseDetails =
      ownedPromptData?.map((p) => ({
        ...p,
        isSellerPrompt: p.product_type?.startsWith("seller_"),
        promptTitle: p.prompt_title,
        sellerName: p.seller_name,
      })) || [];

    return {
      ownedPrompts,
      isAdmin,
      purchaseDetails,
    };
  } catch (error) {
    console.error("Error checking prompt ownership:", error);
    return { ownedPrompts: [], isAdmin: false, purchaseDetails: [] };
  }
}

/**
 * Client-side hook to check current user's prompt ownership
 * @returns {Promise<{ownedPrompts: string[], isAdmin: boolean}>}
 */
export async function checkCurrentUserOwnership() {
  const { supabase } = await import("./supabase");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ownedPrompts: [], isAdmin: false };
    }

    return await checkPromptOwnership(user.id);
  } catch (error) {
    console.error("Error checking current user ownership:", error);
    return { ownedPrompts: [], isAdmin: false };
  }
}

/**
 * Get prompt prices
 */
export const PROMPT_PRICES = {
  seo_blog: { price: 29.99, cents: 2999 },
  email_sequence: { price: 24.99, cents: 2499 },
  ad_copy: { price: 19.99, cents: 1999 },
};

/**
 * Check if user has access to a specific prompt type using database function (supports both traditional and seller prompts)
 * @param {string} userId - The user's ID
 * @param {string} promptType - The prompt type to check (traditional types like 'seo_blog' or seller types like 'seller_uuid')
 * @returns {Promise<boolean>}
 */
export async function checkPromptAccess(userId, promptType) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    // Use our enhanced database function to check ownership (handles both traditional and seller prompts)
    const { data, error } = await supabase.rpc("user_owns_prompt", {
      user_uuid: userId,
      prompt_type: promptType,
    });

    if (error) {
      console.error("Error checking prompt access:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking prompt access:", error);
    return false;
  }
}

/**
 * Check if user already owns a specific prompt type (alias for checkPromptAccess)
 * @param {string} userId - The user's ID
 * @param {string} promptType - The prompt type to check
 * @returns {Promise<boolean>}
 */
export async function checkPromptOwnershipByType(userId, promptType) {
  // Use the same function as checkPromptAccess since they do the same thing
  return await checkPromptAccess(userId, promptType);
}

/**
 * Get all available prompts for a user (both traditional and seller prompts)
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>}
 */
export async function getAvailablePromptsForUser(userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    const { data, error } = await supabase.rpc(
      "get_available_prompts_for_user",
      {
        user_uuid: userId,
      }
    );

    if (error) {
      console.error("Error fetching available prompts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching available prompts:", error);
    return [];
  }
}

/**
 * Check if a prompt is a seller-created prompt
 * @param {string} promptType - The prompt type to check
 * @returns {boolean}
 */
export function isSellerPrompt(promptType) {
  return promptType?.startsWith("seller_");
}

/**
 * Get seller prompt details by type
 * @param {string} promptType - The seller prompt type
 * @returns {Promise<Object|null>}
 */
export async function getSellerPromptDetails(promptType) {
  if (!isSellerPrompt(promptType)) {
    return null;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    const { data, error } = await supabase
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
        created_at,
        prompts!inner(
          id,
          title,
          description,
          content,
          is_public
        ),
        profiles!inner(
          id,
          display_name,
          username
        )
      `
      )
      .eq("type", promptType)
      .eq("is_public", true)
      .single();

    if (error) {
      console.error("Error fetching seller prompt details:", error);
      return null;
    }

    return {
      id: data.id,
      type: data.type,
      title: data.title,
      template: data.template,
      price: data.price,
      isPublic: data.is_public,
      promptId: data.prompt_id,
      createdAt: data.created_at,
      prompt: {
        id: data.prompts.id,
        title: data.prompts.title,
        description: data.prompts.description,
        content: data.prompts.content,
        isPublic: data.prompts.is_public,
      },
      seller: {
        id: data.profiles.id,
        displayName: data.profiles.display_name,
        username: data.profiles.username,
      },
    };
  } catch (error) {
    console.error("Error fetching seller prompt details:", error);
    return null;
  }
}

/**
 * Purchase a prompt (traditional or seller)
 * @param {string} userId - The user's ID
 * @param {string} promptType - The prompt type to purchase
 * @param {number} amount - The amount in cents
 * @param {string} currency - The currency code
 * @param {string} stripeSessionId - The Stripe session ID
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<string|null>} - Purchase ID or null if failed
 */
export async function purchasePrompt(
  userId,
  promptType,
  amount,
  currency = "usd",
  stripeSessionId = null,
  metadata = {}
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    const { data, error } = await supabase.rpc("purchase_prompt", {
      user_uuid: userId,
      prompt_identifier: promptType,
      payment_amount: amount,
      currency_code: currency,
      stripe_session_id: stripeSessionId,
      metadata_json: metadata,
    });

    if (error) {
      console.error("Error purchasing prompt:", error);
      return null;
    }

    return data; // Returns the purchase ID
  } catch (error) {
    console.error("Error purchasing prompt:", error);
    return null;
  }
}
