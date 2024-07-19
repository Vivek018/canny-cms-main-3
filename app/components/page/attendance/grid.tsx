import { weekdays } from '@/constant'
import { cn } from '@/utils/misx'

type AttendanceGridProps = {
	data: {
		date: Date
		holiday: boolean
		present: boolean
		id: string
		employee: {
			id: string
			full_name: string
		} | null
		no_of_hours: number
	}[]
	month: string
	year: string
}

export const AttendanceGrid = ({ data, month, year }: AttendanceGridProps) => {
	const date = new Date(parseInt(year), parseInt(month), 0)
	const totalDays = date.getDate()

	return (
		<div>
			<div className="mt-4 flex w-full text-lg capitalize">
				{weekdays.map((weekday: any, index) => {
					return (
						<div className="h-22 w-full font-bold" key={index}>
							{weekday}
						</div>
					)
				})}
			</div>
			<div className="grid min-h-[450px] auto-rows-auto grid-cols-7 items-center justify-between gap-1 py-2">
				{Array.from({
					length: new Date(`${month}/1/${year}`).getDay(),
				}).map((_, index) => {
					return (
						<div
							key={index}
							className="flex h-24 w-full flex-col justify-between rounded-sm border border-dashed border-muted-foreground/50 p-1.5 text-xs"
						></div>
					)
				})}
				{Array.from({ length: totalDays }).map((_, index) => {
					const dateData = data?.find(
						value => new Date(value.date).getDate() === index + 1,
					)
					return (
						<div
							key={index}
							className={cn(
								'flex h-24 w-full flex-col justify-between rounded-sm border border-muted-foreground/50 bg-muted p-2 text-xs',
							)}
						>
							<div className="flex items-start justify-between">
								<h1 className="text-base font-semibold">{index + 1}</h1>

								<p
									className={cn(
										'grid place-items-center rounded-sm bg-accent p-1.5 text-xs font-semibold text-accent-foreground',
										!dateData && 'hidden',
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
									)}
								>
									{dateData ? (dateData?.present ? 'Present' : 'Absent') : ''}
								</p>
							</div>
							<div className="flex justify-between gap-0.5 text-sm">
								<p>
									Hours:{' '}
									<span
										className={cn(
											'font-medium',
											dateData?.no_of_hours !== undefined &&
												(dateData?.no_of_hours < 8 ||
													dateData?.no_of_hours > 8) &&
												'rounded-sm bg-background px-1 py-0.5',
										)}
									>
										{dateData?.no_of_hours ?? 'N/A'}
									</span>
								</p>
								<p>
									<span
										className={cn(
											'rounded-sm bg-accent p-1 text-[11px] font-medium capitalize',
										)}
									>
										{dateData?.holiday === undefined
											? 'N/A'
											: dateData?.holiday
												? 'Holiday'
												: 'Workday'}
									</span>
								</p>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
