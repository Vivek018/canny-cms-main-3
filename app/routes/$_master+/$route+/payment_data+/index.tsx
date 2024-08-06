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
import { PaymentDataForMasterList } from '@/components/page/payment-data/for-master-list'
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
import {
	cn,
	extractPaymentData,
	flattenObject,
	months,
	transformPaymentData,
} from '@/utils/misx'
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
		const employeeData = await prisma.employee.findFirst({
			select: {
				id: true,
				joining_date: true,
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
								eligible_after_years: true,
								percentage_of: {
									select: {
										name: true,
										is_deduction: true,
										eligible_after_years: true,
										value: {
											select: {
												value: true,
												min_value: true,
												max_value: true,
												type: true,
												value_type: true,
												skill_type: true,
												pay_frequency: true,
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
												employee: {
													select: {
														id: true,
													},
												},
											},
											where: {
												OR: [
													{
														year: {
															lt: parseInt(year),
														},
													},
													{
														month: {
															lte: parseInt(month),
														},
														year: {
															equals: parseInt(year),
														},
													},
												],
											},
											orderBy: [
												{ year: 'desc' },
												{ month: 'desc' },
												{ id: 'desc' },
											],
											take: 1,
										},
									},
								},
								min_value_of: {
									select: {
										name: true,
										is_deduction: true,
										eligible_after_years: true,
										value: {
											select: {
												value: true,
												min_value: true,
												max_value: true,
												type: true,
												value_type: true,
												skill_type: true,
												pay_frequency: true,
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
												employee: {
													select: {
														id: true,
													},
												},
											},
											where: {
												OR: [
													{
														year: {
															lt: parseInt(year),
														},
													},
													{
														month: {
															lte: parseInt(month),
														},
														year: {
															equals: parseInt(year),
														},
													},
												],
											},
											orderBy: [
												{ year: 'desc' },
												{ month: 'desc' },
												{ id: 'desc' },
											],
											take: 1,
										},
									},
								},
								value: {
									select: {
										value: true,
										min_value: true,
										max_value: true,
										type: true,
										value_type: true,
										skill_type: true,
										pay_frequency: true,
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
										employee: {
											select: {
												id: true,
											},
										},
									},
									where: {
										OR: [
											{
												year: {
													lt: parseInt(year),
												},
											},
											{
												month: {
													lte: parseInt(month),
												},
												year: {
													equals: parseInt(year),
												},
											},
										],
									},
									orderBy: [
										{ year: 'desc' },
										{ month: 'desc' },
										{ id: 'desc' },
									],
									take: 1,
								},
							},
							where: {
								is_statutory: false,
							},
							orderBy: { sort_id: 'asc' },
						},
					},
				},
			},
			where: {
				id: employee_id,
			},
		})

		data = employeeData?.project_location?.payment_field?.map(
			(payment_field: any) => ({
				id: payment_field.id,
				name: payment_field.name,
				month: months.find(m => m.value === month)?.label,
				year,
				value: extractPaymentData({
					attendance: employeeData?.attendance,
					payment_field: payment_field,
					employee: {
						id: employeeData.id,
						joining_date: employeeData.joining_date!,
						company_id: employeeData.company_id!,
						project_id: employeeData.project_id!,
						skill_type: employeeData.skill_type!,
					},
					month: parseInt(month),
					year: parseInt(year),
				}),
			}),
		)
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

		data = transformPaymentData({ data: paymentDataListData, month, year })
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

			exportData = transformPaymentData({ data: exportData?.data, month, year })
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
		exportData,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function IndexRoutePaymentData() {
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
	const { handleEnter, handleLeave } = useMouseEvent({
		searchParam,
		setSearchParam,
	})
	const [flattenData, setFlattenData] = useState<any>()

	const { isDocument } = useIsDocument()

	useEffect(() => {
		if (exportData) {
			setFlattenData(() =>
				exportData.map((value: any) =>
					flattenObject({
						obj: value,
						ignore: [
							'id',
							'attendance',
							'percentage_of',
							'min_value_of',
							'value',
						],
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
			<PaymentDataForMasterList
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
								onMouseEnter={handleEnter}
								onMouseLeave={handleLeave}
								onFocus={handleEnter}
								onBlur={handleLeave}
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
