export default function HelpPage() {
  return (
    <div className='min-h-screen bg-[#f7f7f7] py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl text-green-500 font-bold mb-4'>
            Help Center
          </h1>
          <p className='text-lg text-gray-600'>
            Find answers to common questions about using PromptSell
          </p>
        </div>

        <div className='space-y-8'>
          {/* Getting Started */}
          <section className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-2xl text-green-500  font-semibold mb-4'>
              Getting Started
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-medium mb-2'>
                  What is PromptSell?
                </h3>
                <p className='text-gray-600'>
                  PromptSell is a marketplace where you can buy and sell AI
                  prompts. Whether you're looking to purchase high-quality,
                  tested prompts or monetize your own creations, our platform
                  makes it easy to participate in the AI prompt economy.
                </p>
              </div>
              <div>
                <h3 className='text-lg font-medium mb-2'>
                  How do I get started?
                </h3>
                <ol className='list-decimal list-inside text-gray-600 space-y-2'>
                  <li>Create an account using your email</li>
                  <li>Browse available prompts in our marketplace</li>
                  <li>Purchase prompts you're interested in</li>
                  <li>
                    Start selling your own prompts by visiting the Sell page
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Buying Prompts */}
          <section className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-2xl text-green-500  font-semibold mb-4'>
              Buying Prompts
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-medium mb-2'>
                  How to purchase prompts
                </h3>
                <p className='text-gray-600'>
                  Browse our marketplace and select the prompt you want to
                  purchase. Click on the prompt to view details, then click the
                  "Buy Now" button. Follow the checkout process to complete your
                  purchase.
                </p>
              </div>
              <div>
                <h3 className='text-lg font-medium mb-2'>
                  Accessing purchased prompts
                </h3>
                <p className='text-gray-600'>
                  After purchase, you'll have immediate access to your prompts.
                  You can find all your purchased prompts in your account
                  dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Selling Prompts */}
          <section className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-2xl text-green-500  font-semibold mb-4'>
              Selling Prompts
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-medium mb-2'>
                  How to sell prompts
                </h3>
                <p className='text-gray-600'>
                  Visit the Sell page to list your prompts. You'll need to
                  provide a title, description, category, and price for your
                  prompt. Make sure to follow our guidelines for quality and
                  content.
                </p>
              </div>
              <div>
                <h3 className='text-lg font-medium mb-2'>Seller guidelines</h3>
                <ul className='list-disc list-inside text-gray-600 space-y-2'>
                  <li>Ensure your prompts are original and high-quality</li>
                  <li>Set fair and competitive prices</li>
                  <li>Provide clear descriptions and examples</li>
                  <li>Respond to buyer questions promptly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-2xl text-green-500  font-semibold mb-4'>
              Need More Help?
            </h2>
            <p className='text-gray-600 mb-4'>
              If you couldn't find the answer you're looking for, our support
              team is here to help.
            </p>
            <a
              href='mailto:support@promptsell.com'
              className='inline-flex items-center text-[#E53935] hover:text-red-700 transition-colors'
            >
              <span>Contact Support</span>
              <svg
                className='w-5 h-5 ml-2'
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
          </section>
        </div>
      </div>
    </div>
  );
}
