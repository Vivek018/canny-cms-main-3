import { getTableHeaders } from '@/utils/misx'
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

	const datasHeader = data
		? getTableHeaders(data, ['id', 'company_id', 'project_id'])
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
				data={data as any}
			/>
		</div>
	)
}
