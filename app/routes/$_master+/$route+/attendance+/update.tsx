import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	redirect,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { useState } from 'react'
import { DetailsSelector } from '@/components/filter-selector'
import { Field, RadioField } from '@/components/forms'
import { Modal } from '@/components/modal'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
	booleanArray,
	defaultMonth,
	defaultYear,
	NORMAL_DAY_HOURS,
	weekdays,
} from '@/constant'
import { cn, getYears, months } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { loader as indexLoader } from './index'

export async function loader(args: LoaderFunctionArgs) {
	return indexLoader({ ...args, getAttendance: true })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const url = new URL(request.url)
	const master = params._master
	const month = url.searchParams.get('month') ?? defaultMonth
	const year = url.searchParams.get('year') ?? defaultYear

	const currentDate = new Date()
	if (currentDate.getFullYear() === parseInt(year)) {
		if (currentDate.getMonth() + 1 < parseInt(month)) {
			return redirect(url.toString().replace('/update', ''))
		}
	} else if (currentDate.getFullYear() < parseInt(year)) {
		return redirect(url.toString().replace('/update', ''))
	}

	const employeeIdFromSearchParam =
		url.searchParams.get('employee') ?? undefined
	const date = new Date(parseInt(year), parseInt(month), 0)
	let employee_id = employeeIdFromSearchParam

	if (master === 'employees') {
		employee_id = params.route
	}

	if (employee_id !== undefined) {
		for (let i = 0; i < date.getDate(); i++) {
			const singleValue: any = {}
			singleValue.id = formData.get(`id${i}`)?.toString()
			singleValue.date = new Date(String(formData.get(`date${i}`)))
			singleValue.no_of_hours = parseInt(
				formData.get(`no_of_hours${i}`)!.toString(),
			)
			singleValue.present = formData.get(`present${i}`) === 'true'
			singleValue.holiday = formData.get(`holiday${i}`) === 'true'
			await prisma.attendance.upsert({
				select: { id: true },
				where: { id: singleValue.id ?? `__new_attendance__` },
				create: { ...singleValue, employee_id: employee_id },
				update: { ...singleValue, employee_id: employee_id },
			})
		}
	}

	url.searchParams.delete('employee')
	return redirect(url.toString().replace('/update', ''))
}

type UpdateAttendanceProps = {}

