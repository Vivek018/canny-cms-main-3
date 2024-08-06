import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, json, useLoaderData, useSearchParams } from '@remix-run/react'
import { BarComponent } from '@/components/charts/bar'
import { LineComponent } from '@/components/charts/line'
import { PieComponent } from '@/components/charts/pie'
import { ExtraFilter } from '@/components/extra-filter'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { defaultMonth, defaultYear } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, getMonthLabel } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

const name = 'dashboard'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear

	const currentMonth = parseInt(month) 
	const currentYear = parseInt(year)
	const companyId = null
	const projectId = null

	const employeeData: any[] = []
	const advanceAmountPerMonth: any[] = []
	const kmsDrivenPerMonth: any[] = []

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

	const noOfDays = new Date(currentYear, currentMonth - 1, 0).getDate()
	for (let j = 0; j < noOfDays; j++) {
		const date = new Date(currentYear, currentMonth - 1, j + 1)
		employeeData.push({
			date: date,
			employee_present: await prisma.employee.count({
				where: {
					attendance: {
						some: {
							date: {
								equals: date,
							},
							present: true,
						},
					},
					...commonAndClause,
				},
			}),
		})
	}

	for (let month = 1; month <= 12; month++) {
		advanceAmountPerMonth.push({
			month: getMonthLabel(month.toString()),
			amount: (
				await prisma.advance_Payment.findMany({
					select: {
						amount: true,
					},
					where: {
						payment_date: {
							gte: new Date(currentYear, month - 1, 1),
							lte: new Date(currentYear, month, 0),
						},
						employee: commonAndClause,
					},
				})
			).reduce((acc, curr) => acc + curr.amount, 0),
			fill: `hsl(var(--chart-${month % 12 > 0 ? month % 12 : 2}))`,
		})

		kmsDrivenPerMonth.push({
			month: getMonthLabel(month.toString()),
			kms_driven: (
				await prisma.vehicle.findMany({
					select: {
						vehicle_monthly: {
							select: {
								kms_driven: true,
							},
							where: {
								month: month,
								year: currentYear,
							},
						},
					},
					where: { ...commonAndClause },
				})
			).reduce(
				(acc, { vehicle_monthly }) => acc + vehicle_monthly[0]?.kms_driven,
				0,
			),
		})
	}

	return json({
		employeeData,
		advanceAmountPerMonth,
		kmsDrivenPerMonth,
		month: currentMonth.toString(),
		year: currentYear.toString(),
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function Analytics() {
	const {
		employeeData,
		advanceAmountPerMonth,
		kmsDrivenPerMonth,
		month,
		year,
	} = useLoaderData<typeof loader>()

	const [searchParam, setSearchParam] = useSearchParams()
	const { isDocument } = useIsDocument()

	const totalAdvanceAmount = advanceAmountPerMonth.reduce(
		(acc, curr) => acc + curr.amount,
		0,
	)
	return (
		<div className="grid gap-4 pb-4 pt-1">
			<Header
				title={name}
				headerLink1="/dashboard"
				headerLink2="/analytics"
				noBackButton={true}
			>
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
			<div className="grid auto-rows-auto grid-cols-1 gap-4">
				<BarComponent
					chartData={employeeData}
					name="Attendance"
					xAxisDataKey="date"
					barDataKey="employee_present"
					month={month}
					year={year}
				/>
			</div>
			<div className="grid auto-rows-auto grid-cols-3 gap-4">
				<LineComponent
					chartData={kmsDrivenPerMonth}
					name="Kilometers Driven"
					year={year}
					className="col-span-2"
				/>
				<PieComponent
					chartData={advanceAmountPerMonth}
					totalAmount={totalAdvanceAmount}
					innerLabel={true}
					name="Advances Amount"
					year={year}
				/>
			</div>
		</div>
	)
}
