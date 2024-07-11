import * as cookie from 'cookie'
const cookieName = 'en_sidebar'
export type Sidebar = 'true' | 'false'

export function getSidebar(request: Request): Sidebar | null {
	const cookieHeader = request.headers.get('Cookie')
	const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : 'false'
	if (parsed === 'true' || parsed === 'false') return parsed
	return null
}

export function setSidebar(theme: Sidebar) {
	return cookie.serialize(cookieName, theme, { path: '/', maxAge: 31536000 })
}
