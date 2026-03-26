"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/payload/lib/auth/client";
import { EASE, fieldVariants, Spinner } from "./auth-constants";

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
      setLoading(false);
      return;
    }

    // If 2FA is required, the twoFactorClient plugin handles the redirect
    // via onTwoFactorRedirect. Check if the response indicates 2FA.
    const data = result.data as Record<string, unknown> | null;
    if (data?.twoFactorRedirect) {
      window.location.href = "/two-factor";
      return;
    }

    // Also log in via Payload's JWT endpoint to get a payload-token cookie
    // with a valid session ID. Without this, refresh-token fails in the admin.
    try {
      await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
    } catch {
      // Best-effort — admin will still work via BA strategy
    }

    window.location.href = "/admin";
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

  const inputClassName =
    "h-11 rounded-lg px-3.5 text-sm placeholder:text-muted-foreground/50";

  return (
    <AuthLayout>
      <div ref={formRef}>
        {/* Eyebrow */}
        <motion.p
          {...fieldVariants(0, inView)}
          className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]"
        >
          Welcome back
        </motion.p>

        {/* Heading */}
        <motion.h1
          {...fieldVariants(1, inView)}
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
            <motion.div {...fieldVariants(2, inView)}>
              <Label className="mb-1.5 text-[13px]" htmlFor="email">
                Email
              </Label>
              <Input
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
            <motion.div {...fieldVariants(3, inView)}>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-[13px]" htmlFor="password">
                  Password
                </Label>
                <Link
                  className="text-[12px] text-muted-foreground"
                  href="/forgot-password"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                autoComplete="current-password"
                className={inputClassName}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                value={password}
              />
            </motion.div>

            {/* Sign In button */}
            <motion.div {...fieldVariants(4, inView)}>
              <Button
                className="h-11 w-full rounded-lg font-semibold text-sm"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Signing in
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div
              {...fieldVariants(5, inView)}
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
            <motion.div {...fieldVariants(6, inView)}>
              <Button
                className="h-11 w-full rounded-lg text-sm"
                disabled={loading}
                onClick={handleMagicLink}
                type="button"
                variant="outline"
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
              </Button>
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
              {...fieldVariants(7, inView)}
              className="pt-2 text-center text-muted-foreground/60 text-xs"
            >
              Need help? Contact your administrator.
            </motion.p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
