"use client"

import OrgParticipantsTab from "../orgDashboard/orgParticipantsTab"

/**
 * Super-admin "Participants" tab.
 * Same component as the organization one, but:
 *  • it receives EVERY announcement (all organizations), grouped by organization in the dropdown
 *  • it is themed with the CSS variables the super-admin screens use (no uiT object there)
 *  • CSV exports get an extra "Organization" column
 * Needs the RLS policies in super-admin-participants.sql so the super admin can read the rows.
 */
const adminUiT = {
  surfaceBg:    "rgb(var(--surface) / 0.5)",
  surfaceBg2:   "rgb(var(--surface-raised) / 0.5)",
  cardBg:       "rgb(var(--bg-base))",
  inlineBg:     "rgb(var(--surface-raised) / 0.4)",
  inputBg:      "rgb(var(--surface-raised) / 0.6)",
  borderBase:   "rgb(var(--surface-border) / 0.3)",
  borderSubtle: "rgb(var(--surface-border) / 0.4)",
  borderMid:    "rgb(var(--surface-border) / 0.5)",
  headingText:  "rgb(var(--text-primary))",
  bodyText:     "rgb(var(--text-secondary))",
  mutedText:    "rgb(var(--text-faint))",
}

export default function AdminParticipantsTab({ announcements = [], addToast }) {
  return <OrgParticipantsTab announcements={announcements} addToast={addToast} uiT={adminUiT} groupByOrg />
}