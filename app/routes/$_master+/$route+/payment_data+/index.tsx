import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	redirect,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useCSVDownloader } from 'react-papaparse'
import { DetailsSelector } from '@/components/filter-selector'
import { PaymentDataForEmployeeList } from '@/components/page/payment-data/for-employee-list'
import { PaymentDataForProjectLocationList } from '@/components/page/payment-data/for-project-location-list'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { defaultMonth, defaultYear, MAX_DATA_LENGTH } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, getYearsList, months, transformAttendance } from '@/utils/misx'
import { getData } from '@/utils/servers/data.server'
import { prisma } from '@/utils/servers/db.server'

const PAGE_SIZE = 10
const name = 'payment_datas'

export async function loader({
	request,
	params,
	employees,
	getPaymentData,
}: LoaderFunctionArgs & {
	employees?: any
	getPaymentData?: boolean
}) {
	const url = new URL(request.url)
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear
	const employee = url.searchParams.get('employee') ?? undefined
	const master = params._master
	const route = params.route

	let employee_id = master === 'employees' ? params.route : employee

	let data = {}
	let count = 0
	let exportData = null
	const page = url.searchParams.get('page') ?? '1'

	if (master === 'employees' || getPaymentData) {
		data = await prisma.employee.findMany({
			select: {
				id: true,
				attendance: {
					select: {
						present: true,
						holiday: true,
						no_of_hours: true,
					},
				},
				project_location: {
					select: {
						payment_field: {
							select: {
								name: true,
								value: true,
								value_type: true,
								type: true,
								service_charge_field: true,
							},
						},
					},
				},
			},
			where: {
				id: employee_id,
			},
		})
	} else if (master === 'project_locations') {
		const { data: projectLocationData, count: projectLocationCount } =
			(await getData({
				master: name,
				url: request.url,
				take: PAGE_SIZE,
			})(month, year, route)) as any

		data = projectLocationData
		count = projectLocationCount

		if (url.searchParams.get('export') === 'true') {
			exportData = await prisma.employee.findMany({
				select: {
					full_name: true,
					attendance: {
						select: {
							id: true,
							date: true,
							holiday: true,
							present: true,
							no_of_hours: true,
						},
						where: {
							date: {
								gte: new Date(`${month}/1/${year}`),
								lte: new Date(`${month}/31/${year}`),
							},
						},
					},
				},
				where: { project_location_id: projectLocationData.id },
				take: MAX_DATA_LENGTH * 2,
			})
		}
	}

	return json({
		data,
		count,
		month,
		year,
		page,
		employees,
		master,
		route,
		exportData,
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

export default function IndexPaymentData() {
	const { data, count, page, month, year, master, exportData }: any =
		useLoaderData<typeof loader>()
	const monthList = months
	const yearList = getYearsList(2013, parseInt(defaultYear))

	const { CSVDownloader } = useCSVDownloader()

	const [searchParam, setSearchParam] = useSearchParams()
	const [flattenData, setFlattenData] = useState<any>(exportData)

	const { isDocument } = useIsDocument()

	let children = null

	useEffect(() => {
		setFlattenData(() => transformAttendance({ data: exportData, month, year }))
	}, [searchParam, setSearchParam, exportData, master, year, month])

	if (master === 'employees') {
		children = (
			<PaymentDataForEmployeeList
				data={data}
				month={month}
				year={year}
				page={page}
				count={count}
				pageSize={PAGE_SIZE}
			/>
		)
	} else if (master === 'project_locations') {
		children = (
			<PaymentDataForProjectLocationList
				data={data}
				month={month}
				year={year}
				page={page}
				count={count}
				pageSize={PAGE_SIZE}
			/>
		)
	}

	return (
		<div className="flex flex-col">
			<div className="mb-2 mt-3.5 flex justify-between gap-6">
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
						label="label"
						list={yearList}
						name="year"
						defaultValue={year}
						onChange={(e: any) => {
							searchParam.set('year', e.target.value)
							setSearchParam(searchParam)
						}}
						noLabel={true}
						noNone={true}
						showLabel="label"
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
					{master !== 'employees' && isDocument ? (
						<Button
							variant="accent"
							className="h-full gap-2 rounded-sm px-3"
							onMouseEnter={() => {
								searchParam.set('export', 'true')
								setSearchParam(searchParam)
							}}
							onFocus={() => {
								searchParam.set('export', 'true')
								setSearchParam(searchParam)
							}}
						>
							<CSVDownloader
								className="flex items-center gap-2"
								filename={name}
								data={flattenData}
							>
								<Icon name="export" />
								Export
							</CSVDownloader>
						</Button>
					) : null}
				</div>
			</div>
			{children}
		</div>
	)
}
