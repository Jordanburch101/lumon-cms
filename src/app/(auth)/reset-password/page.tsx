import { Suspense } from "react";
import { ResetPasswordPage } from "@/components/features/auth/reset-password-page";

export const metadata = { title: "Reset Password" };

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
