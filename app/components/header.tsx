import { Link, NavLink, useNavigate } from '@remix-run/react'
import { cn, replaceUnderscore } from '@/utils/misx'
import { Button, buttonVariants } from './ui/button'
import { Icon } from './ui/icon'

type HeaderProps = {
	className?: string
	title?: string
	headerLink1?: string
	headerLink2?: string
	children?: React.ReactNode
	goBackLink?: string | boolean
	noBackButton?: boolean
}

export function Header({
	className,
	title,
	headerLink1,
	headerLink2,
	children,
	goBackLink,
	noBackButton = false,
}: HeaderProps) {
	const navigate = useNavigate()
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
						to={goBackLink as string}
						className={buttonVariants({
							variant: 'ghost',
							className: 'h-min w-min px-1 py-1',
						})}
					>
						<Icon name="chevron-left" size="lg" />
					</Link>
				) : (
					<Button
						variant="ghost"
						size="icon"
						className={cn('h-min w-min px-1.5 py-1', noBackButton && 'hidden')}
						onClick={() => navigate(-1)}
					>
						<Icon name="chevron-left" size="lg" />
					</Button>
				)}
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
