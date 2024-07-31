import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { noTabList, routeObjectTitle, singleRouteName } from '@/constant'
import { inputTypes } from '@/utils/input-types'
import { capitalizeFirstLetter, formatDate, hasId, isTitle } from './misx'

const textMinLength = 1
const textMaxLength = 100

const booleanEnum = ['true', 'false'] as readonly ['true', 'false']
const statusEnum = ['active', 'inactive'] as readonly ['active', 'inactive']
const skillTypesEnum = ['skilled', 'semi_skilled', 'unskilled'] as readonly [
	'skilled',
	'semi_skilled',
	'unskilled',
]

const educationEnum = [
	'10th',
	'12th',
	'graduate',
	'post graduate',
	'diploma',
	'other',
] as readonly ['10th', '12th', 'graduate', 'post graduate', 'diploma', 'other']

const vehicleTypeEnum = [
	'car',
	'scooty',
	'bike',
	'truck',
	'bus',
	'van',
	'others',
] as readonly ['car', 'scooty', 'bike', 'truck', 'bus', 'van', 'others']

const belongsToEnum = [
	'company',
	'project',
	'project_location',
	'employee',
	'vehicle',
] as readonly ['company', 'project', 'project_location', 'employee', 'vehicle']

const zString = z
	.string()
	.min(textMinLength)
	.max(textMaxLength)
	.regex(/^[A-Z._a-z \s]+$/, 'Only alphabets are allowed')

const zNumberString = z
	.string()
	.min(textMinLength)
	.max(textMaxLength)
	.regex(/^[A-Z_a-z0-9 \s]+$/, 'Only alphabets and numbers are allowed')

const zNumber = z
	.string()
	.min(textMinLength)
	.max(textMaxLength)
	.regex(/^[0-9]+$/, 'Only numbers are allowed')

const zTextArea = z
	.string()
	.min(10)
	.max(textMaxLength * 10)
	.regex(
		/^[A-Z_a-z./ ,0-9 \s]+$/,
		'Only alphabets, numbers, dot, slash and comma are allowed',
	)

const MAX_SIZE = 1 * 1024 * 1024 // 1MB
const ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
]

const zImage = z
	.any()
	.refine(
		file => (typeof file !== 'string' ? file.size < MAX_SIZE : true),
		'File size must be less than 1MB',
	)
	.refine(
		file =>
			typeof file !== 'string'
				? ACCEPTED_IMAGE_TYPES.includes(file?.type)
				: true,
		'Only .jpg, .jpeg, .png and .webp formats are supported.',
	)
	.optional()

const zFile = z
	.any()
	.refine(
		file => (typeof file !== 'string' ? file.size < MAX_SIZE * 5 : true),
		'File size must be less than 5MB',
	)
	.refine(file => {
		return (
			typeof file !== 'string'
				? [
						...ACCEPTED_IMAGE_TYPES,
						'image/pdf',
						'image/doc',
						'image/docx',
						'application/pdf',
						'application/doc',
						'application/docx',
					].includes(file?.type)
				: true,
			'Only .jpg, .jpeg, .png .webp, .pdf, .doc and .docx formats are supported.'
		)
	})

