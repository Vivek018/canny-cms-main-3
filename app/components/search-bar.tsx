import { useSearchParams } from '@remix-run/react'
import { useEffect, useId, useState } from 'react'
import { useRefFocus } from '@/utils/clients/ref-focus'
import { cn } from '@/utils/misx'
import { Icon } from './ui/icon'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Shortcut } from './ui/shortcut'

type SearchBarProps = {
	className?: string
	inputClassName?: string
	needFocus?: boolean
	maxLength?: number
}

export function SearchBar({
	className,
	inputClassName,
	needFocus = true,
	maxLength,
}: SearchBarProps) {
	const id = useId()
	const [focus, setFocus] = useState(false)
	const [searchParams] = useSearchParams()
	const { ref: inputRef } = useRefFocus(focus)

	useEffect(() => {
		inputRef.current.value = searchParams.get('search')
	}, [inputRef, searchParams])

	return (
		<div
			className={cn(
				'relative flex h-11 w-64 flex-row flex-wrap items-center justify-start rounded-sm border border-gray-300 bg-muted p-2 dark:border-gray-800',
				className,
			)}
		>
			<Label htmlFor={id} className="sr-only">
				Search
			</Label>
			<Icon name="search" />
			<Input
				type="search"
				name="search"
				pattern="[a-zA-Z 0-9]*"
				maxLength={maxLength ?? 40}
				ref={inputRef}
				id={id}
				defaultValue={searchParams.get('search') ?? ''}
				placeholder="Search"
				className={cn(
					'flex-1 border-0 px-2 my-auto bg-transparent hover:bg-transparent focus:bg-transparent',
					inputClassName,
				)}
				onFocus={() => setFocus(true)}
				onBlur={() => setFocus(false)}
			/>

			{needFocus ? (
				<Shortcut char="k" focus={focus} setFocus={setFocus} />
			) : null}
		</div>
	)
}
