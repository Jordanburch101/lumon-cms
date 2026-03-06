"use client";

import {
  Analytics01Icon,
  CheckmarkBadge01Icon,
  Mail01Icon,
  News01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const notifications = [
  {
    id: 1,
    title: "Traffic spike",
    desc: "Homepage visits up 340% since launch",
    icon: Analytics01Icon,
    time: "2m ago",
  },
  {
    id: 2,
    title: "Lead captured",
    desc: "New inquiry from Acme Corp",
    icon: Mail01Icon,
    time: "5m ago",
  },
  {
    id: 3,
    title: "Content published",
    desc: "Case study went live on /work",
    icon: News01Icon,
    time: "12m ago",
  },
  {
    id: 4,
    title: "Core Web Vitals",
    desc: "All green on mobile and desktop",
    icon: CheckmarkBadge01Icon,
    time: "18m ago",
  },
  {
    id: 5,
    title: "Gone live",
    desc: "acme-corp.com deployed to production",
    icon: Rocket01Icon,
    time: "24m ago",
  },
];

const INITIAL_DELAY = 400;
const STAGGER_DELAY = 620;

export function NotificationsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [visible, setVisible] = useState<typeof notifications>([]);
  const [newestId, setNewestId] = useState<number | null>(null);

  useEffect(() => {
    if (!inView) {
      return;
    }

    let i = 0;
    const initialTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i >= notifications.length) {
          clearInterval(interval);
          return;
        }
        const notification = notifications[i];
        i++;
        setNewestId(notification.id);
        setVisible((prev) => [notification, ...prev]);
      }, STAGGER_DELAY);

      return () => clearInterval(interval);
    }, INITIAL_DELAY);

    return () => clearTimeout(initialTimeout);
  }, [inView]);

  // Clear the highlight after it animates
  useEffect(() => {
    if (newestId === null) {
      return;
    }
    const timeout = setTimeout(() => setNewestId(null), 600);
    return () => clearTimeout(timeout);
  }, [newestId]);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-background p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      ref={ref}
    >
      <span className="mb-3 text-[11px] text-muted-foreground uppercase tracking-wider">
        Notifications
      </span>
      <div className="relative flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {visible.map((n) => (
            <motion.div
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              className="relative flex items-start gap-2.5 rounded-lg border border-border/40 px-2.5 py-1.5"
              exit={{
                opacity: 0,
                scale: 0.98,
                filter: "blur(2px)",
                transition: { duration: 0.2 },
              }}
              initial={{
                opacity: 0,
                y: -12,
                scale: 0.96,
                filter: "blur(3px)",
              }}
              key={n.id}
              layout="position"
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
                mass: 0.8,
                filter: { type: "tween", duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                layout: {
                  type: "spring",
                  stiffness: 400,
                  damping: 32,
                },
              }}
            >
              {/* Highlight pulse on newest item */}
              {n.id === newestId && (
                <motion.div
                  animate={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-lg bg-foreground/[0.03]"
                  initial={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary">
                <HugeiconsIcon
                  className="text-foreground/70"
                  icon={n.icon}
                  size={12}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-foreground text-xs">
                    {n.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground/60">
                    {n.time}
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {n.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bottom fade mask — implies more content */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
      </div>
    </div>
  );
}
