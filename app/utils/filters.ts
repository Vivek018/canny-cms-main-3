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
		{ name: 'project_location', label: 'district' },
	],
	documents: () => [
		{ name: 'search', label: 'search' },
		{ name: 'belongs_to', label: 'value' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'project_location', label: 'district' },
		{ name: 'vehicle', label: 'number' },
		{ name: 'upload_date', label: 'upload_date', type: 'date' },
	],
	companies: () => [{ name: 'search', label: 'search' }],
	employees: () => [
		{ name: 'search', label: 'search' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'project_location', label: 'district' },
		{ name: 'status', label: 'value' },
		{ name: 'skill_type', label: 'value' },
		{ name: 'joining_date', label: 'joining_date', type: 'date' },
	],
	advances: () => [
		{ name: 'search', label: 'search' },
		{ name: 'credited', label: 'value' },
		{ name: 'payment_date', label: 'payment_date', type: 'date' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'project_location', label: 'district' },
		{ name: 'user', label: 'full_name' },
	],
	payment_fields: () => [
		{ name: 'search', label: 'search' },
		{ name: 'is_deduction', label: 'value' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'project_location', label: 'district' },
	],
	projects: () => [
		{ name: 'search', label: 'search' },
		{ name: 'starting_date', label: 'starting_date', type: 'date' },
	],
	project_locations: () => [
		{ name: 'search', label: 'search' },
		{ name: 'state', label: 'value' },
	],
	vehicles: () => [
		{ name: 'search', label: 'search' },
		{ name: 'type', label: 'value' },
		{ name: 'status', label: 'value' },
		{ name: 'company', label: 'name' },
		{ name: 'project', label: 'name' },
		{ name: 'project_location', label: 'district' },
	],
	// dont delete this is needed for filterList in tab or master or where ever it is used
	attendances: () => [],
	// dont delete this is needed for filterList in tab or master or where ever it is used
	payment_datas: () => [],
}
