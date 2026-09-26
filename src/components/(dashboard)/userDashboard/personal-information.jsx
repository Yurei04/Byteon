"use client"

import { User2, MapPin, Briefcase, Calendar, Globe } from "lucide-react"

const LIMITS = { name: 100, age: 3, country: 60, affiliation: 100 }

function CharCount({ value, max }) {
  const len  = String(value ?? "").length
  const near = len >= max * 0.85
  return (
    <span className={
      "text-xs font-mono " +
      (near ? "text-amber-600 dark:text-amber-400" : "text-text-muted/40 dark:text-brand-400/40")
    }>
      {len}/{max}
    </span>
  )
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl transition-colors border border-brand-500/12 dark:border-accent-500/12 bg-brand-50/70 dark:bg-white/[0.04] hover:border-brand-500/25 dark:hover:border-accent-500/25">
      <div className="mt-0.5 p-1.5 rounded-lg bg-brand-500/10 dark:bg-accent-500/12 border border-brand-500/20 dark:border-accent-500/20">
        <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-text-muted/55 dark:text-brand-300/45">
          {label}
        </p>
        {value
          ? <p className="text-sm font-medium truncate text-text-primary">{value}</p>
          : <p className="text-sm font-normal italic text-text-muted/30 dark:text-white/22">Not provided</p>}
      </div>
    </div>
  )
}

function EditInput({ id, name, value, onChange, maxLength, placeholder, type = "text", min, max }) {
  return (
    <input
      id={id} name={name} type={type}
      value={value ?? ""} onChange={onChange}
      maxLength={maxLength} min={min} max={max}
      placeholder={placeholder}
      className="w-full px-3 h-10 rounded-lg text-sm outline-none transition-all bg-white/80 dark:bg-white/5 border border-brand-500/20 dark:border-accent-500/22 text-text-primary placeholder:text-text-muted/35 dark:placeholder:text-brand-300/30 focus:border-brand-500/50 dark:focus:border-brand-400/50 focus:ring-4 focus:ring-brand-500/15 dark:focus:ring-brand-400/12"
    />
  )
}

export default function PersonalInformation({ formData, isEditing, onChange }) {
  return (
    <div className="rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-colors duration-300 bg-surface/75 dark:bg-bg-base/60 border border-surface-border/40 dark:border-accent-500/20 dark:shadow-none">

      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2.5 border-b border-brand-500/12 dark:border-accent-500/12">
        <div className="p-1.5 rounded-lg bg-brand-500/10 dark:bg-accent-500/12 border border-brand-500/20 dark:border-accent-500/20">
          <User2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        </div>
        <span className="text-base font-semibold text-text-primary">
          Personal Information
        </span>
        {!isEditing && (
          <span className="ml-auto text-[10px] uppercase tracking-widest font-normal text-text-muted/45 dark:text-brand-300/40">
            Overview
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold text-text-muted/55 dark:text-brand-300/45">
                  Full Name <span className="text-brand-600 dark:text-brand-400">*</span>
                </label>
                <CharCount value={formData.name} max={LIMITS.name} />
              </div>
              <EditInput id="name" name="name" value={formData.name} onChange={onChange}
                maxLength={LIMITS.name} placeholder="John Doe" />
            </div>

            {/* Age + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="age" className="text-xs uppercase tracking-wider font-semibold text-text-muted/55 dark:text-brand-300/45">
                    Age <span className="text-brand-600 dark:text-brand-400">*</span>
                  </label>
                  <CharCount value={formData.age} max={LIMITS.age} />
                </div>
                <EditInput id="age" name="age" type="number" value={formData.age} onChange={onChange}
                  min={1} max={120} placeholder="30" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="country" className="text-xs uppercase tracking-wider font-semibold text-text-muted/55 dark:text-brand-300/45">
                    Country
                  </label>
                  <CharCount value={formData.country} max={LIMITS.country} />
                </div>
                <EditInput id="country" name="country" value={formData.country} onChange={onChange}
                  maxLength={LIMITS.country} placeholder="Philippines" />
              </div>
            </div>

            {/* Affiliation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="affiliation" className="text-xs uppercase tracking-wider font-semibold text-text-muted/55 dark:text-brand-300/45">
                  Affiliation / Organization
                </label>
                <CharCount value={formData.affiliation} max={LIMITS.affiliation} />
              </div>
              <EditInput id="affiliation" name="affiliation" value={formData.affiliation} onChange={onChange}
                maxLength={LIMITS.affiliation} placeholder="Tech University / Company Name" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <InfoField icon={User2}     label="Full Name"   value={formData.name} />
            </div>
            <InfoField icon={Calendar}    label="Age"         value={formData.age ? `${formData.age} years old` : null} />
            <InfoField icon={Globe}       label="Country"     value={formData.country} />
            <div className="sm:col-span-2">
              <InfoField icon={Briefcase} label="Affiliation" value={formData.affiliation} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}