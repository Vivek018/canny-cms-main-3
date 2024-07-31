import { useFormAction, useNavigation } from '@remix-run/react'
import { type ClassValue, clsx } from 'clsx'
import { useEffect, useMemo, useRef } from 'react'
import { useSpinDelay } from 'spin-delay'
import { twMerge } from 'tailwind-merge'
import { NORMAL_DAY_HOURS } from '@/constant'

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
	if (typeof str !== 'string') return str
	return str?.replaceAll(/[-_]/g, ' ')
}

export function addUnderscore(str: string) {
	if (typeof str !== 'string') return str
	return str?.replaceAll(/[' ']/g, '_').toLowerCase()
}

export function capitalizeAfterUnderscore(str: string) {
	if (typeof str !== 'string') return str
	const words = str?.split('_')
	const capitalizedWords = words.map((word, index) =>
		index !== 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
	)
	return capitalizedWords.join('_')
}

export function capitalizeFirstLetter(str: string) {
	if (typeof str !== 'string') return str
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function hasId(str: string) {
	if (typeof str !== 'string') return str
	return str.startsWith('id') || str.endsWith('_id')
}

export function isTitle(str: string) {
	if (typeof str !== 'string') return false
	if (
		str === 'name' ||
		str === 'full_name' ||
		str === 'label' ||
		str === 'title' ||
		str === 'value' ||
		str === 'kms_driven' ||
		str === 'district'
	) {
		return true
	}
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

export function formatStringIntoHtml(value: string) {
	if (typeof value === 'string' && value.length > 20) {
		const dateValue = new Date(value)
		if (isNaN(dateValue.getTime())) {
			return <p className="truncate">{replaceUnderscore(value)}</p>
		} else {
			return (
				<p className="truncate">
					{`${dateValue.getDate()}/${dateValue.getMonth() + 1}/${dateValue.getFullYear()}`}
				</p>
			)
		}
	}
	if (typeof value === 'boolean') {
		return <p>{value ? 'Yes' : 'No'}</p>
	}
	if (typeof value === 'string')
		return <p className="truncate">{replaceUnderscore(value)}</p>
	return <p className="truncate">{value}</p>
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

export const getYears = (years = 35): { value: number }[] => {
	const currentYear = new Date().getFullYear()
	const yearsArray = []
	for (let i = currentYear; i > currentYear - years; i--) {
		yearsArray.push({ value: i })
	}
	return yearsArray
}

export const getMonthLabel = (month?: string) => {
	return month ? months.find(m => m?.value === month)?.label : ''
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
	obj: { [key: string]: any }
	prefix?: string
	ignore?: string[]
}) => {
	const flattenedObj: any = {}
	for (const key in obj) {
		if (key?.includes('id') || ignore?.includes(key) || obj[key] === null) {
			continue
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
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
	for (const key in flattenedObj) {
		if (!isNaN(Number(key)) || ignore.includes(key)) {
			delete flattenedObj[key]
		}
	}
	return flattenedObj
}

export const getAttendanceDays = ({
	attendance,
}: {
	attendance: { present: boolean; holiday: boolean; no_of_hours: number }[]
}) => {
	let normalPresentDays = 0
	let overtimeDays = 0
	for (let i = 0; i < attendance?.length; i++) {
		if (attendance[i].present && !attendance[i].holiday) {
			if (attendance[i].no_of_hours > NORMAL_DAY_HOURS) {
				normalPresentDays++
				overtimeDays =
					overtimeDays +
					(attendance[i].no_of_hours - NORMAL_DAY_HOURS) / NORMAL_DAY_HOURS
			} else {
				normalPresentDays =
					normalPresentDays + attendance[i].no_of_hours / NORMAL_DAY_HOURS
			}
		} else if (!attendance[i].present && attendance[i].holiday) {
			normalPresentDays++
		} else if (attendance[i].present && attendance[i].holiday) {
			overtimeDays = overtimeDays + attendance[i].no_of_hours / NORMAL_DAY_HOURS
		}
	}
	return {
		normalPresentDays: parseFloat(normalPresentDays.toFixed(3)),
		overtimeDays: parseFloat(overtimeDays.toFixed(3)),
	}
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
								innerData[dateString] = 'PH'
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
				innerData[dateString] = 'A'
			}
		}
		returnData.push(innerData)
	}

	return returnData.flat()
}

export const extractPaymentData = ({
	employee,
	payment_field,
	attendance,
	month,
	year,
}: {
	employee: {
		skill_type: string
		id: string
		company_id: string
		project_id: string
	}
	payment_field: {
		name: string
		is_deduction: boolean
		skill_type: string
		percentage_of?: {
			name: string
			is_deduction: boolean
			skill_type: string
			value: {
				value: number
				max_value: number
				type: string
				value_type: string
				skill_type: string
				month: number
				year: number
				company: { id: string }[]
				project: { id: string }[]
				employee: { id: string }[]
			}[]
		}[]
		value: {
			value: number
			max_value: number
			type: string
			value_type: string
			skill_type: string
			month: number
			year: number
			company: { id: string }[]
			project: { id: string }[]
			employee: { id: string }[]
		}[]
	}
	attendance: { present: boolean; holiday: boolean; no_of_hours: number }[]
	month: number
	year: number
}) => {
	let value = 0
	const { normalPresentDays, overtimeDays } = getAttendanceDays({
		attendance,
	})

	const paymentFieldValues = payment_field?.value
	if (
		paymentFieldValues?.length &&
		(normalPresentDays > 0 || overtimeDays > 0)
	) {
		for (let i = 0; i < paymentFieldValues.length; i++) {
			const compareCompanyAndProject = Boolean(
				paymentFieldValues[i].company.find(
					({ id }) => id === employee.company_id,
				) &&
					paymentFieldValues[i].project.find(
						({ id }) => id === employee.project_id,
					),
			)
			const compareEmployee = Boolean(
				paymentFieldValues[i].employee.find(({ id }) => id === employee.id),
			)
			const compareEmployeeSkillType =
				paymentFieldValues[i].skill_type === employee.skill_type ||
				paymentFieldValues[i].skill_type === 'all'

			const compareValueValidity =
				year > paymentFieldValues[i].year ||
				(year === paymentFieldValues[i].year &&
					month >= paymentFieldValues[i].month)

			if (
				compareCompanyAndProject !== compareEmployee &&
				compareEmployeeSkillType &&
				compareValueValidity
			) {
				if (paymentFieldValues[i].type === 'percentage') {
					if (payment_field.percentage_of?.length) {
						value = parseFloat(
							Math.min(
								(paymentFieldValues[i].value *
									(paymentFieldValues[i].max_value ?? Number.MAX_VALUE)) /
									100,
								payment_field.percentage_of.reduce(
									(total, percentage_payment_field̉) => {
										const percentageValue = extractPaymentData({
											employee,
											payment_field: percentage_payment_field̉,
											attendance,
											month,
											year,
										})
										return (
											total +
											(percentageValue * paymentFieldValues[i].value) / 100
										)
									},
									0,
								),
							).toFixed(2),
						)
					}
				}
				if (paymentFieldValues[i].value_type === 'daily') {
					if (paymentFieldValues[i].type === 'fixed') {
						value = paymentFieldValues[i].value * normalPresentDays
					}
				} else if (paymentFieldValues[i].value_type === 'overtime') {
					if (paymentFieldValues[i].type === 'fixed') {
						value = paymentFieldValues[i].value * overtimeDays
					}
				} else if (paymentFieldValues[i].value_type === 'monthly') {
					if (paymentFieldValues[i].type === 'fixed') {
						value = paymentFieldValues[i].value
					}
				}
			}
		}
	}

	return value
}

export const transformPaymentData = ({
	data,
	month,
	year,
}: {
	data: any
	month: string
	year: string
}) => {
	const mapData = data?.employee !== undefined ? data.employee : data
	let employeeData = mapData?.map((employee: any) => ({
		...employee,
		month: getMonthLabel(month),
		year: year,
	}))

	for (let i = 0; i < employeeData?.length; i++) {
		const paymentFieldData = employeeData[0].project_location.payment_field

		for (let j = 0; j < paymentFieldData.length; j++) {
			employeeData[i][paymentFieldData[j].name] =
				paymentFieldData[j].value.length && employeeData[i].attendance.length
					? extractPaymentData({
							employee: {
								id: employeeData[i].id,
								company_id: employeeData[i].company_id,
								project_id: employeeData[i].project_id,
								skill_type: employeeData[i].skill_type,
							},
							payment_field: paymentFieldData[j],
							attendance: employeeData[i].attendance,
							month: parseInt(month),
							year: parseInt(year),
						})
					: 0
		}
	}
	return employeeData
}
