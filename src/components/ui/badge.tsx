import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-violet-500 focus-visible:ring-violet-500/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-600 text-white [a&]:hover:bg-violet-700 dark:bg-violet-500 dark:[a&]:hover:bg-violet-600",
        secondary:
          "border-transparent bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 [a&]:hover:bg-gray-300 dark:[a&]:hover:bg-gray-600",
        destructive:
          "border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 dark:bg-red-500 dark:[a&]:hover:bg-red-600",
        outline:
          "text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 [a&]:hover:bg-gray-100 [a&]:hover:text-gray-900 dark:[a&]:hover:bg-gray-800 dark:[a&]:hover:text-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
