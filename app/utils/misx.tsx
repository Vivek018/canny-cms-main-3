import { useFormAction, useNavigation } from '@remix-run/react'
import { type ClassValue, clsx } from 'clsx'

import { useEffect, useMemo, useRef } from 'react'
import { useSpinDelay } from 'spin-delay'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function dateConvertForInput(date: Date) {
	return `${date.getFullYear() + '-' + (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())}`
}

export const textTruncate = (str: string, length = 50) => {
	const ending = '...'
	if (str?.length > length) {
		return str?.substring(0, length - ending.length) + ending
	} else {
		return str
	}
}

export function getErrorMessage(error: unknown) {
	if (typeof error === 'string') return error
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message
	}
	console.error('Unable to get error message for error', error)
	return 'Unknown Error'
}

export function getDomainUrl(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ??
		request.headers.get('host') ??
		new URL(request.url).host
	const protocol = host.includes('localhost') ? 'http' : 'https'
	return `${protocol}://${host}`
}

export function replaceUnderscore(str: string) {
	return str?.replaceAll(/[-_]/g, ' ')
}

export function addUnderscore(str: string) {
	return str?.replaceAll(/[' ']/g, '_').toLowerCase()
}

export function capitalizeAfterUnderscore(str: string) {
	const words = str?.split('_')
	const capitalizedWords = words.map((word, index) =>
		index !== 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
	)
	return capitalizedWords.join('_')
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function hasId(str: string) {
	return str.startsWith('id') || str.endsWith('_id')
}

export function isTitle(str: string) {
	if (
		str === 'name' ||
		str === 'full_name' ||
		str === 'label' ||
		str === 'title' ||
		str === 'city'
	)
		return true
	return false
}

export function getTitleName(obj: any) {
	return Object.keys(obj).find(str => isTitle(str))
}

export function formatDate(date: any) {
	let dateObject = null
	if (date instanceof Date) {
		return date
	}
	const dateParts = date?.split('/')
	if (date.length > 20) {
		dateObject = new Date(date)
	} else if (
		date.length &&
		new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]).getDate() !==
			undefined
	) {
		dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
	} else {
		dateObject = new Date(date.split('/'))
	}
	return dateObject
}

export function formatString(value: string) {
	if (typeof value === 'string' && value.length > 20) {
		const dateValue = new Date(value)
		if (isNaN(dateValue.getTime())) {
			return textTruncate(replaceUnderscore(value), 32)
		} else {
			return `${dateValue.toLocaleDateString()}`
		}
	}
	if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No'
	}
	if (typeof value === 'string') return replaceUnderscore(value)

	return value
}

export function formatStringIntoHtml(value: string, length?: number) {
	if (typeof value === 'string' && value.length > 20) {
		const dateValue = new Date(value)
		if (isNaN(dateValue.getTime())) {
			return <p>{textTruncate(replaceUnderscore(value), length ?? 40)}</p>
		} else {
			return (
				<p>
					{`${dateValue.getDate()}/${dateValue.getMonth() + 1}/${dateValue.getFullYear()}`}
				</p>
			)
		}
	}
	if (typeof value === 'boolean') {
		return <p>{value ? 'Yes' : 'No'}</p>
	}
	if (typeof value === 'string') return <p>{replaceUnderscore(value)}</p>
	return <p>{value}</p>
}

export const months = [
	{ value: '1', label: 'January' },
	{ value: '2', label: 'February' },
	{ value: '3', label: 'March' },
	{ value: '4', label: 'April' },
	{ value: '5', label: 'May' },
	{ value: '6', label: 'June' },
	{ value: '7', label: 'July' },
	{ value: '8', label: 'August' },
	{ value: '9', label: 'September' },
	{ value: '10', label: 'October' },
	{ value: '11', label: 'November' },
	{ value: '12', label: 'December' },
]

export function getYearsList(startYear: number, endYear: number) {
	let years = []
	for (let year = startYear; year <= endYear; year++) {
		years.unshift({ value: year.toString(), label: year.toString() })
	}
	return years
}

// this is to throw error for any condition we send
export function invariant(condition: any, message: any) {
	if (!condition) {
		throw new Error(typeof message === 'function' ? message() : message)
	}
}

export function useIsPending({
	formAction,
	formMethod = 'POST',
	state = 'non-idle',
}: {
	formAction?: string
	formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
	state?: 'submitting' | 'loading' | 'non-idle'
}) {
	const contextualFormAction = useFormAction()
	const navigation = useNavigation()

	const isPendingState =
		state === 'non-idle'
			? navigation.state !== 'idle'
			: navigation.state === state

	return (
		isPendingState &&
		navigation.formAction === (formAction ?? contextualFormAction) &&
		navigation.formMethod === formMethod
	)
}

