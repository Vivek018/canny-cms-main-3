import { Form, Link, NavLink, useLocation } from '@remix-run/react'
import { useState } from 'react'
import { sideNavList } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, textTruncate } from '@/utils/misx'
import { type Sidebar } from '@/utils/servers/sidebar.server'
import { type Theme } from '@/utils/servers/theme.server'
import { useOptimisticThemeMode } from '@/utils/theme'
import { type IconName } from '~/icon-name'
import {
	DetailsMenu,
	DetailsMenuLabel,
	DetailsMenuSeparator,
	DetailsMenuTrigger,
	DetailsPopup,
} from './details-menu'
import { GotoSelector } from './goto-selector'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip'

type SidebarProps = {
	className?: string
	theme: Theme | 'system'
	sidebar: Sidebar
}

export function Sidebar({ className, theme, sidebar }: SidebarProps) {
	const optimisticMode = useOptimisticThemeMode()
	const currentTheme = optimisticMode ?? theme ?? 'system'
	const location = useLocation()
	const { isDocument } = useIsDocument()

	const [open, setOpen] = useState<boolean>(JSON.parse(sidebar) ?? false)
	return (
		<aside
			className={cn(
				'flex h-full w-56 flex-col gap-3 overflow-hidden border-2 border-blue-400 bg-muted text-muted-foreground transition-[width]',
				'max-lg:w-[68px]',
				className,
				open && 'w-[68px]',
			)}
		>
			<div
				className={cn(
					'mx-5 mt-6 flex w-min items-center gap-2',
					'max-lg:mx-auto',
					open && 'mx-auto',
				)}
			>
				<Form preventScrollReset replace method="POST" action="cookie">
					<input
						type="hidden"
						name="returnTo"
						value={location.pathname + location.search}
						readOnly
					/>
					<button
						type="submit"
						name="sidebar"
						value={isDocument ? String(open) : String(!open)}
						onClick={() => setOpen(prevValue => !prevValue)}
						className={cn('max-lg:cursor-default')}
					>
						<Icon
							className={cn(
								'mt-[1.5px] h-8 w-8 cursor-pointer rounded-sm hover:bg-accent',
								'max-lg:cursor-default max-lg:hover:bg-muted',
							)}
							name="hamburger"
						/>
					</button>
				</Form>
				<Link
					to="/"
					className={cn(
						'flex w-min cursor-pointer gap-3',
						'max-lg:hidden',
						open && 'hidden',
					)}
				>
					<h1 className="w-max text-[23px] font-extrabold uppercase tracking-wider">
						CANNY CMS
					</h1>
				</Link>
			</div>
			<GotoSelector
				open={open}
				className={cn('ml-5 mt-2.5', 'max-lg:mx-auto', open && 'mx-auto')}
			/>
			<div
				className={cn(
					'no-scrollbar -mt-2.5 flex h-full flex-col gap-4 overflow-scroll px-5',
					'max-lg:items-center max-lg:px-2.5',
					open && 'items-center px-2.5',
				)}
				onDoubleClick={() => setOpen(prevValue => !prevValue)}
			>
				<ul className="flex w-full flex-col">
					{sideNavList.map(({ icon, isLabel, name, link }, key) => {
						return !isLabel ? (
							<TooltipProvider key={key}>
								<Tooltip delayDuration={0}>
									<TooltipTrigger>
										<NavLink
											to={link ?? ''}
											className={({ isActive }) =>
												cn(
													'my-1 flex cursor-pointer rounded-sm py-1.5 text-sm tracking-wide first:mt-0 hover:bg-accent',
													isActive
														? 'cursor-auto bg-secondary shadow-sm hover:bg-secondary'
														: '',
													'max-lg:justify-center max-lg:p-2.5',
													open && 'justify-center p-2.5',
												)
											}
										>
											<Icon
												name={icon as IconName}
												className={cn(
													'my-0.5 ml-2.5 scale-100 transition-transform',
													'max-lg:ml-0 max-lg:scale-125',
													open && 'ml-0 scale-125',
												)}
											>
												<li
													className={cn(
														'ml-1 min-w-max capitalize',
														'max-lg:hidden',
														open && 'hidden',
													)}
												>
													{name}
												</li>
											</Icon>
										</NavLink>
									</TooltipTrigger>
									<TooltipContent
										align="start"
										className={cn(
											'-mb-28 ml-[50px] hidden ',
											'max-lg:flex',
											open && 'flex',
										)}
									>
										<span>{name}</span>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<div key={name}>
								<div
									className={cn(
										'mb-1 mt-3.5 hidden',
										'max-lg:block max-lg:border-[0.05px] max-lg:border-foreground/70',
										open && 'block border-[0.05px] border-foreground/70',
									)}
								></div>
								<h2
									className={cn(
										'mb-1 mt-3.5 min-w-max text-xs opacity-70 first:mt-0 first:pt-0',
										'max-lg:hidden',
										open && 'hidden',
									)}
								>
									{name}
								</h2>
							</div>
						)
					})}
				</ul>
			</div>
			<div
				className={cn(
					'mb-6 mt-auto flex w-full flex-row items-center justify-between border-t-[1.5px] border-foreground p-2',
					'max-lg:mb-4 max-lg:flex-col max-lg:gap-1',
					open && 'mb-4 flex-col gap-1',
				)}
			>
				<DetailsMenu className="static">
					<DetailsMenuTrigger
						className={cn(
							'flex w-max flex-1 cursor-pointer items-center gap-2 rounded-sm border-none py-2 pl-3 pr-4 text-sm tracking-wide',
							'max-lg:p-3',
							open && 'p-3',
						)}
					>
						<Icon name="avatar" size="md" />
						<div className={cn('max-lg:hidden', open && 'hidden')}>
							<h2 className="mb-1 leading-none">
								{textTruncate(' Vivek Chauhan', 21)}
							</h2>
							<p className="font-mono text-[10px] capitalize leading-none tracking-tight opacity-60">
								{textTruncate('Account Manager', 21)}
							</p>
						</div>
					</DetailsMenuTrigger>
					<DetailsPopup
						className={cn(
							'bottom-20 left-2 w-48',
							'max-lg:bottom-28 max-lg:left-3',
							open && 'bottom-28 left-3',
						)}
					>
						<DetailsMenuLabel className="px-1.5">My Account</DetailsMenuLabel>
						<DetailsMenuSeparator />
						<AccountMenuLink
							link="/profile"
							iconName="person"
							label="My Profile"
						/>
						<AccountMenuLink
							link="/help-feedback"
							iconName="question-mark-circled"
							label="Help / Feedback"
						/>
						<AccountMenuLink link="/logout" iconName="exit" label="Log out" />
					</DetailsPopup>
				</DetailsMenu>
				<ThemeSwitch theme={currentTheme} />
			</div>
		</aside>
	)
}

