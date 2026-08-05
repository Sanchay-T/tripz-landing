"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * `indicatorColor` is the one addition to the shipped component.
 *
 * The take-rate bars encode booking type by hue, and the hue comes from data, so
 * it cannot be a static class. Threading it through as a prop keeps the inline
 * style inside the component instead of every call site rebuilding a track and a
 * fill out of two nested divs — which is what the admin did before, in two places,
 * at two different heights.
 */
function Progress({
  className,
  value,
  indicatorColor,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      value={value}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "size-full flex-1 rounded-full transition-all",
          !indicatorColor && "bg-primary"
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...(indicatorColor ? { backgroundColor: indicatorColor } : null)
        }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
