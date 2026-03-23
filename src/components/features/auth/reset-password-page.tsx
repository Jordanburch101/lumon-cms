"use client";

import { motion, useInView } from "motion/react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/payload/lib/auth/client";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const formRef = useRef<HTMLDivElement>(null);
  const inView = useInView(formRef, { once: true, margin: "-50px" });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    const result = await authClient.resetPassword({
      newPassword: password,
      token: token ?? "",
    });
    if (result.error) {
      setError(result.error.message ?? "Failed to reset password");
    } else {
      setSuccess(true);
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

  const inputClassName =
    "h-11 rounded-lg px-3.5 text-sm placeholder:text-muted-foreground/50";

  function renderBody() {
    if (!token) {
      return (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="text-destructive text-sm">
            Invalid or expired reset link.
          </p>
          <p className="text-muted-foreground text-sm">
            <a
              className="font-medium text-foreground underline decoration-border underline-offset-4"
              href="/forgot-password"
            >
              Request a new reset link
            </a>
          </p>
        </motion.div>
      );
    }

    if (success) {
      return (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="text-muted-foreground text-sm">
            Password reset successfully.
          </p>
          <p className="text-muted-foreground text-sm">
            <a
              className="font-medium text-foreground underline decoration-border underline-offset-4"
              href="/login"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      );
    }

    return (
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {/* New password */}
        <motion.div {...fieldVariants(2)}>
          <Label className="mb-1.5 text-[13px]" htmlFor="password">
            New password
          </Label>
          <Input
            autoComplete="new-password"
            className={inputClassName}
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            type="password"
            value={password}
          />
        </motion.div>

        {/* Confirm password */}
        <motion.div {...fieldVariants(3)}>
          <Label className="mb-1.5 text-[13px]" htmlFor="confirm-password">
            Confirm password
          </Label>
          <Input
            autoComplete="new-password"
            className={inputClassName}
            id="confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            type="password"
            value={confirmPassword}
          />
        </motion.div>

        {/* Submit button */}
        <motion.div {...fieldVariants(4)}>
          <Button
            className="h-11 w-full rounded-lg font-semibold text-sm"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <svg
                  aria-label="Loading"
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    fill="currentColor"
                  />
                </svg>
                Resetting
              </>
            ) : (
              "Reset Password"
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
      </form>
    );
  }

  return (
    <AuthLayout>
      <div ref={formRef}>
        {/* Eyebrow */}
        <motion.p
          {...fieldVariants(0)}
          className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]"
        >
          Account recovery
        </motion.p>

        {/* Heading */}
        <motion.h1
          {...fieldVariants(1)}
          className="mt-3 font-semibold text-3xl tracking-tight"
        >
          Set a new password
        </motion.h1>

        {renderBody()}
      </div>
    </AuthLayout>
  );
}
