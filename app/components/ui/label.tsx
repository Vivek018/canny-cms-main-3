import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import { cn } from '@/utils/misx'

const labelVariants =
	'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize'

const Label = React.forwardRef<
	HTMLLabelElement,
	React.ComponentPropsWithRef<'label'>
>(({ className, ...props }, ref) => (
	<LabelPrimitive.Root
		ref={ref}
		className={cn(labelVariants, className)}
		{...props}
	/>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
