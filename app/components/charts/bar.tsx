import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { getMonthLabel } from '@/utils/misx'

const chartConfig = {
	views: {
		label: 'Employees Present',
	},
} satisfies ChartConfig

export function BarComponent({
	chartData,
	name,
	month,
	year,
	xAxisDataKey,
	barDataKey,
	className,
}: {
	chartData: any[]
	name: string
	month: string
	year: string
	xAxisDataKey: string
	barDataKey: string
	className?: string
}) {
	return (
		<Card className={className}>
			<CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
					<CardTitle className="capitalize">{name} Chart</CardTitle>
					<CardDescription>
						Showing total {name} for {getMonthLabel(month)} {year}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey={xAxisDataKey}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={value => {
								const date = new Date(value)
								return date.toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
								})
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-[200px]"
									nameKey="views"
									labelFormatter={value => {
										return new Date(value).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										})
									}}
								/>
							}
						/>
						<Bar dataKey={barDataKey} fill={`hsl(var(--chart-1))`} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
