"use client";

import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/payload/lib/auth/client";
import { EASE } from "./auth-constants";

export function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [backupMode, setBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (backupMode) {
        const result = await authClient.twoFactor.verifyBackupCode({
          code: backupCode,
        });
        if (result.error) {
          setError(result.error.message ?? "Verification failed");
        } else {
          window.location.href = "/admin";
        }
      } else {
        const result = await authClient.twoFactor.verifyTotp({
          code,
          trustDevice,
        });
        if (result.error) {
          setError(result.error.message ?? "Verification failed");
        } else {
          window.location.href = "/admin";
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Eyebrow */}
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          Two-factor authentication
        </motion.p>

        {/* Heading */}
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-3xl tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        >
          Enter verification code
        </motion.h1>

        {/* Description */}
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-muted-foreground text-sm"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          {backupMode
            ? "Enter one of your backup codes to verify your identity."
            : "Open your authenticator app and enter the 6-digit code."}
        </motion.p>

        {/* Input */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        >
          {backupMode ? (
            <Input
              autoComplete="off"
              autoFocus
              className="h-11 rounded-lg px-4 font-mono text-sm placeholder:text-muted-foreground/50"
              disabled={loading}
              onChange={(e) => setBackupCode(e.target.value)}
              placeholder="Enter backup code"
              type="text"
              value={backupCode}
            />
          ) : (
            <InputOTP
              autoFocus
              containerClassName="justify-center"
              disabled={loading}
              maxLength={6}
              onChange={(val) => setCode(val)}
              value={code}
            >
              <InputOTPGroup>
                <InputOTPSlot className="size-12 text-xl" index={0} />
                <InputOTPSlot className="size-12 text-xl" index={1} />
                <InputOTPSlot className="size-12 text-xl" index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot className="size-12 text-xl" index={3} />
                <InputOTPSlot className="size-12 text-xl" index={4} />
                <InputOTPSlot className="size-12 text-xl" index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        </motion.div>

        {/* Trust device checkbox (TOTP mode only) */}
        {!backupMode && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            <Checkbox
              checked={trustDevice}
              id="trust-device"
              onCheckedChange={(checked) => setTrustDevice(checked === true)}
            />
            <Label
              className="font-normal text-muted-foreground text-sm"
              htmlFor="trust-device"
            >
              Trust this device for 30 days
            </Label>
          </motion.div>
        )}

        {/* Verify button */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        >
          <Button
            className="h-10 w-full text-sm"
            disabled={loading || (backupMode ? !backupCode : code.length < 6)}
            type="submit"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </motion.div>

        {/* Toggle backup mode */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
        >
          <button
            className="text-[12px] text-muted-foreground underline decoration-border underline-offset-4"
            onClick={() => {
              setBackupMode(!backupMode);
              setError("");
            }}
            type="button"
          >
            {backupMode ? "Use authenticator app instead" : "Use a backup code"}
          </button>
        </motion.div>

        {/* Error display */}
        {error && (
          <motion.p
            animate={{ opacity: 1 }}
            className="text-center text-destructive text-sm"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
      </form>
    </AuthLayout>
  );
}
