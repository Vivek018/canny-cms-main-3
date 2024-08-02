import { extractPaymentData, getTableHeaders, months } from '@/utils/misx'
import { columns } from '../../columns'
import { DataTable } from '../../data-table'

type AttendanceListProps = {
	data: any
	month: string
	year: string
	page: string
	pageSize: number
}

export const PaymentDataForEmployeeList = ({
	data,
	month,
	year,
	page,
	pageSize,
}: AttendanceListProps) => {
	const employeeData = data.project_location.payment_field?.map(
		(payment_field: any) => ({
			id: payment_field.id,
			name: payment_field.name,
			month: months.find(m => m.value === month)?.label,
			year,
			value: extractPaymentData({
				attendance: data.attendance,
				payment_field: payment_field,
				employee: {
					id: data.id,
					joining_date: data.joining_date,
					company_id: data.company_id,
					project_id: data.project_id,
					skill_type: data.skill_type,
				},
				month: parseInt(month),
				year: parseInt(year),
			}),
		}),
	)

	const datasHeader = employeeData
		? getTableHeaders(employeeData, ['id', 'company_id', 'project_id'])
		: []

	return (
		<div>
			<DataTable
				setRows={() => {}}
				columns={columns({
					headers: datasHeader,
					name: 'payment_fields',
					singleRoute: 'payment_Field',
					page: parseInt(page),
					pageSize: pageSize,
					noSelect: true,
					noActions: true,
				})}
				data={employeeData as any}
			/>
		</div>
	)
}
