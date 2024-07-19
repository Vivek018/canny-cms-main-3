import { Form } from '@remix-run/react'
import { getAttendanceDays, getTableHeaders, months } from '@/utils/misx'
import { columns } from '../../columns'
import { DataTable } from '../../data-table'
import { PaginationButtons } from '../../pagination-buttons'

type AttendanceListProps = {
	data: any
	routeName: string
	searchParam: string
	month: string
	year: string
	page: string
	count: number
	pageSize: number
}

export const AttendanceList = ({
	data,
	routeName,
	searchParam,
	month,
	year,
	page,
	count,
	pageSize,
}: AttendanceListProps) => {
	const employeeData = data?.employee.map((employee: any) => {
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
						length: 20,
						extraRoute: `attendance?${searchParam}`,
						page: parseInt(page),
						pageSize: pageSize,
						updateLink: `update?${searchParam}`,
						noSelect: true,
					})}
					data={employeeData as any}
				/>
			</div>
			<Form method="POST" className="py-2">
				<PaginationButtons page={page} count={count} pageSize={pageSize} />
			</Form>
		</div>
	)
}
