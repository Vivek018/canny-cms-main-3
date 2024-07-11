import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, Outlet } from '@remix-run/react'

import { Header } from '@/components/header'

const name = 'dashboard'

export const loader = async ({}: LoaderFunctionArgs) => {
	return json({})
}

export default function Dashboard() {
	return (
		<div>
			<Header title={name}></Header>
			<Outlet />
		</div>
	)
}
