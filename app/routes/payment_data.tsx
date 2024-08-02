import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useCSVDownloader } from 'react-papaparse'
import { ExtraFilter } from '@/components/extra-filter'

import { Header } from '@/components/header'
import { PaymentDataForMasterList } from '@/components/page/payment-data/for-master-list'
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
import { cn, flattenObject, transformPaymentData } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

const name = 'payment_datas'

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const page = url.searchParams.get('page') ?? '1'
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear
	const companyId = url.searchParams.get('company') ?? undefined
	const projectId = url.searchParams.get('project') ?? undefined

	let exportData = null

	const data = await prisma.employee.findMany({
		select: {
			id: true,
			full_name: true,
			designation: true,
			joining_date: true,
			skill_type: true,
			company_id: true,
			project_id: true,
			company: { select: { name: true } },
			project: { select: { name: true } },
			project_location: {
				select: {
					district: true,
					payment_field: {
						select: {
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
											max_value: true,
											pay_frequency: true,
											type: true,
											value_type: true,
											skill_type: true,
											month: true,
											year: true,
											company: { select: { id: true } },
											project: { select: { id: true } },
											employee: { select: { id: true } },
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
									max_value: true,
									type: true,
									value_type: true,
									skill_type: true,
									pay_frequency: true,
									month: true,
									year: true,
									company: { select: { id: true } },
									project: { select: { id: true } },
									employee: { select: { id: true } },
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
								orderBy: [{ year: 'desc' }, { month: 'desc' }, { id: 'desc' }],
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
			attendance: {
				select: {
					no_of_hours: true,
					present: true,
					holiday: true,
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
				id: true,
				full_name: true,
				designation: true,
				joining_date: true,
				skill_type: true,
				company_id: true,
				project_id: true,
				company: { select: { name: true } },
				project: { select: { name: true } },
				project_location: {
					select: {
						district: true,
						payment_field: {
							select: {
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
												max_value: true,
												type: true,
												value_type: true,
												skill_type: true,
												pay_frequency: true,
												month: true,
												year: true,
												company: { select: { id: true } },
												project: { select: { id: true } },
												employee: { select: { id: true } },
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
										max_value: true,
										type: true,
										value_type: true,
										skill_type: true,
										pay_frequency: true,
										month: true,
										year: true,
										company: { select: { id: true } },
										project: { select: { id: true } },
										employee: { select: { id: true } },
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
				attendance: {
					select: {
						no_of_hours: true,
						present: true,
						holiday: true,
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
			take: MAX_DATA_LENGTH * 2,
			skip: (parseInt(page) - 1) * PAGE_SIZE,
		})
	}

	return json({
		data,
		count,
		month,
		year,
		page,
		exportData: exportData,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function PaymentData() {
	const { data, count, page, month, year, exportData } =
		useLoaderData<typeof loader>()
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

	return (
		<div className="flex h-[98%] flex-col py-[5px]">
			<Header title={name}>
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
			<div
				className={cn(
					'flex-0 flex h-full max-h-full min-h-72 flex-col gap-2 rounded-md bg-muted p-3 text-muted-foreground',
				)}
			>
				<div className="flex h-11 w-full items-center justify-end gap-2">
					{isDocument ? (
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
				<PaymentDataForMasterList
					data={data}
					month={month}
					year={year}
					page={page}
					routeName={'payment_data'}
					count={count}
					pageSize={PAGE_SIZE}
					cellClassName="h-[46px]"
					paginationButtonClassName="py-0"
				/>
			</div>
		</div>
	)
}
