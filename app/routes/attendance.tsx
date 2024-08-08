import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useCSVDownloader, useCSVReader } from 'react-papaparse'
import { ExtraFilter } from '@/components/extra-filter'
import { Header } from '@/components/header'
import { ImportData } from '@/components/import-data'
import { AttendanceList } from '@/components/page/attendance/list'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
	defaultMonth,
	defaultYear,
	MAX_DATA_LENGTH,
	PAGE_SIZE,
} from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { useMouseEvent } from '@/utils/clients/mouse-event'
import { cn, transformAttendance } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

const name = 'attendances'

export async function loader({
	request,
}: LoaderFunctionArgs & {
	getAttendance?: boolean
}) {
	const url = new URL(request.url)
	const page = url.searchParams.get('page') ?? '1'
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear
	const companyId = null
	const projectId = null

	let exportData = null

	const data = await prisma.employee.findMany({
		select: {
			id: true,
			full_name: true,
			designation: true,
			joining_date: true,
			skill_type: true,
			company: { select: { name: true } },
			project: { select: { name: true } },
			project_location: { select: { district: true } },
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
		},
		where: {
			joining_date: {
				lte: new Date(`${month}/31/${year}`),
			},
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
			],
		},
		orderBy: [{ created_at: 'desc' }, { id: 'desc' }] as unknown as any,
		take: PAGE_SIZE,
		skip: (parseInt(page) - 1) * PAGE_SIZE,
	})

	const count = await prisma.employee.count({
		where: {
			joining_date: {
				lte: new Date(`${month}/31/${year}`),
			},
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
			],
		},
	})

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
				AND: [
					companyId ? { company_id: companyId } : {},
					projectId ? { project_id: projectId } : {},
				],
			},
			orderBy: [{ created_at: 'desc' }, { id: 'desc' }] as unknown as any,
			take: MAX_DATA_LENGTH * 2,
		})
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
		loaderSearchParams: searchParams,
		exportData,
		imported,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function Attendance() {
	const {
		data,
		count,
		page,
		month,
		year,
		loaderSearchParams,
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

	return (
		<div className="flex h-[98%] flex-col py-[5px]">
			<Header title={name} noBackButton={true}>
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
			</Header>
			{importData && importData.length ? (
				<ImportData
					master={`attendance`}
					header={importData[0]}
					body={importData.slice(1)}
					action={`/attendance/import-attendance`}
					setImportData={setImportData}
				/>
			) : null}
			<div
				className={cn(
					'flex-0 flex h-full max-h-full min-h-72 flex-col gap-2 rounded-md bg-muted p-3 text-muted-foreground',
				)}
			>
				<div className="flex h-11 w-full items-center justify-end gap-2">
					{isDocument ? (
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
				<AttendanceList
					data={data}
					routeName={'attendance'}
					searchParam={loaderSearchParams}
					noActions={true}
					month={month}
					year={year}
					page={page}
					count={count}
					pageSize={PAGE_SIZE}
					paginationButtonClassName="py-0"
					cellClassName="h-[46px]"
				/>
			</div>
		</div>
	)
}
