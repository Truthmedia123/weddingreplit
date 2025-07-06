export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-8">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none space-y-6">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Last updated: January 6, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                TheGoanWedding.com operates as a public directory of wedding vendors in Goa. We collect information in the following ways:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Publicly available information about wedding vendors found on the internet</li>
                <li>Information submitted by vendors who wish to list their services</li>
                <li>Contact information when users submit inquiries through our contact forms</li>
                <li>Technical information such as IP addresses, browser type, and device information for website functionality</li>
                <li>Cookie data for website optimization and advertising purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">2. How We Use Information</h2>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>To maintain and update our public vendor directory</li>
                <li>To respond to user inquiries and customer service requests</li>
                <li>To improve our website functionality and user experience</li>
                <li>To display relevant advertisements through Google AdSense</li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">3. Public Directory Nature</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                TheGoanWedding.com is a public directory service. The vendor information displayed on our website is:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Collected from publicly available sources on the internet</li>
                <li>Intended to help couples find wedding services in Goa</li>
                <li>Subject to updates and corrections upon vendor request</li>
                <li>Removed upon legitimate vendor request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">4. Information Sharing</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We do not sell personal information. We may share information in these situations:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>With Google AdSense for advertising personalization (see Google's Privacy Policy)</li>
                <li>With service providers who help us operate the website</li>
                <li>When required by law or to protect our legal rights</li>
                <li>With vendor consent when facilitating connections with potential clients</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">5. Google AdSense</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our website uses Google AdSense to display advertisements. Google may use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Show ads based on your interests and previous visits to our website</li>
                <li>Measure ad performance and effectiveness</li>
                <li>Prevent fraud and improve security</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-red-500 hover:underline">Google's Ad Settings</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                As a vendor or user, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Request removal of your business information from our directory</li>
                <li>Correct inaccurate information about your business</li>
                <li>Request details about what information we have collected</li>
                <li>Opt out of non-essential cookies and tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">7. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We implement appropriate security measures to protect information collected through our website. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">8. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300">
                For privacy-related questions, data removal requests, or corrections, please contact us at:
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Email: <a href="mailto:info@thegoanwedding.com" className="text-red-500 hover:underline">info@thegoanwedding.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}