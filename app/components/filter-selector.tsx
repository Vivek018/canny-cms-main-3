import { Form, useSearchParams } from '@remix-run/react'
import { type ReactNode, useEffect, useState } from 'react'
import { useIsDocument } from '@/utils/clients/is-document'
import { useRefFocus } from '@/utils/clients/ref-focus'
import { filters } from '@/utils/filters'
import { cn, replaceUnderscore } from '@/utils/misx'
import { DetailsMenu, DetailsMenuTrigger, DetailsPopup } from './details-menu'
import { Button } from './ui/button'
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command'
import { Icon } from './ui/icon'
import { Input } from './ui/input'
import { Shortcut } from './ui/shortcut'

export function FilterSelector({
	name,
	list,
	defaultValue,
}: {
	name: string
	list: any
	defaultValue?: any
}) {
	const [filterFocus, setFilterFocus] = useState(false)
	const hide =
		filters[name as keyof typeof filters]().length === 0 ||
		(filters[name as keyof typeof filters]().length === 1 &&
			filters[name as keyof typeof filters]()[0].name === 'search')

	return (
		<DetailsMenu
			open={filterFocus}
			setOpen={setFilterFocus}
			className={cn(hide && 'hidden')}
		>
			<DetailsMenuTrigger open={filterFocus}>
				<Icon name="filter">
					<span>Filter</span>
				</Icon>
				<Shortcut char="f" focus={filterFocus} setFocus={setFilterFocus} />
			</DetailsMenuTrigger>
			<DetailsPopup className="right-0 max-h-[500px] overflow-visible">
				<div className="flex flex-col items-center justify-center gap-4 p-3">
					{filters[name as keyof typeof filters]().map((filter: any) => {
						const filterName = filter.name
						const filterShowLabel = filter.showLabel
						const filterLabel = filter.label
						const filterType = filter.type
						const filterDefaultValue = filter.defaultValue
						if (filterName !== 'search')
							if (!filterType)
								return (
									<DetailsSelector
										key={filterName}
										list={list[filter?.name as keyof typeof list]}
										label={filterLabel}
										showLabel={filterShowLabel}
										name={filterName}
										defaultValue={filterDefaultValue}
									/>
								)
							else {
								if (filterType === 'number')
									return (
										<DetailsNumberSelector key={filterName} name={filterName} />
									)
								else
									return (
										<DetailsDateRangeSelector
											key={filterName}
											label={filterLabel}
											name={filterName}
										/>
									)
							}
						else return null
					})}
				</div>
			</DetailsPopup>
		</DetailsMenu>
	)
}

export const FormFilterSelector = ({
	children,
	name,
}: {
	children: ReactNode
	name: string
}) => {
	const [searchParams] = useSearchParams()
	return (
		<Form
			key={searchParams.toString()}
			method="POST"
			action={`/filters/${name}`}
			className="flex h-full items-center gap-3"
		>
			{children}
			<Button variant="secondary" size="icon">
				Go
			</Button>
		</Form>
	)
}

function DetailsNumberSelector({ name }: { name: string }) {
	const [searchParams] = useSearchParams()
	return (
		<div className="flex w-full items-center justify-between gap-3">
			<h1 className="w-max text-start text-base font-bold capitalize">
				{replaceUnderscore(name)}
			</h1>
			<Input
				className="w-[170px] gap-2 border-muted-foreground bg-popover p-2 capitalize dark:border-muted-foreground"
				type="number"
				min={0}
				defaultValue={parseInt(searchParams.get(name) ?? '0')}
				placeholder={replaceUnderscore(name)}
				name={name}
				id={name}
			/>
		</div>
	)
}

function DetailsDateRangeSelector({
	name,
	label,
}: {
	name: string
	label: string
}) {
	const [searchParams] = useSearchParams()
	return (
		<div className="flex w-full items-center justify-between gap-3">
			<h1 className="w-max text-start text-base font-bold capitalize">
				{replaceUnderscore(name)}
			</h1>
			<Input
				className="flex w-[170px] items-center justify-center border-muted-foreground bg-popover p-2 capitalize tracking-[0.135em] dark:border-muted-foreground"
				type="date"
				defaultValue={searchParams.get(name) ?? ''}
				placeholder={replaceUnderscore(name)}
				name={name}
				id={name}
			/>
		</div>
	)
}

