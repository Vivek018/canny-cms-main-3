import * as React from 'react'

import { cn } from '@/utils/misx'

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'dark:input-dark flex w-full appearance-none rounded-sm border border-muted-foreground bg-background px-3 text-sm text-foreground file:border-0 file:cursor-pointer file:bg-secondary file:px-1.5 file:py-1 file:rounded-sm file:text-[13px] file:font-medium placeholder:opacity-90 focus-visible:outline-none focus-visible:placeholder:opacity-0 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:opacity-90 dark:focus-visible:placeholder:opacity-0',
					className,
				)}
				ref={ref}
				{...props}
			/>
		)
	},
)
Input.displayName = 'Input'

export { Input }
