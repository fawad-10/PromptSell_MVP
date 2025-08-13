"use client";
import { useRouter } from "next/navigation";
import CheckoutButton from "./CheckoutButton";
import { PROMPT_PRICES } from "../lib/ownership";

export default function PromptCard({
  prompt,
  isOwned = false,
  showOwnership = false,
}) {
  const router = useRouter();

  const handleCardClick = () => {
    // Only allow navigation if user owns the prompt or is admin
    if (!isOwned) {
      return; // Don't navigate if not owned
    }

    // Route to generate page with prompt data as URL parameters
    const params = new URLSearchParams({
      type: prompt.type || "seo_blog",
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      price: prompt.price,
      author: prompt.author_name || "Author",
    });

    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div
      className={`fiverr-card group transition-all duration-200 ${
        isOwned ? "cursor-pointer hover:shadow-lg" : "cursor-default opacity-90"
      }`}
      onClick={handleCardClick}
    >
      {/* Cover image placeholder */}
      <div className='relative h-48 bg-gradient-to-br from-[#f7f7f7] to-[#e4e5e7] overflow-hidden'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-16 h-16 fiverr-gradient rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-white'
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
        </div>
        {/* Fiverr-style overlay */}
        <div className='absolute top-3 left-3'>
          <span className='bg-[#1dbf73] text-white text-xs px-2 py-1 rounded-full font-medium'>
            Featured
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className='p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-6 h-6 rounded-full bg-[#1dbf73] flex items-center justify-center'>
            <span className='text-white text-xs font-bold'>
              {prompt.author_name ? prompt.author_name[0] : "A"}
            </span>
          </div>
          <span className='text-sm fiverr-text-light'>
            {prompt.author_name || "Author"}
          </span>
        </div>

        <h2 className='font-semibold text-lg fiverr-text mb-2 line-clamp-2 min-h-[4em] group-hover:text-[#1dbf73] transition-colors'>
          {prompt.title}
        </h2>

        <p className='text-sm fiverr-text-light mb-3 line-clamp-2 min-h-[5em]'>
          {prompt.description}
        </p>

        {showOwnership && isOwned && (
          <div className='mb-3 px-3 py-1 border-2 bg-green-100 text-green-800 text-sm font-medium rounded-full text-center'>
            {prompt.is_my_prompt
              ? "✓ My Prompt - Click to Generate"
              : "✓ Owned - Click to Generate"}
          </div>
        )}
        {showOwnership && !isOwned && (
          <div className='mb-3 px-3 py-1 border-[2px] border-[#E53935] bg-gradient-to-r from-red-50 to-orange-50 text-gray-800 text-sm font-semibold rounded-full text-center shadow-sm hover:shadow-md transition-all duration-200'>
            {prompt.is_my_prompt
              ? "🔒 My Prompt - Purchase Required"
              : "🔒 Purchase Required"}
          </div>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <div className='flex text-yellow-400'>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
            </div>
            <span className='text-sm fiverr-text-light'>(4.9)</span>
          </div>

          <div className='text-right'>
            <span className='text-sm fiverr-text-light'>
              {showOwnership && !isOwned ? "Buy for" : "Starting at"}
            </span>
            <div className='fiverr-price text-lg'>${prompt.price}</div>
          </div>
        </div>

        {showOwnership && !isOwned && (
          <div className='mt-2' onClick={(e) => e.stopPropagation()}>
            <CheckoutButton
              promptType={prompt.type}
              amount={
                prompt.price
                  ? Math.round(prompt.price * 100)
                  : PROMPT_PRICES[prompt.type]?.cents || 1999
              }
              title={prompt.title}
              description={prompt.description}
              className='w-full text-sm py-2 px-4'
            >
              Buy Template - ${prompt.price}
            </CheckoutButton>
          </div>
        )}
        {showOwnership && isOwned && (
          <div className='mt-3'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className='w-full text-sm py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors'
            >
              Generate Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
