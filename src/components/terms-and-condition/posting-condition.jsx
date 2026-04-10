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
          <DialogTitle className="text-lg font-semibold text-white text-left">Hackathon Submission Guidelines</DialogTitle>
          <p className="text-xs text-purple-400/60 text-left mt-0.5">Last updated: April 2026</p>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-7 text-purple-100/85 leading-relaxed text-sm">

            <p className="text-purple-200/70 text-xs leading-relaxed p-3 rounded-xl border border-purple-400/15 bg-purple-400/5">
              These guidelines apply to all organizations submitting online hackathon announcements on Byteon. All submissions are reviewed by a super admin before going live. Please read carefully before submitting.
            </p>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">1. Eligibility to Post</h2>
              <p>Only registered organizations on Byteon may submit hackathon announcements. By submitting, you confirm that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>You are an authorized representative of the submitting organization.</li>
                <li>The hackathon is a legitimate, real event that will take place as described.</li>
                <li>The event is conducted entirely online (virtual/remote participation).</li>
                <li>The hackathon does not charge participants any registration or entry fee unless explicitly disclosed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">2. Online Hackathon Requirements</h2>
              <p>All listed hackathons must be online events. This means:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Participation, submission, judging, and prize distribution must all be conducted remotely.</li>
                <li>If the event has optional in-person components (e.g., a final showcase), this must be clearly stated in the description.</li>
                <li>The event must provide a digital platform for participants to collaborate and submit (e.g., DevPost, GitHub, a custom portal).</li>
                <li>Communication channels (Discord, Slack, email, etc.) must be accessible to all eligible participants globally or within the stated regions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">3. Accurate and Complete Information</h2>
              <p>All fields submitted in the announcement form must be truthful and accurate at the time of submission. Specifically:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li><strong className="text-white">Title</strong> — Must clearly reflect the name of the hackathon. No misleading titles or keyword stuffing.</li>
                <li><strong className="text-white">Description</strong> — Must include what participants will build, the theme or problem domain, and any tools, technologies, or tracks involved.</li>
                <li><strong className="text-white">Dates</strong> — Start and end dates must be accurate. Events that have already ended will be rejected.</li>
                <li><strong className="text-white">Open To</strong> — Clearly describe who may participate (e.g., students, professionals, global, 18+).</li>
                <li><strong className="text-white">Prizes</strong> — Prize names and values must reflect what will actually be awarded. Vague placeholders (e.g., "TBD") are not accepted.</li>
                <li><strong className="text-white">Links</strong> — All URLs must be live and relevant. Broken or placeholder links will result in rejection.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">4. Prize Pool Standards</h2>
              <p>Prize information must meet the following standards:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>At least one prize with a clearly stated name and value is required.</li>
                <li>Monetary prizes must specify the currency (e.g., USD, PHP, EUR).</li>
                <li>Non-monetary prizes (e.g., certificates, mentorship, credits) are allowed but must be described accurately.</li>
                <li>You must be able to fulfill all listed prizes. Misrepresenting prizes is grounds for immediate removal and account suspension.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">5. Required Links</h2>
              <p>At least one valid link must be provided. Recommended links include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li><strong className="text-white">Website</strong> — The official hackathon landing page with full event details.</li>
                <li><strong className="text-white">DevPost</strong> — If your hackathon is hosted on DevPost, this link is strongly recommended.</li>
                <li><strong className="text-white">Google Forms</strong> — If participants register via a form, provide the direct registration link.</li>
                <li><strong className="text-white">Google Sheet CSV</strong> — For events using spreadsheet-based tracking of participants or submissions.</li>
              </ul>
              <p className="mt-2">All links must be publicly accessible and functional at the time of submission. Password-protected or private links will be rejected.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">6. Country &amp; Eligibility Restrictions</h2>
              <p>Clearly indicate which countries may participate:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li><strong className="text-white">Global</strong> — Open to participants from any country. Select this only if there are truly no geographic restrictions.</li>
                <li><strong className="text-white">Included countries</strong> — Only participants from the listed countries may join. Use this if eligibility is legally or operationally restricted.</li>
                <li><strong className="text-white">Excluded countries</strong> — All countries except those listed are eligible. Use this for sanction-related or compliance restrictions.</li>
              </ul>
              <p className="mt-2">Misrepresenting eligibility (e.g., listing as Global when certain countries are restricted) may result in participant disputes and removal of the listing.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">7. Content Standards</h2>
              <p>Hackathon announcements must not:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Promote illegal activities, hate speech, or discriminatory practices.</li>
                <li>Include spam, duplicate submissions, or substantially identical events posted multiple times.</li>
                <li>Impersonate another organization, brand, or well-known hackathon.</li>
                <li>Contain false urgency, fabricated statistics, or manipulative language designed to mislead participants.</li>
                <li>Advertise third-party products or services unrelated to the hackathon itself.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">8. Review &amp; Approval Process</h2>
              <p>All submissions go through a mandatory review by the Byteon super admin before being published. You can expect:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Review typically completed within <strong className="text-white">1–3 business days</strong>.</li>
                <li>Submissions may be approved, returned for edits, or rejected with a reason provided.</li>
                <li>Resubmissions after rejection are allowed once the flagged issues have been resolved.</li>
                <li>Approved announcements will be published and visible to all Byteon users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">9. Post-Publication Responsibilities</h2>
              <p>After your announcement goes live, your organization is responsible for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Keeping all information up to date (dates, links, prize values).</li>
                <li>Honoring all prizes and commitments stated in the announcement.</li>
                <li>Responding to participant inquiries in a timely and professional manner.</li>
                <li>Notifying Byteon if the event is cancelled or significantly changed after publication.</li>
              </ul>
              <p className="mt-2">Failure to fulfill stated commitments may result in removal of the listing and suspension of your organization's posting privileges.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">10. Removal &amp; Enforcement</h2>
              <p>Byteon reserves the right to remove any announcement at any time if it is found to violate these guidelines, including after approval. Enforcement actions may include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-purple-100/75">
                <li>Warning and request for correction.</li>
                <li>Temporary suspension of posting privileges.</li>
                <li>Permanent removal of the organization from the platform.</li>
              </ul>
              <p className="mt-2">To appeal a removal, contact us at <a href="mailto:support@byteon.com" className="underline underline-offset-2 text-purple-300 hover:text-white transition-colors">support@byteon.com</a>.</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-white mb-2">11. Contact &amp; Support</h2>
              <p>
                For questions about these guidelines or help with your submission, reach out at{" "}
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