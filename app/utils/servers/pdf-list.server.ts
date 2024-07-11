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
		unprofessional_behaviour: async () => ({
			unprofessional_behaviour_context: 'text',
			unprofessional_behaviour_date: 'date',
		}),
		leave_without_information: async () => ({
			leave_without_information_start_date: 'date',
			leave_without_information_end_date: 'date',
		}),
	},
}

export const pdfData: {
	[key: string]: ({ type, id }: { type: string; id: string }) => any
} = {
	employees: async ({ type, id }) => {
		if (type === 'aaa') {
			return 'a'
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
							city: true,
							street_address: true,
							project: {
								select: { name: true, company: { select: { name: true } } },
							},
						},
					},
				},
				where: {
					id: id,
				},
			})
		}
	},
}
