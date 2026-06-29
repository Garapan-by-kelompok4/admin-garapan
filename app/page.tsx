import { redirect } from "next/navigation";

export default function HomePage() {
  // `/` is public; proxy.ts gates /dashboard and bounces to /login if needed.
  redirect("/dashboard");
}
