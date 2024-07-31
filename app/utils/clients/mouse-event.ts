export function useMouseEvent({
	searchParam,
	setSearchParam,
}: {
	searchParam: URLSearchParams
	setSearchParam: (searchParam: URLSearchParams) => void
}) {
	let exportTimeout: NodeJS.Timeout | null = null

	const handleEnter = () => {
		exportTimeout = setTimeout(() => {
			searchParam.set('export', 'true')
			setSearchParam(searchParam)
		}, 500)
	}

	const handleLeave = () => {
		if (exportTimeout) {
			clearTimeout(exportTimeout)
			exportTimeout = null
		}
	}
	return { handleEnter, handleLeave }
}
