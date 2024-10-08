import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { columns } from '@/components/columns'
import { DataTable } from '@/components/data-table'
import { Modal } from '@/components/modal'
import { PaginationButtons } from '@/components/pagination-buttons'
import { SearchBar } from '@/components/search-bar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { singleRouteName, TAB_PAGE_SIZE } from '@/constant'
import { inputTypes } from '@/utils/input-types'
import {
	capitalizeAfterUnderscore,
	cn,
	getTableHeaders,
	replaceUnderscore,
} from '@/utils/misx'
import { getData } from '@/utils/servers/data.server'
import { extraFilterAction } from '@/utils/servers/misx.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const normalTab = params.tab ?? ''
	const tab = capitalizeAfterUnderscore(normalTab)
	const routeName = singleRouteName[params._master ?? '']

	const page = new URL(request.url).searchParams.get('page') ?? '1'

	const isMulti = inputTypes[routeName][normalTab.toLowerCase()]?.isMulti

	let masterProp = ''
	for (let prop in singleRouteName) {
		if (tab === singleRouteName[prop]) {
			masterProp = prop
		} else if (isMulti && normalTab === prop) {
			masterProp = prop
		}
	}

	const queryFilter = !isMulti
		? {
				[`${routeName.toLowerCase()}_id`]: params.route,
			}
		: {
				[`${singleRouteName[params._master!].toLowerCase()}`]: {
					some: { id: params.route },
				},
			}

	const { data, count }: any = singleRouteName[masterProp]
		? await getData({
				master: masterProp,
				url: request.url,
				take: TAB_PAGE_SIZE,
				filterOption: queryFilter,
			})()
		: { data: [], count: 0 }

	return json({
		data,
		count,
		name: params._master,
		route: params.route,
		normalTab: normalTab,
		master: masterProp,
		tab,
		tabMaster: singleRouteName[masterProp],
		page,
	})
}

export async function action(args: ActionFunctionArgs) {
	return extraFilterAction(args)
}

export default function Tab() {
	const { data, count, name, normalTab, route, master, tab, tabMaster, page } =
		useLoaderData<typeof loader>()
	const [showDelete, setShowDelete] = useState(false)
	const [rowSelection, setRowSelection] = useState({})
	const [rows, setRows] = useState<any>()

	const datasHeader = data
		? getTableHeaders(data, ['id', singleRouteName[name!]])
		: null

	useEffect(() => {
		setRowSelection({})
		setRows([])
		setShowDelete(false)
	}, [page, data])

	return (
		<div className="h-full pt-3">
			<Modal
				link={`/${name}/${route}/${normalTab?.toLowerCase()}`}
				modalClassName={cn(!showDelete && 'hidden')}
				setOpen={setShowDelete}
				inMiddle
				shouldNotNavigate
			>
				<Form method="POST">
					{rows?.map((id: string, index: number) => (
						<input key={index} type="hidden" name="ids" value={id} />
					))}
					<h1 className="text-bold px-10 pb-10 pt-6 text-3xl font-bold">
						Are you sure, you want to delete all of them?
					</h1>
					<div className="flex w-full justify-end gap-3">
						<Button
							type="button"
							onClick={() => setShowDelete(false)}
							autoFocus
							className={buttonVariants({
								variant: 'accent',
								className: 'w-28',
							})}
						>
							No
						</Button>

						<Button
							type="submit"
							onClick={() => setShowDelete(false)}
							className={buttonVariants({
								variant: 'destructive',
								className: 'w-28',
							})}
						>
							Delete All
						</Button>
					</div>
				</Form>
			</Modal>
			{datasHeader ? (
				<div className="flex h-full w-full flex-col">
					<div className="flex items-center gap-2">
						<Button
							variant="destructive"
							className={cn(
								'gap-1.5 rounded-sm',
								!rows?.length ? 'hidden' : 'flex',
							)}
							onClick={() => setShowDelete(true)}
						>
							<Icon name="trash" />
							Delete All
						</Button>
						<Form className="flex w-full items-center gap-3">
							<SearchBar className="w-full" maxLength={100} />
							<Link
								to="add"
								className={buttonVariants({
									variant: 'secondary',
									className: 'gap-1.5 capitalize',
								})}
							>
								<Icon name="plus-circled" />
								Add {replaceUnderscore(tab)}
							</Link>
						</Form>
					</div>
					<div className="max-h-full flex-1">
						<DataTable
							rowSelection={rowSelection}
							setRowSelection={setRowSelection}
							setRows={setRows}
							columns={columns({
								headers: datasHeader,
								name: master,
								singleRoute: tabMaster,
								page: parseInt(page),
								pageSize: TAB_PAGE_SIZE,
							})}
							data={data as any}
						/>
					</div>
					<Form method="POST" className="py-2.5">
						<PaginationButtons
							count={count}
							page={page}
							pageSize={TAB_PAGE_SIZE}
						/>
					</Form>
				</div>
			) : null}
			<Outlet />
		</div>
	)
}
