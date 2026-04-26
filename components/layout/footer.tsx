import { FooterDesktop } from "./footer-desktop";
import { FooterMobile } from "./footer-mobile";

export function Footer() {
  return (
    <>
      <div className="hidden md:block">
        <FooterDesktop />
      </div>
      <div className="md:hidden">
        <FooterMobile />
      </div>
    </>
  );
}
