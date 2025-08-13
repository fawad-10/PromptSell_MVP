export default function TermsPage() {
  return (
    <div className='min-h-screen bg-[#f7f7f7] py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl text-green-500  font-bold mb-4'>
            Terms of Service
          </h1>
          <p className='text-lg text-gray-600'>
            Please read these terms carefully before using PromptSell
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-8 space-y-8'>
          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              1. Agreement to Terms
            </h2>
            <p className='text-gray-600'>
              By accessing or using PromptSell, you agree to be bound by these
              Terms of Service. If you disagree with any part of the terms, you
              may not access the service.
            </p>
          </section>

          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              2. User Accounts
            </h2>
            <p className='text-gray-600 mb-4'>
              When you create an account with us, you must provide accurate and
              complete information. You are responsible for maintaining the
              security of your account and password.
            </p>
            <ul className='list-disc list-inside text-gray-600 space-y-2 ml-4'>
              <li>You must be at least 18 years old to use this service</li>
              <li>You are responsible for all activities under your account</li>
              <li>
                You must notify us of any security breach or unauthorized use
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              3. Intellectual Property
            </h2>
            <p className='text-gray-600 mb-4'>
              The prompts and content you purchase are licensed for your
              personal use. You may not redistribute, resell, or share purchased
              prompts without explicit permission.
            </p>
            <p className='text-gray-600'>
              When selling prompts, you warrant that you have the necessary
              rights to the content you&apos;re selling and that it doesn&apos;t infringe
              on any third-party rights.
            </p>
          </section>

          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              4. Payments and Refunds
            </h2>
            <p className='text-gray-600 mb-4'>
              All payments are processed securely through our payment providers.
              Prices for prompts are listed in USD and include applicable taxes.
            </p>
            <p className='text-gray-600'>
              Due to the digital nature of our products, refunds are generally
              not provided unless the prompt is demonstrably defective or not as
              described.
            </p>
          </section>

          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              5. Prohibited Uses
            </h2>
            <p className='text-gray-600 mb-4'>
              You agree not to use PromptSell for any unlawful purposes or to
              conduct any unlawful activity, including, but not limited to:
            </p>
            <ul className='list-disc list-inside text-gray-600 space-y-2 ml-4'>
              <li>Fraud or misleading practices</li>
              <li>Harassment or abuse of other users</li>
              <li>Distribution of malware or harmful content</li>
              <li>Violation of intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              6. Limitation of Liability
            </h2>
            <p className='text-gray-600'>
              PromptSell is provided &quot;as is&quot; without any warranties. We are not
              responsible for any damages or losses resulting from your use of
              the service. We reserve the right to modify or terminate the
              service at any time.
            </p>
          </section>

          <section>
            <h2 className='text-green-500 text-2xl font-semibold mb-4'>
              7. Contact Us
            </h2>
            <p className='text-gray-600'>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href='mailto:support@promptsell.com'
                className='text-[#E53935] hover:text-red-700'
              >
                support@promptsell.com
              </a>
            </p>
          </section>

          <div className='text-sm text-gray-500 pt-8 border-t'>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
