import { Form } from '@remix-run/react'
import { PaginationButtons } from '@/components/pagination-buttons'
import { getTableHeaders, months } from '@/utils/misx'
import { columns } from '../../columns'
import { DataTable } from '../../data-table'

type AttendanceListProps = {
	data: any
	month: string
	year: string
	page: string
	count: number
	pageSize: number
}

export const PaymentDataForProjectLocationList = ({
	data,
	month,
	year,
	page,
	count,
	pageSize,
}: AttendanceListProps) => {
	let employeeData = data.employee.map((employee: any) => ({
		...employee,
		month: months.find(m => m.value === month)?.label,
		year,
	}))
	for (let i = 0; i < employeeData.length; i++) {
		for (let j = 0; j < data.payment_field.length; j++) {
			employeeData[i][data.payment_field[j].name] = data.payment_field[j].value
		}
	}

	const datasHeader = employeeData ? getTableHeaders(employeeData, ['id']) : []

	return (
		<div>
			<DataTable
				setRows={() => {}}
				columns={columns({
					headers: datasHeader,
					name: 'project_locations',
					singleRoute: 'project_location',
					length: 40,
					extraRoute: 'payment_data',
					page: parseInt(page),
					pageSize: pageSize,
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
