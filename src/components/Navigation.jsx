"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { checkCurrentUserOwnership } from "../lib/ownership";
import { supabase } from "../lib/supabase";

const LogoutButton = dynamic(() => import("./LogoutButton"), {
  ssr: false,
});

export default function Navigation() {
  const { user, loading } = useAuth();
  const [ownership, setOwnership] = useState({
    ownedPrompts: [],
    isAdmin: false,
  });
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      checkCurrentUserOwnership().then(setOwnership);
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

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
  }, [user]);

  const isSeller = userProfile?.role === "seller";

  return (
    <nav className='fiverr-nav sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Left side - Logo */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-3'>
              <div className='w-8 h-8 fiverr-gradient rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>P</span>
              </div>
              <span className='text-2xl font-bold fiverr-text'>PromptSell</span>
            </Link>
          </div>

          {/* Center - Search Bar (Fiverr-style) */}
          <div className='hidden md:flex flex-1 max-w-2xl mx-8'>
            <div className='relative w-full'>
              <input
                type='text'
                placeholder='Find prompts...'
                className='w-full px-4 py-2 pl-10 fiverr-search text-sm'
              />
              <svg
                className='absolute left-3 top-2.5 h-4 w-4 text-[#74767e]'
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

          {/* Right side - Navigation Links & Auth */}
          <div className='flex items-center space-x-6'>
            <div className='hidden md:flex items-center space-x-6'>
              <Link
                href='/browse'
                className='fiverr-text hover:text-[#1dbf73] transition-colors font-medium text-sm'
              >
                Browse
              </Link>
              {user && (
                <>
                  {/* <Link
                    href='/generate'
                    className='fiverr-text hover:text-[#1dbf73] transition-colors font-medium text-sm'
                  >
                    Generate
                  </Link> */}
                  <Link
                    href='/sell'
                    className='fiverr-text hover:text-[#1dbf73] transition-colors font-medium text-sm'
                  >
                    {isSeller ? "Seller Dashboard" : "Become a Seller"}
                  </Link>
                  {ownership.isAdmin && (
                    <div className='px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full'>
                      👑 Admin
                    </div>
                  )}
                  {isSeller && (
                    <div className='px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full'>
                      🛒 Seller
                    </div>
                  )}
                  {!ownership.isAdmin &&
                    !isSeller &&
                    ownership.ownedPrompts.length > 0 && (
                      <div className='px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-semibold rounded-full'>
                        📝 {ownership.ownedPrompts.length} Template
                        {ownership.ownedPrompts.length > 1 ? "s" : ""}
                      </div>
                    )}
                </>
              )}
            </div>

            {!loading && (
              <div className='flex items-center space-x-4'>
                {user ? (
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 rounded-full bg-[#1dbf73] flex items-center justify-center'>
                      <span className='text-white text-sm font-bold'>
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <LogoutButton />
                  </div>
                ) : (
                  <Link
                    href='/signin'
                    className='btn btn-primary text-sm px-4 py-2'
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
