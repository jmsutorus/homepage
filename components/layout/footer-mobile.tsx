import Link from "next/link";
import { footerContent } from "./footer-content";

export function FooterMobile() {
  return (
    <footer className="w-full rounded-t-none bg-[#061b0e] dark:bg-[#030d07] text-[#faf9f6] font-lexend font-light tracking-wide mt-auto">
      <div className="px-12 py-16 w-full max-w-screen-2xl mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          {footerContent.sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-semibold tracking-widest uppercase text-[#e3e2e0]/50">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`hover:translate-x-1 transition-transform duration-200 flex items-center gap-2 ${
                        link.isHighlight
                          ? "text-[#9f402d] font-medium hover:text-[#faf9f6]"
                          : "text-[#e3e2e0]/70 hover:text-[#faf9f6]"
                      }`}
                    >
                      {link.icon && (
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            link.isHighlight ? "text-[#9f402d]" : ""
                          }`}
                          {...(link.isHighlight
                            ? {
                                style: { fontVariationSettings: "'FILL' 1" },
                              }
                            : {})}
                        >
                          {link.icon}
                        </span>
                      )}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Brand and Copyright for Mobile */}
        <div className="border-t border-[#e3e2e0]/10 pt-8 flex flex-col gap-4">
          <span className="text-lg font-black uppercase tracking-[0.2em] text-[#9f402d]">
            {footerContent.brand.name}
          </span>
          <p className="text-[#e3e2e0]/80 leading-relaxed text-sm max-w-sm">
            {footerContent.brand.description}
          </p>
          <p className="text-[#e3e2e0]/50 text-xs mt-2">
            {footerContent.brand.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
