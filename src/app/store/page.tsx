import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Store",
  description:
    "House products from the people who run BTCSCAM — physical seed storage and Bitcoin inheritance, sold by link-out only. No paid listings, no ads, no on-site checkout.",
  alternates: { canonical: "/store" },
};

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

/* Verified 2026-08-08 by opening each product page. Prices are quoted only
   where the maker's page states them. Products without a live, verifiable
   page carry no link and no price — editorial law, same as the registry. */
type Product = {
  kicker: string;
  name: string;
  description: string;
  price?: string;
  priceNote?: string;
  url?: string;
  domain?: string;
};

const CATALOG: Product[] = [
  {
    kicker: "SEED STORAGE · KEEPCRYPT",
    name: "Keepcrypt Hinge",
    description:
      "A working door hinge with pentagon titanium beads on the pin — a full 12-word BIP39 phrase hanging in plain sight, engraved on metal that survives fire and flood.",
    price: "$99",
    priceNote: "12-WORD · 24-WORD $179 LISTED COMING SOON",
    url: "https://www.keepcrypt.com/hinge",
    domain: "KEEPCRYPT.COM",
  },
  {
    kicker: "SEED STORAGE · KEEPCRYPT",
    name: "Keepcrypt Cell",
    description:
      "Titanium word beads sealed inside a stainless-steel AAA battery shell, one BIP39 word per bead. Your backup sits in a drawer of dead batteries, not a branded crypto box.",
    price: "$149",
    priceNote: "12-WORD PACK · 24-WORD $219 LISTED COMING SOON",
    url: "https://www.keepcrypt.com/cell",
    domain: "KEEPCRYPT.COM",
  },
  {
    kicker: "SEED STORAGE · KEEPCRYPT",
    name: "Keepcrypt Screw",
    description:
      "An M10 stainless fastener holding titanium word beads — first four letters on four faces, sequence notch on the fifth. Five words per screw. Ships unmarked.",
    price: "$199",
    priceNote: "12-WORD · $299 24-WORD",
    url: "https://www.keepcrypt.com/screw",
    domain: "KEEPCRYPT.COM",
  },
  {
    kicker: "INHERITANCE · SERVICE",
    name: "Bitwill",
    description:
      "Non-custodial Bitcoin inheritance built on pre-signed transactions — heirs can recover funds without Bitwill or anyone else ever holding your keys. Operating since 2018.",
    priceNote: "NO LISTED PRICE — SET AT CONSULTATION, PER THEIR PAGE",
    url: "https://www.bitwill.com/",
    domain: "BITWILL.COM",
  },
];

const IN_PREPARATION: Product[] = [
  {
    kicker: "SEED STORAGE · PAPER",
    name: "SeedBook",
    description:
      "A physical record for seed storage and inheritance instructions. Details and pricing are not yet published. When it is real and for sale, it will be listed here with a link — not before.",
  },
];

function SectionRule({ label }: { label: string }) {
  return (
    <h2
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: "var(--ink)",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 8,
        marginTop: 48,
      }}
    >
      {label}
    </h2>
  );
}

function ProductRow({ product }: { product: Product }) {
  const live = Boolean(product.url);
  return (
    <article
      style={{
        /* Flex-wrap, not "1fr auto" grid: the long mono priceNote strings
           would otherwise crush the description column at phone widths.
           Same pattern as the registry index rows. */
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 16px",
        padding: "24px 0",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div style={{ flex: "1 1 360px", minWidth: 0 }}>
        <p
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            margin: 0,
          }}
        >
          {product.kicker}
        </p>
        <h3 style={{ ...display, fontSize: 24, lineHeight: 1.25, margin: "8px 0 0" }}>
          {product.name}
        </h3>
        <p
          style={{
            fontSize: 16,
            color: "var(--meta)",
            lineHeight: 1.5,
            marginTop: 8,
            marginBottom: 0,
            maxWidth: "58ch",
          }}
        >
          {product.description}
        </p>
        {!live && (
          <span
            style={{
              ...mono,
              display: "inline-block",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              padding: "2px 8px",
              marginTop: 12,
              border: "1px solid var(--rule)",
              color: "var(--meta)",
            }}
          >
            IN PREPARATION — NOT YET FOR SALE
          </span>
        )}
      </div>
      {live && (
        <div
          style={{
            ...mono,
            fontSize: 12,
            textAlign: "right",
            color: "var(--meta)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
            marginLeft: "auto",
            maxWidth: "24ch",
          }}
        >
          {product.price && (
            <span style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>
              {product.price}
            </span>
          )}
          {product.priceNote && <span>{product.priceNote}</span>}
          <a
            href={product.url}
            rel="noopener"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            VIEW AT {product.domain} →
          </a>
        </div>
      )}
    </article>
  );
}

