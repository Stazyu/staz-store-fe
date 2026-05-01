"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "group/switch peer inline-flex h-[26px] w-[48px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
      // Smooth background color transition
      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
      // Focus styles
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Unchecked state
      "data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
      // Checked state with glow
      "data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-[0_0_12px_rgba(16,185,129,0.45),0_0_4px_rgba(16,185,129,0.3)]",
      // Active press effect
      "active:scale-[0.97] active:duration-100",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[22px] w-[22px] rounded-full bg-white ring-0",
        // Smooth spring-like slide transition
        "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        // Shadow that enhances with state
        "shadow-[0_1px_3px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]",
        "data-[state=checked]:shadow-[0_2px_6px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
        // Slide position
        "data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0",
        // Subtle scale on press via group
        "group-active/switch:scale-[0.9] group-active/switch:duration-100",
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
