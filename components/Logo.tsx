"use client";


type LogoProps = {
  name?: string;
  size?: number;
  className?: string;
};

export default function Logo({ name = "?", size = 40, className = "" }: LogoProps) {
  const char = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-900 font-semibold shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      {char}
    </div>
  );
}
