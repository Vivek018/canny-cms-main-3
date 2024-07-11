import { useEffect, useRef } from 'react'

export function useRefFocus(open: boolean) {
	const ref = useRef<any>()

	useEffect(() => {
		if (open) ref.current?.focus()
		else ref.current?.blur()
	}, [open])
	return { ref }
}
