"use client"  
import Link from "next/link"
import { Github, Mail, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer
      className="px-6 py-12 z-10"
      style={{
        background: `linear-gradient(to bottom, rgb(var(--bg-subtle)), rgb(var(--bg-base)))`,
        borderTop: "1px solid rgb(var(--surface-border) / 0.3)",
        color: "rgb(var(--text-secondary))",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Left Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <h2
            className="text-2xl font-bold text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(to right, rgb(var(--brand-400)), rgb(var(--accent-400)))`,
            }}
          >
            Byteon
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            Empowering students and beginners through technology, <br />
            creativity, and meaningful innovation.
          </p>
          <div className="flex justify-center md:justify-start gap-4 mt-2">
            {[
              { href: "", icon: Mail     },
              { href: "", icon: Github   },
              { href: "", icon: Twitter  },
              { href: "", icon: Linkedin },
            ].map(({ href, icon: Icon }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgb(var(--text-faint))" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--brand-500))")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-faint))")}
                className="transition-colors duration-200"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Middle Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          {[
            { label: "Home",             href: "/"                   },
            { label: "About",            href: "/"                   },
            { label: "Partners",         href: "/partners"           },
            { label: "Blog",             href: "/blog"               },
            { label: "HowToHack",        href: "/how-to-hackathon"   },
            { label: "Terms & Condition",href: "/terms-and-conditions"},
            { label: "Privacy Policies", href: "/privacy-policy"     },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ color: "rgb(var(--text-secondary))" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--brand-500))")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-secondary))")}
              className="transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="space-y-4 text-center md:text-right flex flex-col items-center md:items-end">
          <div>
            <p
              className="text-sm"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              Have thoughts to share?
            </p>
            <div className="mt-2 flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-end w-full">
              <input
                type="email"
                placeholder="byteonHack.com"
                className="w-full sm:w-auto px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                style={{
                  background:  "rgb(var(--surface-raised))",
                  border:      "1px solid rgb(var(--surface-border) / 0.4)",
                  color:       "rgb(var(--text-primary))",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgb(var(--brand-500) / 0.5)"
                  e.target.style.boxShadow   = "0 0 0 2px rgb(var(--brand-500) / 0.08)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgb(var(--surface-border) / 0.4)"
                  e.target.style.boxShadow   = "none"
                }}
              />
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg transition-all duration-200"
                style={{
                  background: `rgb(var(--brand-600))`,
                  color:      "rgb(var(--fg-on-brand, 255 255 255))",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgb(var(--brand-500))")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgb(var(--brand-600))")}
              >
                Message Us
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-10 text-center text-xs"
        style={{ color: "rgb(var(--text-faint))" }}
      >
        © {new Date().getFullYear()} Byteon. All rights reserved.
      </div>
    </footer>
  )
}