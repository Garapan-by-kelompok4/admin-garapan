import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-2 lg:items-stretch">
      <LoginHero />

      <div className="grid place-items-center px-5 py-8 sm:p-8 lg:p-12">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
