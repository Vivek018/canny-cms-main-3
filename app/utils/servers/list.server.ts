import { booleanArray, MAX_DATA_LENGTH, singleRouteName } from '@/constant'
import { getYears, months } from '../misx'
import { prisma } from './db.server'

export const statesArray = [
	{ value: 'Andhra Pradesh' },
	{ value: 'Arunachal Pradesh' },
	{ value: 'Assam' },
	{ value: 'Bihar' },
	{ value: 'Chhattisgarh' },
	{ value: 'Goa' },
	{ value: 'Gujarat' },
	{ value: 'Haryana' },
	{ value: 'Himachal Pradesh' },
	{ value: 'Jharkhand' },
	{ value: 'Karnataka' },
	{ value: 'Kerala' },
	{ value: 'Madhya Pradesh' },
	{ value: 'Maharashtra' },
	{ value: 'Manipur' },
	{ value: 'Meghalaya' },
	{ value: 'Mizoram' },
	{ value: 'Nagaland' },
	{ value: 'Odisha' },
	{ value: 'Punjab' },
	{ value: 'Rajasthan' },
	{ value: 'Sikkim' },
	{ value: 'Tamil Nadu' },
	{ value: 'Telangana' },
	{ value: 'Tripura' },
	{ value: 'Uttar Pradesh' },
	{ value: 'Uttarakhand' },
	{ value: 'West Bengal' },
	{ value: 'Andaman and Nicobar Islands' },
	{ value: 'Chandigarh' },
	{ value: 'Dadra and Nagar Haveli and Daman and Diu' },
	{ value: 'Lakshadweep' },
	{ value: 'Delhi' },
	{ value: 'Puducherry' },
	{ value: 'Ladakh' },
	{ value: 'Jammu and Kashmir' },
]

export const gender = [
	{ value: 'male' },
	{ value: 'female' },
	{ value: 'others' },
]

export const education = [
	{ value: '10th' },
	{ value: '12th' },
	{ value: 'graduate' },
	{ value: 'post graduate' },
	{ value: 'diploma' },
	{ value: 'other' },
]

export const status = [{ value: 'active' }, { value: 'inactive' }]
export const payment_field_type = [{ value: 'fixed' }, { value: 'percentage' }]
export const value_type = [
	{ value: 'daily' },
	{ value: 'monthly' },
	{ value: 'overtime' },
]
export const skill_type = [
	{ value: 'skilled' },
	{ value: 'semi_skilled' },
	{ value: 'unskilled' },
]

export const vehicleTypeArray = [
	{ value: 'car' },
	{ value: 'scooty' },
	{ value: 'bike' },
	{ value: 'truck' },
	{ value: 'bus' },
	{ value: 'van' },
	{ value: 'others' },
]

export const belongsToArray = [
	{ value: 'company' },
	{ value: 'project' },
	{ value: 'project location' },
	{ value: 'employee' },
	{ value: 'vehicle' },
]

const paginationOption = {
	take: MAX_DATA_LENGTH,
	orderBy: { updated_at: 'desc' as any },
}

export const companies = async () =>
	await prisma.company.findMany({
		select: {
			id: true,
			name: true,
		},
		...paginationOption,
	})

export const users = async () =>
	await prisma.user.findMany({
		select: {
			id: true,
			full_name: true,
		},
		...paginationOption,
	})

export const user_roles = async () =>
	await prisma.user_Role.findMany({
		select: {
			id: true,
			name: true,
		},
		...paginationOption,
	})

export const projects = async () =>
	await prisma.project.findMany({
		select: {
			id: true,
			name: true,
		},
		...paginationOption,
	})

export const project_locations = async () =>
	await prisma.project_Location.findMany({
		select: {
			id: true,
			district: true,
		},
		...paginationOption,
	})

export const employees = async (dependency?: string) =>
	await prisma.employee.findMany({
		select: {
			id: true,
			full_name: true,
		},
		where: dependency
			? {
					project: { id: dependency },
				}
			: {},
		...paginationOption,
	})

export const vehicles = async (dependency?: string) =>
	await prisma.vehicle.findMany({
		select: {
			id: true,
			number: true,
		},
		where: dependency
			? {
					project: { id: dependency },
				}
			: {},
		...paginationOption,
	})

export const payment_fields = async () =>
	await prisma.payment_Field.findMany({
		select: {
			id: true,
			name: true,
		},
		...paginationOption,
		orderBy: { sort_index: 'asc' },
	})

