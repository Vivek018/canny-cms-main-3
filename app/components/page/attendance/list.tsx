import { Form } from '@remix-run/react'
import { cn, getAttendanceDays, getTableHeaders, months } from '@/utils/misx'
import { columns } from '../../columns'
import { DataTable } from '../../data-table'
import { PaginationButtons } from '../../pagination-buttons'

type AttendanceListProps = {
	data: any
	routeName: string
	searchParam: string
	noActions?: boolean
	month: string
	year: string
	page: string
	count: number
	pageSize: number
	cellClassName?: string
	paginationButtonClassName?: string
}

export const AttendanceList = ({
	data,
	routeName,
	searchParam,
	noActions = false,
	month,
	year,
	page,
	count,
	pageSize,
  cellClassName,
  paginationButtonClassName,
}: AttendanceListProps) => {
	const mapData = data.employee !== undefined ? data.employee : data

	const employeeData = mapData.map((employee: any) => {
		const { normalPresentDays, overtimeDays } = getAttendanceDays({
			attendance: employee.attendance,
		})
		return {
			...employee,
			month: months.find(m => m.value === month)?.label,
			year,
			present_days: normalPresentDays,
			overtime_days: overtimeDays,
			attendance: null,
			_count: null,
		}
	})

	const datasHeader = employeeData
		? getTableHeaders(employeeData, ['id', routeName.toLowerCase()])
		: []

	return (
		<div className="flex h-full flex-col">
			<div className="max-h-full flex-1">
				<DataTable
					setRows={() => {}}
					columns={columns({
						headers: datasHeader,
						name: 'employees',
						singleRoute: 'employee',
						extraRoute: `attendance?${searchParam}`,
						page: parseInt(page),
						pageSize: pageSize,
						updateLink: `update?${searchParam}`,
						noSelect: true,
						noActions: noActions,
					})}
					data={employeeData as any}
					cellClassName={cellClassName}
				/>
			</div>
			<Form method="POST" className={cn('py-2.5', paginationButtonClassName)}>
				<PaginationButtons page={page} count={count} pageSize={pageSize} />
			</Form>
		</div>
	)
}
