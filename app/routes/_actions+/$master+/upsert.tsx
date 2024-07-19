import { parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	json,
	redirect,
	unstable_composeUploadHandlers as composeUploadHandlers,
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	unstable_parseMultipartFormData as parseMultipartFormData,
	type UploadHandler,
} from '@remix-run/node'
import { z } from 'zod'
import { singleRouteName } from '@/constant'
import { imageFieldName, inputTypes } from '@/utils/input-types'
import { getSelectorValues, Schemas } from '@/utils/schema'
import { prisma } from '@/utils/servers/db.server'
import { deleteFile, s3UploadHandler } from '@/utils/servers/s3.server'

export async function action({
	request,
	params,
	connectMaster,
}: ActionFunctionArgs & { connectMaster?: string }) {
	const master = connectMaster ?? params.master ?? (params._master as string)
	const routeName = (singleRouteName[master] ?? connectMaster) as 'user'
	const Schema = Schemas[routeName]

	const uploadHandler: UploadHandler = composeUploadHandlers(
		s3UploadHandler,
		createMemoryUploadHandler(),
	)
	let routeNameData: any = null
	const imageField = imageFieldName[routeName as keyof typeof imageFieldName]
	const imageFieldKey = imageField ? { [imageField]: true } : {}

	const formData = await parseMultipartFormData(request, uploadHandler)

	const submission = await parseWithZod(formData, {
		schema: Schema.superRefine(async (data: any, ctx: any) => {
			if (!data.id) return
			routeNameData = await prisma[routeName].findUnique({
				select: { id: true, ...imageFieldKey },
				where: { id: data.id },
			})
			if (!routeNameData) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Data not found',
				})
			}
		}).transform(async (data: any) => {
			if (routeNameData)
				if (routeNameData[imageField])
					if (data[imageField] === '/no_image.jpeg') {
						return { ...data, [imageField]: routeNameData[imageField] }
					} else
						await deleteFile({
							Key:
								routeNameData[imageField].split('/')[
									routeNameData[imageField]?.split('/').length - 1
								] ?? '',
						})
			return data
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const updateImage = imageField
		? { [imageField]: submission.value[imageField] }
		: {}

	const isMultis: any = Object.values(inputTypes[routeName]).filter(
		(val: any) => val.isMulti,
	)
	let disconnectValues: any = {}

	if (isMultis?.length && submission.value.id) {
		for (let i = 0; i < isMultis.length; i++) {
			disconnectValues[isMultis[i].name] = await prisma[routeName].findFirst({
				select: { [isMultis[i].name]: { select: { id: true } } },
				where: { id: submission.value.id },
			})
		}
	}

	await prisma[routeName].upsert({
		where: { id: submission.value.id ?? `__new_${routeName}__` },
		create: getSelectorValues(routeName, submission.value),
		update: {
			...getSelectorValues(routeName, submission.value, disconnectValues, true),
			...updateImage,
		},
	})

	const url = request.url
		.replaceAll('/update', '')
		.replaceAll('/upsert', '')
		.replaceAll('/add', '')
		.replaceAll('/delete', '')
		.replaceAll('/edit', '')

	return redirect(url)
}
