"use client";

import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { money, type Product } from "@/lib/catalog";
import Link from "next/link";

const collectionScenes: Record<string, string> = {
  Chronograph: "/images/collection-chronograph-lifestyle.jpg",
  Diver: "/images/collection-diver-lifestyle.jpg",
  Dress: "/images/collection-dress-lifestyle.jpg",
  Everyday: "/images/collection-everyday-lifestyle.jpg",
  GMT: "/images/collection-gmt-lifestyle.jpg",
  Sport: "/images/collection-sport-lifestyle.jpg",
};

export default function SiteHeader({ products, active = "" }: { products: Product[]; active?: string }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [mega, setMega] = useState(false);
  const needle = term.trim().toLowerCase();
  const results = products.filter(product => `${product.name} ${product.collection} ${product.description}`.toLowerCase().includes(needle));
  const collections = [...new Set(products.map(product => product.collection.trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
    .filter(collection => collection.toLowerCase().includes(needle));

  return <>
    <header className="topbar v2-header" onMouseLeave={() => setMega(false)} onKeyDown={event => { if (event.key === "Escape") setMega(false); }}>
      <nav className="navleft" aria-label="Main navigation">
        <Link aria-current={active === "home" ? "page" : undefined} href="/">Home</Link>
        <div className="shop-nav" onMouseEnter={() => setMega(true)}>
          <button className="shop-trigger" aria-current={active === "shop" ? "page" : undefined} aria-haspopup="true" aria-expanded={mega} onClick={() => setMega(current => !current)}>Shop</button>
        </div>
        <Link href="/about" aria-current={active === "about" ? "page" : undefined}>About</Link>
        <Link className="mobile-nav-login" href="/login" aria-current={active === "login" ? "page" : undefined}>Login</Link>
      </nav>
      <Link className="brand" href="/">Stacdial</Link>
      <div className="header-actions">
        <form className="search desktop-search" action="/shop"><Search size={17}/><input name="q" aria-label="Search watches" placeholder="Search watches"/></form>
        <Link className="header-login-button" href="/login" aria-current={active === "login" ? "page" : undefined}>Login</Link>
      </div>
      <button className="search search-trigger mobile-search" onClick={() => { setMega(false); setOpen(true); }} aria-label="Search watches"><Search size={18}/></button>

      {mega && <div className="mega" role="region" aria-label="Shop collections">
        <p className="eyebrow" style={{ textAlign: "center" }}>Explore the collections</p>
        <div className="megalist">{collections.map(collection => {
          const representative = products.find(product => product.collection === collection && product.images[0]);
          const scene = collectionScenes[collection];
          return <Link key={collection} href={`/shop?collection=${encodeURIComponent(collection)}`}>
            {scene ? <img className="collection-lifestyle" src={scene} alt={`${collection} lifestyle scene`}/> : representative ? <img src={representative.images[0]} alt=""/> : <span className="mega-placeholder" aria-hidden="true">STACDIAL</span>}
            <span>{collection}</span>
          </Link>;
        })}</div>
        <div className="megafooter"><Link href="/shop" className="textlink">View all watches</Link></div>
      </div>}
    </header>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="search-dialog" style={{ maxWidth: 720, width: "calc(100% - 32px)", padding: 32 }}>
        <DialogTitle style={{ fontSize: 30, letterSpacing: "-.04em" }}>Find your watch.</DialogTitle>
        <DialogDescription>Search a watch name, detail or collection.</DialogDescription>
        <form action="/shop" className="search-field"><Search size={22}/><input autoFocus name="q" aria-label="Search watches and collections" placeholder="Start typing…" value={term} onChange={event => setTerm(event.target.value)}/></form>
        <div aria-live="polite" className="search-count">{needle ? `${results.length} watches found` : "Explore the collections"}</div>
        <div className="search-keywords">{collections.map(collection => <Link className="filter-chip" key={collection} href={`/shop?collection=${encodeURIComponent(collection)}`}>{collection}<ArrowUpRight size={14}/></Link>)}</div>
        <div className="search-results">{(needle ? results : products.filter(product => !product.demo)).slice(0, 6).map(product => <Link className="search-result" key={product.id} href={`/shop/${product.slug || product.id}`}>{product.images[0] && <img src={product.images[0]} alt=""/>}<span><strong>{product.name}</strong><small>{product.collection} · {money(product.price)}</small></span><ArrowUpRight size={18}/></Link>)}</div>
        {needle && !results.length && !collections.length && <p className="muted">No matches yet. Try a different name or collection.</p>}
        {needle && <Link className="textlink" href={`/shop?q=${encodeURIComponent(term)}`}>View all results</Link>}
      </DialogContent>
    </Dialog>
  </>;
}