export const getFilterList = (master: string) => {
	const fitlerArray = {
		users: async () => ({
			role: await user_roles(),
			company: await companies(),
			project: await projects(),
			project_location: await project_locations(),
			last_signed_in: '',
		}),
		documents: async () => ({
			belongs_to: belongsToArray,
			company: await companies(),
			project: await projects(),
			project_location: await project_locations(),
			vehicle: await vehicles(),
		}),
		companies: async () => ({
			project: await projects(),
			project_location: await project_locations(),
		}),
		employees: async () => ({
			status: status,
			skill_type: skill_type,
			company: await companies(),
			project: await projects(),
			project_location: await project_locations(),
		}),
		attendances: async () => ({
			month: months,
			year: getYears(12),
		}),
		advances: async () => ({
			company: await companies(),
			project: await projects(),
			project_location: await project_locations(),
			user: await users(),
			credited: booleanArray,
		}),
		payment_fields: async () => ({
			is_deduction: booleanArray,
			service_charge_field: booleanArray,
			company: await companies(),
			project: await projects(),
			project_location: await project_locations(),
		}),
		projects: async () => ({
			company: await companies(),
		}),
		project_locations: async () => ({
			state: statesArray,
			project: await projects(),
		}),
		vehicles: async () => ({
			type: vehicleTypeArray,
			status: status,
			company: await companies(),
			project: await projects(),
			project_location: await project_locations(),
		}),
	}
	return fitlerArray[master as keyof typeof fitlerArray]
}

export const inputList: { [key: string]: any } = {
	[singleRouteName.users]: async () => {
		const roles = await user_roles()
		const projectList = await projects()
		const locations = await project_locations()
		const companyList = await companies()
		return {
			role: roles,
			project: projectList,
			project_location: locations,
			company: companyList,
		}
	},
	[singleRouteName.documents]: async (dependency: string) => {
		const companyList = await companies()
		const projectList = await projects()
		const locations = await project_locations()
		const employeeList = await employees(dependency)
		const vehicleList = await vehicles(dependency)
		return {
			belongs_to: belongsToArray,
			employee: employeeList,
			company: companyList,
			project: projectList,
			project_location: locations,
			vehicle: vehicleList,
		}
	},
	[singleRouteName.employees]: async () => {
		const companyList = await companies()
		const projectList = await projects()
		const projectLocationList = await project_locations()
		return {
			company: companyList,
			project: projectList,
			project_location: projectLocationList,
			skill_type: skill_type,
			status: status,
			gender: gender,
			education: education,
		}
	},
	[singleRouteName.advances]: async (dependency: string) => {
		const userList = await users()
		const projectList = await projects()
		const employeeList = await employees(dependency)
		return {
			credited: booleanArray,
			user: userList,
			project: projectList,
			employee: employeeList,
		}
	},
	[singleRouteName.projects]: async () => {
		const companyList = await companies()
		return {
			company: companyList,
		}
	},
	[singleRouteName.project_locations]: async () => {
		const projectList = await projects()
		const paymentFieldList = await payment_fields()
		return {
			state: statesArray,
			project: projectList,
			payment_field: paymentFieldList,
		}
	},
	[singleRouteName.payment_fields]: async () => {
		const projectLocationList = await project_locations()
		const paymentFieldList = await payment_fields()
		return {
			project_location: projectLocationList,
			percentage_of: paymentFieldList,
			is_deduction: booleanArray,
			service_charge_field: booleanArray,
		}
	},
	[singleRouteName.vehicles]: async (dependency: string) => {
		const employees = await prisma.employee.findMany({
			select: { id: true, full_name: true },
			where: {
				designation: { contains: 'driver' },
				project: dependency ? { id: dependency } : {},
			},
			take: MAX_DATA_LENGTH,
		})
		const companyList = await companies()
		const projectList = await projects()
		const projectLocationList = await project_locations()
		return {
			company: companyList,
			project: projectList,
			project_location: projectLocationList,
			type: vehicleTypeArray,
			year_bought: getYears(),
			status: status,
			employee: employees,
		}
	},
	value: async () => {
		const paymentFieldList = await payment_fields()
    const companyList = await companies()
		const projectList = await projects()
		return {
			type: payment_field_type,
			value_type: value_type,
			skill_type: [...skill_type, { value: 'all' }],
			month: months,
			year: getYears(),
			payment_field: paymentFieldList,
			company: companyList,
			project: projectList,
		}
	},
}

export const tabList: { [key: string]: any } = {
	[singleRouteName.employees]: ['payment_data'],
	[singleRouteName.companies]: ['attendance', 'payment_data'],
	[singleRouteName.projects]: ['attendance', 'payment_data'],
	[singleRouteName.project_locations]: ['attendance', 'payment_data'],
}
