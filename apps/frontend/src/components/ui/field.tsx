import * as React from "react";
import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("flex flex-col", className)} {...props} />;
}

interface FieldProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

function Field({ orientation = "vertical", className, ...props }: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row items-center gap-2" : "flex-col gap-1.5",
        className
      )}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldLabel };
