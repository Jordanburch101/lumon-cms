"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { TeamBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;
type TeamMember = TeamBlock["members"][number];

interface TeamCardProps {
  index: number;
  inView: boolean;
  isCompact: boolean;
  member: TeamMember;
}

export function TeamCard({ index, inView, isCompact, member }: TeamCardProps) {
  const photoUrl = getMediaUrl(member.photo);
  const blurData = getBlurDataURL(member.photo);
  const badge = `LU-${String(index + 1).padStart(3, "0")}`;

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="group relative overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border"
      data-array-item={`members.${String(index)}`}
      initial={{ opacity: 0, y: 24 }}
      transition={{
        duration: 0.6,
        ease: EASE,
        delay: 0.1 + index * 0.08,
      }}
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {photoUrl ? (
          <motion.div
            animate={inView ? { clipPath: "inset(0 0 0 0)" } : {}}
            className="h-full w-full"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: 0.15 + index * 0.08,
            }}
          >
            <Image
              alt={member.name}
              blurDataURL={blurData}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
              data-field={`members.${String(index)}.photo`}
              fill
              placeholder={blurData ? "blur" : "empty"}
              sizes="(max-width: 768px) 50vw, 25vw"
              src={photoUrl}
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              aria-hidden="true"
              className="h-20 w-20 text-muted-foreground/20"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
            >
              <title>No photo available</title>
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}

        {/* ID Badge */}
        <div className="absolute right-2 bottom-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] text-white backdrop-blur-sm">
          {badge}
        </div>
      </div>

      {/* Info */}
      <div className={`space-y-2 ${isCompact ? "p-3" : "p-4"}`}>
        <p
          className="font-semibold text-[0.9375rem] text-foreground"
          data-field={`members.${String(index)}.name`}
        >
          {member.name}
        </p>
        <p
          className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
          data-field={`members.${String(index)}.role`}
        >
          {member.role}
        </p>

        {/* Detailed-only fields */}
        {!isCompact && (
          <>
            {member.department && (
              <motion.div
                animate={inView ? { opacity: 1 } : {}}
                initial={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.4 + index * 0.08,
                }}
              >
                <span
                  className="inline-block rounded-[3px] border border-primary/15 bg-primary/8 px-2.5 py-0.5 font-mono text-[9px] text-foreground uppercase tracking-[0.15em]"
                  data-field={`members.${String(index)}.department`}
                >
                  {member.department}
                </span>
              </motion.div>
            )}

            {member.bio && (
              <p
                className="text-muted-foreground text-sm"
                data-field={`members.${String(index)}.bio`}
              >
                {member.bio}
              </p>
            )}

            {member.links && member.links.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {member.links.map((link, li) => (
                  <a
                    className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em] transition-colors hover:text-foreground"
                    data-array-item={`members.${String(index)}.links.${String(li)}`}
                    href={link.url}
                    key={link.id}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.platform ?? "Link"}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