export function AccountMenuLink({
	link,
	label,
	iconName,
}: {
	link: string
	label: string
	iconName: IconName
}) {
	return (
		<Link
			to={link}
			className="flex items-center gap-2 rounded-md px-1.5 py-2 hover:bg-muted focus:bg-muted"
		>
			<Icon name={iconName} />
			<span>{label}</span>
		</Link>
	)
}

export function ThemeSwitch({ theme }: { theme: Theme | 'system' }) {
	const location = useLocation()
	const iconName: IconName =
		theme === 'system' ? 'laptop' : theme === 'dark' ? 'moon' : 'sun'

	return (
		<DetailsMenu className="static">
			<DetailsMenuTrigger className="w-min border-none p-3">
				<Icon size="md" name={iconName} />
			</DetailsMenuTrigger>
			<DetailsPopup className="bottom-20 w-36">
				<Form
					preventScrollReset
					replace
					method="POST"
					action="cookie"
					className="flex h-full flex-col gap-1"
				>
					<input
						type="hidden"
						name="returnTo"
						value={location.pathname + location.search}
						readOnly
					/>
					<ColorSchemeButton
						icon="sun"
						label="Light"
						value="light"
						name="colorScheme"
						theme={theme}
					/>
					<ColorSchemeButton
						icon="moon"
						label="Dark"
						value="dark"
						name="colorScheme"
						theme={theme}
					/>
					<ColorSchemeButton
						icon="laptop"
						label="System"
						value="system"
						name="colorScheme"
						theme={theme}
					/>
				</Form>
			</DetailsPopup>
		</DetailsMenu>
	)
}

const ColorSchemeButton = ({
	theme,
	label,
	value,
	icon,
	name,
	...props
}: {
	theme: Theme | 'system'
	label: string
	value: Theme | 'system'
	icon: 'sun' | 'moon' | 'laptop'
	name: string
}) => {
	return (
		<Button
			variant="ghost"
			name={name}
			value={value}
			{...props}
			disabled={theme === value}
			className="flex h-9 justify-start gap-2 py-1 font-normal"
		>
			<Icon name={icon} />
			{label}
		</Button>
	)
}
