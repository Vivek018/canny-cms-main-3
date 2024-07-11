export const filters = {
	dashboard: () => [
		{ name: 'month', label: 'value' },
		{ name: 'year', label: 'value' },
	],
	users: () => [
		{ name: 'search', label: 'search' },
		{ name: 'role', label: 'name' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'sign_in', label: 'last_signed_in', type: 'date' },
	],
	documents: () => [
		{ name: 'search', label: 'search' },
		{ name: 'belongs_to', label: 'value' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'vehicle', label: 'number' },
		{ name: 'upload_date', label: 'upload_date', type: 'date' },
	],
	companies: () => [
		{ name: 'search', label: 'search' },
		{ name: 'service_charge', label: 'service_charge', type: 'number' },
		{
			name: 'reimbursement_charge',
			label: 'reimbursement_charge',
			type: 'number',
		},
	],
	employees: () => [
		{ name: 'search', label: 'search' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'status', label: 'value' },
		{ name: 'joining_date', label: 'joining_date', type: 'date' },
	],
	advances: () => [
		{ name: 'search', label: 'search' },
		{ name: 'amount', label: 'amount', type: 'number' },
		{ name: 'credited', label: 'value' },
		{ name: 'payment_date', label: 'payment_date', type: 'date' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'user', label: 'full_name' },
	],
	payment_fields: () => [
		{ name: 'search', label: 'search' },
		{ name: 'value', label: 'value', type: 'number' },
		{ name: 'type', label: 'value' },
		{ name: 'value_type', label: 'value' },
	],
	projects: () => [
		{ name: 'search', label: 'search' },
		{ name: 'company', label: 'name' },
		{ name: 'starting_date', label: 'starting_date', type: 'date' },
	],
	project_locations: () => [
		{ name: 'search', label: 'search' },
		{ name: 'project', label: 'name' },
		{ name: 'state', label: 'value' },
	],
	vehicles: () => [
		{ name: 'search', label: 'search' },
		{ name: 'kilometers', type: 'number' },
		{ name: 'type', label: 'value' },
		{ name: 'status', label: 'value' },
		{ name: 'project', label: 'name' },
	],
	// dont delete this is needed for filterList in tab or master or where ever it is used
	attendances: () => [],
	// dont delete this is needed for filterList in tab or master or where ever it is used
	payment_datas: () => [],
}
