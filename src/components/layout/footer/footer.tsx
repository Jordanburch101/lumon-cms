import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { footerColumns, legalLinks, socialLinks } from "./footer-data";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Zone 1: Newsletter */}
        <div className="border-b py-6">
          <NewsletterForm />
        </div>

        {/* Zone 2: Link columns */}
        <div className="grid grid-cols-2 gap-6 py-8 lg:grid-cols-6">
          {/* Logo column */}
          <div className="col-span-2">
            <Link className="inline-block" href="/">
              <span className="font-semibold text-base tracking-tight">
                Lumon
                <span className="text-muted-foreground">Payload</span>
              </span>
            </Link>
            <p className="mt-1.5 text-muted-foreground text-xs">
              Next.js + Payload CMS template and component showcase.
            </p>
            <div className="mt-3 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href={social.href}
                  key={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon
                    className="size-4"
                    icon={social.icon}
                    strokeWidth={2}
                  />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                {column.title}
              </h4>
              <ul className="mt-2 space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                      href={link.href}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Zone 3: Legal */}
        <div className="flex flex-col items-center justify-between gap-4 border-t py-4 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {currentYear} Lumon Industries. All rights reserved.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link
                className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
