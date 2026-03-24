"use client";

import { useAuth, useDocumentInfo } from "@payloadcms/ui";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useState } from "react";

type Step = "idle" | "qr" | "verify" | "done";

interface TwoFactorState {
  backupCodes: string[] | null;
  confirmRegenerate: boolean;
  enabled: boolean;
  error: string | null;
  loading: boolean;
  step: Step;
  totpURI: string | null;
  verifyCode: string;
}

export const TwoFactorAdmin: React.FC = () => {
  const { id, initialData } = useDocumentInfo();
  const { user } = useAuth();

  const [state, setState] = useState<TwoFactorState>({
    backupCodes: null,
    confirmRegenerate: false,
    enabled: initialData?.twoFactorEnabled === true,
    error: null,
    loading: false,
    step: "idle",
    totpURI: null,
    verifyCode: "",
  });

  const isAdmin =
    user && typeof user === "object" && "role" in user && user.role === "admin";

  const handleEnable = useCallback(async () => {
    if (!id) {
      return;
    }
    setState((s) => ({ ...s, error: null, loading: true }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/enable`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        totpURI?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `Failed (${res.status})`);
      }
      setState((s) => ({
        ...s,
        loading: false,
        step: "qr",
        totpURI: data.totpURI ?? null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      }));
    }
  }, [id]);

  const handleProceedToVerify = useCallback(() => {
    setState((s) => ({ ...s, step: "verify", verifyCode: "" }));
  }, []);

  const handleVerify = useCallback(async () => {
    if (!id) {
      return;
    }
    setState((s) => ({ ...s, error: null, loading: true }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: state.verifyCode }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Failed (${res.status})`);
      }
      setState((s) => ({
        ...s,
        enabled: true,
        loading: false,
        step: "done",
        totpURI: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      }));
    }
  }, [id, state.verifyCode]);

  const handleDisable = useCallback(async () => {
    if (!id) {
      return;
    }
    setState((s) => ({
      ...s,
      backupCodes: null,
      confirmRegenerate: false,
      error: null,
      loading: true,
      totpURI: null,
    }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/disable`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Failed (${res.status})`);
      }
      setState((s) => ({
        ...s,
        enabled: false,
        loading: false,
        step: "idle",
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      }));
    }
  }, [id]);

  const handleBackupCodes = useCallback(async () => {
    if (!id) {
      return;
    }
    setState((s) => ({
      ...s,
      backupCodes: null,
      confirmRegenerate: false,
      error: null,
      loading: true,
    }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/backup-codes`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { codes?: string[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Failed (${res.status})`);
      }
      setState((s) => ({
        ...s,
        backupCodes: data.codes ?? null,
        loading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      }));
    }
  }, [id]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--theme-elevation-150)",
        marginTop: "1rem",
        paddingTop: "1rem",
      }}
    >
      <h4 style={{ marginBottom: "0.5rem", marginTop: 0 }}>
        Two-Factor Authentication
      </h4>
      <p
        style={{
          color: "var(--theme-elevation-600)",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        Status:{" "}
        <strong
          style={{
            color: state.enabled ? "var(--theme-success-500)" : "inherit",
          }}
        >
          {state.enabled ? "Enabled" : "Disabled"}
        </strong>
      </p>

      {state.error && (
        <p
          style={{
            color: "var(--theme-error-500)",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          {state.error}
        </p>
      )}

      {/* Step: QR code */}
      {state.step === "qr" && state.totpURI && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            1. Scan this QR code with your authenticator app:
          </p>
          <div
            style={{
              background: "white",
              borderRadius: "0.5rem",
              display: "inline-block",
              padding: "0.75rem",
            }}
          >
            <QRCodeSVG size={180} value={state.totpURI} />
          </div>
          <p
            style={{
              color: "var(--theme-elevation-600)",
              fontSize: "0.75rem",
              marginTop: "0.5rem",
              wordBreak: "break-all",
            }}
          >
            {state.totpURI}
          </p>
          <button
            className="btn btn--style-primary btn--size-small"
            onClick={handleProceedToVerify}
            style={{ marginTop: "0.75rem" }}
            type="button"
          >
            Next: Verify code
          </button>
        </div>
      )}

      {/* Step: Verify code */}
      {state.step === "verify" && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            2. Enter the 6-digit code from your authenticator app:
          </p>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setState((s) => ({ ...s, verifyCode: val, error: null }));
              }}
              pattern="[0-9]*"
              placeholder="000000"
              style={{
                background: "var(--theme-elevation-0)",
                border: "1px solid var(--theme-elevation-150)",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "1.25rem",
                letterSpacing: "0.3em",
                padding: "0.5rem 0.75rem",
                textAlign: "center",
                width: "10rem",
              }}
              type="text"
              value={state.verifyCode}
            />
            <button
              className="btn btn--style-primary btn--size-small"
              disabled={state.loading || state.verifyCode.length !== 6}
              onClick={handleVerify}
              type="button"
            >
              {state.loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      )}

      {/* Backup codes */}
      {state.backupCodes && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            Backup codes (save these — shown once):
          </p>
          <pre
            style={{
              background: "var(--theme-elevation-100)",
              borderRadius: "4px",
              fontSize: "0.8125rem",
              lineHeight: "1.6",
              overflowX: "auto",
              padding: "0.5rem 0.75rem",
            }}
          >
            {state.backupCodes.join("\n")}
          </pre>
        </div>
      )}

      {/* Actions */}
      {!state.enabled && state.step === "idle" && (
        <button
          className="btn btn--style-pill btn--size-small"
          disabled={state.loading}
          onClick={handleEnable}
          type="button"
        >
          {state.loading ? "Setting up..." : "Enable 2FA"}
        </button>
      )}
      {state.enabled && state.step !== "qr" && state.step !== "verify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {state.confirmRegenerate ? (
            <div>
              <p
                style={{
                  color: "var(--theme-error-500)",
                  fontSize: "0.75rem",
                  margin: "0 0 0.5rem",
                }}
              >
                Regenerating will invalidate existing codes.
              </p>
              <div style={{ display: "flex", gap: "0.375rem" }}>
                <button
                  className="btn btn--style-pill btn--size-small"
                  disabled={state.loading}
                  onClick={handleBackupCodes}
                  style={{
                    background: "var(--theme-error-500)",
                    color: "white",
                  }}
                  type="button"
                >
                  {state.loading ? "Generating..." : "Regenerate"}
                </button>
                <button
                  className="btn btn--style-pill btn--size-small"
                  onClick={() =>
                    setState((s) => ({ ...s, confirmRegenerate: false }))
                  }
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn--style-pill btn--size-small"
              disabled={state.loading}
              onClick={() =>
                setState((s) => ({ ...s, confirmRegenerate: true }))
              }
              type="button"
            >
              Generate Backup Codes
            </button>
          )}
          <button
            className="btn btn--style-none btn--size-small"
            disabled={state.loading}
            onClick={handleDisable}
            style={{
              color: "var(--theme-error-500)",
              cursor: "pointer",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
            type="button"
          >
            {state.loading ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      )}
    </div>
  );
};
