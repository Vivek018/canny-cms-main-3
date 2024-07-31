import { singleRouteName } from '@/constant'

export const types = {
	file: 'file',
	email: 'email',
	text: 'text',
	number: 'number',
	date: 'date',
	textarea: 'textarea',
	select: 'select',
	radio: 'radio',
}

const commonTypes = {
	company: { company: { name: 'company', label: 'name', type: types.select } },
	project: {
		project: {
			name: 'project',
			label: 'name',
			type: types.select,
		},
	},
	project_location: {
		project_location: {
			name: 'project_location',
			label: 'district',
			type: types.select,
		},
	},
	employee: {
		employee: { name: 'employee', label: 'full_name', type: types.select },
	},
	vehicle: {
		vehicle: {
			name: 'vehicle',
			label: 'number',
			type: types.select,
		},
	},
	value: {
		value: {
			name: 'value',
			label: 'value',
			secondAccess: 'payment_field',
			secondLabel: 'name',
			type: types.select,
		},
	},
}

const commonDependedTypes = {
	project: {
		project: {
			name: 'project',
			label: 'name',
			type: types.select,
			dependency: true,
		},
	},
}

export const inputTypes: { [key: string]: any } = {
	[singleRouteName.users]: {
		ignoreDependentKeys: ['company', 'project', 'project_location'],
		photo: { name: 'photo', type: types.file },
		role: {
			name: 'role',
			label: 'name',
			type: types.select,
			dependant: true,
		},
		email: { name: 'email', type: types.email },
		company: {
			...commonTypes.company.company,
			dependsOn: 'role',
			dependsValue: [
				'client_lead',
				'client_admin',
				'project_admin',
				'project_location_admin',
			],
		},
		project: {
			...commonTypes.project.project,
			dependsOn: 'role',
			dependsValue: ['project_admin', 'project_location_admin'],
			isNeeded: ['company'],
		},
		project_location: {
			...commonTypes.project_location.project_location,
			dependsOn: 'role',
			dependsValue: ['project_location_admin'],
			isNeeded: ['company', 'project'],
		},
	},
	[singleRouteName.documents]: {
		ignoreDependentKeys: [
			'company',
			'project',
			'project_location',
			'employee',
			'vehicle',
		],
		path: { name: 'path', type: types.file },
		belongs_to: {
			name: 'belongs_to',
			label: 'value',
			type: types.radio,
			dependant: true,
		},
		company: {
			...commonTypes.company.company,
			dependsOn: 'belongs_to',
			dependsValue: ['company', 'project', 'project_location'],
		},
		project: {
			...commonDependedTypes.project.project,
			dependsOn: 'belongs_to',
			dependsValue: ['project', 'employee', 'vehicle', 'project_location'],
			isNeeded: ['company'],
		},
		project_location: {
			...commonTypes.project_location.project_location,
			dependsOn: 'belongs_to',
			dependsValue: ['project_location'],
			isNeeded: ['project', 'company'],
		},
		employee: {
			...commonTypes.employee.employee,
			dependsOn: 'belongs_to',
			dependsValue: ['employee'],
		},
		vehicle: {
			...commonTypes.vehicle.vehicle,
			dependsOn: 'belongs_to',
			dependsValue: ['vehicle'],
		},
	},
	[singleRouteName.companies]: {
		photo: { name: 'photo', type: types.file },
		address: { name: 'address', type: types.textarea },
		project: { ...commonTypes.project.project, isMulti: true },
		value: { ...commonTypes.value.value, isMulti: true },
	},
	[singleRouteName.employees]: {
		photo: { name: 'photo', type: types.file },
		...commonTypes.company,
		...commonTypes.project,
		...commonTypes.project_location,
		skill_type: { name: 'skill_type', label: 'value', type: types.radio },
		status: { name: 'status', label: 'value', type: types.radio },
		gender: { name: 'gender', label: 'value', type: types.radio },
		education: { name: 'education', label: 'value', type: types.radio },
		date_of_birth: { type: types.date },
		joining_date: { type: types.date },
		exit_date: { type: types.date },
		permanent_address: { type: types.textarea },
		bank_detail_id: { connectOn: 'bank_detail' },
		account_number: { type: types.number, connectOn: 'bank_detail' },
		ifsc_code: { connectOn: 'bank_detail' },
		value: { ...commonTypes.value.value, isMulti: true },
	},
	[singleRouteName.advances]: {
		amount: { type: types.number },
		payment_date: { type: types.date },
		user: { name: 'user', label: 'full_name', type: types.select },
		project: { ...commonDependedTypes.project.project, ignore: true },
		...commonTypes.employee,
		credited: { name: 'credited', label: 'value', type: types.radio },
		confirmation_document: { name: 'confirmation_document', type: types.file },
	},
	[singleRouteName.projects]: {
		starting_date: { type: types.date },
		ending_date: { type: types.date },
		company: { ...commonTypes.company.company, isMulti: true },
		project_location: {
			...commonTypes.project_location.project_location,
			isMulti: true,
		},
		value: { ...commonTypes.value.value, isMulti: true },
	},
	[singleRouteName.project_locations]: {
		street_address: { type: types.textarea },
		state: { name: 'state', label: 'value', type: types.radio },
		postal_code: { type: types.number },
		payment_field: {
			name: 'payment_field',
			label: 'name',
			type: types.select,
			isMulti: true,
		},
		project: { ...commonTypes.project.project, isMulti: true },
	},
	[singleRouteName.payment_fields]: {
		description: { type: types.textarea },
		type: { name: 'type', label: 'value', type: types.radio },
		sort_id: { type: types.number },
		is_deduction: {
			name: 'is_deduction',
			label: 'value',
			type: types.radio,
		},
		is_statutory: {
			name: 'is_statutory',
			label: 'value',
			type: types.radio,
		},
		eligible_after_years: { type: types.number },
		percentage_of: {
			name: 'percentage_of',
			label: 'name',
			type: types.select,
			isMulti: true,
		},
		project_location: {
			...commonTypes.project_location.project_location,
			isMulti: true,
		},
	},
	[singleRouteName.vehicles]: {
		total_kms_driven: { type: types.number },
		year_bought: { name: 'year_bought', label: 'value', type: types.radio },
		price: { type: types.number },
		type: { name: 'type', label: 'value', type: types.radio },
		status: { name: 'status', label: 'value', type: types.radio },
		...commonTypes.company,
		...commonDependedTypes.project,
		...commonTypes.project_location,
		...commonTypes.employee,
		other_details: { type: types.textarea },
	},
	[singleRouteName.vehicle_monthly]: {
		kms_driven: { type: types.number },
		month: {
			name: 'month',
			showLabel: 'label',
			label: 'value',
			type: types.radio,
		},
		year: { name: 'year', label: 'value', type: types.radio },
		...commonTypes.vehicle,
	},
	[singleRouteName.value]: {
		value: { name: 'value', type: types.number },
		type: { name: 'type', label: 'value', type: types.radio },
		value_type: { name: 'value_type', label: 'value', type: types.radio },
		skill_type: { name: 'skill_type', label: 'value', type: types.radio },
		pay_at_once: { name: 'pay_at_once', label: 'value', type: types.radio },
		month: {
			name: 'month',
			showLabel: 'label',
			label: 'value',
			type: types.radio,
		},
		year: { name: 'year', label: 'value', type: types.radio },
		payment_field: {
			name: 'payment_field',
			label: 'name',
			type: types.select,
		},
		company: {
			...commonTypes.company.company,
			isMulti: true,
		},
		project: {
			...commonTypes.project.project,
			isMulti: true,
		},
		employee: { ...commonTypes.employee.employee, isMulti: true },
	},
}

export const imageFieldName: { [key: string]: string } = {
	[singleRouteName.companies]: 'photo',
	[singleRouteName.users]: 'photo',
	[singleRouteName.employees]: 'photo',
	[singleRouteName.advances]: 'confirmation_document',
	[singleRouteName.documents]: 'path',
}
