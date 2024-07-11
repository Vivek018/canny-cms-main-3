import {
	type ErrorResponse,
	isRouteErrorResponse,
	useParams,
	useRouteError,
} from '@remix-run/react'
import { getErrorMessage } from '@/utils/misx'

type StatusHandlers = (info: {
	error: ErrorResponse
	params: Record<string, string | undefined>
}) => JSX.Element | null

type GeneralErrorBoundaryProps = {
	defaultStatusHandler?: StatusHandlers
	statusHandlers?: Record<string, StatusHandlers>
	unexpectedStatusHandler?: (error: unknown) => JSX.Element
}

export type ListOfErrors = Array<string | null | undefined> | null | undefined

export function ErrorList({
	id,
	errors,
}: {
	errors?: ListOfErrors
	id?: string
}) {
	const errorsToRender = errors?.filter(Boolean)
	if (!errorsToRender?.length) return null
	return (
		<ul id={id} className="flex text-start items-start flex-col gap-1">
			{errorsToRender.map(e => (
				<li key={e} className="text-[10px] text-start text-destructive">
					{e}
				</li>
			))}
		</ul>
	)
}

export function GeneralErrorBoundary({
	defaultStatusHandler = ({ error }) => (
		<p>
			{error.status} {error.data}
		</p>
	),
	statusHandlers,
	unexpectedStatusHandler = error => <p>{getErrorMessage(error)}</p>,
}: GeneralErrorBoundaryProps) {
	const error = useRouteError()
	// captureRemixErrorBoundaryError(error)
	const params = useParams()

	if (typeof document !== undefined) {
		console.error(error)
	}

	return (
		<div className="container flex h-full items-center justify-center bg-destructive p-20 text-white">
			{isRouteErrorResponse(error)
				? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
						error,
						params,
					})
				: unexpectedStatusHandler(error)}
		</div>
	)
}
