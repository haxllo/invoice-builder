import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full rounded border border-input bg-transparent px-3 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground outline-none",
        "focus:border-ring disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-[13px] file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
