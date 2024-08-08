import { transformPaymentData } from '../misx'
import { prisma } from './db.server'

export const warningList = [
	{ value: 'poor_performance' },
	{ value: 'unprofessional_behaviour' },
	{ value: 'leave_without_information' },
	{ value: 'misconduct' },
	{ value: 'negligence' },
]

export const addressList = [
	{ value: 'employee' },
	{ value: 'project_location' },
	{ value: 'company' },
]

export const pdfInputList: any = {
	employees: {
		unprofessional_behaviour: {
			unprofessional_behaviour_context: 'text',
			unprofessional_behaviour_date: 'date',
		},
		leave_without_information: {
			leave_without_information_start_date: 'date',
			leave_without_information_end_date: 'date',
		},
		experience: {
			no_address: true,
		},
		pay_slip: {
			pay_slip_month: 'radio',
			pay_slip_year: 'radio',
		},
	},
}

export const pdfData: {
	[key: string]: ({
		type,
		id,
		...extraArgs
	}: {
		type: string
		id: string
		extraArgs?: any
	}) => any
} = {
	employees: async ({ type, id, ...extraArgs }) => {
		if (type === 'pay_slip') {
			const { pay_slip_month, pay_slip_year } = extraArgs as any
			const data = await prisma.employee.findFirst({
				select: {
					full_name: true,
					permanent_address: true,
					joining_date: true,
					skill_type: true,
					exit_date: true,
					designation: true,
					company_id: true,
					project_id: true,
					project_location: {
						select: {
							district: true,
							payment_field: {
								select: {
									name: true,
									is_deduction: true,
									eligible_after_years: true,
									percentage_of: {
										select: {
											name: true,
											is_deduction: true,
											eligible_after_years: true,
											value: {
												select: {
													value: true,
													min_value: true,
													max_value: true,
													pay_frequency: true,
													type: true,
													value_type: true,
													skill_type: true,
													month: true,
													year: true,
													company: { select: { id: true } },
													project: { select: { id: true } },
													employee: { select: { id: true } },
												},
												where: {
													OR: [
														{
															year: {
																lt: parseInt(pay_slip_year),
															},
														},
														{
															month: {
																lte: parseInt(pay_slip_month),
															},
															year: {
																equals: parseInt(pay_slip_year),
															},
														},
													],
												},
												orderBy: [
													{ year: 'desc' },
													{ month: 'desc' },
													{ id: 'desc' },
												],
												take: 1,
											},
										},
									},
									min_value_of: {
										select: {
											name: true,
											is_deduction: true,
											eligible_after_years: true,
											value: {
												select: {
													value: true,
													min_value: true,
													max_value: true,
													pay_frequency: true,
													type: true,
													value_type: true,
													skill_type: true,
													month: true,
													year: true,
													company: { select: { id: true } },
													project: { select: { id: true } },
													employee: { select: { id: true } },
												},
												where: {
													OR: [
														{
															year: {
																lt: parseInt(pay_slip_year),
															},
														},
														{
															month: {
																lte: parseInt(pay_slip_month),
															},
															year: {
																equals: parseInt(pay_slip_year),
															},
														},
													],
												},
												orderBy: [
													{ year: 'desc' },
													{ month: 'desc' },
													{ id: 'desc' },
												],
												take: 1,
											},
										},
									},
									value: {
										select: {
											value: true,
											min_value: true,
											max_value: true,
											type: true,
											value_type: true,
											skill_type: true,
											pay_frequency: true,
											month: true,
											year: true,
											company: { select: { id: true } },
											project: { select: { id: true } },
											employee: { select: { id: true } },
										},
										where: {
											OR: [
												{
													year: {
														lt: parseInt(pay_slip_year),
													},
												},
												{
													month: {
														lte: parseInt(pay_slip_month),
													},
													year: {
														equals: parseInt(pay_slip_year),
													},
												},
											],
										},
										orderBy: [
											{ year: 'desc' },
											{ month: 'desc' },
											{ id: 'desc' },
										],
										take: 1,
									},
								},
								where: {
									is_statutory: false,
								},
								orderBy: { sort_id: 'asc' },
							},
						},
					},
					project: {
						select: { name: true },
					},
					company: { select: { name: true } },
					attendance: {
						select: {
							no_of_hours: true,
							present: true,
							holiday: true,
						},
						where: {
							date: {
								gte: new Date(`${pay_slip_month}/1/${pay_slip_year}`),
								lte: new Date(`${pay_slip_month}/31/${pay_slip_year}`),
							},
						},
					},
				},
				where: {
					id: id,
				},
			})
			transformPaymentData({
				data: [data],
				month: pay_slip_month,
				year: pay_slip_year,
			})
			return {}
		} else {
			return await prisma.employee.findFirst({
				select: {
					full_name: true,
					permanent_address: true,
					joining_date: true,
					exit_date: true,
					designation: true,
					project_location: {
						select: {
							district: true,
						},
					},
					project: {
						select: { name: true },
					},
					company: { select: { name: true } },
				},
				where: {
					id: id,
				},
			})
		}
	},
}
