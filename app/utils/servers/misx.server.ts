import { routeObjectTitle } from '@/constant'
import { inputTypes } from '../input-types'
import { formatDate } from '../misx'
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
		let no_of_hours = 8
		let present = true
		let holiday = false

		if (values[date] === 'P') {
			present = true
		} else if (values[date] === 'H') {
			present = true
			holiday = false
			no_of_hours = 4
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
			no_of_hours = 8
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
