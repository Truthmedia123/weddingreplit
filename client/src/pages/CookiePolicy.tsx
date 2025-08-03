export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Cookie Policy</h1>
          
          <div className="prose max-w-none space-y-6">
            <p className="text-gray-600 text-lg">
              Last updated: January 6, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">What Are Cookies</h2>
              <p className="text-gray-600">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Essential Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are necessary for the website to function properly and cannot be switched off.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Session management</li>
                    <li>Security and authentication</li>
                    <li>Load balancing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Functional Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies enhance functionality and personalization.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Language preferences</li>
                    <li>Search preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Analytics Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Google Analytics for website traffic analysis</li>
                    <li>Page view tracking</li>
                    <li>User behavior analysis</li>
                    <li>Performance monitoring</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Advertising Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are used to deliver relevant advertisements and measure their effectiveness.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Google AdSense for displaying targeted ads</li>
                    <li>Ad personalization based on interests</li>
                    <li>Frequency capping to avoid showing the same ad too often</li>
                    <li>Conversion tracking for advertisers</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600 mb-4">
                Our website uses third-party services that may set their own cookies:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Google AdSense</h3>
                  <p className="text-gray-600">
                    Google uses cookies to serve ads based on your interests and previous visits. 
                    Learn more at <a href="https://policies.google.com/technologies/ads" className="text-red-500 hover:underline">Google's Ad Policy</a>.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Google Analytics</h3>
                  <p className="text-gray-600">
                    We use Google Analytics to understand website traffic and user behavior. 
                    Learn more at <a href="https://policies.google.com/privacy" className="text-red-500 hover:underline">Google's Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Managing Your Cookie Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Browser Settings</h3>
                  <p className="text-gray-600 mb-2">
                    You can control cookies through your browser settings:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set preferences for specific websites</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Opt-Out Options</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>
                      <strong>Google Ads:</strong> Visit <a href="https://www.google.com/settings/ads" className="text-red-500 hover:underline">Google Ad Settings</a> to opt out of personalized advertising
                    </li>
                    <li>
                      <strong>Google Analytics:</strong> Install the <a href="https://tools.google.com/dlpage/gaoptout" className="text-red-500 hover:underline">Google Analytics Opt-out Browser Add-on</a>
                    </li>
                    <li>
                      <strong>Network Advertising Initiative:</strong> Visit <a href="http://www.networkadvertising.org/choices/" className="text-red-500 hover:underline">NAI Opt-out</a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cookie Retention</h2>
              <p className="text-gray-600 mb-4">
                Different cookies have different lifespan:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain for a set period (typically 1-24 months)</li>
                <li><strong>Third-party cookies:</strong> Controlled by external services and their retention policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Impact of Disabling Cookies</h2>
              <p className="text-gray-600 mb-4">
                Disabling cookies may affect your experience on our website:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Some features may not work properly</li>
                <li>Your preferences won't be saved</li>
                <li>You may see less relevant advertisements</li>
                <li>Website performance tracking will be limited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. 
                We encourage you to review this page periodically for the latest information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about our use of cookies or this Cookie Policy, please contact us at:
              </p>
              <p className="text-gray-600 mt-2">
                Email: <a href="mailto:info@thegoanwedding.com" className="text-red-500 hover:underline">info@thegoanwedding.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}