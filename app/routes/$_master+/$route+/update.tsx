import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { singleRouteName } from '@/constant'
import { getSelector } from '@/utils/schema'
import { prisma } from '@/utils/servers/db.server'
import Upsert, {
	loader as upsertLoader,
	action as upsertAction,
} from '../../$master.upsert'

export async function loader(args: LoaderFunctionArgs) {
	const master = args.params._master as string
	const routeName = singleRouteName[master as string] as 'user'
	const route = args.params.route ?? ''

	const data = await prisma[routeName]?.findFirst({
		select: getSelector(routeName),
		where: { id: route },
	})

	return await upsertLoader({
		...args,
		params: { master },
		data,
		route: route ?? '',
	})
}

export async function action(args: ActionFunctionArgs) {
	return await upsertAction(args)
}

export default function RouteUpdate() {
	const { data } = useLoaderData<typeof loader>()

	return <Upsert data={data} />
}
