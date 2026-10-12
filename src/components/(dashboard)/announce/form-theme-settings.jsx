// ============================================================================
// Patch for PendingAnnounceForm (the organizer form you pasted)
// ============================================================================

// 1) Add the icon import:  Users  → from "lucide-react"

// 2) EMPTY_FORM — add two defaults:
//      allow_teams: true,
//      max_team_size: 4,

// 3) Paste this component next to InviteOnlySection --------------------------
function TeamSettingsSection({ enabled, size, onToggle, onSize, uiT }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-400/15 border border-emerald-400/25">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div>
            <Label className="font-semibold leading-none" style={{ color: uiT?.headingText }}>Team participation</Label>
            <p className="text-[11px] mt-0.5" style={{ color: uiT?.mutedText }}>
              Let participants join solo or as a group. A project leader creates the team and shares a code with groupmates.
            </p>
          </div>
        </div>
        <button
          type="button" role="switch" aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/15"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : ""}`} />
        </button>
      </div>

      {enabled && (
        <div className="flex items-center gap-3">
          <Label className="text-sm" style={{ color: uiT?.mutedText }}>Max team size</Label>
          <select
            value={size} onChange={(e) => onSize(Number(e.target.value))}
            className="text-sm rounded-lg px-2 py-1.5 outline-none cursor-pointer"
            style={{
              background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
              border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`,
              color: uiT?.headingText ?? "#fff",
            }}
          >
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n} style={{ background: uiT?.inputBg ?? "#1a1a2e" }}>{n}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

// 4) Render it (e.g. right after the "Access" <Section>) ---------------------
//
//   {/* ── Teams ── */}
//   <Section uiT={uiT}>
//     <TeamSettingsSection
//       enabled={formData.allow_teams}
//       size={formData.max_team_size}
//       onToggle={(v) => setFormData(prev => ({ ...prev, allow_teams: v }))}
//       onSize={(n) => setFormData(prev => ({ ...prev, max_team_size: n }))}
//       uiT={uiT}
//     />
//   </Section>

// 5) In handleSubmit's `payload`, add:
//      allow_teams:    formData.allow_teams,
//      max_team_size:  formData.allow_teams ? formData.max_team_size : 4,

// 6) (optional) In ReviewDialog's summary add a row:
//      {row("Teams", payload.allow_teams ? `Allowed · up to ${payload.max_team_size} per team` : "Solo only")}


// ============================================================================
// org-dashboard-page: add a "Participants" tab
// ============================================================================
// import OrgParticipantsTab from "@/components/OrgParticipantsTab"
//
// Add { key: "participants", label: "Participants", icon: <UsersRound/> } to wherever
// you build your top-level tab list, then next to the `activeTab === "create"` block:
//
//   {activeTab === "participants" && (
//     <motion.div key="participants" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
//       <div className="rounded-2xl overflow-hidden" style={{ background: uiT.surfaceBg, border: `1px solid ${p}18` }}>
//         <div className="p-5">
//           <OrgParticipantsTab announcements={announcements} addToast={addToast} uiT={uiT} />
//         </div>
//       </div>
//     </motion.div>
//   )}
//
// `announcements` = the org's rows from the `announcements` table
// (must include id, title, max_team_size).


// ============================================================================
// Participant side: where to mount <ParticipationPanel />
// ============================================================================
// On the public announcement/hackathon page, below the registration links
// (and, for invite-only announcements, only after the access code is accepted):
//
//   <ParticipationPanel
//     announcement={announcement}        // id, title, allow_teams, max_team_size
//     userId={user.id}
//     displayName={profile?.full_name ?? user.email}
//     addToast={addToast}
//     uiT={uiT}
//   />