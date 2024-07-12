import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'

export function remember<Value>(name: string, getValue: () => Value) {
	const thusly: any = globalThis
	thusly.__remember ??= new Map()
	if (!thusly.__remember.has(name)) {
		thusly.__remember.set(name, getValue())
	}
	return thusly.__remember.get(name)!
}

export const prisma = remember('prisma', () => {
	const logThreshold = 20

	const client = new PrismaClient({
		log: [
			{ level: 'query', emit: 'event' },
			{ level: 'error', emit: 'stdout' },
			{ level: 'warn', emit: 'stdout' },
		],
	})

	client.$on('query', async (e: any) => {
		if (e.duration < logThreshold) return
		const color =
			e.duration < logThreshold * 1.1
				? 'green'
				: e.duration < logThreshold * 1.2
					? 'blue'
					: e.duration < logThreshold * 1.3
						? 'yellow'
						: e.duration < logThreshold * 1.4
							? 'redBright'
							: 'red'
		const dur = chalk[color](`${e.duration}ms`)
		console.info(`prisma:query - ${dur} - ${e.query}`)
	})
	client.$connect()
	return client
})
