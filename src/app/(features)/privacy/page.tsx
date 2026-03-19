import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Ujjwal Bhavishya',
  description:
    'Privacy Policy for Ujjwal Bhavishya — Learn how we collect, use, and protect your personal information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: March 19, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to Ujjwal Bhavishya (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website{' '}
              <a href="https://www.ujjawalbhavishya.online" className="text-green-700 underline">
                www.ujjawalbhavishya.online
              </a>{' '}
              and use our platform services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address, password, profile picture, and other details
                you provide during registration.
              </li>
              <li>
                <strong>Profile Data:</strong> Educational background, skills, career interests, resume content, and
                professional information you add to your profile.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our platform, including AI
                interview sessions, career guidance conversations, course progress, and assessment results.
              </li>
              <li>
                <strong>Communication Data:</strong> Messages sent through mentor sessions, support requests, and
                feedback you provide.
              </li>
              <li>
                <strong>Device &amp; Log Data:</strong> IP address, browser type, operating system, referring URLs, and
                access timestamps collected automatically.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our AI-powered career readiness services.</li>
              <li>To personalize your experience, including AI mock interviews, career guidance, and job recommendations.</li>
              <li>To generate certifications and verified credentials based on your course completions and assessments.</li>
              <li>To facilitate mentor-student connections and session scheduling.</li>
              <li>To send transactional emails such as password resets, session confirmations, and account notifications.</li>
              <li>To analyze platform usage and improve our services.</li>
              <li>To comply with legal obligations and enforce our terms of service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Sharing &amp; Third-Party Services</h2>
            <p className="mb-3">We may share your information with the following third-party service providers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Anthropic (Claude AI):</strong> Interview and career guidance conversation data is processed by
                Claude AI to provide intelligent responses. We do not share personally identifiable information beyond
                what is necessary for the AI interaction.
              </li>
              <li>
                <strong>Cloudinary:</strong> Profile images and uploaded media are stored securely via Cloudinary.
              </li>
              <li>
                <strong>Resend:</strong> Email delivery service used for transactional emails.
              </li>
              <li>
                <strong>Google Cloud:</strong> Our backend infrastructure is hosted on Google Cloud Run.
              </li>
              <li>
                <strong>Turso:</strong> Database hosting for application data.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal
              information. This includes encrypted data transmission (HTTPS/TLS), secure JWT-based authentication,
              hashed passwords, and access controls on our infrastructure. However, no method of electronic transmission
              or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Cookies &amp; Local Storage</h2>
            <p>
              We use cookies and local storage to maintain your authentication session and remember your preferences.
              These are essential for the platform to function and are not used for advertising or tracking purposes.
              You can control cookie settings through your browser, but disabling them may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete data.
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and associated data.
              </li>
              <li>
                <strong>Data Portability:</strong> Request your data in a structured, machine-readable format.
              </li>
              <li>
                <strong>Withdrawal of Consent:</strong> Withdraw consent for data processing at any time.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:hello@ujjawalbhavishya.online" className="text-green-700 underline">
                hello@ujjawalbhavishya.online
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you with
              our services. If you request account deletion, we will delete your data within 30 days, except where we
              are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our platform is intended for users aged 16 and above. We do not knowingly collect personal information
              from children under 16. If we become aware that we have collected data from a child under 16, we will take
              steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
              the updated policy on this page with a revised &quot;Last updated&quot; date. Your continued use of the platform
              after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us
              at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Ujjwal Bhavishya</p>
              <p>
                Email:{' '}
                <a href="mailto:hello@ujjawalbhavishya.online" className="text-green-700 underline">
                  hello@ujjawalbhavishya.online
                </a>
              </p>
              <p>New Delhi, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
