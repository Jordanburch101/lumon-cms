"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EASE, fieldVariants, Spinner } from "./auth-constants";

export function ForgotPasswordPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const inView = useInView(formRef, { once: true, margin: "-50px" });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      });
      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message ?? "Failed to send reset link");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
          Account recovery
        </motion.p>

        {/* Heading */}
        <motion.h1
          {...fieldVariants(1, inView)}
          className="mt-3 font-semibold text-3xl tracking-tight"
        >
          Reset your password
        </motion.h1>

        {sent ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-1.5"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="font-medium text-sm">Check your email</p>
            <p className="text-muted-foreground text-sm">
              We&apos;ve sent a password reset link to {email}.
            </p>
            <p className="pt-4 text-muted-foreground text-sm">
              <Link
                className="font-medium text-foreground underline decoration-border underline-offset-4"
                href="/login"
              >
                Back to sign in
              </Link>
            </p>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Description */}
            <motion.p
              {...fieldVariants(2, inView)}
              className="text-muted-foreground text-sm"
            >
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </motion.p>

            {/* Email */}
            <motion.div {...fieldVariants(3, inView)}>
              <Label className="mb-1.5 text-[13px]" htmlFor="email">
                Email
              </Label>
              <Input
                autoComplete="email"
                className={inputClassName}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@lumon.industries"
                required
                type="email"
                value={email}
              />
            </motion.div>

            {/* Submit button */}
            <motion.div {...fieldVariants(4, inView)}>
              <Button
                className="h-11 w-full rounded-lg font-semibold text-sm"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Sending
                  </>
                ) : (
                  "Send Reset Link"
                )}
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

            {/* Back to sign in */}
            <motion.p
              {...fieldVariants(5, inView)}
              className="pt-2 text-center text-muted-foreground text-sm"
            >
              <Link
                className="font-medium text-foreground underline decoration-border underline-offset-4"
                href="/login"
              >
                Back to sign in
              </Link>
            </motion.p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
