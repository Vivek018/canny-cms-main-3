import { Link } from '@remix-run/react'
import {
	DetailsMenu,
	DetailsMenuLabel,
	DetailsMenuSeparator,
	DetailsMenuTrigger,
	DetailsPopup,
} from '@/components/details-menu'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { PAGE_SIZE } from '@/constant'
import {
	cn,
	formatStringIntoHtml,
	isTitle,
	replaceUnderscore,
} from '../utils/misx'
import { Checkbox } from './ui/checkbox'

export const columns = ({
	headers,
	name,
	singleRoute,
	length = 12,
	extraRoute = '',
	page = 1,
	pageSize = PAGE_SIZE,
	updateLink,
	noSelect = false,
	noActions = false,
}: {
	headers: {
		accessorKey: string
		header: string
	}[]
	name: string
	singleRoute: string
	length?: number
	extraRoute?: string
	page?: number
	pageSize?: number
	updateLink?: string
	noSelect?: boolean
	noActions?: boolean
}): any[] => [
	{
		id: 'select',
		header: ({ table }: any) => (
			<Checkbox
				className={cn('mx-2 hidden', !noSelect && headers.length && 'flex')}
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }: any) => (
			<Checkbox
				className={cn('mx-2 hidden', !noSelect && headers.length && 'flex')}
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
	},
	headers.length
		? {
				id: 'sr. no',
				header: <h2 className="min-w-max">Sr. No</h2>,
				cell: ({ row }: any) => {
					return (
						<p className="min-w-max">
							{page * pageSize - (pageSize - (row.index + 1))}
						</p>
					)
				},
			}
		: { id: 'sr. no' },
	...headers.map(({ accessorKey, header }) => ({
		id: accessorKey,
		accessorKey: accessorKey,
		header: <h2 className="min-w-max">{replaceUnderscore(header)}</h2>,
		cell: ({ row }: { row: any }) => {
			const value = row.renderValue(accessorKey)

			if (isTitle(accessorKey)) {
				const link = `/${name}/${row.original.id}${extraRoute ? `/${extraRoute}` : ''}`
				return (
					<Link
						to={link}
						className={cn(
							'h-min pl-0 capitalize underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none',
						)}
					>
						<div className="max-w-52 truncate">
							{typeof value === 'string' ? replaceUnderscore(value) : value}
						</div>
					</Link>
				)
			} else
				return (
					<div className="max-w-52">{formatStringIntoHtml(value, length)}</div>
				)
		},
	})),
	{
		id: 'actions',
		cell: ({ row }: { row: any }) => {
			return (
				<DetailsMenu>
					<DetailsMenuTrigger
						className={cn(
							'h-min w-min border-none bg-transparent',
							(noActions || !headers.length) && 'hidden',
						)}
					>
						<span className="sr-only">Open menu</span>
						<Icon name="dots-vertical" size="xs" />
					</DetailsMenuTrigger>
					<DetailsPopup
						className={cn('right-0 gap-px', row.index > 5 && ' bottom-8')}
					>
						<DetailsMenuLabel className="px-2 py-0.5">Actions</DetailsMenuLabel>
						<DetailsMenuSeparator />
						<Link
							className={cn(
								buttonVariants({
									variant: 'ghost',
									className: cn('h-min justify-start py-1.5 capitalize'),
								}),
							)}
							to={`/${name}/${row.original.id}${extraRoute ? `/${extraRoute}` : ''}`}
						>
							<div>
								View {replaceUnderscore(singleRoute)}{' '}
								{extraRoute ? ' - ' + extraRoute?.split('?')[0] : null}
							</div>
						</Link>
						<Link
							className={cn(
								buttonVariants({
									variant: 'ghost',
									className: cn('h-min justify-start py-1.5 capitalize'),
								}),
							)}
							to={
								updateLink
									? updateLink +
										`${extraRoute?.split('?')[0] === 'attendance' ? `&employee=${row.original.id}` : ''}`
									: `/${name}/${row.original.id}${extraRoute ? `/${extraRoute}` : ''}/update`
							}
						>
							<div>
								Update {replaceUnderscore(singleRoute)}{' '}
								{extraRoute ? ' - ' + extraRoute?.split('?')[0] : null}
							</div>
						</Link>
					</DetailsPopup>
				</DetailsMenu>
			)
		},
	},
]
