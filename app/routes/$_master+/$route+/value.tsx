import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	redirect,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { columns } from '@/components/columns'
import { DataTable } from '@/components/data-table'
import { DetailsSelector } from '@/components/filter-selector'
import { Modal } from '@/components/modal'
import { PaginationButtons } from '@/components/pagination-buttons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { defaultMonth, defaultYear, TAB_PAGE_SIZE } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, getTableHeaders, getYears, months } from '@/utils/misx'
import { getData } from '@/utils/servers/data.server'

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

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const url = new URL(request.url)
	const month = formData.get('month')
	const year = formData.get('year')

	const first = formData.get('first')
	const prev = formData.get('prev')
	const next = formData.get('next')
	const last = formData.get('last')

	if (first === 'true') {
		url.searchParams.set('page', '1')
	} else if (prev) {
		if (parseInt(prev.toString()) >= 1)
			url.searchParams.set('page', prev.toString())
	} else if (next) {
		url.searchParams.set('page', next.toString())
	} else if (last) {
		url.searchParams.set('page', last.toString())
	}

	if (month && month !== '0' && month !== 'none') {
		url.searchParams.set('month', month.toString())
	}

	if (year && year !== '0' && year !== 'none') {
		url.searchParams.set('year', year.toString())
	}

	return redirect(url.toString())
}

export default function Value() {
	const { data, count, page, month, year, route }: any =
		useLoaderData<typeof loader>()
	const monthList = months
	const yearList = getYears(10)

	const [searchParam, setSearchParam] = useSearchParams()
	const [showDelete, setShowDelete] = useState(false)
	const [rowSelection, setRowSelection] = useState({})
	const [rows, setRows] = useState<any>()

	const datasHeader = data ? getTableHeaders(data, ['id', 'company', 'project']) : []

	const { isDocument } = useIsDocument()

	useEffect(() => {
		setRowSelection({})
		setRows([])
		setShowDelete(false)
	}, [page])

	return (
		<div className="flex flex-col h-full">
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
					<DetailsSelector
						label="value"
						list={monthList}
						name="month"
						defaultValue={month}
						onChange={(e: any) => {
							searchParam.set('month', e.target.value)
							setSearchParam(searchParam)
						}}
						noLabel={true}
						noNone={true}
						showLabel="label"
						className="w-min"
						triggerClassName="w-[130px]"
					/>
					<DetailsSelector
						label="value"
						list={yearList}
						name="year"
						defaultValue={year}
						onChange={(e: any) => {
							searchParam.set('year', e.target.value)
							setSearchParam(searchParam)
						}}
						noLabel={true}
						noNone={true}
						className="w-min"
						triggerClassName="w-22"
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
			<div className='flex-1 max-h-full overflow-scroll'>
				<DataTable
					rowSelection={rowSelection}
					setRowSelection={setRowSelection}
					setRows={setRows}
					columns={columns({
						headers: datasHeader,
						name: name,
						singleRoute: name,
						length: 34,
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
