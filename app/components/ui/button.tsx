import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/misx'

const buttonVariants = cva(
	'inline-flex items-center capitalize cursor-pointer justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline:
					'border border-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground focus-visible:border-gray-500',
				secondary: 'bg-secondary hover:bg-secondary/80',
				accent:
					'bg-accent text-accent-foreground/80 focus-visible:bg-accent/50 hover:bg-accent/70',
				muted:
					'bg-muted text-muted-foreground focus-visible:bg-muted/50 hover:bg-muted/70',
				ghost: 'hover:bg-accent font-normal',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-11 px-2.5 py-2',
				sm: 'h-9 px-3',
				lg: 'h-11 px-8',
				icon: 'h-11 w-11',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)
Button.displayName = 'Button'

export { Button, buttonVariants }
