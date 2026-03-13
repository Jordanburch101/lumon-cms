"use client";

import {
  Add01Icon,
  ArrowUpRight01Icon,
  DashboardSquare01Icon,
  Edit02Icon,
  GridIcon,
  PencilEdit02Icon,
  TimeSetting01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

import { STATUS_COLORS } from "./admin-bar-data";
import type { MergedCollectionMeta, StaticCommand } from "./admin-command-data";

// --- Types ---

interface CollectionResultDoc {
  id: string | number;
  [key: string]: unknown;
}

interface CollectionResultGroupProps {
  docs: CollectionResultDoc[];
  isFirst: boolean;
  meta: MergedCollectionMeta;
  onSelect: (collectionSlug: string, docId: string | number) => void;
}

interface CommandResultGroupProps {
  commands: StaticCommand[];
  isFirst: boolean;
  onSelect: (command: StaticCommand) => void;
}

// --- Helpers ---

function getStatusColor(status: unknown): string {
  if (status === "published") {
    return STATUS_COLORS.published;
  }
  if (status === "draft") {
    return STATUS_COLORS.draft;
  }
  return STATUS_COLORS["unpublished-changes"];
}

function getThumbnailUrl(doc: CollectionResultDoc): string | null {
  if (
    typeof doc.sizes !== "object" ||
    doc.sizes === null ||
    !("thumbnail" in doc.sizes)
  ) {
    return null;
  }
  const thumb = (doc.sizes as Record<string, Record<string, unknown>>)
    .thumbnail;
  return typeof thumb?.url === "string" ? thumb.url : null;
}

const COMMAND_ICONS: Record<string, typeof Add01Icon> = {
  "create-page": Add01Icon,
  "edit-current": PencilEdit02Icon,
  "go-collections": GridIcon,
  "go-dashboard": DashboardSquare01Icon,
  "toggle-draft": Edit02Icon,
  "view-versions": TimeSetting01Icon,
};

// --- Collection Result Group ---

export function CollectionResultGroup({
  docs,
  isFirst,
  meta,
  onSelect,
}: CollectionResultGroupProps) {
  if (docs.length === 0) {
    return null;
  }

  return (
    <>
      {!isFirst && <CommandSeparator />}
      <CommandGroup heading={meta.label}>
        {docs.map((doc) => (
          <CommandItem
            key={`${meta.slug}-${doc.id}`}
            onSelect={() => onSelect(meta.slug, doc.id)}
            value={`${meta.slug}-${doc.id}`}
          >
            <div className="flex w-full items-center gap-2">
              {/* Status dot for versioned collections */}
              {meta.hasVersions && (
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getStatusColor(doc._status) }}
                />
              )}

              {/* Thumbnail for upload collections */}
              {meta.showThumbnail &&
                meta.isUpload &&
                (() => {
                  const thumbUrl = getThumbnailUrl(doc);
                  const blur =
                    (typeof doc.blurDataURL === "string" && doc.blurDataURL) ||
                    undefined;
                  return (
                    <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                      {thumbUrl ? (
                        <Image
                          alt=""
                          blurDataURL={blur}
                          className="size-full object-cover"
                          height={24}
                          placeholder={blur ? "blur" : "empty"}
                          src={thumbUrl}
                          width={24}
                        />
                      ) : (
                        <span className="text-[8px] text-muted-foreground">
                          FILE
                        </span>
                      )}
                    </div>
                  );
                })()}

              {/* Title */}
              <span className="truncate">
                {String(doc[meta.titleField] ?? doc.id)}
              </span>

              {/* Subtitle (right-aligned) */}
              {meta.subtitleField != null &&
                doc[meta.subtitleField] != null && (
                  <span className="ml-auto truncate text-muted-foreground text-xs">
                    {String(doc[meta.subtitleField])}
                  </span>
                )}

              {/* MIME type for uploads without subtitle override */}
              {!meta.subtitleField &&
                meta.isUpload &&
                typeof doc.mimeType === "string" && (
                  <span className="ml-auto text-muted-foreground text-xs">
                    {doc.mimeType}
                  </span>
                )}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

// --- Command Result Group ---

export function CommandResultGroup({
  commands,
  isFirst,
  onSelect,
}: CommandResultGroupProps) {
  if (commands.length === 0) {
    return null;
  }

  return (
    <>
      {!isFirst && <CommandSeparator />}
      <CommandGroup heading="Commands">
        {commands.map((cmd) => {
          const icon = COMMAND_ICONS[cmd.id] ?? ArrowUpRight01Icon;
          return (
            <CommandItem
              key={cmd.id}
              onSelect={() => onSelect(cmd)}
              value={cmd.id}
            >
              <div className="flex w-full items-center gap-2">
                <HugeiconsIcon
                  className="text-muted-foreground"
                  icon={icon}
                  size={14}
                />
                <span>{cmd.label}</span>
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {cmd.badge}
                </span>
              </div>
            </CommandItem>
          );
        })}
      </CommandGroup>
    </>
  );
}
