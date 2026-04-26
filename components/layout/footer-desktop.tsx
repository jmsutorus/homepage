import Link from "next/link";
import { footerContent } from "./footer-content";

export function FooterDesktop() {
  return (
    <footer className="bg-[#061b0e] dark:bg-[#030d07] text-[#faf9f6] font-lexend font-light tracking-wide w-full rounded-t-none border-none mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 w-full max-w-screen-2xl mx-auto">
        {/* Brand / Narrative Column */}
        <div className="col-span-1 md:col-span-1 flex flex-col items-start">
          <span className="text-xl font-black uppercase tracking-[0.2em] text-[#9f402d] mb-6">
            {footerContent.brand.name}
          </span>
          <p className="text-[#e3e2e0]/80 leading-relaxed text-sm md:text-base max-w-xs mb-8">
            {footerContent.brand.description}
          </p>
          <p className="text-[#e3e2e0]/50 text-xs mt-auto">
            {footerContent.brand.copyright}
          </p>
        </div>

        {/* Dynamic Columns */}
        {footerContent.sections.map((section) => (
          <div key={section.title} className="col-span-1 flex flex-col gap-4 mt-2 md:mt-0">
            <h4 className="text-[#faf9f6] font-semibold text-sm tracking-wider uppercase mb-2">
              {section.title}
            </h4>
            {section.links.map((link) => (
              <Link
                key={link.label}
                className={`text-[#e3e2e0]/70 hover:text-[#faf9f6] opacity-80 hover:opacity-100 transition-opacity hover:translate-x-1 transition-transform duration-200 ${
                  link.icon ? "flex items-center gap-2" : "block"
                } w-max`}
                href={link.href}
              >
                {link.icon && (
                  <span
                    aria-hidden="true"
                    className={`material-symbols-outlined text-sm ${
                      link.isHighlight ? "text-[#9f402d]" : ""
                    }`}
                    data-icon={link.icon}
                    {...(link.isHighlight
                      ? {
                          "data-weight": "fill",
                          style: { fontVariationSettings: "'FILL' 1" },
                        }
                      : {})}
                  >
                    {link.icon}
                  </span>
                )}
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
