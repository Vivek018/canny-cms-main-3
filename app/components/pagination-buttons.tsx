import { PAGE_SIZE } from '@/constant'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export function PaginationButtons({
	count,
	page,
	pageSize = PAGE_SIZE,
}: {
	count: number
	page: string
	pageSize?: number
}) {
	const buttonClassName =
		'h-full w-min bg-accent p-1.5 text-accent-foreground drop-shadow-sm hover:bg-accent/50 focus-visible:brightness-75 disabled:bg-transparent'

	return (
		<div className="mb-1 mt-1.5 flex items-center justify-center gap-5 text-sm">
			<Button
				variant="default"
				name="first"
				value="true"
				disabled={parseInt(page) === 1}
				size="icon"
				className={buttonClassName}
			>
				<Icon name="double-arrow-left" size="xs" />
			</Button>
			<Button
				variant="default"
				name="prev"
				value={parseInt(page) - 1}
				disabled={parseInt(page) === 1}
				size="icon"
				className={buttonClassName}
			>
				<Icon name="chevron-left" size="xs" />
			</Button>
			<p>{page}</p>
			<Button
				variant="default"
				name="next"
				value={parseInt(page) + 1}
				disabled={parseInt(page) >= count / pageSize}
				size="icon"
				className={buttonClassName}
			>
				<Icon name="chevron-right" size="xs" />
			</Button>
			<Button
				variant="default"
				name="last"
				value={
					count / pageSize === Math.floor(count / pageSize)
						? count / pageSize
						: Math.floor(count / pageSize) + 1
				}
				disabled={isNaN(count) || parseInt(page) >= count / pageSize}
				size="icon"
				className={buttonClassName}
			>
				<Icon name="double-arrow-right" size="xs" />
			</Button>
		</div>
	)
}
