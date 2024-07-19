import {
	createCompany,
	createProject,
	createProjectLocation,
	createEmployee,
	createUser,
	createVehicle,
	createUserRoles,
	createAdvancePayment,
	paymentFields,
} from '@/utils/db-utils'
import { prisma } from '@/utils/servers/db.server'

const mainRolesArray = [
	'cms lead',
	'cms admin',
	'cms assistant',
	'waiting',
	'client lead',
	'client admin',
]

async function seed() {
	console.log('Seeding database...')

	console.time('Created User Roles')
	await prisma.user_Role.createMany({
		data: createUserRoles(),
	})
	console.timeEnd('Created User Roles')

	console.time('Database has been seeded')

	console.time(`Created Companies...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 10); index++) {
		await prisma.company.create({
			select: { id: true },
			data: {
				...createCompany(),
				user: {
					create: Array.from({
						length: Math.floor((Math.random() + 1) * 5),
					}).map(() => ({
						...createUser(),
						advance_payment: {
							create: Array.from({
								length: Math.floor((Math.random() + 1) * 5),
							}).map(() => ({
								...createAdvancePayment(),
							})),
						},
					})),
				},
			},
		})
	}
	console.timeEnd(`Created Companies...`)

	console.time(`Created Projects...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 15); index++) {
		await prisma.project.create({
			data: {
				...createProject(),
			},
		})
	}
	console.timeEnd(`Created Projects...`)

	console.time(`Created Project Locations...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 30); index++) {
		await prisma.project_Location.create({
			data: {
				...createProjectLocation(),
			},
		})
	}
	console.timeEnd(`Created Project Locations...`)

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
										Math.floor((Math.random() + 1) * mainRolesArray.length)
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

	const company = await prisma.company.findMany({
		select: { id: true },
	})

	const project = await prisma.project.findMany({
		select: { id: true },
	})

	const projectLocation = await prisma.project_Location.findMany({
		select: { id: true },
	})

	const user = await prisma.user.findMany({
		select: { id: true },
	})

	console.time('Created Payment Fields')
	for (let i = 0; i < paymentFields.length; i++) {
		await prisma.payment_Field.create({
			data: {
				...paymentFields[i],
				project_location: {
					connect: {
						id: projectLocation[
							Math.floor(Math.random() * projectLocation.length)
						].id,
					},
				},
			},
		})
	}
	console.timeEnd('Created Payment Fields')

	console.time(`Created Vehicles...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 20); index++) {
		await prisma.vehicle.create({
			data: {
				...createVehicle(),
				company_id: company[Math.floor(Math.random() * company.length)].id,
				project_id: project[Math.floor(Math.random() * project.length)].id,
				project_location_id:
					projectLocation[Math.floor(Math.random() * projectLocation.length)]
						.id,
			},
		})
	}
	console.timeEnd(`Created Vehicles...`)

	console.time(`Created Employees...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 100); index++) {
		await prisma.employee.create({
			data: {
				...createEmployee(),
				advance_payment: {
					create: Array.from({
						length: Math.floor((Math.random() + 1) * 3),
					}).map(() => ({
						...createAdvancePayment(),
						user_id: user[Math.floor(Math.random() * user.length)].id,
					})),
				},
				company_id: company[Math.floor(Math.random() * company.length)].id,
				project_id: project[Math.floor(Math.random() * project.length)].id,
				project_location_id:
					projectLocation[Math.floor(Math.random() * projectLocation.length)]
						.id,
			},
		})
	}
	console.timeEnd(`Created Employees...`)

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
