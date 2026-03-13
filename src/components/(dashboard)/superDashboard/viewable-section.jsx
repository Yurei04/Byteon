"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Megaphone, FileText, BookOpen, Trash2, Loader2,
  AlertCircle, Search, Calendar, Building2, Tag, Link2, Trophy,
} from "lucide-react"

const ITEMS_PER_PAGE = 6

export default function ViewableSection() {
  const [data, setData] = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState("announcements")
  const [search, setSearch]           = useState("")
  const [pages, setPages]             = useState({ announcements: 1, blogs: 1, resources: 1 })
  const [deleteDialog, setDeleteDialog] = useState(null)   // { id, title, type }
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]             = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: ann }, { data: blogs }, { data: res }] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("blogs").select("*").order("created_at", { ascending: false }),
        supabase.from("resource_hub").select("*").order("created_at", { ascending: false }),
      ])
      setData({
        announcements: ann || [],
        blogs:         blogs || [],
        resources:     res || [],
      })
    } catch (err) {
      showToast("Failed to load content: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filter = (arr) =>
      arr.filter((i) =>
        (i.title || "").toLowerCase().includes(q) ||
        (i.organization || "").toLowerCase().includes(q) ||
        (i.author || "").toLowerCase().includes(q)
      )
    return {
      announcements: filter(data.announcements),
      blogs:         filter(data.blogs),
      resources:     filter(data.resources),
    }
  }, [data, search])

  const paginated = (type) => {
    const page  = pages[type]
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered[type].slice(start, start + ITEMS_PER_PAGE)
  }

  const totalPages = (type) => Math.max(1, Math.ceil(filtered[type].length / ITEMS_PER_PAGE))

  const setPage = (type, p) => setPages((prev) => ({ ...prev, [type]: p }))

  const handleDelete = async () => {
    if (!deleteDialog) return
    const { id, type } = deleteDialog
    setActionLoading(id)
    const tableMap = { announcements: "announcements", blogs: "blogs", resources: "resource_hub" }
    try {
      const { error } = await supabase.from(tableMap[type]).delete().eq("id", id)
      if (error) throw error
      setData((prev) => ({
        ...prev,
        [type]: prev[type].filter((i) => i.id !== id),
      }))
      showToast(`"${deleteDialog.title}" deleted.`)
    } catch (err) {
      showToast("Delete failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setDeleteDialog(null)
    }
  }

  const tabConfig = [
    { value: "announcements", label: "Announcements", Icon: Megaphone, color: "fuchsia" },
    { value: "blogs",         label: "Blogs",         Icon: FileText,  color: "purple"  },
    { value: "resources",     label: "Resources",     Icon: BookOpen,  color: "emerald" },
  ]

  return (
    <>
      {toast && (
        <Alert className={`mb-4 ${toast.type === "error" ? "bg-red-900/30 border-red-500/40 text-red-200" : "bg-emerald-900/30 border-emerald-500/40 text-emerald-200"}`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : null}
          <AlertDescription>{toast.msg}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400/60" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, organization, author…"
          className="pl-10 bg-black/20 border-fuchsia-500/20 text-white placeholder:text-white/30"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-fuchsia-500/20 p-1 mb-5">
          {tabConfig.map(({ value, label, Icon, color }) => (
            <TabsTrigger key={value} value={value}
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white
                ${color === "fuchsia" ? "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600" : ""}
                ${color === "purple"  ? "data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"    : ""}
                ${color === "emerald" ? "data-[state=active]:from-emerald-600 data-[state=active]:to-green-600"  : ""}
              `}>
              <Icon className="w-4 h-4" />{label}
              <span className="text-xs opacity-60">({filtered[value].length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(({ value }) => (
          <TabsContent key={value} value={value}>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
              </div>
            ) : filtered[value].length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{search ? `No results for "${search}"` : `No ${value} yet`}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paginated(value).map((item) => (
                    <LiveContentCard
                      key={item.id}
                      item={item}
                      type={value}
                      actionLoading={actionLoading}
                      onDelete={() => setDeleteDialog({ id: item.id, title: item.title, type: value })}
                    />
                  ))}
                </div>

                {totalPages(value) > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(value, Math.max(1, pages[value] - 1))}
                          className={pages[value] === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages(value) }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === pages[value]}
                            onClick={() => setPage(value, p)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(value, Math.min(totalPages(value), pages[value] + 1))}
                          className={pages[value] === totalPages(value) ? "pointer-events-none opacity-40" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/40 to-rose-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-200">Delete Content</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Permanently delete <strong className="text-red-300">"{deleteDialog?.title}"</strong>?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Live content card ────────────────────────────────────────────────────────
function LiveContentCard({ item, type, actionLoading, onDelete }) {
  const isExpired = item.date_end && new Date(item.date_end) < new Date()

  return (
    <Card className="group bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-lg border border-white/10 hover:border-fuchsia-500/30 transition-all duration-300 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Org badge */}
            {item.organization && (
              <div className="flex items-center gap-1 mb-2">
                <Building2 className="w-3 h-3 text-fuchsia-400" />
                <span className="text-fuchsia-400 text-xs font-semibold uppercase tracking-wider">
                  {item.organization}
                </span>
              </div>
            )}

            <h3 className="text-base font-bold text-white mb-1 line-clamp-2">{item.title}</h3>

            {item.des && (
              <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">{item.des}</p>
            )}

            {/* Type details */}
            <div className="flex flex-wrap gap-2 text-xs">
              {type === "announcements" && (
                <>
                  {item.date_begin && (
                    <span className="flex items-center gap-1 text-white/40">
                      <Calendar className="w-3 h-3 text-fuchsia-400" />
                      {new Date(item.date_begin).toLocaleDateString()} – {new Date(item.date_end).toLocaleDateString()}
                    </span>
                  )}
                  {item.prizes?.length > 0 && (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Trophy className="w-3 h-3" />{item.prizes.length} prizes
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isExpired
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {isExpired ? "Expired" : "Active"}
                  </span>
                </>
              )}

              {type === "blogs" && item.theme && (
                <span className="flex items-center gap-1 text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" />{item.theme}
                </span>
              )}

              {type === "resources" && item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300 underline">
                  <Link2 className="w-3 h-3" />Visit
                </a>
              )}

              <span className="text-white/25 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onDelete}
            disabled={actionLoading === item.id}
            className="shrink-0 h-8 w-8 p-0 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30"
          >
            {actionLoading === item.id
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Trash2 className="w-3 h-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}