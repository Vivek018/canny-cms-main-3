import { type NavList } from 'types'

export const defaultMonth = (new Date().getMonth()).toString()
export const defaultYear = new Date().getFullYear().toString()
export const defaultDay = new Date().getDate().toString()

export const PAGE_SIZE = 12
export const TAB_PAGE_SIZE = 8
export const MAX_DATA_LENGTH = 400
export const NORMAL_DAY_HOURS = 8

export const MILLISECONDS_IN_A_SECOND = 1000
export const SECONDS_IN_AN_HOUR = 3600
export const HOURS_IN_A_DAY = 24
export const DAYS_IN_A_YEAR = 365
export const DAYS_IN_A_MONTH = 30

export const NO_IMAGE = '/no_image.jpeg'

export const noOfDataBelongsTo = ['employees', 'advances', 'vehicles']

export const booleanArray = [{ value: 'true' }, { value: 'false' }]

export const weekdays = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
]

export const singleRouteName: { [key: string]: string } = {
	users: 'user',
	documents: 'document',
	companies: 'company',
	employees: 'employee',
	advances: 'advance_Payment',
	payment_fields: 'payment_Field',
	projects: 'project',
	project_locations: 'project_Location',
	vehicles: 'vehicle',
	value: 'value',
	vehicle_monthly: 'vehicle_Monthly',
}

export const importExportEnabled = [
	'users',
	'companies',
	'employees',
	'advances',
	'attendances',
	'payment_fields',
	'projects',
	'project_locations',
	'vehicles',
]

export const analyticsEnabled = [
	'companies',
	'employees',
	'projects',
	'project_locations',
	'vehicles',
]

export const routeObjectTitle: { [key: string]: string } = {
	[singleRouteName.users]: 'full_name',
	[singleRouteName.documents]: 'label',
	[singleRouteName.companies]: 'name',
	[singleRouteName.employees]: 'full_name',
	[singleRouteName.advances]: 'label',
	[singleRouteName.payment_fields]: 'name',
	[singleRouteName.projects]: 'name',
	[singleRouteName.project_locations]: 'district',
	[singleRouteName.vehicles]: 'number',
	[singleRouteName.vehicle_monthly]: 'kms_driven',
	[singleRouteName.value]: 'value',
}

export const tabList: { [key: string]: any } = {
	[singleRouteName.companies]: ['attendance', 'payment_data'],
	[singleRouteName.employees]: ['payment_data'],
	[singleRouteName.payment_fields]: ['report'],
	[singleRouteName.projects]: ['attendance', 'payment_data'],
	[singleRouteName.project_locations]: ['attendance', 'payment_data'],
}

export const noTabList: { [key: string]: string[] } = {
	[singleRouteName.employees]: ['value'],
	[singleRouteName.companies]: ['value'],
	[singleRouteName.projects]: ['value'],
	[singleRouteName.payment_fields]: ['percentage_of', 'is_percentage', 'min_value_of', 'is_min_value'],
}

export const sideNavList = [
	{ name: 'Main Menu', isLabel: true },
	{ name: 'Dashboard', link: '/dashboard', icon: 'dashboard', isLabel: false },
	{ name: 'Users', link: '/users', icon: 'avatar', isLabel: false },
	{ name: 'Management', isLabel: true },
	{ name: 'Documents', link: '/documents', icon: 'file-text', isLabel: false },
	{ name: 'Companies', link: '/companies', icon: 'company', isLabel: false },
	{ name: 'Employees', link: '/employees', icon: 'employee', isLabel: false },
	{ name: 'Attendance', link: '/attendance', icon: 'calender', isLabel: false },
	{ name: 'Finance', isLabel: true },
	{ name: 'Advances', link: '/advances', icon: 'lab-timer', isLabel: false },
	{
		name: 'Payment Fields',
		link: '/payment_fields',
		icon: 'input',
		isLabel: false,
	},
	{
		name: 'Payment Data',
		link: '/payment_data',
		icon: 'table',
		isLabel: false,
	},
	{ name: 'Project Resources', isLabel: true },
	{ name: 'Projects', link: '/projects', icon: 'project', isLabel: false },
	{
		name: 'Project Locations',
		link: '/project_locations',
		icon: 'pin',
		isLabel: false,
	},
	{ name: 'Vehicles', link: '/vehicles', icon: 'rocket', isLabel: false },
] as NavList[]

const sideNavs = sideNavList.filter(item => !item.isLabel).map(item => item)

export const navList = [
	...sideNavs,
	{ name: 'Analytics', link: '/analytics', icon: 'chart', isLabel: false },
	{
		name: 'Profile',
		link: '/profile',
		icon: 'person',
		isLabel: false,
	},
	{
		name: 'Add Users',
		link: '/users/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Employee',
		link: '/employees/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Document',
		link: '/documents/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Company',
		link: '/companies/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Advance Payment',
		link: '/advances/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Payment Field',
		link: '/payment_fields/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Project',
		link: '/projects/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Project Location',
		link: '/project_locations/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	{
		name: 'Add Vehicle',
		link: '/vehicles/upsert',
		icon: 'plus-circled',
		isLabel: false,
	},
	...analyticsEnabled.map(item => ({
		name: `${item} Analytics`,
		link: `/${item}/analytics`,
		icon: 'chart',
		isLabel: false,
	})),
] as NavList[]
