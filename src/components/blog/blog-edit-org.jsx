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

const PRIZE_TEMPLATES = [
  { name: "1st Place" },
  { name: "2nd Place" },
  { name: "3rd Place" },
  { name: "Best Design" },
  { name: "Most Innovative" },
  { name: "Best Technical Implementation" },
  { name: "People's Choice" },
  { name: "Best Presentation" },
  { name: "Participation Prize" },
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
    prize_currency: safe.prize_currency ?? "USD",
    website_link: safe.website_link ?? "",
    dev_link: safe.dev_link ?? "",
    google_sheet_csv_url: safe.google_sheet_csv_url ?? "",
  });

  const [prizes, setPrizes] = useState([]);
  const [prizesToDelete, setPrizesToDelete] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPrizes, setLoadingPrizes] = useState(false);

  // Fetch prizes when dialog opens
  useEffect(() => {
    if (isOpen && prizes.length === 0) {
      fetchPrizes();
    }
  }, [isOpen]);

  const fetchPrizes = async () => {
    setLoadingPrizes(true);
    try {
      const { data, error } = await supabase
        .from('announcement_prizes')
        .select('*')
        .eq('announcement_id', announcement.id)
        .order('prize_order', { ascending: true });

      if (error) {
        console.error('Error fetching prizes:', error);
      } else {
        setPrizes(data.map(p => ({ 
          ...p, 
          isExisting: true,
          tempId: p.id 
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching prizes:', error);
    } finally {
      setLoadingPrizes(false);
    }
  };
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const addPrize = () => {
    setPrizes([...prizes, { 
      tempId: Date.now(), 
      prize_name: "", 
      prize_amount: "", 
      prize_order: prizes.length,
      isExisting: false 
    }]);
  };

  const removePrize = (tempId, isExisting, realId) => {
    if (isExisting && realId) {
      setPrizesToDelete([...prizesToDelete, realId]);
    }
    setPrizes(prizes.filter(p => p.tempId !== tempId));
  };

  const updatePrize = (tempId, field, value) => {
    setPrizes(prizes.map(p => 
      p.tempId === tempId ? { ...p, [field]: value } : p
    ));
  };

  const usePrizeTemplate = (tempId, template) => {
    updatePrize(tempId, 'prize_name', template.name);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Update announcement basic info
      const updateData = {
        title: form.title,
        des: form.des,
        author: form.author,
        date_begin: form.date_begin,
        date_end: form.date_end,
        open_to: form.open_to,
        countries: form.countries,
        prize_currency: form.prize_currency,
        website_link: form.website_link,
        dev_link: form.dev_link,
        google_sheet_csv_url: form.google_sheet_csv_url ? form.google_sheet_csv_url.trim() : null
      };

      const { error: announcementError } = await supabase
        .from("announcements")
        .update(updateData)
        .eq("id", announcement.id);

      if (announcementError) throw announcementError;

      // Delete removed prizes
      if (prizesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('announcement_prizes')
          .delete()
          .in('id', prizesToDelete);
        
        if (deleteError) throw deleteError;
      }

      // Update existing prizes and insert new ones
      const validPrizes = prizes.filter(p => 
        p.prize_name.trim() && p.prize_amount && parseFloat(p.prize_amount) > 0
      );

      for (let i = 0; i < validPrizes.length; i++) {
        const prize = validPrizes[i];
        const prizeData = {
          prize_name: prize.prize_name.trim(),
          prize_amount: parseInt(prize.prize_amount),
          prize_order: i
        };

        if (prize.isExisting && prize.id) {
          // Update existing prize
          const { error: updateError } = await supabase
            .from('announcement_prizes')
            .update(prizeData)
            .eq('id', prize.id);
          
          if (updateError) throw updateError;
        } else {
          // Insert new prize
          const { error: insertError } = await supabase
            .from('announcement_prizes')
            .insert({
              ...prizeData,
              announcement_id: announcement.id
            });
          
          if (insertError) throw insertError;
        }
      }

      // Reset state
      setPrizesToDelete([]);
      
      // Refresh prizes
      await fetchPrizes();

      if (onUpdate) onUpdate();
      
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
                <Label className="text-fuchsia-300 text-sm">Prize Currency</Label>
                <Select value={form.prize_currency} onValueChange={(val) => handleSelectChange('prize_currency', val)}>
                  <SelectTrigger className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1">
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
              </div>
            </div>

            {/* Dynamic Prizes Section */}
            <div className="space-y-4 p-4 border border-amber-400/30 rounded-xl bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <Label className="text-amber-300 text-base font-semibold">Prize Pool</Label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addPrize}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Prize
                </Button>
              </div>

              {loadingPrizes ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {prizes.map((prize, index) => (
                    <div key={prize.tempId} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              value={prize.prize_name}
                              onChange={(e) => updatePrize(prize.tempId, 'prize_name', e.target.value)}
                              className="bg-black/30 text-fuchsia-200 border-amber-400/30"
                              placeholder="Prize name"
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              value={prize.prize_amount}
                              onChange={(e) => updatePrize(prize.tempId, 'prize_amount', e.target.value)}
                              className="bg-black/30 text-fuchsia-200 border-amber-400/30"
                              placeholder="Amount"
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removePrize(prize.tempId, prize.isExisting, prize.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {PRIZE_TEMPLATES.map((template) => (
                            <button
                              key={template.name}
                              type="button"
                              onClick={() => usePrizeTemplate(prize.tempId, template)}
                              className="px-2 py-1 text-xs bg-amber-900/30 hover:bg-amber-800/40 text-amber-200 rounded border border-amber-600/30 transition-colors"
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {prizes.length === 0 && (
                    <p className="text-center text-amber-300/60 text-sm py-4">
                      No prizes added yet. Click "Add Prize" to create one.
                    </p>
                  )}
                </div>
              )}
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