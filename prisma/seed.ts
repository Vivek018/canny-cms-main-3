import {
	createCompany,
	createProject,
	createProjectLocation,
	createEmployee,
	createUser,
	createBankDetails,
	createVehicle,
	createAdvancePayment,
	createAttendance,
	createUserRoles,
	createPaymentFields,
} from '@/utils/db-utils'
import { prisma } from '@/utils/servers/db.server'

const mainRolesArray = ['cms lead', 'cms admin', 'cms assistant', 'waiting']
const companyRolesArray = ['client lead', 'client admin']

async function seed() {
	console.log('Seeding database...')

	console.time('Created User Roles')
	await prisma.user_Role.createMany({
		data: createUserRoles(),
	})
	console.timeEnd('Created User Roles')

	console.time('Database has been seeded')

	console.time('Created Payment Fields')
	await prisma.payment_Field.createMany({
		data: createPaymentFields(),
	})
	console.timeEnd('Created Payment Fields')

	const projectRoleId = await prisma.user_Role
		.findFirst({
			where: {
				name: 'project admin',
			},
		})
		.then(role => role?.id)

	const projectLocationRoleId = await prisma.user_Role
		.findFirst({
			where: {
				name: 'project location admin',
			},
		})
		.then(role => role?.id)

	const totalCompanies = 20

	console.time('Created Main User')
	for (let i = 0; i < 20; i++) {
		await prisma.user.create({
			data: {
				...createUser(),
				role: {
					connect: {
						id: await prisma.user_Role
							.findFirst({
								where: {
									name: mainRolesArray[
										Math.floor(Math.random() * mainRolesArray.length)
									],
								},
							})
							.then(role => role?.id),
					},
				},
			},
		})
	}
	console.timeEnd('Created Main User')

	console.time(`Created ${totalCompanies} users...`)
	for (let index = 0; index < totalCompanies; index++) {
		const companyRoleId = await prisma.user_Role
			.findFirst({
				where: {
					name: companyRolesArray[
						Math.floor(Math.random() * companyRolesArray.length)
					],
				},
			})
			.then(role => role?.id)

		await prisma.company.create({
			select: { id: true },
			data: {
				...createCompany(),
				user: {
					create: Array.from({ length: Math.floor(Math.random() * 2) }).map(
						() => ({
							...createUser(),
							role: {
								connect: {
									id: companyRoleId,
								},
							},
						}),
					),
				},
				project: {
					create: Array.from({ length: Math.floor(Math.random() * 2) }).map(
						() => ({
							...createProject(),
							user: {
								create: Array.from({
									length: Math.floor(Math.random() * 2),
								}).map(() => ({
									...createUser(),
									role: {
										connect: {
											id: projectRoleId,
										},
									},
								})),
							},
							project_location: {
								create: Array.from({
									length: Math.floor(Math.random() * 10),
								}).map(() => ({
									...createProjectLocation(),
									vehicle: {
										create: Array.from({
											length: Math.floor(Math.random() * 3),
										}).map(() => ({
											...createVehicle(),
										})),
									},
									user: {
										create: Array.from({
											length: Math.floor(Math.random() * 2),
										}).map(() => ({
											...createUser(),
											role: {
												connect: {
													id: projectLocationRoleId,
												},
											},
										})),
									},
									employee: {
										create: Array.from({
											length: Math.floor(Math.random() * 100),
										}).map(() => ({
											...createEmployee(),
											attendance: {
												create: Array.from({
													length: Math.floor(Math.random() * 5),
												}).map(() => createAttendance()),
											},
											bank_detail: {
												create: createBankDetails(),
											},
											advance_payment: {
												create: Array.from({
													length: Math.floor(Math.random() * 5),
												}).map(() => createAdvancePayment()),
											},
										})),
									},
								})),
							},
						}),
					),
				},
			},
		})
	}
	console.timeEnd(`Created ${totalCompanies} users...`)
	console.timeEnd(`Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
