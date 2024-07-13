import { Form } from '@remix-run/react'
import { cn, textTruncate } from '@/utils/misx'
import { Icon } from './ui/icon'

type FilterTabsProps = {
	filters?: string[] | null
	name: string
}

export function FilterTabs({ filters = [], name }: FilterTabsProps) {
	return (
		<div className={cn('flex max-w-[55%] items-center justify-start gap-2')}>
			<div className="no-scrollbar flex min-w-max gap-1.5 overflow-x-scroll">
				{filters?.map(filter => (
					<div key={filter} className="group relative">
						<div
							key={filter}
							className={cn(
								'flex min-w-max items-center gap-1.5 rounded-sm bg-background p-1.5 text-xs leading-3 tracking-tight text-muted-foreground shadow-sm',
							)}
						>
							{textTruncate(filter, 26)}
							<Form
								method="POST"
								action={`/filters/${name}`}
								className={cn('flex max-h-min')}
							>
								<input
									type="hidden"
									name="all-filters"
									value={filters.join('--')}
								/>
								<button
									name="delete"
									type="submit"
									value={filter}
									className="grid h-min place-items-center rounded-full bg-accent p-1 hover:opacity-80 focus:opacity-80"
								>
									<Icon name="cross" size="xs" />
								</button>
							</Form>
						</div>
					</div>
				))}
			</div>
			{filters?.length ? (
				<Form method="POST" action={`/filters/${name}`}>
					<button
						name="deleteAll"
						value={'true'}
						className="flex h-min flex-shrink items-center justify-center gap-1.5 rounded-sm bg-accent px-2 py-2 text-xs shadow-sm hover:opacity-85"
					>
						<Icon name="update" size="sm" />
					</button>
				</Form>
			) : null}
		</div>
	)
}
