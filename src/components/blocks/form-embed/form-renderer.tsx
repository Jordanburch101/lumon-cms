"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "./field-mapper";
import type { FormConfig } from "./types";

interface FormRendererProps {
  /** Pre-rendered confirmation message (server component RichText passed as prop) */
  confirmationNode?: ReactNode;
  form: FormConfig;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function FormRenderer({ form, confirmationNode }: FormRendererProps) {
  const fields = form.fields ?? [];

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      if (field.name) {
        initial[field.name] = field.defaultValue ?? "";
      }
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && field.name) {
        const val = values[field.name]?.trim();
        if (!val) {
          newErrors[field.name] = `${field.label || field.name} is required`;
        }
      }
      if (field.blockType === "email" && field.name && values[field.name]) {
        const emailVal = values[field.name].trim();
        if (emailVal && !emailVal.includes("@")) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const submissionData = Object.entries(values).map(([field, value]) => ({
        field,
        value,
      }));

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: form.id, submissionData }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.errors?.[0]?.message ??
            "Something went wrong. Please try again."
        );
      }

      if (form.confirmationType === "redirect" && form.redirect?.url) {
        window.location.href = form.redirect.url;
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          key="confirmation"
          transition={{ duration: 0.5, ease: EASE }}
        >
          {confirmationNode ? (
            confirmationNode
          ) : (
            <p className="text-muted-foreground">
              Thank you! Your submission has been received.
            </p>
          )}
        </motion.div>
      ) : (
        <motion.form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          exit={{ opacity: 0, y: -12 }}
          key="form"
          onSubmit={handleSubmit}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {fields.map((field, i) => (
            <FormField
              error={errors[field.name ?? ""]}
              field={field}
              key={field.name ?? `field-${i}`}
              onChange={handleChange}
              value={values[field.name ?? ""] ?? ""}
            />
          ))}

          {serverError && (
            <div className="col-span-full">
              <p className="text-destructive text-sm">{serverError}</p>
            </div>
          )}

          <div className="col-span-full">
            <Button
              className="w-full sm:w-auto"
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? "Submitting..."
                : form.submitButtonLabel || "Submit"}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
