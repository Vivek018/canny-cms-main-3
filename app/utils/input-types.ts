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
			label: 'city',
			type: types.select,
		},
	},
	employee: {
		employee: { name: 'employee', label: 'full_name', type: types.select },
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
			dependsValue: ['client lead', 'client admin'],
		},
		project: {
			...commonDependedTypes.project.project,
			dependsOn: 'role',
			dependsValue: ['project admin', 'project location admin'],
		},
		project_location: {
			...commonTypes.project_location.project_location,
			dependsOn: 'role',
			dependsValue: ['project location admin'],
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
			dependsValue: ['company'],
		},
		project: {
			...commonDependedTypes.project.project,
			dependsOn: 'belongs_to',
			dependsValue: ['project', 'employee', 'vehicle', 'project location'],
		},
		project_location: {
			...commonTypes.project_location.project_location,
			dependsOn: 'belongs_to',
			dependsValue: ['project location'],
		},
		employee: {
			...commonTypes.employee.employee,
			dependsOn: 'belongs_to',
			dependsValue: ['employee'],
		},
		vehicle: {
			name: 'vehicle',
			label: 'number',
			type: types.select,
			dependsOn: 'belongs_to',
			dependsValue: ['vehicle'],
		},
	},
	[singleRouteName.companies]: {
		photo: { name: 'photo', type: types.file },
		service_charge: { type: types.number },
		reimbursement_charge: { type: types.number },
		service_charge_field: {
			name: 'service_charge_field',
			label: 'value',
			type: types.radio,
		},
		address: { name: 'address', type: types.textarea },
	},
	[singleRouteName.employees]: {
		photo: { name: 'photo', type: types.file },
		project: { ...commonDependedTypes.project.project, ignore: true },
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
		...commonTypes.company,
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
		...commonTypes.project,
	},
	[singleRouteName.payment_fields]: {
		description: { type: types.textarea },
		type: { name: 'type', label: 'value', type: types.radio },
		skill_type: { name: 'skill_type', label: 'value', type: types.radio },
		value_type: { name: 'value_type', label: 'value', type: types.radio },
		sort_index: { type: types.number },
		is_deduction: {
			name: 'is_deduction',
			label: 'value',
			type: types.radio,
		},
		service_charge_field: {
			name: 'service_charge_field',
			label: 'value',
			type: types.radio,
		},
		percentage_of: {
			name: 'percentage_of',
			label: 'name',
			type: types.select,
			isMulti: true,
		},
		project: {
			...commonDependedTypes.project.project,
			on: 'project_location',
			ignore: true,
		},
		project_location: {
			name: 'project_location',
			label: 'city',
			type: types.select,
			isMulti: true,
		},
	},
	[singleRouteName.vehicles]: {
		kms_driven: { type: types.number },
		year_bought: { name: 'year_bought', label: 'value', type: types.radio },
		price: { type: types.number },
		type: { name: 'type', label: 'value', type: types.radio },
		status: { name: 'status', label: 'value', type: types.radio },
		project: { ...commonDependedTypes.project.project, ignore: true },
		...commonTypes.project_location,
		other_details: { type: types.textarea },
	},
}

export const imageFieldName: { [key: string]: string } = {
	[singleRouteName.companies]: 'photo',
	[singleRouteName.users]: 'photo',
	[singleRouteName.employees]: 'photo',
	[singleRouteName.advances]: 'confirmation_document',
	[singleRouteName.documents]: 'path',
}
