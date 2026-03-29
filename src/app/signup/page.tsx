import { SignupForm } from "@/components/signup/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Sign Up - FPL",
  description: "Sign up to compete in the Franchise Premier League.",
};

export default function SignupPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Player <span className="text-fpl-accent">Sign Up</span>
          </h1>
          <p className="text-fpl-muted text-lg max-w-xl mx-auto">
            Fill out the form below to register for the next FPL season.
            All fields are required unless marked optional.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
