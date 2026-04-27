export function UserAvatar({ name, imageUrl, color, size = 32 }: { name: string; imageUrl?: string | null; color?: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (imageUrl) {
    return <img src={imageUrl} alt={name} width={size} height={size} className="rounded-full border border-zinc-200 object-cover" />;
  }

  return (
    <div
      className="flex items-center justify-center rounded-full text-xs font-medium text-white"
      style={{ width: size, height: size, background: color ?? "#6b7280" }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
