import { cn } from "@/lib/utils";

export default function DominoLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className="text-sm font-extrabold tracking-tight uppercase">
        Domino
      </span>
      <span className="text-xs font-mono font-medium tracking-widest uppercase text-muted-foreground">
        Online
      </span>
    </div>
  );
}
