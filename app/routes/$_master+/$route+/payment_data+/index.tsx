import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useCSVDownloader } from 'react-papaparse'
import { ExtraFilter } from '@/components/extra-filter'
import { PaymentDataForEmployeeList } from '@/components/page/payment-data/for-employee-list'
import { PaymentDataForProjectLocationList } from '@/components/page/payment-data/for-project-location-list'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
	defaultMonth,
	defaultYear,
	MAX_DATA_LENGTH,
	singleRouteName,
	TAB_PAGE_SIZE,
} from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { useMouseEvent } from '@/utils/clients/mouse-event'
import { cn, flattenObject, transformPaymentData } from '@/utils/misx'
import { getData } from '@/utils/servers/data.server'
import { prisma } from '@/utils/servers/db.server'
import { companies, projects } from '@/utils/servers/list.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

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
	const master = params._master
	const route = params.route

	const page = url.searchParams.get('page') ?? '1'
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear
	const employee = url.searchParams.get('employee') ?? undefined
	const company_id = url.searchParams.get('company') ?? undefined
	const project_id = url.searchParams.get('project') ?? undefined
	let employee_id = master === 'employees' ? params.route : employee

	let data = null
	let count = 0
	let exportData = null
	let companyList = null
	let projectList = null

	if (master === 'employees' || getPaymentData) {
		data = await prisma.employee.findFirst({
			select: {
				id: true,
				skill_type: true,
				company_id: true,
				project_id: true,
				attendance: {
					select: {
						present: true,
						holiday: true,
						no_of_hours: true,
					},
					where: {
						date: {
							gte: new Date(`${month}/1/${year}`),
							lte: new Date(`${month}/31/${year}`),
						},
					},
				},
				project_location: {
					select: {
						payment_field: {
							select: {
								id: true,
								name: true,
								is_deduction: true,
								service_charge_field: true,
								percentage_of: {
									select: {
										name: true,
										is_deduction: true,
										service_charge_field: true,
										value: {
											select: {
												value: true,
												max_value: true,
												type: true,
												value_type: true,
												skill_type: true,
												month: true,
												year: true,
												company: {
													select: {
														id: true,
													},
												},
												project: {
													select: {
														id: true,
													},
												},
											},
											where: {
												month: {
													lte: parseInt(month),
												},
												year: {
													lte: parseInt(year),
												},
											},
										},
									},
								},
								value: {
									select: {
										value: true,
										max_value: true,
										type: true,
										value_type: true,
										skill_type: true,
										month: true,
										year: true,
										company: {
											select: {
												id: true,
											},
										},
										project: {
											select: {
												id: true,
											},
										},
									},
									where: {
										month: {
											lte: parseInt(month),
										},
										year: {
											lte: parseInt(year),
										},
									},
								},
							},
							orderBy: { sort_index: 'asc' },
						},
					},
				},
			},
			where: {
				id: employee_id,
			},
		})
	} else {
		if (master === 'project_locations' || master === 'projects') {
			companyList = await companies()
		}
		if (master === 'project_locations') {
			projectList = await projects()
		}
		const { data: paymentDataListData, count: paymentDataListCount } =
			(await getData({
				master: name,
				url: request.url,
				take: TAB_PAGE_SIZE,
			})(
				month,
				year,
				route,
				singleRouteName[master!],
				company_id,
				project_id,
			)) as any

		data = paymentDataListData
		count = paymentDataListCount

		if (url.searchParams.get('export') === 'true') {
			exportData = (await getData({
				master: name,
				url: request.url,
				take: Math.min(MAX_DATA_LENGTH, count),
			})(
				month,
				year,
				route,
				singleRouteName[master!],
				company_id,
				project_id,
			)) as any
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
		companyList,
		projectList,
		exportData: exportData?.data,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function IndexPaymentData() {
	const {
		data,
		count,
		page,
		month,
		year,
		master,
		companyList,
		projectList,
		exportData,
	} = useLoaderData<typeof loader>()
	const { CSVDownloader } = useCSVDownloader()

	const [searchParam, setSearchParam] = useSearchParams()
	const { handleMouseEnter, handleMouseLeave } = useMouseEvent({
		searchParam,
		setSearchParam,
	})
	const [flattenData, setFlattenData] = useState<any>()

	const { isDocument } = useIsDocument()

	useEffect(() => {
		if (exportData) {
			setFlattenData(() =>
				transformPaymentData({ data: exportData, month, year }).map(
					(value: any) =>
						flattenObject({
							obj: value,
							ignore: ['id', 'attendance', 'percentage_of', 'value'],
						}),
				),
			)
		}
	}, [exportData, year, month])

	let children = null

	if (master === 'employees') {
		children = (
			<PaymentDataForEmployeeList
				data={data}
				month={month}
				year={year}
				page={page}
				pageSize={TAB_PAGE_SIZE}
			/>
		)
	} else {
		children = (
			<PaymentDataForProjectLocationList
				data={data}
				month={month}
				year={year}
				page={page}
				routeName={singleRouteName[master!]}
				count={count}
				pageSize={TAB_PAGE_SIZE}
			/>
		)
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex justify-between gap-6 pb-1 pt-3.5">
				<Form method="POST" className="flex gap-2">
					<ExtraFilter
						companyList={companyList}
						projectList={projectList}
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
					{master !== 'employees' && isDocument ? (
						<>
							<Button
								variant="accent"
								className="h-full gap-2 rounded-sm px-3"
								onMouseEnter={handleMouseEnter}
								onMouseLeave={handleMouseLeave}
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
						</>
					) : null}
				</div>
			</div>
			{children}
		</div>
	)
}
