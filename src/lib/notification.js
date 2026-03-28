// lib/notifications.js
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  ACCOUNT_SUSPENDED:        "account_suspended",
  ACCOUNT_REACTIVATED:      "account_reactivated",
  POST_APPROVED:            "post_approved",
  POST_REJECTED:            "post_rejected",
  POST_DELETED_BY_ADMIN:    "post_deleted_by_admin",
  CONTENT_DELETED_BY_ORG:   "content_deleted_by_org",
  BLOG_DELETED_BY_USER:     "blog_deleted_by_user",
}

export const NOTIFICATION_META = {
  account_suspended:       { color: "amber",   emoji: "🔒" },
  account_reactivated:     { color: "emerald", emoji: "✅" },
  post_approved:           { color: "emerald", emoji: "🎉" },
  post_rejected:           { color: "red",     emoji: "❌" },
  post_deleted_by_admin:   { color: "rose",    emoji: "🗑️"  },
  content_deleted_by_org:  { color: "sky",     emoji: "📋" },
  blog_deleted_by_user:    { color: "violet",  emoji: "📝" },
}

// ── Base insert ───────────────────────────────────────────────────────────────
async function insertNotification({ recipientUserId = null, recipientRole, type, title, message, metadata = {} }) {
  const { error } = await supabase.from("notifications").insert({
    recipient_user_id: recipientUserId,
    recipient_role:    recipientRole,
    type,
    title,
    message,
    metadata,
  })
  if (error) console.error("[notify] insert error:", error.message)
}

// ── Per-role helpers ──────────────────────────────────────────────────────────
export async function notifyUser({ authUserId, type, title, message, metadata }) {
  if (!authUserId) return
  return insertNotification({ recipientUserId: authUserId, recipientRole: "user", type, title, message, metadata })
}

export async function notifyOrg({ authUserId, type, title, message, metadata }) {
  if (!authUserId) return
  return insertNotification({ recipientUserId: authUserId, recipientRole: "org_admin", type, title, message, metadata })
}

/** Broadcast to ALL super admins (recipient_user_id = null, each marks read via read_by[]) */
export async function notifySuperAdmins({ type, title, message, metadata }) {
  return insertNotification({ recipientUserId: null, recipientRole: "super_admin", type, title, message, metadata })
}

// ── Convenience builders ──────────────────────────────────────────────────────

export async function notifyAccountSuspended({ authUserId, role, name, reason }) {
  return (role === "org_admin" ? notifyOrg : notifyUser)({
    authUserId,
    type:     NOTIFICATION_TYPES.ACCOUNT_SUSPENDED,
    title:    "Your account has been suspended",
    message:  `Your account "${name}" has been suspended. Reason: ${reason || "No reason provided."}`,
    metadata: { name, reason },
  })
}

export async function notifyAccountReactivated({ authUserId, role, name }) {
  return (role === "org_admin" ? notifyOrg : notifyUser)({
    authUserId,
    type:     NOTIFICATION_TYPES.ACCOUNT_REACTIVATED,
    title:    "Your account has been reactivated",
    message:  `Your account "${name}" has been reactivated. You now have full platform access.`,
    metadata: { name },
  })
}

export async function notifyPostApproved({ submittedBy, contentType, title }) {
  if (!submittedBy) return
  return notifyOrg({
    authUserId: submittedBy,
    type:     NOTIFICATION_TYPES.POST_APPROVED,
    title:    "Submission approved 🎉",
    message:  `Your ${contentType} "${title}" has been approved and is now live on the platform.`,
    metadata: { contentType, contentTitle: title },
  })
}

export async function notifyPostRejected({ submittedBy, contentType, title, reason }) {
  if (!submittedBy) return
  return notifyOrg({
    authUserId: submittedBy,
    type:     NOTIFICATION_TYPES.POST_REJECTED,
    title:    "Submission rejected",
    message:  `Your ${contentType} "${title}" was not approved. Reason: ${reason || "No reason provided."}`,
    metadata: { contentType, contentTitle: title, reason },
  })
}

export async function notifyPostDeletedByAdmin({ organizationId, contentType, title }) {
  if (!organizationId) return
  const { data: org } = await supabase
    .from("organizations").select("user_id, name").eq("id", organizationId).single()
  if (!org?.user_id) return
  return notifyOrg({
    authUserId: org.user_id,
    type:     NOTIFICATION_TYPES.POST_DELETED_BY_ADMIN,
    title:    "Your content was removed",
    message:  `Your ${contentType} "${title}" was removed by a platform administrator.`,
    metadata: { contentType, contentTitle: title, organizationName: org.name },
  })
}

export async function notifyContentDeletedByOrg({ orgName, contentType, contentTitle }) {
  return notifySuperAdmins({
    type:     NOTIFICATION_TYPES.CONTENT_DELETED_BY_ORG,
    title:    "Organization deleted content",
    message:  `${orgName} deleted their ${contentType} "${contentTitle}".`,
    metadata: { orgName, contentType, contentTitle },
  })
}

/** User deletes their own blog → notify all super admins */
export async function notifyBlogDeletedByUser({ userName, blogTitle }) {
  return notifySuperAdmins({
    type:     NOTIFICATION_TYPES.BLOG_DELETED_BY_USER,
    title:    "User deleted a blog post",
    message:  `${userName || "A user"} deleted their blog post "${blogTitle || "Untitled"}".`,
    metadata: { userName, blogTitle },
  })
}