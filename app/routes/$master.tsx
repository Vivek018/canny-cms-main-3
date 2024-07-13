import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	json,
	Link,
	Outlet,
	redirect,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useCSVDownloader, useCSVReader } from 'react-papaparse'
import { columns } from '@/components/columns'
import { DataTable } from '@/components/data-table'
import {
	FilterSelector,
	FormFilterSelector,
} from '@/components/filter-selector'
import { FilterTabs } from '@/components/filter-tabs'
import { Header } from '@/components/header'
import { ImportData } from '@/components/import-data'
import { Modal } from '@/components/modal'
import { PaginationButtons } from '@/components/pagination-buttons'
import { SearchBar } from '@/components/search-bar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
	importExportEnabled,
	MAX_DATA_LENGTH,
	sideNavList,
	singleRouteName,
} from '@/constant'
import { useIsDocument } from '@/utils/clients/is-document'
import {
	cn,
	flattenObject,
	getTableHeaders,
	replaceUnderscore,
} from '@/utils/misx'
import { getData, getFilters } from '@/utils/servers/data.server'
import { prisma } from '@/utils/servers/db.server'
import { getFilterList } from '@/utils/servers/list.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	if (
		!sideNavList.flat().find(nav => nav.link?.split('/')[1] === params.master)
	) {
		throw new Response('Not found', { status: 404 })
	}

	const name = params.master as string
	const url = new URL(request.url)
	let exportData = { data: [] }

	const { data, count } = singleRouteName[name]
		? ((await getData({
				master: name,
				url: request.url,
			})()) as any)
		: { data: [], count: 0 }

	if (
		url.searchParams.get('export') === 'true' &&
		importExportEnabled.includes(name)
	) {
		exportData = (await getData({
			master: name,
			url: request.url,
			take: Math.min(MAX_DATA_LENGTH, count),
		})()) as any
	}

	const filterList = await getFilterList(name)()
	const filters = getFilters(request) ?? []

	const page = url.searchParams.get('page') ?? '1'
	const imported = url.searchParams.get('imported') ?? 'false'

	return json({
		data,
		exportData: exportData.data,
		filters,
		filterList,
		name,
		page,
		count,
		imported,
	})
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const master = params.master as string
	const routeName = singleRouteName[master] as 'user'
	const url = new URL(request.url)

	const formData = await request.formData()
	const ids = formData.getAll('ids')
	for (let i = 0; i < ids.length; i++) {
		await prisma[routeName].deleteMany({
			where: {
				id: ids[i].toString(),
			},
		})
	}
	url.searchParams.set('page', '1')
	return redirect(url.toString())
}

export default function MasterIndex() {
	const { data, exportData, filters, filterList, name, page, count, imported } =
		useLoaderData<typeof loader>()

	const { CSVDownloader } = useCSVDownloader()
	const { CSVReader } = useCSVReader()
	const [searchParams, setSearchParams] = useSearchParams()
	const { isDocument } = useIsDocument()

	const [importData, setImportData] = useState<any>(null)
	const [flattenData, setFlattenData] = useState<any>(exportData)
	const [showDelete, setShowDelete] = useState(false)
	const [rowSelection, setRowSelection] = useState({})
	const [rows, setRows] = useState<any>([])

	const datasHeader = data ? getTableHeaders(data, ['id', 'path']) : null

	useEffect(() => {
		setRowSelection({})
		setRows([])
		setShowDelete(false)

		if (imported === 'true') {
			setImportData(null)
			searchParams.delete('imported')
			setSearchParams(searchParams)
		}
		if (exportData?.length) {
			setFlattenData(
				exportData?.map((item: any, index: number) => ({
					'Sr. No': index + 1,
					...flattenObject({ obj: item }),
				})),
			)
		}
	}, [imported, searchParams, setSearchParams, exportData])

	const routeName = replaceUnderscore(
		singleRouteName[name as keyof typeof singleRouteName],
	)

	return (
		<div className="flex h-[98%] flex-col pt-0.5">
			<Modal
				link={`/${name}`}
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
			<Outlet />
			<Header title={name}>
				<FormFilterSelector name={name}>
					<input type="hidden" name="all-filters" value={filters.join('--')} />
					<SearchBar />
					<FilterSelector name={name} list={filterList} />
				</FormFilterSelector>
			</Header>

			{importData && importData.length ? (
				<ImportData
					master={name}
					header={importData[0]}
					body={importData.slice(1)}
					setImportData={setImportData}
				/>
			) : null}
			{datasHeader ? (
				<div
					className={cn(
						'flex max-h-[90%] min-h-80 flex-col gap-2 rounded-md bg-muted p-3 text-muted-foreground',
					)}
				>
					<div className="flex w-full items-center">
						{rows.length ? (
							<Button
								variant="destructive"
								className="h-full gap-1.5 rounded-sm py-2.5"
								onClick={() => setShowDelete(true)}
							>
								<Icon name="trash" />
								Delete All
							</Button>
						) : (
							<FilterTabs filters={filters} name={name} />
						)}
						<div className="flex w-full items-center justify-end gap-2">
							<Link
								to="upsert"
								className={buttonVariants({
									variant: 'secondary',
									className: 'h-full gap-1.5 rounded-sm py-2.5',
								})}
							>
								<Icon name="plus-circled" />
								Add {routeName}
							</Link>
							{importExportEnabled.includes(name) && isDocument ? (
								<>
									{' '}
									<CSVReader
										key={name}
										onUploadAccepted={(results: any) => {
											setImportData(results.data)
										}}
									>
										{({ getRootProps }: any) => (
											<Button
												{...getRootProps()}
												variant="accent"
												className="h-full gap-2 rounded-sm px-3 py-2.5"
											>
												<Icon name="import" />
												Import
											</Button>
										)}
									</CSVReader>
									<Button
										variant="accent"
										className="h-full gap-2 rounded-sm px-3 py-2.5"
										onMouseEnter={() => {
											searchParams.set('export', 'true')
											setSearchParams(searchParams)
										}}
										onFocus={() => {
											searchParams.set('export', 'true')
											setSearchParams(searchParams)
										}}
									>
										<CSVDownloader
											className="flex items-center gap-2"
											filename={name}
											data={flattenData}
										>
											<Icon name="export" />
											Export
										</CSVDownloader>
									</Button>
								</>
							) : null}
						</div>
					</div>
					<DataTable
						rowSelection={rowSelection}
						setRowSelection={setRowSelection}
						setRows={setRows}
						columns={columns({
							headers: datasHeader,
							name: name,
							singleRoute: routeName,
							length: 40,
							page: parseInt(page),
						})}
						data={data as any}
						className="flex-1"
					/>
					<Form method="POST" action={`/filters/${name}`}>
						{filters ? (
							<input
								type="hidden"
								name="all-filters"
								value={filters.join('--')}
							/>
						) : null}
						<PaginationButtons page={page} count={count} />
					</Form>
				</div>
			) : null}
		</div>
	)
}
