import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { NORMAL_DAY_HOURS, routeObjectTitle } from '@/constant'
import { inputTypes } from '../input-types'
import { capitalizeAfterUnderscore, formatDate } from '../misx'
import { Schemas } from '../schema'
import { prisma } from './db.server'

// this is to throw error for any condition we send with response
export function invariantResponse(
	condition: any,
	message: any,
	responseInit?: any,
) {
	if (!condition) {
		throw new Response(typeof message === 'function' ? message() : message, {
			status: 400,
			...responseInit,
		})
	}
}

export async function extraFilterAction({
	request,
	params,
}: ActionFunctionArgs) {
	const formData = await request.formData()
	const url = new URL(request.url)

	const tab = params.tab as 'user'
	const ids = formData.getAll('ids')

	if (ids) {
		for (let i = 0; i < ids.length; i++) {
			await prisma[capitalizeAfterUnderscore(tab) as 'user'].deleteMany({
				where: {
					id: ids[i].toString(),
				},
			})
			url.searchParams.delete('page')
		}
	}

	const company = formData.get('company')
	const project = formData.get('project')
	const project_location = formData.get('project_location')
	const month = formData.get('month')
	const year = formData.get('year')

	const first = formData.get('first')
	const prev = formData.get('prev')
	const next = formData.get('next')
	const last = formData.get('last')

	if (first === 'true') {
		url.searchParams.set('page', '1')
	} else if (prev) {
		if (parseInt(prev.toString()) >= 1)
			url.searchParams.set('page', prev.toString())
	} else if (next) {
		url.searchParams.set('page', next.toString())
	} else if (last) {
		url.searchParams.set('page', last.toString())
	}

	if (company && company !== 'on' && company !== 'none') {
		url.searchParams.set('company', company.toString())
	} else if (company === 'none') {
		url.searchParams.delete('company')
	}

	if (project && project !== 'on' && project !== 'none') {
		url.searchParams.set('project', project.toString())
	} else if (project === 'none') {
		url.searchParams.delete('project')
	}

	if (
		project_location &&
		project_location !== 'on' &&
		project_location !== 'none'
	) {
		url.searchParams.set('project_location', project_location.toString())
	} else if (project_location === 'none') {
		url.searchParams.delete('project_location')
	}

	if (month && month !== '0' && month !== 'none') {
		url.searchParams.set('month', month.toString())
	}

	if (year && year !== '0' && year !== 'none') {
		url.searchParams.set('year', year.toString())
	}

	return redirect(url.toString())
}

export const getImportedSelectorValues = async (
	routeName: string,
	values: any,
): Promise<any> => {
	let selectorValues = {}

	for (const key in Schemas[routeName].shape) {
		const typeKey = inputTypes[routeName][key]

		if (key === 'id' || !values[key] || typeKey?.dependency || key === 'Sr. No')
			continue
		else if (typeKey?.type === 'radio') {
			const isBoolean = values[key] === 'true' || values[key] === 'false'
			if (isBoolean)
				selectorValues = {
					...selectorValues,
					[key]: values[key] === 'true' ? true : false,
				}
			else selectorValues = { ...selectorValues, [key]: values[key] }
		} else if (typeKey?.isMulti) {
			selectorValues = {
				...selectorValues,
				[key]: { connect: values[key].map((value: any) => ({ id: value })) },
			}
		} else if (typeKey?.type === 'select') {
			const data = await prisma[key as 'employee'].findFirst({
				select: { id: true },
				where: { [routeObjectTitle[key as string] ?? 'name']: values[key] },
			})
			selectorValues = {
				...selectorValues,
				[`${key}_id`]: data?.id,
			}
		} else if (typeKey?.type === 'number') {
			selectorValues = {
				...selectorValues,
				[key]: String(values[key])?.includes('.')
					? parseFloat(values[key])
					: parseInt(values[key]),
			}
		} else if (typeKey?.type === 'date') {
			const dateObject = formatDate(values[key])
			selectorValues = {
				...selectorValues,
				[key]: dateObject,
			}
		} else selectorValues = { ...selectorValues, [key]: values[key] }
	}
	return selectorValues
}

export const attendanceSelectorValues = async (values: any) => {
	if (values.employee) {
		const employee = await prisma.employee.findFirst({
			select: { id: true },
			where: {
				full_name: values.employee,
			},
		})
		const date = values.date
		const dateObject = formatDate(date)
		let no_of_hours = NORMAL_DAY_HOURS
		let present = true
		let holiday = false

		if (values[date] === 'P') {
			present = true
		} else if (values[date] === 'H') {
			present = true
			holiday = false
			no_of_hours = NORMAL_DAY_HOURS / 2
		} else if (
			values[date] === 'PL' ||
			values[date] === 'PH' ||
			values[date] === 'WO'
		) {
			present = false
			holiday = true
			no_of_hours = 0
		} else if (values[date] === 'POW' || values[date] === 'POH') {
			present = true
			holiday = true
			no_of_hours = NORMAL_DAY_HOURS
		} else {
			present = false
			no_of_hours = 0
		}

		return {
			date: dateObject,
			present,
			holiday,
			no_of_hours,
			employee_id: employee?.id,
		}
	}
}
