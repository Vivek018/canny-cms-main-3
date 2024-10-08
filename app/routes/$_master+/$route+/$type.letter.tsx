import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, json, useActionData, useLoaderData } from '@remix-run/react'
import { RadioField } from '@/components/forms'
import { Modal } from '@/components/modal'
import { PDF } from '@/components/pdf-component'
import { Button } from '@/components/ui/button'
import { singleRouteName } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn } from '@/utils/misx'
import { letterTypesInputList } from '@/utils/pdf-list'
import { pdfData, pdfInputList } from '@/utils/servers/pdf-list.server'

export async function loader({ params }: LoaderFunctionArgs) {
	const master = params._master! as string
	const route = params.route!
	const routeName = singleRouteName[master] as 'employee'
	const type = params.type!

	// this being null is very important
	const list = pdfInputList[master] ? pdfInputList[master][params.type!] : null

	const onlyHasAddress =
		list && Object.keys(list).length === 1 && list.no_address === true
	// this being null is very important
	const data =
		!list || onlyHasAddress
			? await pdfData[master]({ type: type, id: route })
			: {}

	if (list && list.no_address === true) {
		data.no_address = true
	}

	return json({
		master: master,
		route: params.route!,
		routeName: routeName,
		type: params.type!,
		loaderData: data,
		list,
	})
}

export async function action({ params, request }: ActionFunctionArgs) {
	const master = params._master!
	const route = params.route!
	const type = params.type!
	const formData = await request.formData()

	const keysList = pdfInputList[master][params.type!]
		? Object.keys(pdfInputList[master][params.type!])
		: []

	const onlyHasAddress =
		keysList &&
		keysList.length === 1 &&
		keysList.includes('no_address') === true

	// this being null is very important
	let data: any = {}

	for (let i = 0; i < keysList.length; i++) {
		const key = keysList[i]
		const value = formData.get(key)
		data[key] = value
	}

	data =
		keysList && !onlyHasAddress
			? {
					...data,
					...(await pdfData[master]({ type: type, id: route, ...data })),
				}
			: data

	return json({ actionData: data })
}

export default function Letter() {
	const { master, route, routeName, type, loaderData, list } =
		useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const goBackLink = `/${master}/${route}`
	const { isDocument } = useIsDocument()
	const letterInput =
		typeof letterTypesInputList[master][type] === 'function'
			? letterTypesInputList[master][type]
			: null
	const data = { ...loaderData, ...actionData?.actionData }

	let address = null
	if (master === 'employees') {
		address = data?.permanent_address
	}
	return (
		<Modal
			inMiddle
			modalClassName={cn(!isDocument && 'hidden')}
			className="overflow-visible rounded-md border-0 px-0 py-0"
			iconClassName="sr-only"
			link={goBackLink}
			shouldNotNavigate
		>
			{(letterInput && !actionData) || !loaderData ? (
				<Form method="POST" className="flex flex-col items-end p-6">
					{list && list['address_list'] ? (
						<RadioField
							name="address_list"
							label="value"
							defaultValue={routeName.toLowerCase()}
							list={list['address_list']}
							isNotId={true}
						/>
					) : null}
					{letterInput ? letterInput({ list }) : null}
					<Button variant="secondary" size="lg">
						Submit
					</Button>
				</Form>
			) : isDocument ? (
				<PDF type={type} data={data} address={address} />
			) : null}
		</Modal>
	)
}
