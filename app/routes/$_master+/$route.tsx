import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	json,
	Link,
	NavLink,
	Outlet,
	useLoaderData,
	useLocation,
} from '@remix-run/react'
import { DetailsData } from '@/components/details-data'
import { Header } from '@/components/header'
import { DocumentPage } from '@/components/page/document'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { singleRouteName } from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import { imageFieldName } from '@/utils/input-types'
import { cn, formatString, replaceUnderscore } from '@/utils/misx'
import { generateEnabledList } from '@/utils/pdf-list'
import {
	getRouteNameSelector,
	getRouteNameSelectorHeading,
	getRouteNameSelectorKeys,
	getRouteNameSelectorList,
} from '@/utils/schema'
import { prisma } from '@/utils/servers/db.server'
import { tabList } from '@/utils/servers/list.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const master = params._master
	const routeName = singleRouteName[master as string] as 'user'
	const data = await prisma[routeName].findFirst({
		select: await getRouteNameSelector(routeName),
		where: { id: params.route },
	})

	return json({
		data,
		route: params.route,
		master,
		keys: getRouteNameSelectorKeys(routeName),
		headings: getRouteNameSelectorHeading(routeName),
		routeFieldList: [
			...(tabList[routeName] ?? []),
			...getRouteNameSelectorList(routeName),
		],
	})
}

export default function Route() {
	const { data, route, master, keys, headings, routeFieldList } =
		useLoaderData<typeof loader>()
	const { pathname } = useLocation()
	const { isDocument } = useIsDocument()

	const routeName = singleRouteName[master as keyof typeof singleRouteName]
	const defaultRoute = `/${master}/${route}`
	const imageField = imageFieldName[routeName as keyof typeof imageFieldName]

	let children = (
		<>
			<div className="flex w-full items-center justify-between ">
				<div className="flex gap-4">
					{imageField ? (
						<div className="grid max-h-24 min-h-20 w-24 place-items-center overflow-hidden rounded-md border border-gray-300 dark:opacity-70">
							<img
								className="min-h-full w-full object-contain"
								src={
									data![imageField] ? `${data![imageField]}` : '/no_image.jpeg'
								}
								alt="no-media"
							/>
						</div>
					) : null}
					<div
						className={cn(
							'flex gap-4',
							imageField && 'flex-col items-start justify-around gap-2',
						)}
					>
						<h1 className="text-2xl font-medium capitalize tracking-wide">
							{data ? data[headings[0] as any] : null}
						</h1>
						<p className="my-auto mb-1 w-max rounded-sm bg-accent px-3 py-1 text-xs">
							Last Updated:{' '}
							{data ? formatString(data[headings[1] as any]) : null}
						</p>
					</div>
				</div>
				{generateEnabledList[master!] !== undefined ? (
					<Link
						to="generate"
						className={cn(
							buttonVariants({
								variant: 'secondary',
							}),
							'px-5',
							!isDocument && 'hidden',
						)}
					>
						<Icon name="file-text">Generate Letter</Icon>
					</Link>
				) : null}
			</div>
			<div className="flex flex-1 flex-col rounded-md py-3.5">
				<div className="flex gap-1.5 border-b border-accent">
					<NavLink
						key={defaultRoute}
						to={defaultRoute}
						className={() =>
							cn(
								'w-max rounded-t-sm px-3 py-2 text-sm capitalize hover:bg-accent hover:text-accent-foreground',
								pathname === defaultRoute ||
									pathname === `${defaultRoute}/update` ||
									pathname === `${defaultRoute}/delete` ||
									pathname === `${defaultRoute}/generate`
									? 'cursor-default bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground'
									: null,
							)
						}
					>
						Overview
					</NavLink>
					{routeFieldList.map((tab, index) => {
						return (
							<NavLink
								key={index}
								to={`${tab}`}
								className={({ isActive }) =>
									cn(
										'w-max rounded-t-sm px-3 py-2 text-sm capitalize hover:bg-accent hover:text-accent-foreground',
										isActive &&
											'cursor-default bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground',
									)
								}
							>
								{replaceUnderscore(tab)}
							</NavLink>
						)
					})}
				</div>
				<div>
					{pathname === defaultRoute ||
					pathname === `${defaultRoute}/update` ||
					pathname === `${defaultRoute}/delete` ||
					pathname === `${defaultRoute}/generate` ? (
						<DetailsData data={data} keys={keys} imageField={imageField} />
					) : null}
				</div>
				<Outlet />
			</div>
		</>
	)

	if (master === 'documents' || master === 'advances') {
		children = (
			<>
				<DocumentPage
					data={data}
					keys={[...headings, ...keys]}
					imageField={imageField}
					routeName={routeName}
				/>
				<Outlet />
			</>
		)
	}

	return (
		<div className="flex h-full flex-col gap-5">
			<Header title={routeName} goBackLink={`/${master}`}>
				<Link
					to="update"
					className={buttonVariants({
						variant: 'accent',
						className: 'px-5',
					})}
				>
					Update
				</Link>
				<Link
					to="delete"
					className={buttonVariants({
						variant: 'destructive',
						className: 'px-5',
					})}
				>
					Delete
				</Link>
			</Header>
			{children}
		</div>
	)
}
