import { Link, NavLink } from '@remix-run/react'
import { cn, replaceUnderscore } from '@/utils/misx'
import { Icon } from './ui/icon'

type HeaderProps = {
	className?: string
	title?: string
	headerLink1?: string
	headerLink2?: string
	children?: React.ReactNode
	goBackLink?: string
}

export function Header({
	className,
	title,
	headerLink1,
	headerLink2,
	children,
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
				<div
					className={cn(
						'ml-3 hidden items-center gap-2 text-sm',
						headerLink1 && headerLink2 && 'flex',
					)}
				>
					<NavLink
						to={headerLink1 ?? '/'}
						className={({ isActive }) =>
							cn(
								'py-1.5text-muted-foreground/85 flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1.5 hover:bg-accent hover:text-accent-foreground',
								isActive &&
									'cursor-auto bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground',
							)
						}
					>
						<Icon name="home" />
						Home
					</NavLink>
					<NavLink
						to={headerLink2 ?? '/analytics'}
						className={({ isActive }) =>
							cn(
								'flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1.5 text-muted-foreground/85 hover:bg-accent hover:text-accent-foreground',
								isActive &&
									'cursor-auto bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground',
							)
						}
					>
						<Icon name="chart" />
						Analytics
					</NavLink>
				</div>
			</div>
			<div className="flex w-full items-center justify-end gap-3">
				{children}
			</div>
		</header>
	)
}
