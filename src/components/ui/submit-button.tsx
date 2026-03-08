import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

export interface SubmitButtonProps
    extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    asChild?: boolean;
}

export function SubmitButton({
    children,
    isLoading = false,
    loadingText,
    icon,
    disabled,
    className,
    variant,
    size,
    asChild,
    ...props
}: SubmitButtonProps) {
    return (
        <Button
            className={className}
            disabled={isLoading || disabled}
            variant={variant}
            size={size}
            asChild={asChild}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingText || children}
                </>
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    {children}
                </>
            )}
        </Button>
    )
}
