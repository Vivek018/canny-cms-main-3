import { Link } from '@remix-run/react'
import { cn, replaceUnderscore } from '@/utils/misx'
import { Icon } from './ui/icon'

type HeaderProps = {
	className?: string
	title?: string
	children?: React.ReactNode
	goBackLink?: string
}

export function Header({
	title,
	children,
	className,
	goBackLink,
}: HeaderProps) {
	return (
		<header
			className={cn(
				'flex items-center justify-between gap-5 py-3.5',
				className,
				!title && 'gap-0',
			)}
		>
			<div className="flex items-center gap-1">
				{goBackLink ? (
					<Link
						to={goBackLink}
						className="rounded-sm px-1.5 py-1 hover:bg-muted"
					>
						<Icon name="chevron-left" size="lg" />
					</Link>
				) : null}
				<h1 className="w-max text-2xl font-bold capitalize tracking-wide">
					{replaceUnderscore(title ?? '')}
				</h1>
			</div>
			<div className="flex w-full items-center justify-end gap-3">
				{children}
			</div>
		</header>
	)
}