export default function UpdateAttendance({}: UpdateAttendanceProps) {
	const { data, month, year, master, route, loaderSearchParams }: any =
		useLoaderData<typeof loader>()

	const [searchParam, setSearchParam] = useSearchParams()
	const [values, setValues] = useState<any>({})

	const monthList = months
	const yearList = getYears(10)
	const date = new Date(parseInt(year), parseInt(month), 0)
	const totalDays = date.getDate()
	const commonClassName = 'w-40 md:w-28'

	let children = null

	if (master !== 'employees') {
		children = (
			<div className="my-6 flex justify-between gap-4">
				<div className="flex gap-4">
					<DetailsSelector
						label="value"
						list={monthList}
						name="month"
						noNone={true}
						defaultValue={month}
						onChange={(e: any) => {
							searchParam.set('month', e.target.value)
							setSearchParam(searchParam)
						}}
						noLabel={true}
						showLabel="label"
						className="w-min"
						triggerClassName="w-[160px]"
						popClassName="w-[160px]"
					/>
					<DetailsSelector
						label="value"
						list={yearList}
						name="year"
						noNone={true}
						defaultValue={year}
						onChange={(e: any) => {
							searchParam.set('year', e.target.value)
							setSearchParam(searchParam)
						}}
						noLabel={true}
						className="w-min"
						triggerClassName="w-24"
						popClassName="w-20"
					/>
				</div>
			</div>
		)
	}

	return (
		<Modal
			className={cn(
				'sm:w-full lg:w-[90%] xl:w-[80%] 2xl:w-[70%]',
				data === null && 'hidden',
			)}
			link={`/${master}/${route}/attendance?${loaderSearchParams}`}
			shouldNotNavigate={true}
		>
			<div className="mb-4 flex w-full items-start gap-2">
				<Link
					to={`/${master}/${route}/attendance?${loaderSearchParams}`}
					relative="path"
					replace={true}
					className="rounded-sm px-1.5 py-1 hover:bg-accent"
				>
					<Icon name="chevron-left" size="lg" />
				</Link>
				<h1 className="text-2xl font-bold capitalize tracking-wide">
					Update Attendance
				</h1>
			</div>
			{children}
			{data !== null ? (
				<Form method="POST">
					<div
						className={cn(
							'grid min-h-[450px] auto-rows-auto grid-cols-3 items-center justify-between gap-x-2 gap-y-4 py-1.5 md:grid-cols-5 lg:grid-cols-7',
						)}
					>
						{Array.from({ length: totalDays }).map((_, index) => {
							const dateData = data?.find(
								(value: any) => new Date(value.date).getDate() === index + 1,
							)
							const day = new Date(`${month}/${index + 1}/${year}`).getDay()

							return (
								<div
									key={index}
									className={cn(
										'grid place-items-center rounded-sm border border-foreground pt-1.5',
										dateData?.holiday &&
											dateData?.present &&
											'bg-[#f8bae2] dark:bg-[#bc0f80]',
										!dateData?.holiday &&
											dateData?.present &&
											'bg-[#baf8ba] dark:bg-green-800',
										dateData?.holiday &&
											!dateData?.present &&
											'bg-[#ffef97] text-black dark:bg-[#c6b76a] dark:text-black',
										!dateData?.holiday &&
											!dateData?.present &&
											'bg-destructive text-destructive-foreground',
										!dateData && 'bg-muted text-muted-foreground',
									)}
								>
									<div className="flex w-full items-center justify-between px-1">
										<h1 className="text-sm font-semibold">
											{index + 1}/{month}/{year}
										</h1>
										<p className="rounded-sm bg-background p-1 text-xs text-foreground">
											{weekdays[day]?.substring(0, 2)}
										</p>
									</div>
									{dateData ? (
										<input
											type="hidden"
											name={`id${index}`}
											value={dateData.id}
										/>
									) : null}
									<input
										type="hidden"
										name={`date${index}`}
										value={`${month}/${index + 1}/${year}`}
									/>
									<Field
										className="mt-4"
										labelProps={{ children: 'Hours' }}
										inputClassName={commonClassName}
										inputProps={{
											name: `no_of_hours${index}`,
											min: 0,
											max: 24,
											autoFocus: index === 0,
											placeholder: `Enter no of hours`,
											onChange: (e: any) => {
												setValues((prevVal: any) => ({
													...prevVal,
													[`hours${index}`]: String(e.target.value),
												}))
											},
											defaultValue:
												dateData?.no_of_hours !== undefined &&
												dateData?.no_of_hours !== null
													? dateData?.no_of_hours
													: day === 0
														? 0
														: NORMAL_DAY_HOURS,
										}}
									/>
									<RadioField
										label="value"
										name={`present${index}`}
										list={booleanArray}
										defaultValue={
											values.hasOwnProperty(`hours${index}`)
												? parseInt(values[`hours${index}`] ?? '0') > 0
													? 'true'
													: 'false'
												: dateData?.present !== undefined &&
													  dateData?.present !== null
													? String(dateData?.present)
													: day === 0
														? 'false'
														: 'true'
										}
										className={commonClassName}
										isNotId
									/>
									<RadioField
										label="value"
										name={`holiday${index}`}
										list={booleanArray}
										defaultValue={
											dateData?.holiday !== undefined &&
											dateData?.holiday !== null
												? String(dateData?.holiday)
												: 'false'
										}
										className={commonClassName}
										isNotId
									/>
								</div>
							)
						})}
					</div>
					<Button type="submit" variant="secondary" className="mt-4 w-full">
						Submit
					</Button>
				</Form>
			) : null}
		</Modal>
	)
}
