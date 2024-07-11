import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { filters } from '@/utils/filters'
import { safeRedirect } from '@/utils/servers/http.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
	return safeRedirect(request.headers.get('Referer') ?? '/', { status: 303 })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const formData = await request.formData()
	const routeName = params.routeName ?? ''

	const url = new URL(request.url)

	const pathname = url.pathname.replace('/filters', '')
	const deleteAllFilter = formData.get('deleteAll')

	if (deleteAllFilter === 'true') {
		return json(null, {
			status: 303,
			headers: {
				location: url.origin + pathname,
			},
		})
	}

	const first = formData.get('first')
	const prev = formData.get('prev')
	const next = formData.get('next')
	const last = formData.get('last')

	if (first === 'true') {
		url.searchParams.set('page', '1')
	} else if (prev) {
		if (parseInt(prev.toString()) > 1)
			url.searchParams.set('page', prev.toString())
	} else if (next) {
		url.searchParams.set('page', next.toString())
	} else if (last) {
		url.searchParams.set('page', last.toString())
	}

	const deleteFilter = formData.get('delete')
	const allFilters =
		formData
			.get('all-filters')
			?.toString()
			.split('--')
			.filter((filter: string) => filter !== deleteFilter) ?? []

	for (let filter of filters[routeName as keyof typeof filters]()) {
		let value =
			formData.get(filter.name)?.toString().toLowerCase().trim() ?? '0'

		if ((!value.length || value === '0') && allFilters.length) {
			value =
				allFilters
					.find(value => {
						return filter.name === value.split('=')[0].trim()
					})
					?.split('=')[1]
					.trim() ?? '0'
		}
		if (value.length && value !== '0' && value !== 'none') {
			url.searchParams.set(filter.name, value)
		} else url.searchParams.delete(filter.name)
	}

	return redirect(url.toString().replace('/filters', ''))
}
