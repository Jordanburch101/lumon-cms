"use client";

import { useAuth, useDocumentInfo } from "@payloadcms/ui";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useState } from "react";

interface TwoFactorState {
  backupCodes: string[] | null;
  error: string | null;
  loading: boolean;
  totpURI: string | null;
}

export const TwoFactorAdmin: React.FC = () => {
  const { id, initialData } = useDocumentInfo();
  const { user } = useAuth();

  const [state, setState] = useState<TwoFactorState>({
    backupCodes: null,
    error: null,
    loading: false,
    totpURI: null,
  });

  const isEnabled = initialData?.twoFactorEnabled === true;
  const isAdmin =
    user && typeof user === "object" && "role" in user && user.role === "admin";

  const handleEnable = useCallback(async () => {
    if (!id) {
      return;
    }
    setState((s) => ({ ...s, error: null, loading: true, totpURI: null }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/enable`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Failed (${res.status})`
        );
      }
      const data = (await res.json()) as { totpURI: string };
      setState((s) => ({ ...s, loading: false, totpURI: data.totpURI }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      }));
    }
  }, [id]);

  const handleDisable = useCallback(async () => {
    if (!id) {
      return;
    }
    setState((s) => ({
      ...s,
      backupCodes: null,
      error: null,
      loading: true,
      totpURI: null,
    }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/disable`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Failed (${res.status})`
        );
      }
      setState((s) => ({ ...s, loading: false }));
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
    setState((s) => ({ ...s, backupCodes: null, error: null, loading: true }));
    try {
      const res = await fetch(`/api/users/${id}/2fa/backup-codes`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Failed (${res.status})`
        );
      }
      const data = (await res.json()) as { codes: string[] };
      setState((s) => ({ ...s, backupCodes: data.codes, loading: false }));
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
          style={{ color: isEnabled ? "var(--theme-success-500)" : "inherit" }}
        >
          {isEnabled ? "Enabled" : "Disabled"}
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

      {state.totpURI && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p
            style={{
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Scan this QR code with an authenticator app:
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
        </div>
      )}

      {state.backupCodes && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p
            style={{
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Backup codes (save these — shown once):
          </p>
          <pre
            style={{
              background: "var(--theme-elevation-100)",
              borderRadius: "0.25rem",
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

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {!isEnabled && (
          <button
            className="btn btn--style-secondary btn--size-small"
            disabled={state.loading}
            onClick={handleEnable}
            type="button"
          >
            {state.loading ? "Enabling..." : "Enable 2FA"}
          </button>
        )}
        {isEnabled && (
          <>
            <button
              className="btn btn--style-secondary btn--size-small"
              disabled={state.loading}
              onClick={handleBackupCodes}
              type="button"
            >
              {state.loading ? "Generating..." : "Generate Backup Codes"}
            </button>
            <button
              className="btn btn--style-secondary btn--size-small"
              disabled={state.loading}
              onClick={handleDisable}
              style={{ color: "var(--theme-error-500)" }}
              type="button"
            >
              {state.loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
