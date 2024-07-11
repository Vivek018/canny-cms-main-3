import * as React from 'react'

import { cn } from '@/utils/misx'

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'aria-[invalid]:border-input-invalid flex min-h-[80px] w-full rounded-sm border border-foreground bg-background px-3 py-2 text-sm placeholder:opacity-90 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50',
					className,
				)}
				ref={ref}
				{...props}
			/>
		)
	},
)
Textarea.displayName = 'Textarea'

export { Textarea }
