import * as React from "react";
import { cn } from "@/lib/utils";

function SectionTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-title"
      className={cn(
        "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16 sm:mb-24",
        className
      )}
      {...props}
    />
  );
}

function SectionHeading({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="section-heading"
      className={cn(
        "text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight",
        className
      )}
      {...props}
    />
  );
}

function SectionSubtitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-subtitle"
      className={cn(
        "font-mono text-xs tracking-widest uppercase text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { SectionTitle, SectionHeading, SectionSubtitle };
