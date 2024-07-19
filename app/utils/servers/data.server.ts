import { defaultMonth, defaultYear, PAGE_SIZE } from '@/constant'
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
	if (filters[master as keyof typeof filters]) {
		filters[master as keyof typeof filters]().forEach(filter => {
			filterCookies.set(
				filter.name,
				new URL(url).searchParams.get(filter.name)?.toString() ?? '',
			)
		})
	}

	const search = filterCookies
		.get('search')
		?.toString()
		.replaceAll(/[^a-zA-Z0-9\s]/g, '')
	const user = filterCookies.get('user')
	const project = filterCookies.get('project')
	const project_location = filterCookies.get('project_location')
	const company = filterCookies.get('company')
	const status = filterCookies.get('status')
	const skill_type = filterCookies.get('skill_type')
	const page = parseInt(new URL(url).searchParams.get('page') ?? '1')

	const paginationOption = {
		take: take ?? PAGE_SIZE,
		skip: (page - 1) * (take ?? PAGE_SIZE),
	}

	const filtersOption = {
		users: () => {
			const user_role = filterCookies.get('role')
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
									],
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
						project_location
							? {
									project_location: {
										district: { equals: project_location, mode: 'insensitive' },
									},
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
											amount: { gte: parseInt(amount ?? '0') },
										},
										{
											employee: {
												full_name: { contains: search, mode: 'insensitive' },
											},
										},
									],
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
										company: {
											name: { equals: company, mode: 'insensitive' },
										},
									},
								}
							: {},
						project
							? {
									employee: {
										project: {
											name: { equals: project, mode: 'insensitive' },
										},
									},
								}
							: {},
						project_location
							? {
									employee: {
										project_location: {
											district: {
												equals: project_location,
												mode: 'insensitive',
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
											uan_no: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											esic_id: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											employee_code: {
												contains: search,
												mode: 'insensitive',
											},
										},
									],
								}
							: {},
						company
							? {
									company: {
										name: { equals: company, mode: 'insensitive' },
									},
								}
							: {},
						project
							? {
									project: {
										name: { equals: project, mode: 'insensitive' },
									},
								}
							: {},
						project_location
							? {
									project_location: {
										district: { equals: project_location, mode: 'insensitive' },
									},
								}
							: {},
						status
							? {
									status: { equals: status },
								}
							: {},
						skill_type
							? {
									status: { equals: skill_type },
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
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [{ name: { contains: search, mode: 'insensitive' } }],
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
									OR: [{ name: { contains: search, mode: 'insensitive' } }],
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
										{ district: { contains: search, mode: 'insensitive' } },
										{ city: { contains: search, mode: 'insensitive' } },
										{ postal_code: { equals: parseInt(search) } },
										{ esic_code: { contains: search, mode: 'insensitive' } },
									],
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
												district: { contains: search, mode: 'insensitive' },
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
						company
							? {
									company: {
										name: { equals: company, mode: 'insensitive' },
									},
								}
							: {},
						project
							? {
									project: {
										name: { equals: project, mode: 'insensitive' },
									},
								}
							: {},
						project_location
							? {
									project_location: {
										district: { equals: project_location, mode: 'insensitive' },
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
										{
											employee: {
												full_name: { contains: search, mode: 'insensitive' },
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
						company
							? {
									company: {
										name: { equals: company, mode: 'insensitive' },
									},
								}
							: {},
						project
							? {
									project: {
										name: { equals: project, mode: 'insensitive' },
									},
								}
							: {},
						project_location
							? {
									project_location: {
										district: { equals: project_location, mode: 'insensitive' },
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
			const is_deduction = filterCookies.get('is_deduction')
			const service_charge_field = filterCookies.get('service_charge_field')
			return {
				where: {
					...filterOption,
					AND: [
						search
							? {
									OR: [{ name: { contains: search, mode: 'insensitive' } }],
								}
							: {},
						is_deduction
							? {
									is_deduction: {
										equals: is_deduction === 'true' ? true : false,
									},
								}
							: {},
						service_charge_field
							? {
									service_charge_field: {
										equals: service_charge_field === 'true' ? true : false,
									},
								}
							: {},
						project_location
							? {
									project_location: {
										some: {
											district: {
												contains: project_location,
												mode: 'insensitive',
											},
										},
									},
								}
							: {},
					],
				},
			}
		},
		attendances: ({ month, year, company_id, project_id }: any) => {
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
						company_id
							? {
									company_id: company_id,
								}
							: {},
						project_id
							? {
									project_id: project_id,
								}
							: {},
					],
				},
			}
		},
		payment_datas: ({ month, year, company_id, project_id }: any) => {
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
						company_id
							? {
									company_id: company_id,
								}
							: {},
						project_id
							? {
									project_id: project_id,
								}
							: {},
					],
				},
			}
		},
		value: ({ month, year, payment_field_id }: any) => {
			return {
				where: {
					...filterOption,
					AND: [
						month
							? {
									month: {
										lte: parseInt(month),
									},
								}
							: {},
						year
							? {
									year: {
										lte: parseInt(year),
									},
								}
							: {},
						payment_field_id
							? {
									payment_field_id: payment_field_id,
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
						project_location: { select: { district: true } },
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
							select: { district: true },
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
						company: {
							select: {
								name: true,
							},
						},
						project: {
							select: {
								name: true,
							},
						},
						project_location: {
							select: {
								district: true,
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
								company: {
									select: {
										name: true,
									},
								},
								project: {
									select: {
										name: true,
									},
								},
								project_location: {
									select: {
										district: true,
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
						district: true,
						city: true,
						state: true,
						postal_code: true,
						esic_code: true,
						_count: {
							select: {
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
						company: {
							select: {
								name: true,
							},
						},
						project: {
							select: {
								name: true,
							},
						},
						project_location: {
							select: {
								district: true,
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
			year = defaultYear,
			id = '',
			routeName = 'project_Location',
			company_id = '',
			project_id = '',
		) => {
			return {
				data: await prisma[routeName as 'company'].findFirst({
					select: {
						id: true,
						employee: {
							select: {
								id: true,
								full_name: true,
								designation: true,
								joining_date: true,
								skill_type: true,
								company: { select: { name: true } },
								project: { select: { name: true } },
								project_location: { select: { district: true } },
								attendance: {
									select: {
										present: true,
										holiday: true,
										no_of_hours: true,
									},
									where: {
										date: {
											gte: new Date(`${month}/1/${year}`),
											lte: new Date(`${month}/31/${year}`),
										},
									},
								},
							},
							...paginationOption,
							...filtersOption[master as 'attendances']({
								month,
								year,
								company_id,
								project_id,
							}),
						},
					},
					where: id
						? {
								id: id,
							}
						: {},
				}),
				count:
					(
						await prisma[routeName as 'company'].findFirst({
							select: {
								_count: {
									select: {
										employee: {
											...filtersOption[master as 'attendances']({
												month,
												year,
												company_id,
												project_id,
											}),
										},
									},
								},
							},
							where: id
								? {
										id: id,
									}
								: {},
						})
					)?._count.employee ?? 0,
			}
		},
		payment_datas: async (
			month = defaultMonth,
			year = defaultYear,
			id = '',
			routeName = 'project_Location',
			company_id = '',
			project_id = '',
		) => {
			return {
				data: await prisma[routeName as 'company'].findFirst({
					select: {
						id: true,
						employee: {
							select: {
								id: true,
								full_name: true,
								designation: true,
								joining_date: true,
								skill_type: true,
								company_id: true,
								project_id: true,
								company: { select: { name: true } },
								project: { select: { name: true } },
								project_location: {
									select: {
										district: true,
										payment_field: {
											select: {
												name: true,
												is_deduction: true,
												service_charge_field: true,
												percentage_of: {
													select: {
														name: true,
														is_deduction: true,
														service_charge_field: true,
														value: {
															select: {
																value: true,
																max_value: true,
																type: true,
																value_type: true,
																skill_type: true,
																month: true,
																year: true,
																company: { select: { id: true } },
																project: { select: { id: true } },
															},
															where: {
																month: {
																	lte: parseInt(month),
																},
																year: {
																	lte: parseInt(year),
																},
															},
														},
													},
												},
												value: {
													select: {
														value: true,
														max_value: true,
														type: true,
														value_type: true,
														skill_type: true,
														month: true,
														year: true,
														company: { select: { id: true } },
														project: { select: { id: true } },
													},
													where: {
														month: {
															lte: parseInt(month),
														},
														year: {
															lte: parseInt(year),
														},
													},
												},
											},
											orderBy: { sort_index: 'asc' },
										},
									},
								},
								attendance: {
									select: {
										no_of_hours: true,
										present: true,
										holiday: true,
									},
									where: {
										date: {
											gte: new Date(`${month}/1/${year}`),
											lte: new Date(`${month}/31/${year}`),
										},
									},
								},
							},
							...paginationOption,
							...filtersOption[master as 'payment_datas']({
								month,
								year,
								company_id,
								project_id,
							}),
						},
					},
					where: id
						? {
								id: id,
							}
						: {},
				}),
				count:
					(
						await prisma[routeName as 'company'].findFirst({
							select: {
								_count: {
									select: {
										employee: {
											...filtersOption[master as 'payment_datas']({
												month,
												year,
												company_id,
												project_id,
											}),
										},
									},
								},
							},
							where: id
								? {
										id: id,
									}
								: {},
						})
					)?._count.employee ?? 0,
			}
		},
		value: async (
			month = defaultMonth,
			year = defaultYear,
			payment_field_id = '',
		) => {
			return {
				data: await prisma.value.findMany({
					select: {
						id: true,
						value: true,
						max_value: true,
						type: true,
						value_type: true,
						skill_type: true,
						month: true,
						year: true,
						company: { select: { name: true } },
						project: { select: { name: true } },
						payment_field: { select: { name: true } },
					},
					...filtersOption[master as 'value']({
						month,
						year,
						payment_field_id,
					}),
				}),
				count: await prisma.value.count({
					...filtersOption[master as 'value']({
						month,
						year,
						payment_field_id,
					}),
				}),
			}
		},
	}

	return data[master as keyof typeof data]
}
