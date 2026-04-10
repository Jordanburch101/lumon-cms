import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "@/components/layout/shared/logo";
import { socialIconMap } from "@/components/layout/shared/social-icon-map";
import { CMSLink } from "@/components/ui/cms-link";
import type { Footer as FooterType } from "@/payload-types";
import { NewsletterForm } from "./newsletter-form";

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  data: FooterType;
}

export function Footer({ data }: FooterProps) {
  const currentYear = CURRENT_YEAR;

  return (
    <footer
      className="mt-16 border-t bg-background lg:mt-24"
      style={{ viewTransitionName: "site-footer" }}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Zone 1: Newsletter */}
        <div className="border-b py-6">
          <NewsletterForm />
        </div>

        {/* Zone 2: Link columns */}
        <div className="grid grid-cols-2 gap-6 py-8 lg:grid-cols-6">
          {/* Logo column */}
          <div className="col-span-2">
            <Logo data={data.logo ?? {}} />
            <p className="mt-1.5 text-muted-foreground text-xs">
              {data.tagline}
            </p>
            <div className="mt-3 flex gap-2">
              {(data.socialLinks ?? []).map((social) => {
                const icon = socialIconMap[social.platform];
                if (!icon) {
                  return null;
                }
                return (
                  <a
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href={social.url}
                    key={social.id ?? social.platform}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <HugeiconsIcon
                      className="size-4"
                      icon={icon}
                      strokeWidth={2}
                    />
                    <span className="sr-only">{social.platform}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {(data.columns ?? []).map((column) => (
            <div key={column.id ?? column.label}>
              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                {column.label}
              </h4>
              <ul className="mt-2 space-y-1.5">
                {(column.links ?? []).map((linkItem) => (
                  <li key={linkItem.id}>
                    <CMSLink
                      className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                      link={linkItem.link}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Zone 3: Legal */}
        <div className="flex flex-col items-center justify-between gap-4 border-t py-4 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {currentYear} {data.copyrightText ?? ""}. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            {(data.legalLinks ?? []).map((linkItem) => (
              <CMSLink
                className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                key={linkItem.id}
                link={linkItem.link}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
