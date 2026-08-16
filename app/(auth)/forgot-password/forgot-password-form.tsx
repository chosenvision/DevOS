"use client";

import { useActionState } from "react";

import { forgotPassword, type AuthActionState } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialState);

  if (state.success) {
    return <FormMessage success={state.success} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}
