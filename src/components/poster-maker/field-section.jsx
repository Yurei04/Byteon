// components/poster-maker/FieldSection.jsx
export default function FieldSection({ label, description, children }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}