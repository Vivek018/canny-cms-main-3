import { Form } from '@remix-run/react'
import { PaginationButtons } from '@/components/pagination-buttons'
import { getTableHeaders, months, transformPaymentData } from '@/utils/misx'
import { columns } from '../../columns'
import { DataTable } from '../../data-table'

type AttendanceListProps = {
	data: any
	month: string
	year: string
	page: string
	count: number
	routeName: string
	pageSize: number
}

export const PaymentDataForProjectLocationList = ({
	data,
	month,
	year,
	page,
	count,
	routeName,
	pageSize,
}: AttendanceListProps) => {
	let employeeData = data.employee.map((employee: any) => ({
		...employee,
		month: months.find(m => m.value === month)?.label,
		year,
	}))

	for (let i = 0; i < employeeData.length; i++) {
		const paymentFieldData = employeeData[0].project_location.payment_field

		for (let j = 0; j < paymentFieldData.length; j++) {
			employeeData[i][paymentFieldData[j].name] =
				paymentFieldData[j].value.length && employeeData[i].attendance.length
					? transformPaymentData({
							employee: {
								company_id: employeeData[i].company_id,
								project_id: employeeData[i].project_id,
								skill_type: employeeData[i].skill_type,
							},
							payment_field: paymentFieldData[j],
							attendance: employeeData[i].attendance,
						})
					: 0
		}
	}

	const datasHeader = employeeData
		? getTableHeaders(employeeData, [
				'id',
				'company_id',
				'project_id',
				'payment_field',
				'attendance',
				routeName.toLowerCase(),
			])
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
						extraRoute: `payment_data?month=${month}&year=${year}`,
						page: parseInt(page),
						pageSize: pageSize,
						updateLink: `update?month=${month}&year=${year}`,
						noSelect: true,
						noActions: true,
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
