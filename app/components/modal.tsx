import { Link, useNavigate } from '@remix-run/react'
import { type ReactNode } from 'react'
import { cn } from '@/utils/misx'
import { Icon } from './ui/icon'

export function Modal({
	link,
	children,
	inMiddle,
	modalClassName,
	className,
	iconClassName,
	shouldNotNavigate = false,
	setOpen,
}: {
	link?: string
	children?: ReactNode
	inMiddle?: boolean
	modalClassName?: string
	className?: string
	iconClassName?: string
	shouldNotNavigate?: boolean
	setOpen?: any
}) {
	const navigate = useNavigate()

	return (
		<div
			className={cn(
				'max-w-screen absolute inset-0 z-30 grid h-full max-h-screen place-items-end overflow-hidden',
				inMiddle && 'place-items-center',
				modalClassName,
			)}
		>
			<Link
				to={link ?? '..'}
				relative="path"
				replace={true}
				className={cn(
					'max-w-screen absolute inset-0 z-30 grid h-full max-h-screen w-full place-items-end bg-transparent/70 text-transparent',
					inMiddle && 'place-items-center',
				)}
				onClick={() => {
					if (setOpen) {
						setOpen((prev: boolean) => !prev)
					}
					if (!shouldNotNavigate) {
						navigate(-1)
					} else {
						navigate(link ?? '..', { replace: true })
					}
				}}
			>
				Go Back
			</Link>
			<div
				className={cn(
					'no-scrollbar z-40 h-screen max-h-full overflow-scroll border-[0.5px] border-muted-foreground/15 bg-background px-12 pt-6 pb-6 shadow-lg dark:bg-muted',
					inMiddle ? 'h-min animate-pop rounded-md' : 'pb-16 animate-slideInRight',
					className,
				)}
			>
				<Link
					to={link ?? '..'}
					relative="path"
					replace={true}
					className={cn(
						'absolute right-2.5 top-2.5 grid place-items-center rounded-full bg-accent p-2 shadow-sm hover:brightness-90',
						!inMiddle && 'sr-only',
						iconClassName,
					)}
					onClick={() => {
						if (setOpen) {
							setOpen((prev: boolean) => !prev)
						}
						if (!shouldNotNavigate) {
							navigate(-1)
						} else {
							navigate(link ?? '..', { replace: true })
						}
					}}
				>
					<Icon name="cross" size="xs" />
				</Link>
				{children}
			</div>
		</div>
	)
}
