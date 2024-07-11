import { type Dispatch, type SetStateAction, useEffect } from 'react'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn } from '@/utils/misx'

export function Shortcut({
	focus,
	setFocus,
	char,
	absolute = false,
	className,
}: {
	focus: boolean
	setFocus: Dispatch<SetStateAction<boolean>>
	char: string
	absolute?: boolean
	className?: string
}) {
	const { isDocument } = useIsDocument()

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === char) {
				e.preventDefault()
				setFocus(prevValue => !prevValue)
			}
		}
		document.addEventListener('keydown', down)
		return () => document.removeEventListener('keydown', down)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div
			className={cn(
				'ml-auto hidden gap-[2px] rounded-sm bg-background px-1.5 py-1 text-xs group-hover:bg-background',
				isDocument && 'flex',
				focus && 'hidden',
				absolute && 'absolute right-2.5 top-1/2 -translate-y-1/2',
				className,
			)}
		>
			<span>⌘</span>
			<span className="uppercase">{char}</span>
		</div>
	)
}
