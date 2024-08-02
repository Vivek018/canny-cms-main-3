import { faker } from '@faker-js/faker'
import { NORMAL_DAY_HOURS } from '@/constant'
import { statesArray, vehicleTypeArray } from './servers/list.server'

export const paymentFields = [
	{
		payment_field: {
			name: 'Basic',
			sort_id: 0,
		},
		value: {
			value: 540,
			month: 4,
			year: 2024,
			skill_type: 'unskilled',
		},
	},
	{
		payment_field: {
			name: 'Fixed Allowance',
			sort_id: 1,
		},
		value: {
			value: 200,
			month: 4,
			year: 1960,
			skill_type: 'all',
		},
	},
	{
		payment_field: {
			name: 'PF',
			sort_id: 2,
			is_deduction: true,
		},
		value: {
			value: 13,
			max_value: 15000,
			month: 4,
			year: 1960,
			type: 'percentage',
			skill_type: 'all',
		},
	},
	{
		payment_field: {
			name: 'ESIC',
			sort_id: 3,
			is_deduction: true,
		},
		value: {
			value: 3.25,
			month: 4,
			year: 1960,
			type: 'percentage',
			skill_type: 'all',
		},
	},

	{
		payment_field: {
			name: 'BONUS',
			sort_id: 4,
		},
		value: {
			value: 8.33,
			month: 4,
			year: 1960,
			type: 'percentage',
			skill_type: 'all',
		},
	},
	{
		payment_field: {
			name: 'Overtime',
			sort_id: 5,
		},
		value: {
			value: 800,
			value_type: 'overtime',
			month: 4,
			year: 1960,
			skill_type: 'all',
		},
	},
	{
		payment_field: {
			name: 'PT',
			sort_id: 7,
			is_deduction: true,
		},
		value: {
			value: 200,
			value_type: 'monthly',
			month: 4,
			year: 1960,
			skill_type: 'all',
		},
	},
	{
		payment_field: {
			name: 'HRA',
			sort_id: 8,
		},
		value: {
			value: 6.25,
			month: 4,
			year: 1960,
			type: 'percentage',
			skill_type: 'all',
		},
	},
	{
		payment_field: {
			name: 'Gratuity',
			sort_id: 9,
			is_deduction: true,
			is_statutory: true,
			eligible_after_years: 4.5,
		},
		value: {
			value: 540,
			month: 4,
			year: 2024,
			pay_frequency: 'at_end',
			value_type: 'yearly',
			skill_type: 'unskilled',
		},
	},
	{
		payment_field: {
			name: 'Leave Encashment',
			sort_id: 10,
			is_statutory: true,
			eligible_after_years: 0.5,
		},
		value: {
			value: 6.67,
			month: 4,
			year: 2024,
			type: 'percentage',
		},
	},
	{
		payment_field: {
			name: 'Retrenchment Bonus',
			sort_id: 11,
			is_statutory: true,
			eligible_after_years: 0.5,
		},
		value: {
			value: 540,
			month: 4,
			year: 2024,
			value_type: 'yearly',
			skill_type: 'unskilled',
		},
	},
	{
		payment_field: {
			name: 'LWF',
			sort_id: 12,
			is_deduction: true,
			is_statutory: true,
		},
		value: {
			value: 36,
			month: 4,
			year: 2024,
			value_type: 'monthly',
			skill_type: 'unskilled',
		},
	},
]

const educationArray = [
	'10th',
	'12th',
	'Graduate',
	'Post Graduate',
	'Diploma',
	'Others',
]

const statusArray = ['active', 'inactive']

const booleanArray = [true, false]
// const typeArray = ['String', 'Number', 'Boolean']

const randomNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function createEmployee() {
	return {
		full_name: faker.person.fullName(),
		guardian_name: faker.person.fullName(),
		designation: faker.person.jobTitle(),
		date_of_birth: faker.date.birthdate(),
		gender: faker.person.gender(),
		education:
			educationArray[Math.floor(Math.random() * educationArray.length)],
		employee_code: faker.string.alphanumeric({ length: 6 }),
		uan_no: faker.string.alphanumeric({ length: 6 }),
		esic_id: faker.string.alphanumeric({ length: 6 }),
		pan_number: faker.string.alphanumeric({ length: 6 }),
		mobile: faker.string.numeric({ length: 10 }),
		status: statusArray[Math.floor(Math.random() * statusArray.length)],
		joining_date: faker.date.past({ years: 10 }),
		exit_date: faker.date.future(),
		aadhar_number: faker.string.numeric({ length: 12 }),
		permanent_address:
			faker.location.streetAddress() +
			faker.location.streetAddress() +
			faker.location.streetAddress(),
	}
}

export function createCompany() {
	return {
		name: faker.company.name(),
		email_suffix: faker.internet.domainSuffix(),
		address: faker.location.streetAddress(),
	}
}

export function createProject() {
	return {
		name: faker.company.name(),
		starting_date: faker.date.past({ years: 10 }),
		ending_date: faker.date.future({ years: 10 }),
	}
}

export function createProjectLocation() {
	return {
		district: faker.location.street() + faker.location.street().substring(0, 3),
		city: faker.location.city(),
		state: statesArray[Math.floor(Math.random() * statesArray.length)].value,
		postal_code: faker.number.int({ max: 999999 }),
		esic_code: faker.string.alphanumeric({ length: 6 }),
	}
}

export function createVehicle() {
	return {
		name: faker.vehicle.vehicle(),
		number: faker.vehicle.vin(),
		type: vehicleTypeArray[Math.floor(Math.random() * vehicleTypeArray.length)]
			.value,
		year_bought: randomNumber(2000, 2022),
		total_kms_driven: randomNumber(10000, 200000),
		price: randomNumber(500000, 5000000),
		other_details: faker.lorem.sentence(),
		status: statusArray[Math.floor(Math.random() * statusArray.length)],
	}
}
export function createUserRoles() {
	const mainRolesArray = [
		{ name: 'cms_lead' },
		{ name: 'cms_admin' },
		{ name: 'cms_assistant' },
		{ name: 'waiting' },
	]
	const companyRolesArray = [{ name: 'client_lead' }, { name: 'client_admin' }]

	return [
		...mainRolesArray,
		...companyRolesArray,
		{ name: 'project_admin' },
		{ name: 'project_location_admin' },
	]
}

export function createUser() {
	return {
		designation: faker.person.jobTitle(),
		full_name: faker.person.fullName(),
		email: faker.internet.email(),
		last_signed_in: faker.date.past(),
	}
}

export function createBankDetails() {
	return {
		account_number: faker.finance.accountNumber(),
		ifsc_code: faker.finance.routingNumber(),
	}
}

export function createAttendance() {
	return {
		date: faker.date.past(),
		no_of_hours: randomNumber(0, NORMAL_DAY_HOURS),
		present: booleanArray[Math.floor(Math.random() * booleanArray.length)],
		holiday: booleanArray[Math.floor(Math.random() * booleanArray.length)],
	}
}

export function createPaymentField() {
	return {
		name: faker.finance.transactionType(),
		description: faker.lorem.sentence(),
	}
}

export function createMonthlyPayment() {
	return {
		label: faker.lorem.word(),
		amount: parseInt(faker.finance.amount()),
	}
}

export function createAdvancePayment() {
	return {
		label: faker.lorem.word(),
		amount: parseInt(faker.finance.amount()),
		credited: booleanArray[Math.floor(Math.random() * booleanArray.length)],
		payment_date: faker.date.past(),
	}
}
