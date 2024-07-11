import { getTableHeaders, transformPaymentData } from '@/utils/misx'
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

export const PaymentDataForEmployeeList = ({
	data,
	month,
	year,
	page,
	count,
	pageSize,
}: AttendanceListProps) => {
	const employeeData = data[0].project_location.payment_field?.map(
		(payment_field: any) => ({
			name: payment_field.name,
			value: transformPaymentData(payment_field),
		}),
	)

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
					extraRoute: 'attendance',
					page: parseInt(page),
					pageSize: pageSize,
					updateLink: `update?month=${month}&year=${year}`,
					noSelect: true,
				})}
				data={employeeData as any}
			/>
		</div>
	)
}
