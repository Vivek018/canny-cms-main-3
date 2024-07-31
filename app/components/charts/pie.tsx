import { Label, Pie, PieChart } from 'recharts'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/utils/misx'

export function PieComponent({
	name,
	chartData,
	year,
	innerLabel = false,
	totalAmount,
	className,
}: {
	name: string
	chartData: any[]
	year: string
	innerLabel?: boolean
	totalAmount?: number | string
	className?: string
}) {
	const chartConfig = {
		visitors: {
			label: 'Advance Amount',
		},
	}

	return (
		<Card className={cn(className)}>
			<CardHeader className="items-center pb-0">
				<CardTitle>{name} Chart</CardTitle>
				<CardDescription>{year}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[320px]"
				>
					<PieChart startAngle={45}>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent className="min-w-[180px]" />}
						/>
						<Pie
							data={chartData}
							dataKey="amount"
							nameKey="month"
							innerRadius={innerLabel ? '55%' : '0%'}
						>
							{innerLabel ? (
								<Label
									content={({ viewBox }) => {
										if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
											return (
												<text
													x={viewBox.cx}
													y={viewBox.cy}
													textAnchor="middle"
													dominantBaseline="middle"
												>
													<tspan
														x={viewBox.cx}
														y={viewBox.cy}
														className="fill-foreground text-xl font-bold"
													>
														₹{totalAmount}
													</tspan>
													<tspan
														x={viewBox.cx}
														y={(viewBox.cy || 0) + 24}
														className="fill-muted-foreground"
													>
														{name}
													</tspan>
												</text>
											)
										}
									}}
								/>
							) : null}
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="leading-none text-muted-foreground">
					Showing total {name?.split(' ')[name?.split(' ')?.length - 1]} for{' '}
					{year}
				</div>
			</CardFooter>
		</Card>
	)
}
