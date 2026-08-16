"use client";

import { useActionState } from "react";

import { signUp, type AuthActionState } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  if (state.success) {
    return <FormMessage success={state.success} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} />
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required placeholder="Kristhian Pinili" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Repeat your password" />
      </div>
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
