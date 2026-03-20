import { GalleryVerticalEnd, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — Byteon",
  description: "Byteon Privacy Policy",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] text-purple-50">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-purple-300/70 hover:text-purple-200 transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="font-semibold text-lg">Byteon</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-purple-300 text-sm">Last updated: March 2025</p>
        </div>

        <div className="border-t border-purple-400/20 mb-10" />

        <div className="space-y-10 text-purple-100/90 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Byteon ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform. By using Byteon, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-purple-100/80">
              <li><strong className="text-white">Account information:</strong> Email address, password (stored as a secure hash), name, age, country, and occupation (for individual users), or organization name and description (for organizations).</li>
              <li><strong className="text-white">Profile media:</strong> Profile photos you choose to upload.</li>
              <li><strong className="text-white">Usage data:</strong> Information about how you interact with the platform, including pages visited, content viewed, and actions taken.</li>
              <li><strong className="text-white">Device and technical data:</strong> IP address, browser type, operating system, and other technical identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-purple-100/80">
              <li>Create and manage your account and provide access to the platform.</li>
              <li>Verify your identity and eligibility (including age verification).</li>
              <li>Communicate with you about your account, updates, or support requests.</li>
              <li>Improve and maintain the platform's features, security, and performance.</li>
              <li>Enforce our Terms of Service and respond to violations.</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, a trusted cloud infrastructure provider. We implement industry-standard measures including encryption at rest and in transit, access controls, and regular security reviews to protect your personal information.
            </p>
            <p className="mt-3">
              While we take all reasonable steps to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Profile Photos</h2>
            <p>
              Profile photos you upload are stored in secure cloud storage and are publicly accessible via your profile. Do not upload photos that contain sensitive personal information or images of others without their consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services. If you request account deletion, we will delete or anonymize your personal information within a reasonable timeframe, except where retention is required by law or for legitimate business purposes such as fraud prevention.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Third-Party Services</h2>
            <p>
              Byteon uses third-party services to operate the platform, including Supabase for authentication and data storage. These providers process data on our behalf and are contractually required to protect your information in accordance with applicable privacy laws.
            </p>
            <p className="mt-3">
              We do not share your personal data with advertisers or unrelated third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-purple-100/80">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict certain processing of your data.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@byteon.com" className="underline text-purple-300 hover:text-white transition-colors">
                support@byteon.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Children's Privacy</h2>
            <p>
              Byteon is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we discover that a user is under 18, their account will be terminated and their data removed promptly. If you believe a minor has registered on our platform, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date at the top of this page. Continued use of the platform after changes are posted constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how we handle your data, please reach out to us at{" "}
              <a href="mailto:support@byteon.com" className="underline text-purple-300 hover:text-white transition-colors">
                support@byteon.com
              </a>.
            </p>
          </section>
        </div>

        <div className="border-t border-purple-400/20 mt-12 pt-8 text-center text-purple-400 text-sm">
          © {new Date().getFullYear()} Byteon. All rights reserved.
        </div>
      </div>
    </div>
  )
}