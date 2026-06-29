// Avatar gradient + initials, matching the design handoff (av-0…av-7).
// The actual gradient values live in globals.css (`--av-*` + `bg-avatar-*`
// utilities); here we only pick which one, seeded from a string so the same
// name always maps to the same hue.
//
// These are kept as literal class names (not built dynamically) so Tailwind's
// content scanner emits the corresponding `@utility` rules.
const AVATAR_CLASSES = [
  "bg-avatar-0",
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
  "bg-avatar-7",
] as const;

export function avatarClass(seed: string | null | undefined): string {
  const safeSeed = seed || "?";
  let sum = 0;
  for (let i = 0; i < safeSeed.length; i += 1) {
    sum += safeSeed.charCodeAt(i) * 31;
  }
  return AVATAR_CLASSES[Math.abs(sum) % AVATAR_CLASSES.length];
}

export function initials(name: string | null | undefined): string {
  const safeName = name || "?";
  const parts = safeName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
