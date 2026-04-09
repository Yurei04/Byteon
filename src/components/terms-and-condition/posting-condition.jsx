"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GalleryVerticalEnd } from "lucide-react"

export function PostingTermsDialog({ trigger }) {
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
          <p className="text-xs text-purple-400/60 text-left mt-0.5">Last updated: April 2026</p>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-7 text-purple-100/85 leading-relaxed text-sm">

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>By accessing, registering for, or using Byteon (“Platform,” “we,” “us,” or “our”), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (“Terms”).</p>
              <p className="mt-2">If you do not agree to these Terms, you must not access or use the Platform. We reserve the right to modify or update these Terms at any time. Changes will become effective upon posting. Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>
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
              <p className="mt-2">By using the Byteon, you represent and warrant that all registration information you provide is accurate and truthful. We reserve the right to suspend or terminate accounts that violate these requirements.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">3. Account Registration and Security</h2>
              <p>To access certain features of Byteon, you must register for an account. You agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security and confidentiality of your login credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>Take full responsibility for all activity that occurs under your account.</li>
              </ul>
              <p className="mt-2">You may not:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Create multiple accounts for fraudulent purpose, each email address may only be associate with one account</li>
                <li>Share or transfer your account without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">4. User Conduct</h2>
              <p>You agree to use Byteon responsibly and lawfully. You must not:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Post or distribute unlawful, harmful, abusive, or defamatory content</li>
                <li>Harass, threaten, or exploit other users</li>
                <li>Impersonate individuals or entities</li>
                <li>Upload malicious code (e.g., viruses, malware)</li>
                <li>Engage in spam, phishing, or fraudulent activities</li>
                <li>Attempt unauthorized access to systems or accounts</li>
                <li>Use bots, scraping tools, or automation without permission</li>
              <p className="mt-2">Violation of these rules may result in immediate suspension or termination.</p>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">5. Content Ownership and License</h2>
              <p>You retain ownership of the content you submit (“User Content”).</p>
              <p className="mt-2">By posting content, you grant Byteon a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Non-exclusive</li>
                <li>Worldwide</li>
                <li>Royalty-free</li>
              </ul>
              <p className="mt-2">license to use, reproduce, display, and distribute your content for platform operation, promotion, and improvement purposes.</p>
              <p className="mt-2">You represent that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>You own or have rights to the content</li>
                <li>Your content does not violate any intellectual property or legal rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">6. Organizations</h2>
              <p>If you register on behalf of an organization, you represent that you are authorized to act on its behalf.</p>
              <p>Organizations are responsible for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>All activity under their account</li>
                <li>Ensuring compliance with these Terms and applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">7. Privacy</h2>
              <p>Your use of Byteon is also governed by our Privacy Policy, which explains how we collect, use, and protect your data.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">8. Disclaimer of Warranties</h2>
              <p>Byteon is provided on an &quot;as is&quot; and &quot;as available&quot; We make no guarantees that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>The Platform will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Platform is free of viruses or harmful components</li>
              </ul>
              <p className="mt-2">Use of the Platform is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">9. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, Byteon and its affiliates shall not be liable for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data, revenue, or profits</li>
                <li>Damages resulting from your use or inability to use the Platform</li>
              </ul>
              <p className="mt-2">Even if we have been advised of such risks.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">10. Indemnification</h2>
              <p>You agree to defend, indemnify, and hold harmless Byteon, its affiliates, and team from any claims, damages, or expenses arising from:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your infringement of any rights of a third party</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">11. Governing Law</h2>
              <p>These Terms shall be governed by and interpreted in accordance with the laws of the jurisdiction in which Byteon operates, without regard to conflict of law principles.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">12. Changes to the Platform</h2>
              <p>We reserve the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Modify or discontinue any part of the Platform</li>
                <li>Add or remove features</li>
                <li>Restrict access to certain users</li>
              </ul>
              <p className="mt-2">At any time, without prior notice.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">13. Account Suspension and Termination</h2>
              <p>Byteon may suspend or terminate your account at our sole discretion, with or without notice, if:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>You violate these Terms & Conditions</li>
                <li>Your actions harm the platform or other users</li>
                <li>Required by law or legal request</li>
              </ul>
              <p className="mt-2">Upon termination, your right to use the platform ceases immediately. Provisions of these terms that by their nature should survive termination shall survive, including but not limited to ownership provisions, disclaimers, and limitations of liability.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">14. Account Deletion and Suspension Policy</h2>
              <p>Byteon reserves the right to suspend, restrict, or permanently delete user accounts under the following conditions:</p>
              <p className="mt-2">A. Grounds for Suspension or Termination</p>
              <p className="mt-2">An account may be suspended or terminated if the user:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Violates any provision of these Terms of Service</li>
                <li>Engages in fraudulent, abusive, or illegal activities</li>
                <li>Provides false, misleading, or incomplete registration information</li>
                <li>Compromises the security or integrity of the platform</li>
                <li>Repeatedly receives complaints from other users</li>
                <li>Uses the platform in a manner that may harm Byteon, its users, or third parties</li>
              </ul>
              <p className="mt-2">B. Types of Enforcement Actions</p>
              <p className="mt-2">Depending on the severity of the violation, Byteon may take one or more of the following actions:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Warning Notice – Issuance of a formal warning to the user</li>
                <li>Temporary Suspension – Limited restriction of account access for a defined period</li>
                <li>Permanent Termination – Complete removal of the account and access to the platform</li>
              </ul>
              <p className="mt-2">C. User-Initiated Account Deletion</p>
              <p className="mt-2">Users may request to delete their account at any time by:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Accessing account settings, or</li>
                <li>Contacting support at support@byteon.com</li>
              </ul>
              <p className="mt-2">Upon deletion:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Your account will be deactivated immediately or within a reasonable processing period</li>
                <li>Certain data may be retained as required by law or for legitimate business purposes (e.g., fraud prevention, legal compliance)</li>
              </ul>
              <p className="mt-2">D. Effect of Termination</p>
              <p className="mt-2">Upon suspension or termination:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Your right to access and use Byteon will immediately cease</li>
                <li>Any active content, submissions, or participation (e.g., hackathons, posts) may be removed or retained at our discretion</li>
                <li>Byteon shall not be liable for any loss of data or content resulting from account termination</li>
              </ul>
              <p className="mt-2">E. Appeals and Review</p>
              <p className="mt-2">If you believe your account was suspended or terminated in error, you may submit an appeal by contacting: support@byteon.com</p>
              <p className="mt-2">Byteon reserves the right to make the final decision after review.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">15. Contact Us</h2>
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