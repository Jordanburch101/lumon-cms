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

export function NotificationsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [visible, setVisible] = useState<typeof notifications>([]);

  useEffect(() => {
    if (!inView) {
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i >= notifications.length) {
        clearInterval(interval);
        return;
      }
      const notification = notifications[i];
      i++;
      setVisible((prev) => [notification, ...prev]);
    }, 800);

    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-background p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      ref={ref}
    >
      <span className="mb-3 text-[11px] text-muted-foreground uppercase tracking-wider">
        Notifications
      </span>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {visible.map((n) => (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              className="flex items-start gap-2.5 rounded-md border border-border/40 px-2.5 py-1.5"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
              key={n.id}
              layout
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
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
      </div>
    </div>
  );
}