export const Schemas: { [key: string]: any } = {
	[singleRouteName.users]: z.object({
		id: z.string().optional(),
		full_name: zString,
		photo: zImage,
		role: z.string().default('waiting'),
		designation: zString,
		email: z.string().email().min(textMinLength).max(textMaxLength),
		company: zNumberString.optional(),
		project: zNumberString.optional(),
		project_location: zNumberString.optional(),
	}),
	[singleRouteName.documents]: z.object({
		id: z.string().optional(),
		label: zString,
		path: zFile,
		belongs_to: z.enum(belongsToEnum),
		company: zNumberString.optional(),
		project: zNumberString.optional(),
		project_location: zNumberString.optional(),
		employee: zNumberString.optional(),
		vehicle: zNumberString.optional(),
	}),
	[singleRouteName.companies]: z.object({
		id: z.string().optional(),
		name: zString,
		photo: zImage,
		email_suffix: z
			.string()
			.min(textMinLength)
			.max(20)
			.regex(
				/^[A-Z_a-z.0-9 \s]+$/,
				'Only alphabets, numbers and dot are allowed',
			)
			.optional(),
		address: zTextArea.optional(),
		project: z.array(zNumberString).optional(),
	}),
	[singleRouteName.employees]: z.object({
		id: z.string().optional(),
		full_name: zString,
		guardian_name: zString,
		photo: zImage,
		designation: zString.default('Sampler'),
		skill_type: z.enum(skillTypesEnum).default('unskilled'),
		company: zNumberString,
		project: zNumberString,
		project_location: zNumberString,
		date_of_birth: z
			.date()
			.min(new Date('1950-01-01'))
			.max(new Date())
			.optional(),
		status: z.string().default('active'),
		gender: zString.default('male'),
		education: z.enum(educationEnum).default('12th'),
		employee_code: zNumberString.min(1).max(12),
		uan_no: zNumberString.min(1).max(12),
		esic_id: zNumberString.min(1).max(12),
		mobile: zNumber.min(10).max(10).optional(),
		joining_date: z
			.date()
			.min(new Date('1960-01-01'))
			.max(new Date())
			.default(new Date()),
		exit_date: z.date().min(new Date('1960-01-01')).max(new Date()).optional(),
		aadhar_number: zNumber.min(12).max(12).optional(),
		pan_number: zNumberString.min(8).max(12).optional(),
		permanent_address: zTextArea.optional(),
		bank_detail_id: z.string().optional(),
		account_number: zNumber.min(8).max(16).optional(),
		ifsc_code: zNumberString.min(8).max(16).optional(),
		value: z.array(zNumberString).optional(),
	}),
	[singleRouteName.advances]: z.object({
		id: z.string().optional(),
		label: zNumberString,
		amount: z.number().int().min(1),
		credited: z.enum(booleanEnum).default('false'),
		user: zNumberString.optional(),
		project: zNumberString.optional(),
		employee: zNumberString.optional(),
		payment_date: z.date().max(new Date()).default(new Date()),
		confirmation_document: zFile,
	}),
	[singleRouteName.projects]: z.object({
		id: z.string().optional(),
		name: zNumberString,
		starting_date: z.date().default(new Date()),
		ending_date: z.date().optional(),
		company: z.array(zNumberString).optional(),
		project_location: z.array(zNumberString).optional(),
	}),
	[singleRouteName.project_locations]: z.object({
		id: z.string().optional(),
		district: zString,
		city: zString,
		state: zString,
		postal_code: z.number().min(1000).max(9999999).optional(),
		esic_code: zNumberString.max(20).optional(),
		payment_field: z.array(zNumberString).optional(),
		project: z.array(zNumberString).optional(),
	}),
	[singleRouteName.payment_fields]: z.object({
		id: z.string().optional(),
		name: zNumberString,
		description: zTextArea.max(1000).optional(),
		sort_id: zNumber.min(0).max(50).optional(),
		is_deduction: z.enum(booleanEnum).default('false'),
		is_statutory: z.enum(booleanEnum).default('false'),
		eligible_after_years: z.number().default(0),
		percentage_of: z.array(zNumberString).optional(),
		project_location: z.array(zNumberString).optional(),
	}),
	[singleRouteName.vehicles]: z.object({
		id: z.string().optional(),
		name: zString,
		number: zNumberString,
		type: z.enum(vehicleTypeEnum).default('car'),
		year_bought: z.number().int().min(1960).max(new Date().getFullYear()),
		company: zNumberString,
		project: zNumberString,
		project_location: zNumberString,
		employee: zNumberString.optional(),
		total_kms_driven: z.number().int().min(1).max(10000000).optional(),
		status: z.enum(statusEnum).default('active'),
		price: z.number().int().min(1000).max(100000000).optional(),
		other_details: zTextArea.optional(),
	}),
	[singleRouteName.vehicle_monthly]: z.object({
		id: z.string().optional(),
		kms_driven: z.number().int().min(1).max(10000000),
		month: z
			.number()
			.int()
			.min(1)
			.max(12)
			.default(new Date().getMonth() + 1),
		year: z
			.number()
			.int()
			.min(1960)
			.max(new Date().getFullYear())
			.default(new Date().getFullYear()),
		vehicle: zNumberString.optional(),
	}),
	[singleRouteName.value]: z.object({
		id: z.string().optional(),
		value: z.number().min(0).max(10000000),
		max_value: z.number().min(0).max(10000000).optional(),
		type: z.enum(['fixed', 'percentage']).default('fixed'),
		value_type: z
			.enum(['daily', 'monthly', 'yearly', 'overtime', 'n/a'])
			.default('daily'),
		skill_type: z.enum([...skillTypesEnum, 'all']).default('all'),
		pay_at_once: z.enum(booleanEnum).default('false'),
		month: z.number().int().min(1).max(12),
		year: z.number().int().min(1960).max(new Date().getFullYear()),
		payment_field: zNumberString.optional(),
		company: z.array(zNumberString).optional(),
		project: z.array(zNumberString).optional(),
	}),
}

