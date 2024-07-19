import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { routeObjectTitle, singleRouteName } from '@/constant'
import Upsert from '@/routes/$master.upsert'
import { action as upsertAction } from '@/routes/_actions+/$master+/upsert'
import { capitalizeAfterUnderscore } from '@/utils/misx'
import { prisma } from '@/utils/servers/db.server'
import { inputList } from '@/utils/servers/list.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const routeName = singleRouteName[params._master as string] as 'document'
	const tab = capitalizeAfterUnderscore(params.tab ?? '')

	const data = {
		[routeName.toLowerCase()]: await prisma[routeName].findFirst({
			select: {
				id: true,
				[routeObjectTitle[routeName]]: true,
			},
			where: { id: params.route },
		}),
	}

	const url = new URL(request.url)
	const dependency = url.searchParams.get('projectDependency')

	const list = inputList[tab]
		? dependency
			? await inputList[tab](dependency)
			: await inputList[tab]()
		: []

	return json({
		list,
		data,
		master: params._master,
		route: params.route,
		tab: tab,
	})
}

export async function action(args: ActionFunctionArgs) {
	const tab = capitalizeAfterUnderscore(args.params.tab ?? '')
	const master =
		Object.keys(singleRouteName).find(key => singleRouteName[key] === tab) ??
		tab

	return upsertAction({
		...args,
		connectMaster: master,
	})
}

export default function TabAdd() {
	const { data, master, route, tab } = useLoaderData<typeof loader>()

	return (
		<Upsert
			link={`/${master}/${route}/${tab}`}
			fixedData={data}
			fixedRouteName={tab}
		/>
	)
}
