import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useCSVDownloader, useCSVReader } from 'react-papaparse'
import { ExtraFilter } from '@/components/extra-filter'
import { ImportData } from '@/components/import-data'
import { AttendanceGrid } from '@/components/page/attendance/grid'
import { AttendanceList } from '@/components/page/attendance/list'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { cn, transformAttendance } from '@/utils/misx'
import { getData } from '@/utils/servers/data.server'
import { prisma } from '@/utils/servers/db.server'
import { companies, projects } from '@/utils/servers/list.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

const name = 'attendances'

export async function loader({
	request,
	params,
	getAttendance,
}: LoaderFunctionArgs & {
	getAttendance?: boolean
}) {
	const url = new URL(request.url)
	const master = params._master
	const route = params.route

	const page = url.searchParams.get('page') ?? '1'
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear
	const company_id = url.searchParams.get('company') ?? undefined
	const project_id = url.searchParams.get('project') ?? undefined
	const employee_id = url.searchParams.get('employee') ?? undefined

	let whereClause =
		master === 'employees'
			? {
					employee_id: params.route,
				}
			: {
					employee_id: employee_id,
				}

	let data: any = null
	let count = 0
	let exportData = null
	let companyList = null
	let projectList = null

	if (
		master === 'employees' ||
		(getAttendance === true && employee_id !== undefined)
	) {
		data = await prisma.attendance.findMany({
			select: {
				id: true,
				date: true,
				holiday: true,
				present: true,
				no_of_hours: true,
				employee: { select: { id: true, full_name: true } },
			},
			where: {
				...whereClause,
				AND: [
					{
						employee: {
							joining_date: {
								lte: new Date(`${month}/31/${year}`),
							},
						},
					},
					{
						date: {
							gte: new Date(`${month}/1/${year}`),
							lte: new Date(`${month}/31/${year}`),
						},
					},
				],
			},
		})
	} else if (master !== 'employees' && !getAttendance) {
		if (master === 'project_locations' || master === 'projects') {
			companyList = await companies()
		}
		if (master === 'project_locations') {
			projectList = await projects()
		}

		const { data: attendanceListData, count: attendanceListCount } =
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

		data = attendanceListData
		count = attendanceListCount

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
				where: {
					[`${singleRouteName[master!].toLowerCase()}_id`]:
						attendanceListData.id,
					AND: [
						company_id ? { company_id: company_id } : {},
						project_id ? { project_id: project_id } : {},
					],
				},
				orderBy: [{ created_at: 'desc' }, { id: 'desc' }] as unknown as any,
				take: MAX_DATA_LENGTH * 2,
			})
		}
	}

	const imported = url.searchParams.get('imported') ?? 'false'

	url.searchParams.delete('employee')
	const searchParams = url.searchParams.toString()

	return json({
		data,
		count,
		month,
		year,
		page,
		master,
		route,
		loaderSearchParams: searchParams,
		companyList,
		projectList,
		exportData,
		imported,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function IndexRouteAttendance() {
	const {
		data,
		count,
		page,
		month,
		year,
		master,
		route,
		loaderSearchParams,
		companyList,
		projectList,
		exportData,
		imported,
	} = useLoaderData<typeof loader>()

	const { CSVDownloader } = useCSVDownloader()
	const { CSVReader } = useCSVReader()

	const [searchParam, setSearchParam] = useSearchParams()
	const { handleEnter, handleLeave } = useMouseEvent({
		searchParam,
		setSearchParam,
	})
	const [importData, setImportData] = useState<any>(null)
	const [flattenData, setFlattenData] = useState<any>(exportData)

	const { isDocument } = useIsDocument()

	useEffect(() => {
		if (imported === 'true') {
			setImportData(null)
			searchParam.delete('imported')
			setSearchParam(searchParam)
		}
	}, [imported, searchParam, setSearchParam])

	useEffect(() => {
		setFlattenData(() => transformAttendance({ data: exportData, month, year }))
	}, [exportData, month, year])

	let children = null

	if (importData && importData.length) {
		children = (
			<ImportData
				master={`/${master}/${route}/attendance`}
				header={importData[0]}
				body={importData.slice(1)}
				action={`/${master}/${route}/import-attendance`}
				setImportData={setImportData}
			/>
		)
	} else if (master === 'employees') {
		children = <AttendanceGrid data={data as any} month={month} year={year} />
	} else {
		children = (
			<AttendanceList
				data={data}
				routeName={singleRouteName[master!]}
				searchParam={loaderSearchParams}
				month={month}
				year={year}
				page={page}
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
					<Link
						to={`update?${loaderSearchParams}`}
						className={cn(
							buttonVariants({
								variant: 'secondary',
								className: 'gap-1.5',
							}),
							master !== 'employees' && 'hidden',
						)}
					>
						<Icon name="plus-circled" />
						Update Attendance
					</Link>
					{master !== 'employees' && isDocument ? (
						<>
							<CSVReader
								key={name}
								onUploadAccepted={(results: any) => {
									setImportData(results.data)
								}}
							>
								{({ getRootProps }: any) => (
									<Button
										{...getRootProps()}
										variant="accent"
										className="h-full gap-2 rounded-sm px-3"
									>
										<Icon name="import" />
										Import
									</Button>
								)}
							</CSVReader>
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
