import Image from "next/image";

export default function BlogPage() {
  return (
    <div className='min-h-screen bg-[#f7f7f7] py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl text-green-500  font-bold mb-4'>
            PromptSell Blog
          </h1>
          <p className='text-lg text-gray-600'>
            Latest news, tips and updates from the AI prompt marketplace
          </p>
        </div>

        <div className='grid gap-8'>
          {/* Featured Blog Post */}
          <article className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='relative w-full h-64 sm:h-80 md:h-96'>
              <image
                src='/1728260000.png'
                alt='Featured blog post'
                fill
                style={{ objectFit: "cover" }}
                priority
                sizes='(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px'
              />
            </div>
            <div className='p-6'>
              <div className='flex items-center text-sm text-gray-500 mb-2'>
                <span>June 15, 2023</span>
                <span className='mx-2'>•</span>
                <span>5 min read</span>
              </div>
              <h2 className='text-2xl text-green-500  font-bold mb-3 hover:text-green-500  transition-colors'>
                <a href='/blog/getting-started-with-ai-prompts'>
                  Getting Started with AI Prompts: A Complete Guide
                </a>
              </h2>
              <p className='text-gray-600 mb-4'>
                Learn how to create effective AI prompts that generate amazing
                results. This comprehensive guide covers everything from basic
                principles to advanced techniques.
              </p>
              <a
                href='/blog/getting-started-with-ai-prompts'
                className='text-[#E53935] hover:text-red-700 font-medium inline-flex items-center transition-colors'
              >
                Read More
                <svg
                  className='w-4 h-4 ml-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14 5l7 7m0 0l-7 7m7-7H3'
                  />
                </svg>
              </a>
            </div>
          </article>

          {/* Recent Posts Grid */}
          <div className='grid md:grid-cols-2 gap-8'>
            <article className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center text-sm text-gray-500 mb-2'>
                <span>June 10, 2023</span>
                <span className='mx-2'>•</span>
                <span>3 min read</span>
              </div>
              <h2 className='text-xl font-bold mb-3 hover:text-green-500  transition-colors'>
                <a href='/blog/top-10-ai-prompts'>
                  Top 10 Most Popular AI Prompts This Month
                </a>
              </h2>
              <p className='text-gray-600 mb-4'>
                Discover the most successful and widely-used AI prompts that are
                trending in our marketplace this month.
              </p>
              <a
                href='/blog/top-10-ai-prompts'
                className='text-[#E53935] hover:text-red-700 font-medium inline-flex items-center transition-colors'
              >
                Read More
                <svg
                  className='w-4 h-4 ml-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14 5l7 7m0 0l-7 7m7-7H3'
                  />
                </svg>
              </a>
            </article>

            <article className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center text-sm text-gray-500 mb-2'>
                <span>June 5, 2023</span>
                <span className='mx-2'>•</span>
                <span>4 min read</span>
              </div>
              <h2 className='text-xl font-bold mb-3 hover:text-green-500  transition-colors'>
                <a href='/blog/selling-prompts-guide'>
                  How to Make Money Selling AI Prompts
                </a>
              </h2>
              <p className='text-gray-600 mb-4'>
                A comprehensive guide on how to create, price, and market your
                AI prompts effectively on PromptSell.
              </p>
              <a
                href='/blog/selling-prompts-guide'
                className='text-[#E53935] hover:text-red-700 font-medium inline-flex items-center transition-colors'
              >
                Read More
                <svg
                  className='w-4 h-4 ml-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14 5l7 7m0 0l-7 7m7-7H3'
                  />
                </svg>
              </a>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
