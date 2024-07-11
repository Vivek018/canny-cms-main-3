import { faker } from '@faker-js/faker'
import { statesArray, vehicleTypeArray } from './servers/list.server'

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
const typeArray = ['String', 'Number', 'Boolean']

const paymentFieldType = ['fixed', 'percentage']

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
		permanent_address: faker.location.streetAddress(),
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
		street_address: faker.location.streetAddress(),
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
		kms_driven: randomNumber(0, 200000),
		price: randomNumber(500000, 5000000),
		other_details: faker.lorem.sentence(),
		status: statusArray[Math.floor(Math.random() * statusArray.length)],
	}
}
export function createUserRoles() {
	const mainRolesArray = [
		{ name: 'cms lead' },
		{ name: 'cms admin' },
		{ name: 'cms assistant' },
		{ name: 'waiting' },
	]
	const companyRolesArray = [{ name: 'client lead' }, { name: 'client admin' }]

	return [
		...mainRolesArray,
		...companyRolesArray,
		{ name: 'project admin' },
		{ name: 'project location admin' },
	]
}

export function createPaymentFields() {
	return [
		{
			name: 'BASIC',
			type: paymentFieldType[0],
		},
		{
			name: 'FIXED ALLOWANCE',
			type: paymentFieldType[0],
		},
		{
			name: 'OVERTIME ALLOWANCE',
			type: paymentFieldType[0],
		},
		{
			name: 'PF',
			type: paymentFieldType[1],
			value: 12,
		},
		{
			name: 'ESIC',
			type: paymentFieldType[1],
			value: 3.75,
		},
		{
			name: 'BONUS',
			type: paymentFieldType[1],
			value: 8.33,
		},
		{
			name: 'PT',
			type: paymentFieldType[0],
		},
		{
			name: 'HRA',
			type: paymentFieldType[0],
		},
		{
			name: 'OTHERS',
			type: paymentFieldType[0],
		},
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
		no_of_hours: randomNumber(0, 8),
		present: booleanArray[Math.floor(Math.random() * booleanArray.length)],
		holiday: booleanArray[Math.floor(Math.random() * booleanArray.length)],
	}
}

export function createPaymentField() {
	return {
		name: faker.finance.transactionType(),
		description: faker.lorem.sentence(),
		type: typeArray[Math.floor(Math.random() * typeArray.length)],
		value: parseInt(faker.finance.amount()),
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
