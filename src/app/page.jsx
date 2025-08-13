import Link from "next/link";

export default function Home() {
  return (
    <div className='min-h-screen bg-[#f7f7f7]'>
      {/* Hero Section */}
      <div className='bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='text-center'>
            <h1 className='text-5xl md:text-6xl font-bold fiverr-text mb-6'>
              Find the perfect
              <span className='text-[#1dbf73]'> AI prompt</span>
            </h1>
            <p className='text-xl fiverr-text-light mb-8 max-w-2xl mx-auto'>
              Buy and sell the best AI prompts. Get high-quality, tested prompts
              from experts or monetize your own creations.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/browse'
                className='btn border-2 border-green-500 hover:border-green-600  btn-primary text-lg px-8 py-2'
              >
                Find Prompts
              </Link>
              <Link
                href='/sell'
                className='btn border-2 text-green-500 border-green-500 hover:border-green-500  hover:bg-green-500  hover:text-slate-100 hover:bg-opacity-80  btn-secondary text-lg px-8 py-2                '
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold fiverr-text mb-4'>
            Why choose PromptSell?
          </h2>
          <p className='text-lg fiverr-text-light'>
            Join thousands of users buying and selling AI prompts
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          <div className='card p-8 text-center'>
            <div className='w-16 h-16 fiverr-gradient rounded-full flex items-center justify-center mx-auto mb-6'>
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
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold fiverr-text mb-3'>
              Instant Access
            </h3>
            <p className='fiverr-text-light'>
              Get professional AI prompts instantly. No waiting, no delays.
            </p>
          </div>

          <div className='card p-8 text-center'>
            <div className='w-16 h-16 fiverr-gradient rounded-full flex items-center justify-center mx-auto mb-6'>
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
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold fiverr-text mb-3'>
              Earn Money
            </h3>
            <p className='fiverr-text-light'>
              Sell your best prompts and earn from your expertise.
            </p>
          </div>

          <div className='card p-8 text-center'>
            <div className='w-16 h-16 fiverr-gradient rounded-full flex items-center justify-center mx-auto mb-6'>
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
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold fiverr-text mb-3'>
              Secure Platform
            </h3>
            <p className='fiverr-text-light'>
              Safe transactions and protected intellectual property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
