"use client";

import { motion, useInView } from "motion/react";
import { type FormEvent, useRef, useState } from "react";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { cn } from "@/core/lib/utils";
import { authClient } from "@/lib/auth/client";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LoginPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const inView = useInView(formRef, { once: true, margin: "-50px" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
    } else {
      window.location.href = "/admin";
    }

    setLoading(false);
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email address first");
      return;
    }

    setLoading(true);
    setError("");

    const result = await authClient.signIn.magicLink({ email });

    if (result.error) {
      setError(result.error.message ?? "Magic link failed");
    } else {
      setMagicLinkSent(true);
    }

    setLoading(false);
  }

  const fieldVariants = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView
      ? {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE, delay: 0.1 + i * 0.05 },
        }
      : {},
  });

  const inputClassName = cn(
    "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-foreground text-sm",
    "placeholder:text-muted-foreground/50",
    "focus:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring/20",
    "transition-all duration-200"
  );

  return (
    <AuthLayout>
      <div ref={formRef}>
        {/* Eyebrow */}
        <motion.p
          {...fieldVariants(0)}
          className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]"
        >
          Welcome back
        </motion.p>

        {/* Heading */}
        <motion.h1
          {...fieldVariants(1)}
          className="mt-3 font-semibold text-3xl tracking-tight"
        >
          Sign in to your account
        </motion.h1>

        {magicLinkSent ? (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-muted-foreground text-sm"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Check your email for a magic link
          </motion.p>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSignIn}>
            {/* Email */}
            <motion.div {...fieldVariants(2)}>
              <label
                className="mb-1.5 block font-medium text-[13px]"
                htmlFor="email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                className={inputClassName}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@lumon.industries"
                type="email"
                value={email}
              />
            </motion.div>

            {/* Password */}
            <motion.div {...fieldVariants(3)}>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="font-medium text-[13px]" htmlFor="password">
                  Password
                </label>
                <a
                  className="text-[12px] text-muted-foreground"
                  href="/forgot-password"
                >
                  Forgot?
                </a>
              </div>
              <input
                autoComplete="current-password"
                className={inputClassName}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                value={password}
              />
            </motion.div>

            {/* Sign In button */}
            <motion.div {...fieldVariants(4)}>
              <button
                className={cn(
                  "h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground text-sm",
                  "transition-all duration-200",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={loading}
                type="submit"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div
              {...fieldVariants(5)}
              className="relative flex items-center gap-4 py-1"
            >
              <motion.div
                animate={inView ? { scaleX: 1 } : {}}
                className="h-px flex-1 origin-right bg-border"
                initial={{ scaleX: 0 }}
                transition={{
                  duration: 0.8,
                  ease: EASE,
                  delay: 0.1 + 5 * 0.05,
                }}
              />
              <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">
                or
              </span>
              <motion.div
                animate={inView ? { scaleX: 1 } : {}}
                className="h-px flex-1 origin-left bg-border"
                initial={{ scaleX: 0 }}
                transition={{
                  duration: 0.8,
                  ease: EASE,
                  delay: 0.1 + 5 * 0.05,
                }}
              />
            </motion.div>

            {/* Magic Link button */}
            <motion.div {...fieldVariants(6)}>
              <button
                className={cn(
                  "flex items-center justify-center gap-2",
                  "h-11 w-full rounded-lg border border-border bg-background text-sm",
                  "transition-all duration-200",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={loading}
                onClick={handleMagicLink}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <rect height="16" rx="2" width="20" x="2" y="4" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
                Sign in with Magic Link
              </button>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm"
                initial={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {error}
              </motion.p>
            )}

            {/* Footer */}
            <motion.p
              {...fieldVariants(7)}
              className="pt-2 text-center text-muted-foreground text-sm"
            >
              Don&apos;t have an account?{" "}
              <a
                className="font-medium text-foreground underline decoration-border underline-offset-4"
                href="/register"
              >
                Request access
              </a>
            </motion.p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
