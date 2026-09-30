import Link from "next/link";

const serviceLinks = [
  ["FAQ", "/faq"],
  ["Shipping", "/shipping"],
  ["Returns", "/returns"],
] as const;

const legalLinks = [
  ["Privacy Policy", "/privacy"],
  ["Terms", "/terms"],
] as const;

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-intro">
      <Link className="brand" href="/">Stacdial</Link>
      <p>Considered timepieces, handled personally.</p>
    </div>
    <nav className="footer-column" aria-label="Customer information">
      <strong>Customer care</strong>
      {serviceLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
    <div className="footer-column">
      <strong>Contact</strong>
      <a href="tel:+94768422125">076 842 2125</a>
    </div>
    <div className="footer-column">
      <strong>Delivery</strong>
      <span>Colombo: 1–3 business days</span>
      <span>Outside Colombo: 3–5 business days</span>
    </div>
    <nav className="footer-column" aria-label="Legal information">
      <strong>Legal</strong>
      {legalLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Stacdial</span><span>Independent watch retailer · Sri Lanka</span></div>
  </footer>;
}