export const getSelector = (routeName: string) => {
	return Object.keys(Schemas[routeName].shape).reduce((acc: any, key) => {
		const typeKey = inputTypes[routeName][key]
		if (typeKey?.ignore) {
			return acc
		} else if (typeKey?.connectOn) {
			if (key.endsWith('_id')) {
				acc[typeKey?.connectOn] = {
					select: {
						id: true,
						...acc[typeKey?.connectOn]?.select,
					},
				}
			} else {
				acc[typeKey?.connectOn] = {
					select: {
						...acc[typeKey?.connectOn]?.select,
						[key]: true,
					},
				}
			}
		} else if (typeKey?.type === 'select') {
			acc[key] = { select: { [typeKey?.label]: true } }
		} else {
			acc[key] = true
		}
		return acc
	}, [])
}

export const getSelectorKeys = (routeName: string): string[] => {
	let selectorKeys = []
	for (const key in Schemas[routeName].shape) {
		if (key === 'id') continue
		selectorKeys.push(key)
	}
	return selectorKeys
}

export const getSelectorValues = (
	routeName: string,
	values: any,
	disconnectValues: any = null,
	update?: boolean,
): any => {
	let selectorValues: any = {}

	for (const key in Schemas[routeName].shape) {
		const typeKey = inputTypes[routeName][key]
		if (key === 'id' || typeKey?.ignore) continue
		else if (typeKey?.type === 'radio' && values[key]) {
			const isBoolean = values[key] === 'true' || values[key] === 'false'
			if (isBoolean) {
				selectorValues[key] = values[key] === 'true' ? true : false
			} else {
				selectorValues[key] = values[key]
			}
		} else if (typeKey?.connectOn && values[key]) {
			if (key.endsWith('_id')) {
				selectorValues[typeKey?.connectOn] = update
					? {
							upsert: {
								where: { id: values[key] ?? `__new_${typeKey?.connectOn}__` },
							},
						}
					: {
							create: {},
						}
			} else {
				selectorValues[typeKey?.connectOn] = update
					? {
							upsert: {
								create: {
									...selectorValues[typeKey?.connectOn]?.upsert.create,
									[key]: values[key],
								},
								update: {
									...selectorValues[typeKey?.connectOn]?.upsert.update,
									[key]: values[key],
								},
							},
						}
					: {
							create: {
								...selectorValues[typeKey?.connectOn]?.create,
								[key]: values[key],
							},
						}
			}
		} else if (typeKey?.isMulti) {
			if (
				disconnectValues &&
				disconnectValues[typeKey.name] &&
				disconnectValues[typeKey.name][key]?.length
			) {
				const disconnectValue = disconnectValues[typeKey.name]

				selectorValues[key] = {
					disconnect: disconnectValue[key],
					connect: values[key]?.map((value: any) => ({ id: value })),
				}
			} else {
				selectorValues[key] = {
					connect: values[key]?.map((value: any) => ({ id: value })),
				}
			}
		} else if (typeKey?.type === 'select' && values[key]) {
			const typeIgnoreKeys = inputTypes[routeName]?.ignoreDependentKeys?.filter(
				(item: string) => item !== key && !typeKey?.isNeeded?.includes(item),
			)

			if (typeIgnoreKeys) {
				selectorValues = update
					? {
							...selectorValues,
							...typeIgnoreKeys?.reduce((acc: any, item: string) => {
								acc[item] = { disconnect: true }
								return acc
							}, {}),
						}
					: {
							...selectorValues,
							...Object.entries(selectorValues).reduce(
								(acc: any, [key, value]: any) => {
									if (typeIgnoreKeys?.includes(key)) {
										acc[key] = undefined
									} else {
										acc[key] = value
									}
									return acc
								},
								{},
							),
						}
			}
			selectorValues[key] = { connect: { id: values[key] } }
		} else if (typeKey?.type === 'number' && values[key]) {
			selectorValues[key] = String(values[key])?.includes('.')
				? parseFloat(values[key])
				: parseInt(values[key])
		} else if (typeKey?.type === 'date' && values[key]) {
			const dateObject = formatDate(values[key])
			selectorValues[key] = dateObject
		} else {
			selectorValues[key] = values[key]
		}
	}
	return selectorValues
}