export function DetailsSelector({
	list,
	name,
	label,
	defaultValue,
	noLabel,
	noNone,
	showLabel,
	className,
	triggerClassName,
	popClassName,
	onChange,
	length,
}: {
	list: any
	name: string
	label: string
	defaultValue?: any
	noLabel?: boolean
	noNone?: boolean
	showLabel?: string
	className?: string
	triggerClassName?: string
	popClassName?: string
	onChange?: any
	length?: number
}) {
	const [open, setOpen] = useState(false)
	const { ref: inputRef } = useRefFocus(open)
	const { isDocument } = useIsDocument()
	const [searchParams] = useSearchParams()
	const [currentValue, setCurrentValue] = useState(
		defaultValue ?? searchParams.get(name),
	)
	const fullList = noNone
		? list
		: list
			? [
					{ [showLabel ?? label]: 'none', [label]: 'none' },
					...list,
				]
			: []

	const valueLabel = fullList?.find((value: any) => {
		return (
			String(value[label]).toLowerCase() === String(currentValue)?.toLowerCase()
		)
	})?.[showLabel ?? label]

	useEffect(() => {
		setCurrentValue(searchParams.get(name) ?? defaultValue)
	}, [name, defaultValue, searchParams])

	const noValue = !valueLabel || valueLabel === 'none'

	return (
		<div
			className={cn(
				'flex w-full items-center justify-between gap-3',
				className,
			)}
		>
			<h1
				className={cn(
					'w-max text-start text-base font-bold capitalize',
					noLabel && 'hidden',
				)}
			>
				{replaceUnderscore(name)}
			</h1>
			<DetailsMenu open={open} setOpen={setOpen} className={cn('')}>
				<DetailsMenuTrigger
					className={cn(
						'flex w-[170px] justify-between gap-2 border-muted-foreground bg-popover p-2 dark:border-muted-foreground',
						triggerClassName,
					)}
				>
					<span
						className={cn(
							'mr-2 truncate capitalize',
							noValue && 'text-gray-400',
						)}
					>
						{replaceUnderscore(noValue ? name : valueLabel)}
					</span>
					<Icon name="triangle-down" size="md" className='flex-shrink-0' />
				</DetailsMenuTrigger>
				<DetailsPopup className={cn('z-50 w-52', popClassName)}>
					<Command>
						<CommandInput
							ref={inputRef}
							divClassName={cn('hidden', isDocument && 'flex')}
						/>
						<CommandList className="no-scrollbar">
							<CommandGroup className="flex flex-col">
								{fullList?.map((value: any, index: number) => {
									const itemId = String(name + value[label] + index).replaceAll(
										/[^a-zA-Z0-9]/g,
										'',
									)
									return (
										<CommandItem
											key={itemId}
											value={value[showLabel ?? label]}
											className="m-0 px-1 py-0 "
											disabled={value[showLabel ?? label] === valueLabel}
											onChange={onChange}
											onSelect={() => {
												const input: any = document.querySelector(
													`input#${itemId}`,
												)
												input.click()
											}}
										>
											<Icon
												name="check"
                        size="sm"
												className={cn(
													value[showLabel ?? label] === valueLabel
														? 'opacity-100'
														: 'opacity-0',
												)}
											/>
											<h2 className="ml-2 inline py-1.5 w-full cursor-pointer text-start truncate font-normal capitalize">
												{replaceUnderscore(value[showLabel ?? label])}
											</h2>
											<Input
												id={itemId}
												type="radio"
												defaultChecked={value[label] === valueLabel}
												name={name}
												autoComplete="on"
												value={value[label]}
												onClick={() => {
													setCurrentValue(value[label])
													setOpen(false)
												}}
												className={cn(
													'absolute z-40 h-7 w-full cursor-pointer border-none bg-transparent opacity-40 disabled:bg-transparent',
												)}
											/>
										</CommandItem>
									)
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</DetailsPopup>
			</DetailsMenu>
		</div>
	)
}
