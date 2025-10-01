import { cn } from "@/lib/utils";

export default function LogoText({ className }: { className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-sky-500 via-purple-500 to-violet-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-200", className)}>
      SaaS Boilerplate
    </span>
  )
}
