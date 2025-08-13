"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-100 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='card bg-white shadow-2xl border border-red-200 p-8 rounded-2xl'>
          {/* Cancel Icon */}
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-10 h-10 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <h1 className='text-4xl font-bold text-red-700 mb-2'>
              Payment Cancelled
            </h1>
            <p className='text-lg text-gray-600'>
              No worries! You can try again anytime.
            </p>
          </div>

          {/* Information */}
          <div className='bg-red-50 rounded-lg p-6 mb-8'>
            <h2 className='text-xl font-semibold text-red-800 mb-4'>
              What happened?
            </h2>
            <div className='space-y-3 text-gray-700'>
              <p>• Your payment was cancelled and no charges were made</p>
              <p>• Your cart items are still available</p>
              <p>• You can continue browsing and try purchasing again</p>
            </div>
          </div>

          {/* Why Purchase? */}
          <div className='mb-8'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              🚀 PromptSell Template Benefits:
            </h3>
            <div className='grid md:grid-cols-2 gap-4'>
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
                  <p className='font-medium text-gray-800'>Expert Templates</p>
                  <p className='text-sm text-gray-600'>
                    Professional AI prompt templates
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
                  <p className='font-medium text-gray-800'>AI Generation</p>
                  <p className='text-sm text-gray-600'>
                    Generate content with your template
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
                  <p className='font-medium text-gray-800'>Instant Access</p>
                  <p className='text-sm text-gray-600'>
                    Get your template immediately
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
                  <p className='font-medium text-gray-800'>Lifetime Access</p>
                  <p className='text-sm text-gray-600'>
                    Keep your template forever
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Reminder */}
          <div className='bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mb-8'>
            <div className='text-center'>
              <h3 className='text-2xl font-bold text-gray-800 mb-2'>
                PromptSell Premium
              </h3>
              <div className='text-4xl font-bold text-green-600 mb-2'>
                $49.99
              </div>
              <p className='text-gray-600'>
                One-time payment • Lifetime access
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <button
              onClick={() => router.back()}
              className='flex-1 btn bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors'
            >
              Try Payment Again
            </button>
            <Link
              href='/browse'
              className='flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center transition-colors'
            >
              Continue Browsing
            </Link>
          </div>

          {/* Help Section */}
          <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
            <h4 className='font-semibold text-gray-800 mb-2'>Need Help?</h4>
                          <p className='text-sm text-gray-600 mb-3'>
                If you&apos;re experiencing issues with payment, we&apos;re here to help!
              </p>
            <div className='flex flex-col sm:flex-row gap-2 justify-center text-sm'>
              <a
                href='mailto:support@promptsell.com'
                className='text-green-600 hover:text-green-700 transition-colors'
              >
                📧 support@promptsell.com
              </a>
              <span className='hidden sm:inline text-gray-300'>|</span>
              <span className='text-gray-600'>💬 Live Chat Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
