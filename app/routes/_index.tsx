import {
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'


export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	if (url.pathname === '/') {
		return redirect('/dashboard')
	}
	return null
}

export default function Index() {
	return null
}
