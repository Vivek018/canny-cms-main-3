import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	json,
	Link,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { columns } from '@/components/columns'
import { DataTable } from '@/components/data-table'
import { ExtraFilter } from '@/components/extra-filter'
import { Header } from '@/components/header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
	defaultMonth,
	defaultYear,
	singleRouteName,
	noOfDataBelongsTo,
} from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, getTableHeaders, replaceUnderscore } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

const name = 'dashboard'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear

	const currentMonth = parseInt(month) - 1
	const currentYear = parseInt(year)
	const companyId = null
	const projectId = null

	const noOfData: any = {}

	const commonAndClause = {
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
	}

	const options = {
		orderBy: {
			created_at: 'desc' as unknown as 'desc' | 'asc',
		},
		take: 8,
	}

	const employees = await prisma.employee.findMany({
		select: {
			id: true,
			full_name: true,
			designation: true,
			joining_date: true,
		},
		where: { ...commonAndClause },
		...options,
	})

	const advances = await prisma.advance_Payment.findMany({
		select: {
			id: true,
			label: true,
			employee: { select: { full_name: true } },
			amount: true,
			payment_date: true,
		},
		where: {
			employee: {
				...commonAndClause,
			},
		},
		...options,
	})

	const documents = await prisma.document.findMany({
		select: {
			id: true,
			label: true,
			belongs_to: true,
		},
		where: { ...commonAndClause },
		...options,
	})

	const statutoryPayments = await prisma.payment_Field.findMany({
		select: {
			id: true,
			name: true,
		},
		where: {
			OR: [
				{
					is_statutory: true,
				},
				{
					is_deduction: true,
				},
			],
		},
		orderBy: { sort_id: 'asc' },
	})

	for (let i = 0; i < noOfDataBelongsTo.length; i++) {
		const belongs_to = noOfDataBelongsTo[i]
		const noOfDataWhereClause = {
			where: {
				belongs_to: belongs_to,
				month: currentMonth,
				year: currentYear,
				...commonAndClause,
			},
		}

		noOfData[belongs_to] = await prisma.no_Of_Data.findFirst({
			select: {
				no_of_data: true,
				belongs_to: true,
			},
			...noOfDataWhereClause,
		})

		if (!noOfData || !noOfData[belongs_to]) {
			const routeName = singleRouteName[belongs_to]
			let dataCount = await prisma[routeName as 'user'].count({
				where: {
					AND: noOfDataWhereClause.where.AND,
				},
			})
			noOfData[belongs_to] = await prisma.no_Of_Data.create({
				data: {
					belongs_to: belongs_to,
					no_of_data: dataCount,
					month: currentMonth,
					year: currentYear,
					company_id: companyId,
					project_id: projectId,
				},
			})
		}

		noOfData[belongs_to].prev_month = await prisma.no_Of_Data.findFirst({
			select: {
				no_of_data: true,
			},
			where: {
				belongs_to: noOfDataWhereClause.where.belongs_to,
				month: noOfDataWhereClause.where.month - 1,
				year: noOfDataWhereClause.where.year,
				AND: [...noOfDataWhereClause.where.AND],
			},
		})
	}

	const data: any[] = [{ recent_employees: employees }]

	if (statutoryPayments?.length) {
		data.push({ statutory_payment_fields: statutoryPayments })
	}

	if (advances?.length) {
		data.push({ recent_advances: advances })
	}

	if (documents?.length) {
		data.push({ recent_documents: documents })
	}

	return json({
		noOfData,
		data,
		statutoryPayments,
		month: currentMonth.toString(),
		year: currentYear.toString(),
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function Dashboard() {
	const { noOfData, data, month, year } = useLoaderData<typeof loader>()
	const [searchParam, setSearchParam] = useSearchParams()
	const { isDocument } = useIsDocument()

	return (
		<div className="pb-4 pt-1">
			<Header title={name} headerLink1="/dashboard" headerLink2="/analytics">
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
			<div className="grid gap-4 py-1">
				<div className="grid auto-rows-auto grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 md:grid-cols-3">
					{noOfDataBelongsTo?.map((master: any, index: number) => {
						const item = noOfData[master]
						const prevMonthNoOfData = item?.prev_month?.no_of_data
						const isDecreasing = item.no_of_data < prevMonthNoOfData
						const isIncreasing = item.no_of_data > prevMonthNoOfData
						return (
							<div
								key={index}
								className="flex flex-1 flex-col gap-4 rounded-md bg-muted px-3 py-2.5"
							>
								<h2 className="text-lg font-medium capitalize">
									Total {item.belongs_to}
								</h2>
								<div className="flex w-full items-center justify-between gap-1">
									<p className="text-lg font-bold md:text-xl xl:text-3xl">
										{item.no_of_data}
									</p>
									{prevMonthNoOfData ? (
										<div
											className={cn(
												'flex flex-col items-start text-[10px] font-medium md:text-xs xl:text-[13px]',
												isDecreasing && 'text-destructive',
												isIncreasing && 'text-green-700 dark:text-green-500',
											)}
										>
											<p className="flex gap-1">
												<Icon
													name={
														isDecreasing
															? 'arrow-bottom-left'
															: 'arrow-top-right'
													}
												/>{' '}
												{Math.abs(item.no_of_data - prevMonthNoOfData) / 100}%
											</p>
											<p className="-mt-0.5">from last month</p>
										</div>
									) : (
										''
									)}
								</div>
							</div>
						)
					})}
				</div>
				<div
					className={cn(
						'grid auto-rows-auto grid-cols-1 gap-4 overflow-hidden md:grid-cols-3',
					)}
				>
					{data.map((item, index) => {
						const itemKey = Object.keys(item)[0]
						const itemValue = item[itemKey]
						const itemsHeader = itemValue
							? getTableHeaders(itemValue, ['id'])
							: []
						const itemName =
							itemKey.split('_')[1] +
							(itemKey.split('_')[2] ? '_' + itemKey.split('_')[2] : '')
						const replacedUnderscoreItemName = replaceUnderscore(itemName)
						const routeName = itemName ?? ''
						return (
							<div
								key={index}
								className={cn(
									'flex min-h-[400px] max-w-full flex-col gap-2 rounded-md bg-muted p-3',
									index % 2 === 0 && 'col-span-2',
									(!itemKey || !itemValue?.length) && 'hidden',
								)}
							>
								<div className="flex w-full items-center justify-between gap-2">
									<h2 className="truncate text-lg font-semibold capitalize">
										{replaceUnderscore(itemKey)}
									</h2>
									<Link
										to={`/${itemName}`}
										className={cn(
											buttonVariants({
												variant: 'secondary',
												size: 'sm',
												className: 'gap-1.5 text-[13px] capitalize',
											}),
										)}
									>
										<Icon name="new-window" size="sm" />
										Go to {replacedUnderscoreItemName}
									</Link>
								</div>
								<DataTable
									columns={columns({
										headers: itemsHeader!,
										name: itemName,
										singleRoute: routeName,
										noSelect: true,
									})}
									data={itemValue}
									className={!itemsHeader ? 'hidden' : 'flex-1'}
								/>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
