import { createClient } from "@supabase/supabase-js";

/**
 * Check if a user has admin access
 * @param {string} userId - The user's ID
 * @returns {Promise<{isAdmin: boolean, isSeller: boolean}>}
 */
export async function checkAdminAccess(userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking admin access:", error);
      return { isAdmin: false, isSeller: false };
    }

    const isAdmin = profile?.role === "admin";
    const isSeller = profile?.role === "seller";

    return {
      isAdmin,
      isSeller,
      hasAccess: isAdmin || isSeller,
    };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return {
      isAdmin: false,
      isSeller: false,
      hasAccess: false,
    };
  }
}

/**
 * Client-side hook to check current user's admin status
 * @returns {Promise<{isAdmin: boolean, isSeller: boolean}>}
 */
export async function checkCurrentUserAdmin() {
  const { supabase } = await import("./supabase");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAdmin: false,
        isSeller: false,
        hasAccess: false,
      };
    }

    return await checkAdminAccess(user.id);
  } catch (error) {
    console.error("Error checking current user admin status:", error);
    return {
      isAdmin: false,
      isSeller: false,
      hasAccess: false,
    };
  }
}

/**
 * Check if user has seller access
 * @param {string} userId - The user's ID
 * @returns {Promise<{isSeller: boolean, isAdmin: boolean}>}
 */
export async function checkSellerAccess(userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking seller access:", error);
      return { isSeller: false, isAdmin: false };
    }

    const isSeller = profile?.role === "seller";
    const isAdmin = profile?.role === "admin";

    return {
      isSeller,
      isAdmin,
      hasAccess: isSeller || isAdmin,
    };
  } catch (error) {
    console.error("Error checking seller access:", error);
    return {
      isSeller: false,
      isAdmin: false,
      hasAccess: false,
    };
  }
}

/**
 * Client-side hook to check current user's seller status
 * @returns {Promise<{isSeller: boolean, isAdmin: boolean}>}
 */
export async function checkCurrentUserSeller() {
  const { supabase } = await import("./supabase");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        isSeller: false,
        isAdmin: false,
        hasAccess: false,
      };
    }

    return await checkSellerAccess(user.id);
  } catch (error) {
    console.error("Error checking current user seller status:", error);
    return {
      isSeller: false,
      isAdmin: false,
      hasAccess: false,
    };
  }
}
