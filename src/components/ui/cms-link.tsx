// src/components/ui/cms-link.tsx
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/core/lib/utils'

// --- Types ---

interface CMSLinkData {
  type?: 'internal' | 'external' | null
  label?: string | null
  url?: string | null
  reference?: {
    slug?: string | null
    value?: string | number | { slug?: string | null; path?: string | null } | null
    relationTo?: string
  } | null
  newTab?: boolean | null
  appearanceType?: 'button' | 'link' | null
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | null
  buttonSize?: 'xs' | 'sm' | 'default' | 'lg' | null
  linkVariant?: 'plain' | 'underline' | 'arrow' | null
}

interface CMSLinkProps {
  link?: CMSLinkData | null
  className?: string
  children?: ReactNode
  [key: `data-${string}`]: string | undefined
}

// --- Helpers ---

const linkVariantClasses: Record<string, string> = {
  plain: '',
  underline: 'underline underline-offset-4',
  arrow: 'group inline-flex items-center gap-2',
}

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://placeholder.com')
    return SAFE_PROTOCOLS.has(parsed.protocol)
  } catch {
    return false
  }
}

function resolveHref(link: CMSLinkData): string | null {
  if (link.type === 'internal') {
    const ref = link.reference
    if (!ref) return null
    if (typeof ref.value !== 'object' || ref.value === null) return null
    const path = ref.value.path ?? ref.value.slug
    if (path === undefined || path === null) return null
    return !path || path === '' ? '/' : `/${path}`
  }
  const url = link.url ?? null
  if (url && !isSafeUrl(url)) return null
  return url
}

// --- Component ---

export function CMSLink({ link, className, children, ...rest }: CMSLinkProps) {
  if (!link) return null

  const href = resolveHref(link)
  if (!href) return null

  const content = children ?? link.label
  if (!content) return null

  const isInternal = link.type === 'internal'
  const isNewTab = link.newTab === true

  // Build common props
  const linkProps: Record<string, unknown> = {}
  if (isNewTab) {
    linkProps.target = '_blank'
    linkProps.rel = 'noopener noreferrer'
  }

  // Determine the inner element
  const LinkEl = isInternal && !isNewTab ? Link : 'a'
  const hrefProp = { href }

  // --- Button appearance ---
  if (link.appearanceType === 'button') {
    return (
      <Button
        asChild
        className={className}
        size={link.buttonSize ?? 'default'}
        variant={link.buttonVariant ?? 'default'}
      >
        <LinkEl {...hrefProp} {...linkProps} {...rest}>
          {content}
        </LinkEl>
      </Button>
    )
  }

  // --- Link appearance ---
  if (link.appearanceType === 'link') {
    const variantClass = linkVariantClasses[link.linkVariant ?? 'plain'] ?? ''
    return (
      <LinkEl
        className={cn(
          'font-medium text-sm transition-colors hover:text-foreground/70',
          variantClass,
          className,
        )}
        {...hrefProp}
        {...linkProps}
        {...rest}
      >
        {content}
        {link.linkVariant === 'arrow' && (
          <HugeiconsIcon
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            icon={ArrowRight01Icon}
          />
        )}
      </LinkEl>
    )
  }

  // --- No appearance (plain link) ---
  return (
    <LinkEl className={className} {...hrefProp} {...linkProps} {...rest}>
      {content}
    </LinkEl>
  )
}
