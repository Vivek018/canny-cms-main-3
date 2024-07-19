export function useMouseEvent({
	searchParam,
	setSearchParam,
}: {
	searchParam: URLSearchParams
	setSearchParam: (searchParam: URLSearchParams) => void
}) {
	let exportTimeout: NodeJS.Timeout | null = null

	const handleMouseEnter = () => {
		exportTimeout = setTimeout(() => {
			searchParam.set('export', 'true')
			setSearchParam(searchParam)
		}, 500)
	}

	const handleMouseLeave = () => {
		if (exportTimeout) {
			clearTimeout(exportTimeout)
			exportTimeout = null
		}
	}
	return {handleMouseEnter, handleMouseLeave}
}
