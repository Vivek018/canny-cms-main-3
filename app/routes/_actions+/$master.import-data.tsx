import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import { MAX_DATA_LENGTH, singleRouteName } from '@/constant'
import { addUnderscore } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { safeRedirect } from '@/utils/servers/http.server'
import { getImportedSelectorValues } from '@/utils/servers/misx.server'

export async function loader({ params }: LoaderFunctionArgs) {
	return safeRedirect(`/${params.master}`, { status: 303 })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const master = params.master
	const routeName = singleRouteName[master as string] as 'user'
	const values = []

	const headers = formData.get('headers')?.toString().split(',') ?? []
	const body = formData.getAll('row')
	for (let i = 0; i < Math.min(body.length, MAX_DATA_LENGTH * 1.5); i++) {
		const singleValue: any = {}
		const singleBody = body[i].toString().split(',') ?? []
		
		for (let j = 0; j < singleBody.length; j++) {
			
			singleValue[addUnderscore(headers[j])] = singleBody[j].trim()
		}
		values.push(await getImportedSelectorValues(routeName, singleValue))
	}
	await prisma[routeName].createMany({
		data: values,
		skipDuplicates: true,
	})
	return redirect(`/${master}?imported=true`)
}
