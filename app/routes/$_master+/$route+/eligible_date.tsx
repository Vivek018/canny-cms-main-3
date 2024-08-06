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
import { getEligiblityDate, getTableHeaders } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import {
	companies,
	projectLocations,
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
							eligible_after_years: true,
						},
						where: {
							id: route,
						},
					},
				},
			},
			joining_date: true,
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
		data[i]['eligiblity_date'] = getEligiblityDate(
			data[i].joining_date,
			data[i].project_location.payment_field[0].eligible_after_years,
		)
	}

	return json({
		data,
		count,
		year,
		page,
		companyList: await companies(),
		projectList: await projects(),
		projectLocationList: await projectLocations(),
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function EligibleDate() {
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
