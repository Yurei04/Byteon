"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GalleryVerticalEnd } from "lucide-react"

export function TermsDialog({ trigger }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-purple-950/95 border border-purple-500/30 text-purple-50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-900/50 p-0 gap-0 overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent rounded-t-2xl pointer-events-none" />

        {/* Fixed header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex size-6 items-center justify-center rounded-md bg-purple-600 shadow-sm">
              <GalleryVerticalEnd className="size-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-400/70 tracking-wide">Byteon</span>
          </div>
          <DialogTitle className="text-lg font-semibold text-white text-left">Terms of Service</DialogTitle>
          <p className="text-xs text-purple-400/60 text-left mt-0.5">Last updated: March 2025</p>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-7 text-purple-100/85 leading-relaxed text-sm">

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>By creating an account or using Byteon in any way, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.</p>
              <p className="mt-2">These terms constitute a legally binding agreement between you and Byteon. We reserve the right to update or modify these terms at any time, and your continued use of the platform following any changes constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">2. Eligibility</h2>
              <p>Byteon is intended solely for users who are <strong className="text-white">18 years of age or older</strong>. By registering, you represent and warrant that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>You are at least 18 years old.</li>
                <li>You have the legal capacity to enter into a binding agreement.</li>
                <li>Your use of the platform does not violate any applicable law or regulation in your jurisdiction.</li>
                <li>All registration information you submit is truthful and accurate.</li>
              </ul>
              <p className="mt-2">Byteon reserves the right to terminate any account found to belong to a user under the age of 18 without prior notice.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">3. Account Registration</h2>
              <p>To access certain features of Byteon, you must register for an account. You agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security and confidentiality of your login credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>Take full responsibility for all activity that occurs under your account.</li>
              </ul>
              <p className="mt-2">Each email address may only be associated with one account. Creating duplicate or fraudulent accounts is prohibited.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">4. User Conduct</h2>
              <p>You agree not to use Byteon to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Post, upload, or share content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
                <li>Upload viruses, malware, or any other malicious code.</li>
                <li>Engage in spamming, phishing, or any form of unsolicited communication.</li>
                <li>Attempt to gain unauthorized access to other user accounts or any part of the platform&apos;s infrastructure.</li>
                <li>Use automated tools or bots to access or scrape the platform without prior written consent.</li>
                <li>Violate any applicable local, national, or international law or regulation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">5. Content Ownership and License</h2>
              <p>You retain ownership of any content you submit or post to Byteon. By posting content, you grant Byteon a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content solely for the purpose of operating and improving the platform.</p>
              <p className="mt-2">You represent and warrant that you have all rights necessary to grant this license, and that your content does not infringe the intellectual property rights of any third party.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">6. Organizations</h2>
              <p>Users registering as organizations represent that they are authorized to act on behalf of the organization they register under. Organizations are responsible for ensuring that all content posted under their account complies with these Terms of Service and all applicable laws.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">7. Account Suspension and Termination</h2>
              <p>Byteon reserves the right to suspend or permanently terminate your account at our sole discretion, with or without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, third parties, or the platform.</p>
              <p className="mt-2">Upon termination, your right to use the platform ceases immediately. Provisions of these terms that by their nature should survive termination shall survive, including but not limited to ownership provisions, disclaimers, and limitations of liability.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">8. Disclaimer of Warranties</h2>
              <p>Byteon is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Byteon and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform, even if we have been advised of the possibility of such damages.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@byteon.com" className="underline underline-offset-2 text-purple-300 hover:text-white transition-colors">
                  support@byteon.com
                </a>.
              </p>
            </section>

            <div className="border-t border-purple-400/20 pt-5 text-center text-purple-400/50 text-xs">
              © {new Date().getFullYear()} Byteon. All rights reserved.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}