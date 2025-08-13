"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  // Role selection for sign up: buyer -> user, seller -> seller
  const [selectedRole, setSelectedRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    // Clear sign-up specific fields when switching to sign-in
    if (isSignUp) {
      setUsername("");
      setDisplayName("");
      setBio("");
      setSelectedRole("buyer");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Validate required fields for sign up
        if (!username || !displayName) {
          throw new Error("Username and display name are required");
        }

        // Check if username already exists
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .single();

        if (existingUser) {
          throw new Error(
            "Username already exists. Please choose a different username."
          );
        }
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Create profile for new user
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: username,
              display_name: displayName,
              bio: bio || null,
              avatar_url: null, // Can be updated later
              // Map UI role to DB role (buyer -> user, seller -> seller)
              role: selectedRole === "seller" ? "seller" : "user",
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            throw new Error(
              "Failed to create user profile: " + profileError.message
            );
          }

          alert(
            "Account created successfully! Please check your email to confirm your account."
          );
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }

      // Redirect to browse page after successful authentication
      router.push("/browse");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#f7f7f7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-lg w-full space-y-8'>
        <div>
          <div className='flex justify-center'>
            <div className='w-12 h-12 fiverr-gradient rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>P</span>
            </div>
          </div>
          <h2 className='mt-6 text-center text-3xl font-bold fiverr-text'>
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h2>
          <p className='mt-2 text-center text-sm fiverr-text-light'>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={toggleMode}
              className='font-medium text-[#1dbf73] hover:text-[#19a463]'
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium fiverr-text'
              >
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mt-1 block w-full px-3 py-2 fiverr-search text-sm'
                placeholder='Enter your email'
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label
                    htmlFor='username'
                    className='block text-sm font-medium fiverr-text'
                  >
                    Username
                  </label>
                  <input
                    id='username'
                    name='username'
                    type='text'
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 fiverr-search text-sm'
                    placeholder='Enter your username'
                    minLength={3}
                    maxLength={20}
                  />
                  <p className='mt-1 text-xs fiverr-text-light'>
                    3-20 characters, unique username
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='displayName'
                    className='block text-sm font-medium fiverr-text'
                  >
                    Display Name
                  </label>
                  <input
                    id='displayName'
                    name='displayName'
                    type='text'
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 fiverr-search text-sm'
                    placeholder='Enter your display name'
                    maxLength={50}
                  />
                  <p className='mt-1 text-xs fiverr-text-light'>
                    Your public display name
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='bio'
                    className='block text-sm font-medium fiverr-text'
                  >
                    Bio (Optional)
                  </label>
                  <textarea
                    id='bio'
                    name='bio'
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 fiverr-search text-sm'
                    placeholder='Tell us about yourself...'
                    maxLength={500}
                  />
                  <p className='mt-1 text-xs fiverr-text-light'>
                    Optional bio (max 500 characters)
                  </p>
                </div>

                {/* Role selector */}
                <div>
                  <label className='block text-sm font-medium fiverr-text'>
                    Account Type
                  </label>
                  <div className='mt-2 grid grid-cols-2 gap-3'>
                    <button
                      type='button'
                      onClick={() => setSelectedRole("buyer")}
                      className={`border rounded-md p-3 text-sm ${
                        selectedRole === "buyer"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      Buyer
                      <span className='block text-xs text-gray-500'>
                        Buy prompts and generate content
                      </span>
                    </button>
                    <button
                      type='button'
                      onClick={() => setSelectedRole("seller")}
                      className={`border rounded-md p-3 text-sm ${
                        selectedRole === "seller"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      Seller
                      <span className='block text-xs text-gray-500'>
                        List prompts and earn money
                      </span>
                    </button>
                  </div>
                  <p className='mt-1 text-xs text-red-600 font-medium'>
                    ⚠️ Important: This cannot be changed after signup
                  </p>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium fiverr-text'
              >
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='mt-1 block w-full px-3 py-2 fiverr-search text-sm'
                placeholder='Enter your password'
                minLength={6}
              />
              {isSignUp && (
                <p className='mt-1 text-xs fiverr-text-light'>
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-md p-4'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1dbf73] hover:bg-[#19a463] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1dbf73] disabled:opacity-50 transition-colors'
            >
              {loading ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              ) : (
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
              )}
            </button>
          </div>

          <div className='text-center'>
            <Link
              href='/'
              className='font-medium text-[#1dbf73] hover:text-[#19a463] text-sm'
            >
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