export default function StorePage() {
  return (
    <main>
      {/* Disclosure banner — mandatory, always first */}
      <div style={{ background: "var(--warm)", borderBottom: "1px solid var(--rule)" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "2px 8px",
            }}
          >
            DISCLOSURE
          </span>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, flex: 1, minWidth: 260 }}>
            House products, made by the people who run BTCSCAM. Disclosed per{" "}
            <Link href="/standards" style={{ fontWeight: 700, color: "var(--link)" }}>
              our standards
            </Link>
            : we take no paid listings and sell no ads. This store is the only
            commerce on this site.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
          <Link href="/">← FRONT PAGE</Link>
          <span style={{ color: "var(--meta)" }}> / THE STORE</span>
        </nav>

        <p
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            margin: "24px 0 0",
          }}
        >
          COMMERCE · DISCLOSED · LINK-OUT ONLY
        </p>
        <h1
          style={{
            ...display,
            fontSize: "clamp(32px, 6vw, 40px)",
            lineHeight: 1.2,
            margin: "8px 0 0",
          }}
        >
          The Store
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 16, maxWidth: "62ch" }}>
          A catalog of the house products this paper&rsquo;s founder makes.
          There is no cart and no checkout here — every link below leaves this
          site and lands on the maker&rsquo;s own page, where the purchase
          actually happens.
        </p>

        <SectionRule label="WHY A STORE ON AN ANTI-SCAM SITE" />
        <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16, maxWidth: "68ch" }}>
          This paper tells you, dossier after dossier, to do two things: keep
          your seed words on something physical that survives fire and time,
          and leave instructions so your Bitcoin does not die with you.
          Physical seed storage and inheritance planning are those two things —
          built by the people who run this site, so the practice we preach is
          the practice we sell. There is a second reason to buy direct: the
          fake-device scam category. Tampered hardware wallets and counterfeit
          backup gear sold through third-party marketplace sellers are a
          recurring way people lose everything — a device that ships with a
          pre-generated seed, packaging swapped in a warehouse. Buying from the
          maker&rsquo;s own page removes the middleman who could tamper.
        </p>

        <SectionRule label="THE CATALOG" />
        <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 12 }}>
          PRICES AS STATED ON THE MAKER&rsquo;S PAGES · CHECKED 2026-08-08 · NO
          CHECKOUT ON THIS SITE
        </p>
        {CATALOG.map((p) => (
          <ProductRow key={p.name} product={p} />
        ))}

        <SectionRule label="IN PREPARATION" />
        {IN_PREPARATION.map((p) => (
          <ProductRow key={p.name} product={p} />
        ))}

        <p
          style={{
            ...mono,
            fontSize: 12,
            color: "var(--meta)",
            marginTop: 32,
            lineHeight: 1.6,
          }}
        >
          NOTHING ELSE IS FOR SALE. NO THIRD-PARTY LISTINGS, PAID OR OTHERWISE.
          IF A PRODUCT ABOVE HAS NO LINK, IT IS NOT YET REAL ENOUGH TO SELL —
          AND WE SAY SO.
        </p>
      </div>
    </main>
  );
}
