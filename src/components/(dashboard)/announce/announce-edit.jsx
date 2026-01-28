"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Loader2, Info, CheckCircle, Trophy, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const PRIZE_TEMPLATES = [
  { name: "1st Place", value: "$5,000" },
  { name: "2nd Place", value: "$3,000" },
  { name: "3rd Place", value: "$2,000" },
  { name: "Best Design", value: "$1,000" },
  { name: "Most Innovative", value: "$1,500" },
  { name: "NordVPN Subscription", value: "1 Year" },
  { name: "GitHub Pro", value: "1 Year" },
  { name: "Swag Pack", value: "T-shirt + Stickers" },
]

export default function AnnouncementEdit({ announcement, onUpdate, children }) {
  const safe = announcement || {};

  const [form, setForm] = useState({
    title: safe.title ?? "",
    des: safe.des ?? "",
    author: safe.author ?? "",
    date_begin: safe.date_begin ?? "",
    date_end: safe.date_end ?? "",
    open_to: safe.open_to ?? "",
    countries: safe.countries ?? "",
    website_link: safe.website_link ?? "",
    dev_link: safe.dev_link ?? "",
    google_sheet_csv_url: safe.google_sheet_csv_url ?? "",
  });

  const [prizes, setPrizes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load prizes when dialog opens
  useEffect(() => {
    if (isOpen) {
      const existingPrizes = safe.prizes || [];
      if (existingPrizes.length > 0) {
        setPrizes(existingPrizes.map((p, i) => ({
          ...p,
          id: Date.now() + i
        })));
      } else {
        setPrizes([{ id: Date.now(), name: "", value: "", description: "" }]);
      }
    }
  }, [isOpen]);
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addPrize = () => {
    setPrizes([...prizes, { id: Date.now(), name: "", value: "", description: "" }]);
  };

  const removePrize = (id) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter(p => p.id !== id));
    }
  };

  const updatePrize = (id, field, value) => {
    setPrizes(prizes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const usePrizeTemplate = (id, template) => {
    setPrizes(prizes.map(p => 
      p.id === id ? { ...p, name: template.name, value: template.value } : p
    ));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Validate and clean prizes
      const validPrizes = prizes.filter(p => p.name.trim() && p.value.trim());
      const prizesData = validPrizes.map(({ id, ...prize }) => ({
        name: prize.name.trim(),
        value: prize.value.trim(),
        description: prize.description.trim() || ""
      }));

      const updateData = {
        title: form.title,
        des: form.des,
        author: form.author,
        date_begin: form.date_begin,
        date_end: form.date_end,
        open_to: form.open_to,
        countries: form.countries,
        prizes: prizesData,
        website_link: form.website_link,
        dev_link: form.dev_link,
        google_sheet_csv_url: form.google_sheet_csv_url ? form.google_sheet_csv_url.trim() : null
      };

      const { error } = await supabase
        .from("announcements")
        .update(updateData)
        .eq("id", announcement.id);

      if (error) throw error;

      if (onUpdate) onUpdate();
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error saving:', error);
      alert("Error saving changes: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-fuchsia-900 border-fuchsia-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <DialogTitle className="text-fuchsia-200 mb-4">
          Edit Announcement – {announcement.title}
        </DialogTitle>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">

            <div>
              <Label className="text-fuchsia-300 text-sm">Title *</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
              />
            </div>

            <div>
              <Label className="text-fuchsia-300 text-sm">Description *</Label>
              <Textarea
                name="des"
                value={form.des}
                onChange={handleChange}
                className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1 resize-none"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-fuchsia-300 text-sm">Author *</Label>
              <Input
                name="author"
                value={form.author}
                onChange={handleChange}
                className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
              />
            </div>

            {/* Dynamic Prizes Section */}
            <div className="space-y-4 p-5 border border-amber-400/30 rounded-xl bg-gradient-to-br from-amber-950/30 to-yellow-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <Label className="text-amber-300 text-base font-semibold">Prize Pool</Label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addPrize}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Prize
                </Button>
              </div>

              <div className="space-y-3">
                {prizes.map((prize, index) => (
                  <div key={prize.id} className="relative bg-black/20 rounded-lg p-4 border border-amber-500/20">
                    {prizes.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removePrize(prize.id)}
                        className="absolute top-2 right-2 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="space-y-3 pr-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-amber-300 text-xs">Prize Name *</Label>
                          <Input
                            value={prize.name}
                            onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
                            className="bg-black/40 text-fuchsia-200 border-amber-400/30"
                            placeholder="e.g., 1st Place, Best Design"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-amber-300 text-xs">Value / Prize *</Label>
                          <Input
                            value={prize.value}
                            onChange={(e) => updatePrize(prize.id, 'value', e.target.value)}
                            className="bg-black/40 text-fuchsia-200 border-amber-400/30"
                            placeholder="$5,000 / NordVPN 1yr / Swag"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-amber-300 text-xs">Description (optional)</Label>
                        <Textarea
                          value={prize.description}
                          onChange={(e) => updatePrize(prize.id, 'description', e.target.value)}
                          className="bg-black/40 text-fuchsia-200 border-amber-400/30 resize-none"
                          placeholder="Additional details..."
                          rows={2}
                        />
                      </div>
                      
                      {/* Quick Templates */}
                      <div className="space-y-1.5">
                        <Label className="text-amber-300 text-xs">Quick Templates:</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRIZE_TEMPLATES.map((template) => (
                            <button
                              key={template.name}
                              type="button"
                              onClick={() => usePrizeTemplate(prize.id, template)}
                              className="px-2 py-1 text-xs bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 rounded border border-amber-600/30 transition-colors"
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-amber-300/70 mt-2 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Prizes can be cash, subscriptions, swag, or anything else!</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Start Date *</Label>
                <Input
                  name="date_begin"
                  type="datetime-local"
                  value={form.date_begin}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">End Date *</Label>
                <Input
                  name="date_end"
                  type="datetime-local"
                  value={form.date_end}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Open To</Label>
                <Input
                  name="open_to"
                  value={form.open_to}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">Countries</Label>
                <Input
                  name="countries"
                  value={form.countries}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Website Link</Label>
                <Input
                  name="website_link"
                  type="url"
                  value={form.website_link}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">DevPost Link</Label>
                <Input
                  name="dev_link"
                  type="url"
                  value={form.dev_link}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 border border-blue-400/30 rounded-xl bg-blue-950/20 mt-6">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <Label className="text-blue-200 text-base font-semibold">
                    Registration Tracking
                  </Label>
                  <p className="text-sm text-blue-300/80 mt-1">
                    Current count: {announcement.registrants_count || 0} registrants
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">
                  Google Sheet Published CSV URL
                </Label>
                <Input
                  name="google_sheet_csv_url"
                  value={form.google_sheet_csv_url}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1 font-mono text-xs"
                  placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
                />
                <p className="text-xs text-fuchsia-400/60 mt-1">
                  Paste the FULL CSV URL from: File → Share → Publish to web → CSV
                </p>
              </div>

              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200 text-sm">
                  Updates automatically when CSV URL is set
                </AlertDescription>
              </Alert>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}