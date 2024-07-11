import { parseWithZod } from '@conform-to/zod'
import { useFetchers } from '@remix-run/react'
import { z } from 'zod'
import { useHints } from './client-hints'
import { useRequestInfo } from './request-info'

export const ThemeFormSchema = z.object({
	theme: z.enum(['light', 'dark', 'system']),
})

export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}
	return requestInfo?.userPrefs.theme ?? hints.theme
}

export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(f => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}
