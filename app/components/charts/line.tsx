import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/utils/misx'

const chartConfig = {
	views: {
		label: 'Kms Driven',
	},
} satisfies ChartConfig

export function LineComponent({
	chartData,
  name,
	year,
  className,
}: {
	chartData: any[]
  name: string
	year: string
  className?: string
}) {
	return (
		<Card className={cn('', className)}>
			<CardHeader>
				<CardTitle>{name} Chart</CardTitle>
				<CardDescription>{year}</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer className="max-h-72 w-full" config={chartConfig}>
					<LineChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid />
						<XAxis
							dataKey="month"
							tickMargin={8}
							tickFormatter={value => value.slice(0, 3)}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									nameKey="views"
									className="min-w-[170px]"
								/>
							}
						/>
						<Line
							dataKey="kms_driven"
							type="natural"
							stroke="hsl(var(--chart-1))"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="leading-none text-muted-foreground">
					Showing total {name} for {year}
				</div>
			</CardFooter>
		</Card>
	)
}
