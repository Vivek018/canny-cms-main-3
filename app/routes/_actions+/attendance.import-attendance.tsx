import {
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import { MAX_DATA_LENGTH } from '@/constant'
import { prisma } from '@/utils/servers/db.server'
import { safeRedirect } from '@/utils/servers/http.server'
import { attendanceSelectorValues } from '@/utils/servers/misx.server'

export async function loader() {
	return safeRedirect(`attendance?imported=true`, {
		status: 303,
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const values: any = []
	const headers = formData.get('headers')?.toString().split(',') ?? []
	const body = formData.getAll('row')

	for (let i = 0; i < Math.min(body.length, MAX_DATA_LENGTH * 1.5); i++) {
		const singleBody = body[i].toString().split(',') ?? []
		for (let j = 2; j < singleBody.length; j++) {
			const singleValue: any = {}
			singleValue.employee = singleBody[1].trim()
			singleValue.date = headers[j]
			singleValue[headers[j]] = singleBody[j].trim()
			values.push(await attendanceSelectorValues(singleValue))
		}
	}
	await prisma.attendance.createMany({
		data: values,
		skipDuplicates: true,
	})
	return redirect(`/attendance?imported=true`)
}
