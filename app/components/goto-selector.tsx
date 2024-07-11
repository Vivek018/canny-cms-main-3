import { Link, useNavigate } from '@remix-run/react'
import { useState } from 'react'
import { navList } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { useRefFocus } from '@/utils/clients/ref-focus'
import { cn, textTruncate } from '@/utils/misx'
import { type IconName } from '~/icon-name'
import { DetailsMenu, DetailsMenuTrigger, DetailsPopup } from './details-menu'
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command'
import { Icon } from './ui/icon'
import { Shortcut } from './ui/shortcut'

export function GotoSelector({
	open,
	className,
}: {
	open?: boolean
	className?: string
}) {
	const [gotofocus, setGotoFocus] = useState(false)
	const { ref: inputRef } = useRefFocus(gotofocus)
	const { isDocument } = useIsDocument()
	const navigate = useNavigate()

	return (
		<DetailsMenu
			open={gotofocus}
			setOpen={setGotoFocus}
			closeOnSubmit={false}
			className={cn('static', 'max-lg:px-3', open && 'px-3')}
		>
			<DetailsMenuTrigger
				open={gotofocus}
				className={cn(
					'w-[185px] rounded-md bg-background dark:border-accent',
					className,
					'max-lg:flex max-lg:w-full max-lg:items-center max-lg:justify-center',
					open && 'flex w-full items-center justify-center',
				)}
			>
				<Icon name="new-window" size="md">
					<span className={cn('max-lg:hidden', open && ' hidden')}>Go To</span>
				</Icon>
				<Shortcut
					className={cn('bg-muted', 'max-lg:hidden', open && 'hidden')}
					char="g"
					focus={gotofocus}
					setFocus={setGotoFocus}
				/>
			</DetailsMenuTrigger>
			<DetailsPopup
				className={cn('mx-5 w-52', 'max-lg:mx-0', open && 'mx-0')}
			>
				<Command>
					<CommandInput
						divClassName={cn('hidden', isDocument && 'flex')}
						ref={inputRef}
					/>
					<CommandList className="no-scrollbar">
						<CommandGroup className="flex flex-col rounded-md">
							{navList.map(({ name, icon, isLabel, link }) => {
								return !isLabel ? (
									<CommandItem
										key={link}
										value={name}
										className="m-0 p-0"
										onSelect={() => navigate(`${link}`)}
									>
										<Link
											key={link}
											to={link!}
											className={cn(
												'my-0.5 flex h-1 items-center justify-start gap-2 rounded-sm px-2 py-4 hover:bg-accent',
											)}
										>
											<Icon name={icon as IconName}>
												{textTruncate(name, 18)}
											</Icon>
										</Link>
									</CommandItem>
								) : null
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</DetailsPopup>
		</DetailsMenu>
	)
}
