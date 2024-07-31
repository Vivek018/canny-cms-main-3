import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { columns } from '@/components/columns'
import { DataTable } from '@/components/data-table'
import { ExtraFilter } from '@/components/extra-filter'
import { PaginationButtons } from '@/components/pagination-buttons'
import { defaultYear, TAB_PAGE_SIZE } from '@/constant'
import {
	extractPaymentData,
	getMonthLabel,
	getTableHeaders,
} from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import {
	companies,
	project_locations,
	projects,
} from '@/utils/servers/list.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const route = params.route
	const url = new URL(request.url)
	const companyId = url.searchParams.get('company') ?? null
	const projectId = url.searchParams.get('project') ?? null
	const projectLocationId = url.searchParams.get('project_location') ?? null
	const year = url.searchParams.get('year') ?? defaultYear
	const page = url.searchParams.get('page') ?? '1'
	const data: any = await prisma.employee.findMany({
		select: {
			id: true,
			full_name: true,
			designation: true,
			joining_date: true,
			skill_type: true,
			company_id: true,
			project_id: true,
			company: {
				select: { name: true },
			},
			project: {
				select: { name: true },
			},
			project_location: {
				select: {
					district: true,
					payment_field: {
						select: {
							name: true,
							is_deduction: true,
							percentage_of: {
								select: {
									name: true,
									is_deduction: true,
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
												select: { id: true },
											},
											project: {
												select: { id: true },
											},
											employee: {
												select: { id: true },
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
													year: {
														equals: parseInt(year),
													},
												},
											],
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
										select: { id: true },
									},
									project: {
										select: { id: true },
									},
									employee: {
										select: { id: true },
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
											year: {
												equals: parseInt(year),
											},
										},
									],
								},
							},
						},
						where: {
							id: route,
						},
						orderBy: { sort_id: 'asc' },
					},
				},
			},
		},
		where: {
			AND: [
				companyId
					? {
							company_id: companyId,
						}
					: {},
				projectId
					? {
							project_id: projectId,
						}
					: {},
				projectLocationId
					? {
							project_location_id: projectLocationId,
						}
					: {},
			],
		},
		orderBy: [{ created_at: 'desc' }, { id: 'desc' }] as unknown as any,
		take: TAB_PAGE_SIZE,
		skip: (parseInt(page) - 1) * TAB_PAGE_SIZE,
	})
	const count = await prisma.employee.count({
		where: {
			AND: [
				companyId
					? {
							company_id: companyId,
						}
					: {},
				projectId
					? {
							project_id: projectId,
						}
					: {},
				projectLocationId
					? {
							project_location_id: projectLocationId,
						}
					: {},
			],
		},
	})

	for (let i = 0; i < data.length; i++) {
		const employeeId = data[i].id
		const paymentFieldData = data[0].project_location?.payment_field[0]
		for (let j = 1; j <= 12; j++) {
			data[i][getMonthLabel(j.toString())?.substring(0, 3) + '_' + year] =
				extractPaymentData({
					employee: {
						id: data[i].id,
						company_id: data[i].company_id,
						project_id: data[i].project_id,
						skill_type: data[i].skill_type,
					},
					payment_field: paymentFieldData,
					attendance: await prisma.attendance.findMany({
						select: {
							no_of_hours: true,
							present: true,
							holiday: true,
						},
						where: {
							employee_id: employeeId,
							present: true,
							date: {
								gte: new Date(`${j}/1/${year}`),
								lte: new Date(`${j}/31/${year}`),
							},
						},
					}),
					month: j,
					year: parseInt(year),
				})
		}
	}
	return json({
		data,
		count,
		year,
		page,
		companyList: await companies(),
		projectList: await projects(),
		projectLocationList: await project_locations(),
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function Report() {
	const {
		data,
		count,
		year,
		page,
		companyList,
		projectList,
		projectLocationList,
	} = useLoaderData<typeof loader>()
	const [searchParam, setSearchParam] = useSearchParams()

	const datasHeader = data
		? getTableHeaders(data, [
				'id',
				'company_id',
				'project_id',
				'project_location_id',
				'payment_field',
				'attendance',
			])
		: []

	return (
		<div className="flex h-full flex-col py-2.5">
			<ExtraFilter
				searchParam={searchParam}
				setSearchParam={setSearchParam}
				companyList={companyList}
				projectList={projectList}
				projectLocationList={projectLocationList}
				year={year}
			/>
			<div className="max-h-full flex-1 pt-2">
				<DataTable
					setRows={() => {}}
					columns={columns({
						headers: datasHeader,
						name: 'employees',
						singleRoute: 'employee',
						page: parseInt(page),
						pageSize: TAB_PAGE_SIZE,
						noSelect: true,
						noActions: true,
					})}
					data={data as any}
				/>
			</div>
			<Form method="POST">
				<PaginationButtons page={page} count={count} pageSize={TAB_PAGE_SIZE} />
			</Form>
		</div>
	)
}
