import { defaultYear } from '@/constant'
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
	'cms_lead',
	'cms_admin',
	'cms_assistant',
	'waiting',
	'client_lead',
	'client_admin',
]

async function seed() {
	console.log('Seeding database...')

	console.time('Created User Roles')
	await prisma.user_Role.createMany({
		data: createUserRoles(),
	})
	console.timeEnd('Created User Roles')

	console.time('Database has been seeded')

	console.time(`Created Project Locations...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 50); index++) {
		await prisma.project_Location.create({
			data: {
				...createProjectLocation(),
			},
		})
	}
	const projectLocation = await prisma.project_Location.findMany({
		select: { id: true },
	})
	console.timeEnd(`Created Project Locations...`)

	console.time(`Created Projects...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 15); index++) {
		await prisma.project.create({
			data: {
				...createProject(),
				// project_location: {
				// 	connect: Array.from({ length: 10 }).map(() => ({
				// 		id: projectLocation[
				// 			Math.floor(Math.random() * projectLocation.length)
				// 		].id,
				// 	})),
				// },
			},
		})
	}
	const project = await prisma.project.findMany({
		select: { id: true },
	})
	console.timeEnd(`Created Projects...`)

	console.time(`Created Companies...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 10); index++) {
		await prisma.company.create({
			select: { id: true },
			data: {
				...createCompany(),
				// project: {
				// 	connect: Array.from({ length: 20 }).map(() => ({
				// 		id: project[Math.floor(Math.random() * project.length)].id,
				// 	})),
				// },
				user: {
					create: Array.from({
						length: Math.floor((Math.random() + 1) * 5),
					}).map(() => ({
						...createUser(),
						advance_payment: {
							create: Array.from({
								length: Math.floor((Math.random() + 1) * 3),
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

	console.time('Created Payment Fields')
	for (let i = 0; i < paymentFields.length; i++) {
		await prisma.payment_Field.create({
			data: {
				...paymentFields[i].payment_field,
				value: {
					create: {
						...paymentFields[i].value,
						company: {
							connect: Array.from({ length: company.length }).map((_, i) => ({
								id: company[i].id,
							})),
						},
						project: {
							connect: Array.from({ length: project.length }).map((_, i) => ({
								id: project[i].id,
							})),
						},
					},
				},
				project_location: {
					connect: Array.from({ length: projectLocation.length }).map(
						(_, i) => ({
							id: projectLocation[i].id,
						}),
					),
				},
			},
		})
	}
	console.timeEnd('Created Payment Fields')

	console.time(`Created Vehicles...`)
	for (let index = 0; index < Math.floor((Math.random() + 1) * 40); index++) {
		await prisma.vehicle.create({
			data: {
				...createVehicle(),
				vehicle_monthly: {
					create: (() => {
						const vehicleMonthlyData = []
						for (let k = 2024; k <= parseInt(defaultYear); k++) {
							for (let i = 6; i <= 8; i++) {
								vehicleMonthlyData.push({
									month: i,
									year: k,
									kms_driven: Math.floor((Math.random() + 1) * 1000),
								})
							}
						}
						return vehicleMonthlyData
					})(),
				},
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
				attendance: {
					create: (() => {
						const attendanceData = []
						for (let k = 2024; k <= parseInt(defaultYear); k++) {
							for (let i = 6; i < 8; i++) {
								const noOfDays = new Date(
									parseInt(defaultYear),
									i + 1,
									0,
								).getDate()
								for (let j = 0; j < noOfDays; j++) {
									const date = new Date(`${k}/${i + 1}/${j + 1}`)
									const holiday =
										Math.random() > 0.8 ||
										(date.getDay() === 0 && Math.random() > 0.2)
											? true
											: false
									attendanceData.push({
										date: date,
										present:
											Math.random() > 0.8 || (holiday && Math.random() > 0.2)
												? false
												: true,
										holiday: holiday,
									})
								}
							}
						}
						return attendanceData
					})(),
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
