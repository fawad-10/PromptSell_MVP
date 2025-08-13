"use client";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to signin...");
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f7f7f7] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dbf73] mx-auto'></div>
          <p className='mt-4 fiverr-text-light'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-[#f7f7f7] flex items-center justify-center'>
        <div className='text-center'>
          <p className='fiverr-text-light'>Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return children;
}
