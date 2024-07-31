import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { columns } from '@/components/columns'
import { DataTable } from '@/components/data-table'
import { ExtraFilter } from '@/components/extra-filter'
import { Modal } from '@/components/modal'
import { PaginationButtons } from '@/components/pagination-buttons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { defaultMonth, defaultYear, TAB_PAGE_SIZE } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, getTableHeaders } from '@/utils/misx'
import { getData } from '@/utils/servers/data.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

const name = 'value'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear
	const route = params.route
	const page = url.searchParams.get('page') ?? '1'

	const { data, count } = (await getData({
		master: name,
		url: request.url,
		take: TAB_PAGE_SIZE,
	})(month, year, route)) as any

	return json({
		data,
		count,
		month,
		year,
		page,
		route,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function Value() {
	const { data, count, page, month, year, route }: any =
		useLoaderData<typeof loader>()
	const [searchParam, setSearchParam] = useSearchParams()
	const [showDelete, setShowDelete] = useState(false)
	const [rowSelection, setRowSelection] = useState({})
	const [rows, setRows] = useState<any>()

	const datasHeader = data
		? getTableHeaders(data, ['id', 'company', 'project'])
		: []

	const { isDocument } = useIsDocument()

	useEffect(() => {
		setRowSelection({})
		setRows([])
		setShowDelete(false)
	}, [page])

	return (
		<div className="flex h-full flex-col">
			<Modal
				link={`/${name}/${route}/${name?.toLowerCase()}`}
				modalClassName={cn(!showDelete && 'hidden')}
				setOpen={setShowDelete}
				inMiddle
				shouldNotNavigate
			>
				<Form method="POST">
					{rows?.map((id: string, index: number) => (
						<input key={index} type="hidden" name="ids" value={id} />
					))}
					<h1 className="text-bold px-10 pb-10 pt-6 text-3xl font-bold">
						Are you sure, you want to delete all of them?
					</h1>
					<div className="flex w-full justify-end gap-3">
						<Button
							type="button"
							onClick={() => setShowDelete(false)}
							autoFocus
							className={buttonVariants({
								variant: 'accent',
								className: 'w-28',
							})}
						>
							No
						</Button>

						<Button
							type="submit"
							onClick={() => setShowDelete(false)}
							className={buttonVariants({
								variant: 'destructive',
								className: 'w-28',
							})}
						>
							Delete All
						</Button>
					</div>
				</Form>
			</Modal>
			<div className="mb-1 mt-3.5 flex justify-between gap-6">
				<Form method="POST" className="flex gap-2">
					<ExtraFilter
						month={month}
						year={year}
						searchParam={searchParam}
						setSearchParam={setSearchParam}
					/>
					<Button
						variant="secondary"
						className={cn('hidden px-3', !isDocument && 'flex')}
					>
						Go
					</Button>
				</Form>
				<div className="flex items-center gap-2">
					<Link
						to={`add`}
						className={buttonVariants({
							variant: 'secondary',
							className: 'gap-1.5',
						})}
					>
						<Icon name="plus-circled" />
						Add Value
					</Link>
				</div>
			</div>
			<div className="max-h-full flex-1 overflow-scroll">
				<DataTable
					rowSelection={rowSelection}
					setRowSelection={setRowSelection}
					setRows={setRows}
					columns={columns({
						headers: datasHeader,
						name: name,
						singleRoute: name,
						page: parseInt(page),
						pageSize: TAB_PAGE_SIZE,
					})}
					data={data as any}
				/>
			</div>
			<Form method="POST" className="py-2.5">
				<PaginationButtons count={count} page={page} pageSize={TAB_PAGE_SIZE} />
			</Form>
		</div>
	)
}
