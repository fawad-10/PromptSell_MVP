"use client";
import ClientOnly from "./ClientOnly";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutButton() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const { supabase } = await import("../lib/supabase");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      // Redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Only show logout button if user is authenticated
  if (!user) return null;

  return (
    <ClientOnly>
      <button
        onClick={handleLogout}
        className='btn btn-secondary text-sm px-4 py-2'
      >
        Logout
      </button>
    </ClientOnly>
  );
}
