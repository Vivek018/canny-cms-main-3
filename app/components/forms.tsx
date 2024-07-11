import { useSearchParams } from '@remix-run/react'
import React, { useEffect, useId, useState } from 'react'
import { useIsDocument } from '@/utils/clients/is-document'
import { useRefFocus } from '@/utils/clients/ref-focus'
import { cn, replaceUnderscore, textTruncate } from '@/utils/misx'
import { DetailsMenu, DetailsMenuTrigger, DetailsPopup } from './details-menu'
import { ErrorList, type ListOfErrors } from './error-boundary'
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command'
import { Icon } from './ui/icon'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

export function Field({
	labelProps,
	inputProps,
	inputClassName,
	labelClassName,
	errors,
	className,
}: {
	labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>
	inputClassName?: string
	labelClassName?: string
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = inputProps?.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<Label htmlFor={id} className={cn(labelClassName)} {...labelProps} />
			<Input
				id={id}
				{...inputProps}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				placeholder={
					inputProps?.placeholder ?? replaceUnderscore(inputProps?.name ?? '')
				}
				className={cn('w-96 p-2 placeholder:capitalize', inputClassName)}
				onChange={inputProps?.onChange}
			/>
			<div className={cn('-mt-1 w-96 pb-3', inputClassName)}>
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const [defaultValue, setDefaultValue] = useState(textareaProps?.defaultValue)
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	useEffect(() => {
		setDefaultValue(textareaProps?.defaultValue)
	}, [textareaProps?.defaultValue])

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<Label htmlFor={id} {...labelProps} />
			<Textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				required
				placeholder={
					textareaProps.placeholder ??
					replaceUnderscore(textareaProps?.name ?? '')
				}
				aria-describedby={errorId}
				{...textareaProps}
				defaultValue={defaultValue}
			/>
			<div className={cn('-mt-1 w-full pb-3')}>
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function RadioField({
	list,
	name,
	label,
	buttonReset,
	defaultValue,
	dependent = false,
	isNotId,
	errors,
	onChange,
	disabled = false,
	className,
}: {
	list: any
	name: string
	label: string
	buttonReset?: any
	defaultValue?: string
	dependent?: boolean
	isNotId?: boolean
	errors?: ListOfErrors
	onChange?: (e?: any) => void
	disabled?: boolean
	className?: string
}) {
	const [open, setOpen] = useState(false)
	const { ref: inputRef } = useRefFocus(open)
	const { isDocument } = useIsDocument()
	const [currentValue, setCurrentValue] = useState(String(defaultValue))
	const [searchParams, setSearchParams] = useSearchParams()
	const errorId = errors?.length ? `name-error` : undefined

	const valueLabel = list?.find(
		(value: any) =>
			String(value[label]).toLowerCase() ===
			String(currentValue)?.toLowerCase(),
	)?.[label]

	useEffect(() => {
		setCurrentValue(String(defaultValue))
		if (disabled) {
			setCurrentValue('')
		} else {
			setCurrentValue(String(defaultValue))
		}
	}, [defaultValue, disabled])

	useEffect(() => {
		if (dependent && currentValue) {
			searchParams.set(name + 'Dependency', currentValue)
			setSearchParams(searchParams)
		}
		if (buttonReset?.current?.onClick) {
			setCurrentValue('')
		}
	}, [
		buttonReset,
		currentValue,
		dependent,
		name,
		searchParams,
		setSearchParams,
	])

	const noValue = !valueLabel || valueLabel === 'None'

	const fullList = [{ [label]: 'None' }, ...list]

	return (
		<div
			className={cn(
				'mb-2.5 flex w-min flex-col items-center justify-between gap-1',
			)}
		>
			<h1 className={cn('w-full text-start text-sm font-medium capitalize')}>
				{replaceUnderscore(name?.split(' ')[0])}
			</h1>
			<div
				className={cn(
					'flex h-10 w-96 cursor-not-allowed justify-between gap-2 rounded-sm border border-muted-foreground bg-background p-2 text-sm opacity-50',
					!disabled && 'hidden',
					className,
				)}
			>
				<span className={cn('mr-2 capitalize text-gray-500')}>
					{textTruncate(noValue ? replaceUnderscore(name) : valueLabel, 32)}
				</span>
			</div>
			<DetailsMenu
				open={open}
				setOpen={setOpen}
				className={cn('static', disabled && 'hidden')}
			>
				<DetailsMenuTrigger
					className={cn(
						'flex h-10 w-96 justify-between gap-2 border-muted-foreground bg-background p-2 dark:border-muted-foreground',
						className,
					)}
				>
					<>
						<span className={cn('mr-2 capitalize', noValue && 'text-gray-400')}>
							{textTruncate(
								replaceUnderscore(
									noValue ? replaceUnderscore(name) : valueLabel,
								),
								32,
							)}
						</span>
						<Icon name="triangle-down" size="md" />
					</>
				</DetailsMenuTrigger>
				<DetailsPopup className={cn('z-50 w-96', className)}>
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
											value={value[label]}
											className="m-0 px-1"
											disabled={disabled || value[label] === valueLabel}
											onSelect={() => {
												const input = document.getElementById(
													itemId,
												) as HTMLInputElement
												input?.click()
												setCurrentValue(value[label])
												setOpen(false)
											}}
										>
											<Icon
												name="check"
												className={cn(
													value[label] === valueLabel
														? 'opacity-100'
														: 'opacity-0',
												)}
											/>
											<h2
												className={cn(
													'ml-2 flex w-full cursor-pointer flex-row items-center justify-start font-normal capitalize',
												)}
											>
												{textTruncate(
													replaceUnderscore(String(value[label])),
													32,
												)}
											</h2>
											<Input
												id={itemId}
												type="radio"
												checked={value[label] === currentValue && !disabled}
												readOnly={true}
												name={name}
												autoComplete="on"
												value={value[isNotId ? label : 'id']}
												onChange={onChange}
												className={cn(
													'absolute z-40 h-7 w-full cursor-pointer border-none bg-transparent opacity-40 disabled:bg-transparent ',
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
			<div className="w-full pb-1">
				<ErrorList id={errorId} errors={errors} />
			</div>
		</div>
	)
}

export function SelectorField({
	list,
	name,
	label,
	buttonReset,
	defaultValue,
	disabled = false,
	isNotId,
	errors,
}: {
	list: any
	name: string
	label: string
	buttonReset?: any
	defaultValue?: any[]
	disabled?: boolean
	isNotId?: boolean
	errors?: ListOfErrors
}) {
	const [open, setOpen] = useState(false)
	const { ref: inputRef } = useRefFocus(open)
	const { isDocument } = useIsDocument()
	const [currentValues, setCurrentValues] = useState(
		defaultValue ? [...defaultValue] : [],
	)
	const errorId = errors?.length ? `name-error` : undefined

	let valueLabel = currentValues?.map(currentValue => {
		return list?.find(
			(value: any) =>
				String(value[label]).toLowerCase() ===
				currentValue[label]?.toLowerCase(),
		)?.[label]
	})

	valueLabel = valueLabel
		?.filter((value, index, self) => self.indexOf(value) === index)
		.filter(Boolean)

	useEffect(() => {
		setCurrentValues(defaultValue ? [...defaultValue] : [])
		if (buttonReset?.current?.onClick) {
			setCurrentValues([])
		}
	}, [buttonReset, defaultValue])

	const noValue =
		!valueLabel || valueLabel[0] === undefined || valueLabel[0] === 'None'

	return (
		<div
			className={cn(
				'mb-2.5 flex w-min flex-col items-center justify-between gap-1',
			)}
		>
			<h1 className={cn('w-full text-start text-sm font-medium capitalize')}>
				{replaceUnderscore(name) + 's'}
			</h1>
			<DetailsMenu open={open} setOpen={setOpen} className={cn('static')}>
				<DetailsMenuTrigger
					className={cn(
						'no-scrollbar flex h-max max-h-44 w-96 justify-between gap-2 overflow-scroll border-muted-foreground bg-background p-2 dark:border-muted-foreground',
					)}
				>
					<span
						className={cn(
							'row-span-4 mr-2 h-max max-h-44 w-full space-x-2 space-y-2 capitalize',
							noValue && 'text-gray-400',
						)}
					>
						{noValue
							? textTruncate(replaceUnderscore(name + 's'), 32)
							: valueLabel?.map((value: any, index) => (
									<p
										key={value + index}
										className="inline-block w-max rounded-sm bg-secondary px-1.5 py-1 text-xs"
									>
										{textTruncate(replaceUnderscore(value), 14)}
									</p>
								))}
					</span>
					<Icon name="triangle-down" size="md" />
				</DetailsMenuTrigger>
				<DetailsPopup className={cn('z-50 w-96')}>
					<Command>
						<CommandInput
							ref={inputRef}
							divClassName={cn('hidden', isDocument && 'flex')}
						/>
						<CommandList className="no-scrollbar">
							<CommandGroup className="flex flex-col">
								{list?.map((value: any, index: number) => {
									const itemId = String(name + value[label] + index).replaceAll(
										/[^a-zA-Z0-9]/g,
										'',
									)
									const isValue =
										value[label] ===
										valueLabel?.find(val => val === value[label])

									return (
										<CommandItem
											key={itemId}
											value={value[label]}
											disabled={disabled}
											className="m-0 px-1"
											onSelect={() => {
												isValue
													? setCurrentValues(prevVal => {
															return prevVal?.filter(
																val => val[label] !== value[label],
															)
														})
													: setCurrentValues(prevVal => {
															return [...prevVal!, { [label]: value[label] }]
														})
												const input = document?.getElementById(
													itemId,
												) as HTMLInputElement
												input.click()
											}}
										>
											<Icon
												name="check"
												className={cn(
													value[label] ===
														valueLabel?.find(val => val === value[label])
														? 'opacity-100'
														: 'opacity-0',
												)}
											/>
											<h2
												className={cn(
													'ml-2 flex w-full cursor-pointer flex-row items-center justify-start font-normal capitalize',
												)}
											>
												{textTruncate(
													replaceUnderscore(String(value[label])),
													32,
												)}
											</h2>
											<input
												id={itemId}
												type="checkbox"
												name={name}
												readOnly={true}
												disabled={disabled}
												defaultChecked={isValue}
												autoComplete="on"
												value={value[isNotId ? label : 'id']}
												className={cn(
													'absolute hidden cursor-pointer border-none bg-transparent text-transparent opacity-40 disabled:bg-transparent',
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
			<div className="w-full pb-1">
				<ErrorList id={errorId} errors={errors} />
			</div>
		</div>
	)
}
