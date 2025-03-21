"use client";

import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface RequiredFormLabelProps extends React.ComponentPropsWithoutRef<typeof FormLabel> {
  children: React.ReactNode;
}

export function RequiredFormLabel({ children, className, ...props }: RequiredFormLabelProps) {
  return (
    <FormLabel className={cn(className)} {...props}>
      {children}
      <span className="text-destructive ml-1">*</span>
    </FormLabel>
  );
}