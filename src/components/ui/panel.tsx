import * as React from "react";
import { cn } from "@/lib/utils";

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "group relative p-6 sm:p-8 border border-border/30 hover:border-border/60 bg-card/50 transition-colors",
        className
      )}
      {...props}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-foreground/10 group-hover:border-foreground/25 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-foreground/10 group-hover:border-foreground/25 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-foreground/10 group-hover:border-foreground/25 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-foreground/10 group-hover:border-foreground/25 transition-colors" />
      {props.children}
    </div>
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex items-center justify-between mb-4",
        className
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="panel-title"
      className={cn(
        "text-lg sm:text-xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function PanelTag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="panel-tag"
      className={cn(
        "font-mono text-[10px] tracking-wider text-muted-foreground/60 group-hover:text-muted-foreground transition-colors",
        className
      )}
      {...props}
    />
  );
}

function PanelDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="panel-description"
      className={cn(
        "text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Panel, PanelHeader, PanelTitle, PanelTag, PanelDescription };
