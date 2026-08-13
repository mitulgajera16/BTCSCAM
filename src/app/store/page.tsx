import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Store",
  description:
    "Products made by the people who run BTCSCAM — metal backups for your seed phrase, and a way to leave your Bitcoin to your family. Every link goes to the maker's own page. No paid listings, no ads, no checkout on this site.",
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
      "A working door hinge with five-sided titanium beads on the pin — your full 12-word seed phrase hanging in plain sight, engraved on metal that survives fire and flood.",
    price: "$99",
    priceNote: "FOR 12 WORDS · 24-WORD VERSION $179, MAKER SAYS COMING SOON",
    url: "https://www.keepcrypt.com/hinge",
    domain: "KEEPCRYPT.COM",
  },
  {
    kicker: "SEED STORAGE · KEEPCRYPT",
    name: "Keepcrypt Cell",
    description:
      "Titanium word beads sealed inside a stainless-steel AAA battery shell, one seed word per bead. Your backup sits in a drawer of dead batteries instead of a box with a crypto logo on it.",
    price: "$149",
    priceNote: "FOR 12 WORDS · 24-WORD VERSION $219, MAKER SAYS COMING SOON",
    url: "https://www.keepcrypt.com/cell",
    domain: "KEEPCRYPT.COM",
  },
  {
    kicker: "SEED STORAGE · KEEPCRYPT",
    name: "Keepcrypt Screw",
    description:
      "An M10 stainless-steel screw holding titanium word beads — the first four letters of each word on four faces, and a notch on the fifth to keep the words in order. Five words per screw. Ships in plain packaging with nothing on the outside.",
    price: "$199",
    priceNote: "FOR 12 WORDS · $299 FOR 24 WORDS",
    url: "https://www.keepcrypt.com/screw",
    domain: "KEEPCRYPT.COM",
  },
  {
    kicker: "INHERITANCE · SERVICE",
    name: "Bitwill",
    description:
      "A way to leave your Bitcoin to your family. It uses transactions signed in advance, so the people you name can claim the coins without Bitwill — or anyone else — ever holding your keys. Running since 2018.",
    priceNote: "NO PRICE LISTED — THEIR PAGE SAYS IT IS AGREED IN A CONSULTATION",
    url: "https://www.bitwill.com/",
    domain: "BITWILL.COM",
  },
];

const IN_PREPARATION: Product[] = [
  {
    kicker: "SEED STORAGE · PAPER",
    name: "SeedBook",
    description:
      "Something physical to keep your seed words on, along with instructions for whoever inherits your Bitcoin. Details and price are not published yet. When it is real and for sale, it will be listed here with a link — not before.",
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
            NOT FINISHED — NOT FOR SALE YET
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
            We make these products ourselves — the same people who run BTCSCAM.
            We say so up front, because{" "}
            <Link href="/standards" style={{ fontWeight: 700, color: "var(--link)" }}>
              our standards
            </Link>{" "}
            require it: we take no paid listings and sell no ads. This store is
            the only place we sell anything on this site.
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
          OUR OWN PRODUCTS · EVERY LINK LEAVES THIS SITE
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
          A list of the products the founder of this site makes. There is no
          cart and no checkout here — every link below leaves this site and
          lands on the maker&rsquo;s own page, where the purchase actually
          happens.
        </p>

        <SectionRule label="WHY A STORE ON AN ANTI-SCAM SITE" />
        <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16, maxWidth: "68ch" }}>
          This site tells you, case file after case file, to do two things:
          keep your seed phrase — the 12 or 24 secret words that control your
          Bitcoin — on something physical that survives fire and time, and
          leave instructions so your Bitcoin does not die with you. These
          products do those two things, and the people who run this site build
          them, so what we sell is what we tell you to do. There is a second
          reason to buy straight from the maker: fake devices. Tampered
          hardware wallets — the small devices that hold your Bitcoin keys
          offline — and counterfeit backup gear sold by outside sellers on big
          marketplaces are a common way people lose everything. The device
          arrives with the seed words already set by the thief, or the box was
          swapped in a warehouse. Buying from the maker&rsquo;s own page cuts
          out the middleman who could tamper with it.
        </p>

        <SectionRule label="WHAT WE SELL" />
        <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 12 }}>
          PRICES AS SHOWN ON THE MAKER&rsquo;S OWN PAGES · CHECKED 2026-08-08 ·
          NO CHECKOUT ON THIS SITE
        </p>
        {CATALOG.map((p) => (
          <ProductRow key={p.name} product={p} />
        ))}

        <SectionRule label="NOT FINISHED YET" />
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
          NOTHING ELSE IS FOR SALE HERE. WE DO NOT LIST ANYONE ELSE&rsquo;S
          PRODUCTS, PAID OR NOT. IF A PRODUCT ABOVE HAS NO LINK, IT IS NOT REAL
          ENOUGH TO SELL YET — AND WE SAY SO.
        </p>
      </div>
    </main>
  );
}
