import { defaultMonth, PAGE_SIZE } from '@/constant'
import { filters } from '../filters'
import { prisma } from './db.server'

export const getFilters = (request: Request) => {
	const filters: string[] = []
	const url = new URL(request.url)
	url.searchParams.forEach((value, key) => {
		if (
			key !== 'page' &&
			key !== 'dependency' &&
			!key.includes('Dependency') &&
			key !== 'imported' &&
			key !== 'export'
		)
			filters.push(`${key} = ${value}`)
	})
	return filters
}

export const getData = ({
	master,
	url = '',
	take,
	filterOption,
}: {
	master: string
	url: string
	take?: number
	filterOption?: any
}) => {
	let filterCookies = new Map<string, string>()
	filters[master as keyof typeof filters]().forEach(filter => {
		filterCookies.set(
			filter.name,
			new URL(url).searchParams.get(filter.name)?.toString() ?? '',
		)
	})

	const search = filterCookies
		.get('search')
		?.toString()
		.replaceAll(/[^a-zA-Z0-9\s]/g, '')
	const user = filterCookies.get('user')
	const project = filterCookies.get('project')
	const company = filterCookies.get('company')
	const status = filterCookies.get('status')
	const page = parseInt(new URL(url).searchParams.get('page') ?? '1')

	const paginationOption = {
		take: take ?? PAGE_SIZE,
		skip: (page - 1) * (take ?? PAGE_SIZE),
	}

	const filtersOption = {
		users: () => {
			const user_role = filterCookies.get('role')
			const sign_in = filterCookies.get('sign_in')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{
											full_name: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{ designation: { contains: search, mode: 'insensitive' } },
										{
											role: { name: { contains: search, mode: 'insensitive' } },
										},
										{
											company: {
												name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											project: {
												name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											project_location: {
												city: { contains: search, mode: 'insensitive' },
											},
										},
									],
								}
							: {},
						sign_in
							? {
									last_signed_in: { gte: new Date(sign_in) },
								}
							: {},
						company
							? {
									company: { name: { equals: company, mode: 'insensitive' } },
								}
							: {},
						project
							? {
									project: { name: { equals: project, mode: 'insensitive' } },
								}
							: {},
						user_role
							? {
									role: { name: { equals: user_role, mode: 'insensitive' } },
								}
							: {},
					],
				},
			}
		},
		advances: () => {
			const amount = filterCookies.get('amount')
			const credited = filterCookies.get('credited')
			const payment_date = filterCookies.get('payment_date')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{ label: { contains: search, mode: 'insensitive' } },
										{
											user: {
												full_name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											employee: {
												full_name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											employee: {
												project_location: {
													city: { contains: search, mode: 'insensitive' },
												},
											},
										},
										{
											employee: {
												project_location: {
													project: {
														name: { contains: search, mode: 'insensitive' },
													},
												},
											},
										},
										{
											employee: {
												project_location: {
													project: {
														company: {
															name: { contains: search, mode: 'insensitive' },
														},
													},
												},
											},
										},
									],
								}
							: {},
						amount
							? {
									amount: { gte: parseInt(amount) },
								}
							: {},
						user
							? {
									user: { full_name: { equals: user, mode: 'insensitive' } },
								}
							: {},
						company
							? {
									employee: {
										project_location: {
											project: {
												company: {
													name: { equals: company, mode: 'insensitive' },
												},
											},
										},
									},
								}
							: {},
						project
							? {
									employee: {
										project_location: {
											project: {
												name: { equals: project, mode: 'insensitive' },
											},
										},
									},
								}
							: {},
						credited
							? {
									credited: { equals: credited === 'true' ? true : false },
								}
							: {},
						payment_date
							? {
									payment_date: { gte: new Date(payment_date) },
								}
							: {},
					],
				},
			}
		},
		employees: () => {
			const joining_date = filterCookies.get('joining_date')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{
											full_name: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											designation: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											guardian_name: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											project_location: {
												city: {
													contains: search,
													mode: 'insensitive',
												},
											},
										},
										{
											project_location: {
												project: {
													name: {
														contains: search,
														mode: 'insensitive',
													},
												},
											},
										},
										{
											project_location: {
												project: {
													company: {
														name: { contains: search, mode: 'insensitive' },
													},
												},
											},
										},
									],
								}
							: {},
						company
							? {
									project_location: {
										project: {
											company: {
												name: { equals: company, mode: 'insensitive' },
											},
										},
									},
								}
							: {},
						project
							? {
									project_location: {
										project: {
											name: { equals: project, mode: 'insensitive' },
										},
									},
								}
							: {},
						status
							? {
									status: { equals: status },
								}
							: {},
						joining_date
							? {
									joining_date: { gte: new Date(joining_date) },
								}
							: {},
					],
				},
			}
		},
		companies: () => {
			const service_charge = filterCookies.get('service_charge')
			const reimbursement_charge = filterCookies.get('reimbursement_charge')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{ name: { contains: search, mode: 'insensitive' } },
										{
											service_charge_field: {
												contains: search,
												mode: 'insensitive',
											},
										},
									],
								}
							: {},
						service_charge
							? {
									service_charge: { gte: parseInt(service_charge) },
								}
							: {},
						reimbursement_charge
							? {
									reimbursement_charge: { gte: parseInt(reimbursement_charge) },
								}
							: {},
					],
				},
			}
		},
		projects: () => {
			const starting_date = filterCookies.get('starting_date')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{ name: { contains: search, mode: 'insensitive' } },
										{
											company: {
												name: { contains: search, mode: 'insensitive' },
											},
										},
									],
								}
							: {},
						company
							? {
									company: { name: { equals: company, mode: 'insensitive' } },
								}
							: {},
						starting_date
							? {
									starting_date: { gte: new Date(starting_date) },
								}
							: {},
					],
				},
			}
		},
		project_locations: () => {
			const state = filterCookies.get('state')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{ city: { contains: search, mode: 'insensitive' } },
										{ state: { contains: search, mode: 'insensitive' } },
										{ esic_code: { contains: search, mode: 'insensitive' } },
										{
											project: {
												name: { contains: search, mode: 'insensitive' },
											},
										},
									],
								}
							: {},
						project
							? {
									project: { name: { equals: project, mode: 'insensitive' } },
								}
							: {},
						state
							? {
									state: { equals: state, mode: 'insensitive' },
								}
							: {},
					],
				},
			}
		},
		vehicles: () => {
			const vehicle_type = filterCookies.get('type')
			const kilometers = filterCookies.get('kilometers')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{ name: { contains: search, mode: 'insensitive' } },
										{ number: { contains: search, mode: 'insensitive' } },
										{
											project_location: {
												city: { contains: search, mode: 'insensitive' },
											},
										},
										{
											project_location: {
												project: {
													name: { contains: search, mode: 'insensitive' },
												},
											},
										},
									],
								}
							: {},
						vehicle_type
							? {
									type: { equals: vehicle_type, mode: 'insensitive' },
								}
							: {},
						status
							? {
									status: { equals: status },
								}
							: {},
						kilometers
							? {
									kms_driven: { gte: parseInt(kilometers) },
								}
							: {},
						project
							? {
									project_location: {
										project: {
											name: { equals: project, mode: 'insensitive' },
										},
									},
								}
							: {},
					],
				},
			}
		},
		documents: () => {
			const belongsTo = filterCookies.get('belongs_to')
			const uploadDate = filterCookies.get('upload_date')
			const vehicle = filterCookies.get('vehicle')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [
										{ label: { contains: search, mode: 'insensitive' } },
										{ belongs_to: { contains: search, mode: 'insensitive' } },
										{
											project: {
												name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											project_location: {
												city: { contains: search, mode: 'insensitive' },
											},
										},
										{
											company: {
												name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											employee: {
												full_name: { contains: search, mode: 'insensitive' },
											},
										},
										{
											vehicle: {
												number: { contains: search, mode: 'insensitive' },
											},
										},
									],
								}
							: {},
						belongsTo
							? {
									belongs_to: { equals: belongsTo, mode: 'insensitive' },
								}
							: {},
						uploadDate
							? {
									created_at: { gte: new Date(uploadDate) },
								}
							: {},
						project
							? {
									project: {
										name: { equals: project, mode: 'insensitive' },
									},
								}
							: {},
						company
							? {
									company: {
										name: { equals: company, mode: 'insensitive' },
									},
								}
							: {},
						vehicle
							? {
									vehicle: {
										number: { equals: vehicle, mode: 'insensitive' },
									},
								}
							: {},
					],
				},
			}
		},
		payment_fields: () => {
			const value = filterCookies.get('value')
			const type = filterCookies.get('type')
			const value_type = filterCookies.get('value_type')
			return {
				where: {
					...filterOption,
					AND: [
						value
							? {
									value: { gte: parseInt(value) },
								}
							: {},
						type
							? {
									type: type,
								}
							: {},
						value_type
							? {
									value_type: value_type,
								}
							: {},
						search
							? {
									OR: [
										{ name: { contains: search, mode: 'insensitive' } },
										{
											project_location: {
												some: {
													city: { contains: search, mode: 'insensitive' },
												},
											},
										},
									],
								}
							: {},
					],
				},
			}
		},
		attendances: ({ month, year }: any) => {
			return {
				where: {
					...filterOption,
					AND: [
						{
							joining_date: {
								lte: new Date(`${month}/31/${year}`),
							},
						},
						search
							? {
									OR: [
										{ full_name: { contains: search, mode: 'insensitive' } },
									],
								}
							: {},
					],
				},
			}
		},
		payment_datas: ({ month, year }: any) => {
			return {
				where: {
					...filterOption,
					AND: [
						{
							joining_date: {
								lte: new Date(`${month}/31/${year}`),
							},
						},
						search
							? {
									OR: [
										{ full_name: { contains: search, mode: 'insensitive' } },
									],
								}
							: {},
					],
				},
			}
		},
	}

	const data = {
		users: async () => {
			return {
				data: await prisma.user.findMany({
					select: {
						id: true,
						full_name: true,
						designation: true,
						email: true,
						last_signed_in: true,
						role: { select: { name: true } },
						company: { select: { name: true } },
						project: { select: { name: true } },
						project_location: { select: { city: true } },
					},
					...filtersOption[master as 'users'](),
					...paginationOption,
				}),
				count: await prisma.user.count({
					...filtersOption[master as 'users'](),
				}),
			}
		},
		documents: async () => {
			return {
				data: await prisma.document.findMany({
					select: {
						id: true,
						label: true,
						path: true,
						belongs_to: true,
						project_location: {
							select: { city: true },
						},
						project: {
							select: { name: true },
						},
						company: {
							select: { name: true },
						},
						employee: {
							select: { full_name: true },
						},
						vehicle: {
							select: { number: true },
						},
					},
					...filtersOption[master as 'documents'](),
					...paginationOption,
				}),
				count: await prisma.document.count({
					...filtersOption[master as 'documents'](),
				}),
			}
		},
		companies: async () => {
			return {
				data: await prisma.company.findMany({
					select: {
						id: true,
						name: true,
						email_suffix: true,
						_count: {
							select: {
								project: true,
							},
						},
					},
					...filtersOption[master as 'companies'](),
					...paginationOption,
				}),
				count: await prisma.company.count({
					...filtersOption[master as 'companies'](),
				}),
			}
		},
		employees: async () => {
			return {
				data: await prisma.employee.findMany({
					select: {
						id: true,
						full_name: true,
						guardian_name: true,
						designation: true,
						skill_type: true,
						joining_date: true,
						status: true,
						mobile: true,
						project_location: {
							select: {
								city: true,
								project: {
									select: {
										name: true,
										company: {
											select: {
												name: true,
											},
										},
									},
								},
							},
						},
						date_of_birth: true,
						esic_id: true,
						uan_no: true,
						employee_code: true,
						aadhar_number: true,
					},
					...filtersOption[master as 'employees'](),
					...paginationOption,
				}),
				count: await prisma.employee.count({
					...filtersOption[master as 'employees'](),
				}),
			}
		},
		advances: async () => {
			return {
				data: await prisma.advance_Payment.findMany({
					select: {
						id: true,
						label: true,
						amount: true,
						credited: true,
						payment_date: true,
						employee: {
							select: {
								full_name: true,
								project_location: {
									select: {
										city: true,
										project: {
											select: {
												name: true,
												company: {
													select: {
														name: true,
													},
												},
											},
										},
									},
								},
							},
						},
						user: { select: { full_name: true } },
					},
					...filtersOption[master as 'advances'](),
					...paginationOption,
				}),
				count: await prisma.advance_Payment.count({
					...filtersOption[master as 'advances'](),
				}),
			}
		},
		payment_fields: async () => {
			return {
				data: await prisma.payment_Field.findMany({
					select: {
						id: true,
						name: true,
						type: true,
						skill_type: true,
						value: true,
						value_type: true,
						_count: {
							select: {
								project_location: true,
							},
						},
					},
					...filtersOption[master as 'payment_fields'](),
					...paginationOption,
					orderBy: { sort_index: 'asc' },
				}),
				count: await prisma.payment_Field.count({
					...filtersOption[master as 'payment_fields'](),
				}),
			}
		},
		projects: async () => {
			return {
				data: await prisma.project.findMany({
					select: {
						id: true,
						name: true,
						starting_date: true,
						ending_date: true,
						company: { select: { name: true } },
						_count: {
							select: {
								project_location: true,
							},
						},
					},
					...filtersOption[master as 'projects'](),
					...paginationOption,
				}),
				count: await prisma.project.count({
					...filtersOption[master as 'projects'](),
				}),
			}
		},
		project_locations: async () => {
			return {
				data: await prisma.project_Location.findMany({
					select: {
						id: true,
						city: true,
						state: true,
						postal_code: true,
						esic_code: true,
						project: { select: { name: true } },
						_count: {
							select: {
								employee: true,
								vehicle: true,
								payment_field: true,
							},
						},
					},
					...filtersOption[master as 'project_locations'](),
					...paginationOption,
				}),
				count: await prisma.project_Location.count({
					...filtersOption[master as 'project_locations'](),
				}),
			}
		},
		vehicles: async () => {
			return {
				data: await prisma.vehicle.findMany({
					select: {
						id: true,
						name: true,
						number: true,
						type: true,
						year_bought: true,
						price: true,
						kms_driven: true,
						status: true,
						project_location: {
							select: {
								city: true,
								project: {
									select: { name: true, company: { select: { name: true } } },
								},
							},
						},
					},
					...filtersOption[master as 'vehicles'](),
					...paginationOption,
				}),
				count: await prisma.vehicle.count({
					...filtersOption[master as 'vehicles'](),
				}),
			}
		},
		attendances: async (
			month = defaultMonth,
			year = defaultMonth,
			project_location_id = '',
		) => {
			return {
				data: await prisma.project_Location.findFirst({
					select: {
						id: true,
						employee: {
							select: {
								id: true,
								full_name: true,
								designation: true,
								joining_date: true,
								_count: {
									select: {
										attendance: {
											where: {
												date: {
													gte: new Date(`${month}/1/${year}`),
													lte: new Date(`${month}/31/${year}`),
												},
												present: true,
											},
										},
									},
								},
							},
							...paginationOption,
							...filtersOption[master as 'attendances']({ month, year }),
						},
					},
					where: project_location_id
						? {
								id: project_location_id,
							}
						: {},
				}),
				count:
					(
						await prisma.project_Location.findFirst({
							select: {
								_count: {
									select: {
										employee: {
											...filtersOption[master as 'attendances']({
												month,
												year,
											}),
										},
									},
								},
							},
							where: project_location_id
								? {
										id: project_location_id,
									}
								: {},
						})
					)?._count.employee ?? 0,
			}
		},
		payment_datas: async (
			month = defaultMonth,
			year = defaultMonth,
			project_location_id = '',
		) => {
			return {
				data: await prisma.project_Location.findFirst({
					select: {
						id: true,
						payment_field: {
							select: {
								name: true,
								value: true,
								value_type: true,
								type: true,
								service_charge_field: true,
							},
							orderBy: { sort_index: 'asc' },
						},
						employee: {
							select: {
								full_name: true,
								designation: true,
								joining_date: true,
							},
							...paginationOption,
							...filtersOption[master as 'payment_datas']({ month, year }),
						},
					},
					where: project_location_id
						? {
								id: project_location_id,
							}
						: {},
				}),
				count:
					(
						await prisma.project_Location.findFirst({
							select: {
								_count: {
									select: {
										employee: {
											...filtersOption[master as 'payment_datas']({
												month,
												year,
											}),
										},
									},
								},
							},
							where: project_location_id
								? {
										id: project_location_id,
									}
								: {},
						})
					)?._count.employee ?? 0,
			}
		},
	}

	return data[master as keyof typeof data]
}