export const getRouteNameSelector = (routeName: string) => {
	const fields = Prisma.dmmf.datamodel.models.find(
		model => model.name === capitalizeFirstLetter(routeName),
	)?.fields

	return fields?.reduce((acc: any, key) => {
		const typeKey = inputTypes[routeName][key.name]
		if (key.isList && key.kind === 'object') {
			return acc
		} else if (key.kind === 'object' && typeKey?.type === 'select') {
			acc[key.name] = {
				select: { id: true, [typeKey?.label]: true },
			}
		} else {
			acc[key.name] = true
		}
		return acc
	}, [])
}

export const getRouteNameSelectorHeading = (routeName: string) => {
	const fields = Prisma.dmmf?.datamodel.models.find(
		model => model.name === capitalizeFirstLetter(routeName),
	)?.fields

	let headingKeys = []
	if (fields) {
		for (const key of fields) {
			if (routeObjectTitle[routeName] === key.name) headingKeys.push(key.name)
			else if (key.name === 'updated_at') headingKeys.push(key.name)
		}
	}
	return headingKeys
}

export const getRouteNameSelectorKeys = (routeName: string) => {
	const fields = Prisma.dmmf?.datamodel.models.find(
		model => model.name === capitalizeFirstLetter(routeName),
	)?.fields

	let fieldKeys = []
	if (fields) {
		for (const key of fields) {
			if (isTitle(key.name)) continue
			if (hasId(key.name)) continue
			if (key.name === 'created_at') continue
			if (key.name === 'updated_at') continue

			fieldKeys.push(key.name)
		}
	}
	return fieldKeys
}

export const getRouteNameSelectorList = (routeName: string) => {
	const fields = Prisma.dmmf?.datamodel.models.find(
		model => model.name === capitalizeFirstLetter(routeName),
	)?.fields

	let fieldList = []
	if (fields) {
		for (const key of fields) {
			if (noTabList[routeName]?.includes(key.name)) continue
			if (key.kind === 'object' && key.isList) fieldList.push(key.name)
		}
	}
	return fieldList
}
