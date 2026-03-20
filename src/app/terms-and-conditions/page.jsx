import { GalleryVerticalEnd, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Terms of Service — Byteon",
  description: "Byteon Terms of Service and Usage Agreement",
}

export default function TermsAndConditionsPage() {
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

          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-purple-300 text-sm">Last updated: March 2025</p>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-400/20 mb-10" />

        <div className="space-y-10 text-purple-100/90 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using Byteon in any way, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.
            </p>
            <p className="mt-3">
              These terms constitute a legally binding agreement between you and Byteon. We reserve the right to update or modify these terms at any time, and your continued use of the platform following any changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Eligibility</h2>
            <p>
              Byteon is intended solely for users who are <strong className="text-white">18 years of age or older</strong>. By registering, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-purple-100/80">
              <li>You are at least 18 years old.</li>
              <li>You have the legal capacity to enter into a binding agreement.</li>
              <li>Your use of the platform does not violate any applicable law or regulation in your jurisdiction.</li>
              <li>All registration information you submit is truthful and accurate.</li>
            </ul>
            <p className="mt-3">
              Byteon reserves the right to terminate any account found to belong to a user under the age of 18 without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Account Registration</h2>
            <p>
              To access certain features of Byteon, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-purple-100/80">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security and confidentiality of your login credentials.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
              <li>Take full responsibility for all activity that occurs under your account.</li>
            </ul>
            <p className="mt-3">
              Each email address may only be associated with one account. Creating duplicate or fraudulent accounts is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. User Conduct</h2>
            <p>You agree not to use Byteon to:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-purple-100/80">
              <li>Post, upload, or share content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Upload viruses, malware, or any other malicious code.</li>
              <li>Engage in spamming, phishing, or any form of unsolicited communication.</li>
              <li>Attempt to gain unauthorized access to other user accounts or any part of the platform's infrastructure.</li>
              <li>Use automated tools or bots to access or scrape the platform without prior written consent.</li>
              <li>Violate any applicable local, national, or international law or regulation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Content Ownership and License</h2>
            <p>
              You retain ownership of any content you submit or post to Byteon. By posting content, you grant Byteon a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content solely for the purpose of operating and improving the platform.
            </p>
            <p className="mt-3">
              You represent and warrant that you have all rights necessary to grant this license, and that your content does not infringe the intellectual property rights of any third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Organizations</h2>
            <p>
              Users registering as organizations represent that they are authorized to act on behalf of the organization they register under. Organizations are responsible for ensuring that all content posted under their account complies with these Terms of Service and all applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Account Suspension and Termination</h2>
            <p>
              Byteon reserves the right to suspend or permanently terminate your account at our sole discretion, with or without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, third parties, or the platform.
            </p>
            <p className="mt-3">
              Upon termination, your right to use the platform ceases immediately. Provisions of these terms that by their nature should survive termination shall survive, including but not limited to ownership provisions, disclaimers, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p>
              Byteon is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Byteon and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{" "}
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