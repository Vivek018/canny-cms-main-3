import { Form } from '@remix-run/react'
import { getTableHeaders, months } from '@/utils/misx'
import { columns } from '../../columns'
import { DataTable } from '../../data-table'
import { PaginationButtons } from '../../pagination-buttons'

type AttendanceListProps = {
	data: any
	month: string
	year: string
	page: string
	count: number
	pageSize: number
}

export const AttendanceList = ({
	data,
	month,
	year,
	page,
	count,
	pageSize,
}: AttendanceListProps) => {
	const employeeData = data?.employee.map((employee: any) => ({
		...employee,
		month: months.find(m => m.value === month)?.label,
		year,
		present_days: employee?._count?.attendance,
		_count: null,
	}))

	const datasHeader = employeeData ? getTableHeaders(employeeData, ['id']) : []

	return (
		<div>
			<DataTable
				setRows={() => {}}
				columns={columns({
					headers: datasHeader,
					name: 'employees',
					singleRoute: 'employee',
					length: 40,
					extraRoute: `attendance?month=${month}&year=${year}`,
					page: parseInt(page),
					pageSize: pageSize,
					updateLink: `update?month=${month}&year=${year}`,
					noSelect: true,
				})}
				data={employeeData as any}
			/>
			<Form method="POST" className="py-2">
				<PaginationButtons page={page} count={count} pageSize={pageSize} />
			</Form>
		</div>
	)
}
