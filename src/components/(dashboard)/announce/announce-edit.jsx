"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Loader2, Info, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
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
  prizes: safe.prizes ?? "",
  prize_currency: safe.prize_currency ?? "USD",
  website_link: safe.website_link ?? "",
  dev_link: safe.dev_link ?? "",
  google_sheet_csv_url: safe.google_sheet_csv_url ?? "",
});


  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);

    const updateData = {
      title: form.title,
      des: form.des,
      author: form.author,
      date_begin: form.date_begin,
      date_end: form.date_end,
      open_to: form.open_to,
      countries: form.countries,
      prizes: form.prizes ? Number(form.prizes) : null,
      prize_currency: form.prize_currency,
      website_link: form.website_link,
      dev_link: form.dev_link,
      google_sheet_csv_url: form.google_sheet_csv_url ? form.google_sheet_csv_url.trim() : null
    };

    const { error } = await supabase
      .from("announcements")
      .update(updateData)
      .eq("id", announcement.id);

    setSaving(false);

    if (error) {
      alert("Error saving changes: " + error.message);
      return;
    }

    onUpdate?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-fuchsia-900 border-fuchsia-500/30 max-w-3xl w-full max-h-[90vh] overflow-hidden">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Author *</Label>
                <Input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">Prize Amount</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={form.prize_currency} onValueChange={(val) => handleSelectChange('prize_currency', val)}>
                    <SelectTrigger className="w-28 bg-black/30 text-fuchsia-200 border-fuchsia-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    name="prizes"
                    type="number"
                    value={form.prizes}
                    onChange={handleChange}
                    className="flex-1 bg-black/30 text-fuchsia-200 border-fuchsia-500/30"
                  />
                </div>
              </div>
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