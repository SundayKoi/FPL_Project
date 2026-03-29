"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/validators/signup";
import { ROLES, RANKS } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Loader2 } from "lucide-react";

const roleOptions = ROLES.map((r) => ({ label: r, value: r }));
const rankOptions = RANKS.map((r) => ({ label: r, value: r }));

export function SignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    try {
      const res = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to submit signup");
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">You&apos;re In!</h2>
        <p className="text-fpl-muted">
          Your signup has been submitted. We&apos;ll reach out on Discord with
          next steps.
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          id="discordUsername"
          label="Discord Username"
          placeholder="username"
          {...register("discordUsername")}
          error={errors.discordUsername?.message}
        />

        <Input
          id="opggLink"
          label="OP.GG Link"
          placeholder="https://www.op.gg/summoners/na/YourName-TAG"
          {...register("opggLink")}
          error={errors.opggLink?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Select
            id="primaryRole"
            label="Primary Role"
            placeholder="Select role..."
            options={roleOptions}
            {...register("primaryRole")}
            error={errors.primaryRole?.message}
          />

          <Select
            id="secondaryRole"
            label="Secondary Role (Optional)"
            placeholder="Select role..."
            options={roleOptions}
            {...register("secondaryRole")}
            error={errors.secondaryRole?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Select
            id="currentRank"
            label="Current Rank"
            placeholder="Select rank..."
            options={rankOptions}
            {...register("currentRank")}
            error={errors.currentRank?.message}
          />

          <Select
            id="peakRank"
            label="Peak Rank (Past 2 Splits)"
            placeholder="Select rank..."
            options={rankOptions}
            {...register("peakRank")}
            error={errors.peakRank?.message}
          />
        </div>

        {serverError && (
          <p className="text-red-400 text-sm text-center">{serverError}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Signup"
          )}
        </Button>
      </form>
    </Card>
  );
}
