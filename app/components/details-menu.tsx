/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation, useNavigation } from '@remix-run/react'
import {
	forwardRef,
	useState,
	useRef,
	useEffect,
	type Dispatch,
	type SetStateAction,
} from 'react'
import { cn } from '@/utils/misx'

/**
 * An enhanced `<details>` component that's intended to be used as a menu (a bit
 * like a menu-button).
 */
export const DetailsMenu = forwardRef<
	HTMLDetailsElement,
	React.ComponentPropsWithRef<'details'> & {
		setOpen?: Dispatch<SetStateAction<boolean>>
		closeOnSubmit?: boolean
	}
>(({ setOpen, className, closeOnSubmit = true, ...props }, forwardedRef) => {
	let { onToggle, onMouseDown, onTouchStart, onFocus, open, ...rest } = props
	let [isOpen, setIsOpen] = useState(false)
	let location = useLocation()
	let navigation = useNavigation()
	let clickRef = useRef<boolean>(false)
	let focusRef = useRef<boolean>(false)

	useEffect(() => {
		if (navigation.state === 'submitting' && closeOnSubmit) {
			setIsOpen(false)
			if (setOpen) setOpen(false)
		}
	}, [navigation.state])

	useEffect(() => {
		if (closeOnSubmit) {
			setIsOpen(false)
		}
		if (setOpen) setOpen(false)
	}, [location.key])

	useEffect(() => {
		if (isOpen) {
			let clickHandler = () => {
				if (!clickRef.current) {
					setIsOpen(false)
					if (setOpen) setOpen(false)
				}
				clickRef.current = false
			}
			let focusHandler = () => {
				if (!focusRef.current) {
					setIsOpen(false)
					if (setOpen) setOpen(false)
				}
				focusRef.current = false
			}
			document.addEventListener('mousedown', clickHandler)
			document.addEventListener('touchstart', clickHandler)
			document.addEventListener('focusin', focusHandler)
			return () => {
				document.removeEventListener('mousedown', clickHandler)
				document.removeEventListener('touchstart', clickHandler)
				document.removeEventListener('focusin', focusHandler)
			}
		}
	}, [isOpen])

	return (
		<details
			className={cn('relative', className)}
			ref={forwardedRef}
			open={open ?? isOpen}
			onToggle={event => {
				onToggle && onToggle(event)
				if (event.defaultPrevented) return
				setIsOpen(event.currentTarget.open)
				if (setOpen) setOpen(event.currentTarget.open)
			}}
			onMouseDown={event => {
				onMouseDown && onMouseDown(event)
				if (event.defaultPrevented) return
				if (isOpen) clickRef.current = true
			}}
			onTouchStart={event => {
				onTouchStart && onTouchStart(event)
				if (event.defaultPrevented) return
				if (isOpen) clickRef.current = true
			}}
			onFocus={event => {
				onFocus && onFocus(event)
				if (event.defaultPrevented) return
				if (isOpen) focusRef.current = true
			}}
			{...rest}
		/>
	)
})
DetailsMenu.displayName = 'DetailsMenu'

export function DetailsMenuTrigger({
	children,
	className,
	open,
}: {
	children: React.ReactNode
	className?: string
	open?: boolean
}) {
	const ref = useRef<any>()

	useEffect(() => {
		if (open) {
			ref.current?.focus()
		}
	}, [open])

	return (
		<summary
			ref={ref}
			className={cn(
				'group flex h-11 w-[160px] cursor-pointer list-none items-center gap-2 rounded-sm border border-gray-300 bg-muted p-2 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:outline-none dark:border-gray-800',
				className,
			)}
		>
			{children}
		</summary>
	)
}

export function DetailsPopup({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				'no-scrollbar absolute z-50 mt-1 flex max-h-80 min-w-[8em] flex-col overflow-scroll rounded-md border border-muted bg-popover p-2 text-sm shadow-sm dark:border-2',
				className,
			)}
		>
			{children}
		</div>
	)
}

export const DetailsMenuLabel = ({
	className,
	...props
}: {
	className: string
	children: React.ReactNode
}) => <h3 className={cn('font-semibold', className)} {...props} />
DetailsMenuLabel.displayName = 'DetailsMenuLabel'

export const DetailsMenuSeparator = ({ className }: { className?: string }) => (
	<div className={cn('-mx-1 mb-1.5 mt-1 h-px bg-muted', className)} />
)
