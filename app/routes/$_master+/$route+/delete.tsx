import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	json,
	Link,
	redirect,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import { z } from 'zod'
import { ErrorList } from '@/components/error-boundary'
import { Modal } from '@/components/modal'
import { Button, buttonVariants } from '@/components/ui/button'
import { singleRouteName } from '@/constant'
import { imageFieldName } from '@/utils/input-types'
import { getTitleName, replaceUnderscore } from '@/utils/misx'
import { getSelector } from '@/utils/schema'
import { prisma } from '@/utils/servers/db.server'
import { invariantResponse } from '@/utils/servers/misx.server'
import { deleteFile } from '@/utils/servers/s3.server'

const DeleteFormSchema = z.object({
	id: z.string(),
})

export async function loader({ params }: LoaderFunctionArgs) {
	const master = params._master as string
	const routeName = singleRouteName[master] as 'user'
	const data = await prisma[routeName].findFirst({
		select: getSelector(routeName),
		where: { id: params.route },
	})
	return json({ data, master: params._master, route: params.route })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const master = params._master
	const formData = await request.formData()
	const routeName = singleRouteName[master!] as 'user'
	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id } = submission.value
	const imageField = imageFieldName[routeName as keyof typeof imageFieldName]
	const imageFieldKey = imageField ? { [imageField]: true } : {}

	const data = await prisma[routeName].findFirst({
		select: { id: true, ...imageFieldKey },
		where: { id },
	})
	invariantResponse(data, 'Not found', { status: 404 })

	const image = data![imageField as keyof typeof data] as string

	const fileName = imageField
		? image?.split('/')[image?.split('/').length - 1]
		: ''

	if (imageField) await deleteFile({ Key: fileName })

	await prisma[routeName].delete({ where: { id } })

	return redirect(master !== 'value' ? `/${master}` : '/payment_fields')
}

export default function RouteDelete() {
	const actionData = useActionData<typeof action>()
	const { data, master, route: id } = useLoaderData<typeof loader>()

	const routeName = singleRouteName[master ?? '']
	const [form] = useForm({
		id: `delete-${routeName}`,
		lastResult: actionData?.result,
	})

	const title = data![getTitleName(data) as keyof typeof data]

	return (
		<Modal link={`/${master}/${id}`} inMiddle>
			<Form method="POST" {...getFormProps(form)}>
				<input type="hidden" name="id" value={id} />
				<h1 className="text-bold px-10 pb-10 pt-6 text-2xl">
					Are you sure, you want to delete{' '}
					<span className="font-bold capitalize">
						{title} - {replaceUnderscore(routeName)}
					</span>
					?
				</h1>
				<div className="flex w-full justify-end gap-3">
					<Link
						to={`/${master}/${id}`}
						autoFocus
						className={buttonVariants({
							variant: 'accent',
							className: 'w-28',
						})}
					>
						No
					</Link>

					<Button type="submit" variant="destructive" size="lg">
						Delete
					</Button>
				</div>
				<ErrorList errors={form.errors} id={form.errorId} />
			</Form>
		</Modal>
	)
}
