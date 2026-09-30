"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/catalog";
import { money } from "@/lib/catalog";

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [photo, setPhoto] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ reference: string; message: string } | null>(null);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    let key = sessionStorage.getItem(`preorder-${product.id}`);
    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem(`preorder-${product.id}`, key);
    }
    try {
      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productId: product.id, requestKey: key }),
      });
      const payload = await response.json() as { error?: string; reference?: string; message?: string };
      if (!response.ok || !payload.reference) throw Error(payload.error || "Unable to register your interest");
      sessionStorage.removeItem(`preorder-${product.id}`);
      setResult({
        reference: payload.reference,
        message: payload.message || "Your interest has been registered. We will contact you shortly with the details.",
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to register your interest");
    } finally {
      setBusy(false);
    }
  }

  const specifications = [
    ["Reference", product.modelReference || product.sku],
    ["Movement", product.movementType],
    ["Case", product.caseMaterial],
    ["Diameter", product.caseDiameter],
    ["Thickness", product.caseThickness],
    ["Bracelet", product.braceletMaterial],
    ["Dial", product.dialColour],
    ["Crystal", product.crystalMaterial],
    ["Water resistance", product.waterResistance],
    ["Power reserve", product.powerReserve],
  ].filter(([, value]) => value);

  return <main>
    <section className="premium-pdp">
      <div className="pdp-gallery">
        <img src={product.images[photo]} alt={`${product.name}, view ${photo + 1}`} />
        {product.images.length > 1 && <div className="thumbs">{product.images.map((src, index) =>
          <button key={`${src}-${index}`} aria-label={`View image ${index + 1}`} aria-pressed={photo === index} onClick={() => setPhoto(index)}><img src={src} alt="" /></button>
        )}</div>}
      </div>
      <div className="pdp-summary">
        <span className="eyebrow muted">{product.collection}</span><h1>{product.name}</h1>
        {product.modelReference && <p className="muted">Reference {product.modelReference}</p>}
        <div className="pricebig">{product.currency || "LKR"} {money(product.price).replace("LKR ", "")}</div>
        <span className="availability">{product.availabilityStatus === "in_stock" ? "Available" : product.availabilityStatus === "out_of_stock" ? "Unavailable" : "Interest registrations open"}</span>
        <p className="pdp-lead">{product.description}</p>
        <button className="pill preorder-button" disabled={product.demo || product.availabilityStatus === "out_of_stock"} onClick={() => setOpen(true)}>{product.demo ? "Preview only" : "Register your interest"}</button>
        <small>{product.demo ? "This sample demonstrates the reusable product page. Add a product in the admin to accept interest registrations." : "Registering your interest is not a purchase or payment commitment."}</small>
      </div>
    </section>
    <section className="pdp-information">
      <article><span className="eyebrow muted">The timepiece</span><h2>Crafted in detail.</h2><p>{product.fullDescription || product.specs}</p></article>
      <div className="spec-card">{specifications.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    </section>
    <section className="pdp-service">
      <article><h3>Shipping</h3><p>{product.shipping || "Delivery details are confirmed personally when we contact you."}</p></article>
      <article><h3>Warranty</h3><p>{product.warranty || "Warranty terms are confirmed with your order."}</p></article>
      <article><h3>Care</h3><p>{product.care || "Care guidance is provided with your timepiece."}</p></article>
    </section>
    {related.length > 0 && <section className="section"><div className="sectionhead"><h2>You may also appreciate.</h2></div><div className="related-watch-grid">{related.map(item => <Link className="related-watch-card" href={`/shop/${item.slug || item.id}`} key={item.id}><div><span className="eyebrow muted">{item.collection}</span><h3>{item.name}</h3><p>{money(item.price)}</p></div><img src={item.images[0]} alt={item.name} /></Link>)}</div></section>}
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) { setError(""); setResult(null); } }}>
      <DialogContent className="preorder-dialog">
        <DialogTitle>Your timepiece inquiry.</DialogTitle>
        <DialogDescription>Leave your details and a dedicated member of our team will be in touch shortly to answer any and all of your questions.</DialogDescription>
        <div className="preorder-summary inquiry-watch" aria-label="Selected timepiece"><img src={product.images[0]} alt="" /><div><span className="eyebrow muted">Selected watch</span><strong>{product.name}</strong><small>{product.modelReference || product.sku || product.collection}</small><small>{[product.caseDiameter, product.movementType].filter(Boolean).join(", ")}</small></div></div>
        {result ? <div className="notice" role="status"><h3>Interest registered.</h3><p>{result.message}</p><strong>Reference: {result.reference}</strong></div> : <form className="form" onSubmit={submit}>
          <h3 className="inquiry-contact-title">Contact information</h3>
          <div className="split"><label>First name<input name="firstName" required maxLength={60} autoComplete="given-name" /></label><label>Last name<input name="lastName" required maxLength={60} autoComplete="family-name" /></label></div>
          <label>Email address<input name="email" required maxLength={254} type="email" autoComplete="email" /></label>
          <label>Phone number<input name="phone" required minLength={9} maxLength={30} type="tel" autoComplete="tel" /></label>
          <fieldset className="contact-preference"><legend>How would you prefer us to contact you?</legend><label><input name="contactPreference" value="email" type="radio" required /> Email</label><label><input name="contactPreference" value="phone" type="radio" /> Phone</label><label><input name="contactPreference" value="either" type="radio" /> Either</label></fieldset>
          <label>Questions or message <span className="muted">Optional</span><textarea name="note" maxLength={1000} /></label>
          {error && <p role="alert" className="error">{error}</p>}
          <button className="pill" disabled={busy}>{busy ? "Submitting…" : "Register my interest"}</button>
        </form>}
      </DialogContent>
    </Dialog>
  </main>;
}
