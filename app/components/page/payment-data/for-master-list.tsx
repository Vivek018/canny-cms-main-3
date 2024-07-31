import { Form } from '@remix-run/react'
import { PaginationButtons } from '@/components/pagination-buttons'
import { getTableHeaders, transformPaymentData } from '@/utils/misx'
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

export const PaymentDataForMasterList = ({
	data,
	month,
	year,
	page,
	count,
	routeName,
	pageSize,
}: AttendanceListProps) => {
	const employeeData = transformPaymentData({ data, month, year });

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
			<Form method="POST">
				<PaginationButtons page={page} count={count} pageSize={pageSize} />
			</Form>
		</div>
	)
}