export function useDelayedIsPending({
	formAction,
	formMethod,
	delay = 400,
	minDuration = 300,
}: Parameters<typeof useIsPending>[0] &
	Parameters<typeof useSpinDelay>[1] = {}) {
	const isPending = useIsPending({ formAction, formMethod })
	const delayedIsPending = useSpinDelay(isPending, {
		delay,
		minDuration,
	})
	return delayedIsPending
}

export function debounce<
	Callback extends (...args: Parameters<Callback>) => void,
>(fn: Callback, delay: number) {
	let timer: ReturnType<typeof setTimeout> | null = null
	return (...args: Parameters<Callback>) => {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			fn(...args)
		}, delay)
	}
}

export function useDebounce<
	Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>,
>(callback: Callback, delay: number) {
	const callbackRef = useRef(callback)

	useEffect(() => {
		callbackRef.current = callback
	})

	return useMemo(
		() =>
			debounce(
				(...args: Parameters<Callback>) => callbackRef.current(...args),
				delay,
			),
		[delay],
	)
}

export const getTableHeaders = (data: Object[], ignore?: string[]) => {
	let employeesHeader: { accessorKey: string; header: string }[] = []
	const extractHeaders = (obj: Object, prefix = '') => {
		const splitPrefix = prefix?.split('.')
		for (const key in obj) {
			const value = obj[key as keyof typeof obj]
			if (
				ignore?.includes(key) ||
				value === null ||
				employeesHeader.find(header => header.header === `${key}`) ||
				employeesHeader.find(header => header.header === `no. of ${key}s`)
			) {
				continue
			} else if (typeof value === 'object') {
				extractHeaders(value, `${prefix}${key}.`)
			} else {
				employeesHeader.push({
					accessorKey: `${prefix}${key}`,
					header: `${prefix.includes('count') ? 'no. of ' + key + 's' : prefix ? (splitPrefix[splitPrefix.length - 2] ? splitPrefix[splitPrefix.length - 2] : splitPrefix[splitPrefix.length - 1]) : key}`,
				})
			}
		}
	}
	for (let i = 0; i < data.length; i++) {
		extractHeaders(data[i])
	}
	extractHeaders(data)
	return employeesHeader
}

export const flattenObject = ({
	obj,
	prefix = '',
	ignore = [],
}: {
	obj: any
	prefix?: string
	ignore?: any
}) => {
	const flattenedObj: any = {}
	for (const key in obj) {
		if (key === 'id' || ignore.includes(key)) continue
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			const nestedObj = flattenObject({
				obj: obj[key],
				prefix: `${prefix}${key}.`,
			})
			for (const nestedKey in nestedObj) {
				const splittedNestedKey = nestedKey.split('.')
				flattenedObj[
					`${splittedNestedKey[4] ? splittedNestedKey[3] : splittedNestedKey[3] ? splittedNestedKey[2] : splittedNestedKey[2] ? splittedNestedKey[1] : splittedNestedKey[1] ? splittedNestedKey[0] : nestedKey}`
				] = nestedObj[nestedKey]
			}
		} else {
			flattenedObj[`${prefix}${key}`] = obj[key]
		}
	}
	return flattenedObj
}

export const transformAttendance = ({
	data,
	month,
	year,
}: {
	data: any
	month: string
	year: string
}): any[] => {
	const date = new Date(parseInt(year), parseInt(month), 0)
	const totalDays = date.getDate()
	const returnData = []

	for (let i = 0; i < data?.length; i++) {
		const innerData: any = {}
		innerData['Sr. No'] = i + 1
		innerData.employee = data[i].full_name
		for (let j = 0; j < totalDays; j++) {
			const dateString = `${j + 1}/${month}/${year}`
			if (data[i]?.attendance?.length) {
				for (let k = 0; k < data[i]?.attendance.length; k++) {
					const item = data[i]?.attendance[k]
					if (
						item.date === new Date(`${month}/${j + 1}/${year}`).toISOString()
					) {
						if (item.present !== undefined) {
							if (item.present === true) {
								innerData[dateString] = 'P'
							} else if (item.holiday === true) {
								innerData[dateString] = 'H'
							} else {
								innerData[dateString] = 'A'
							}
							break
						} else {
							continue
						}
					} else {
						continue
					}
				}
			} else {
				if (new Date(`${month}/${j + 1}/${year}`).getDay() === 0) {
					innerData[dateString] = 'H'
				} else {
					innerData[dateString] = 'A'
				}
			}
		}
		returnData.push(innerData)
	}

	return returnData.flat()
}

export const transformPaymentData = (paymentData: any) => {
	let value = paymentData.value

	return value
}
