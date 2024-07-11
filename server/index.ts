import { createRequestHandler as _createRequestHandler } from '@remix-run/express'
import { installGlobals, type ServerBuild } from '@remix-run/node'
import { ip as ipAddress } from 'address'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import getPort, { portNumbers } from 'get-port'
import morgan from 'morgan'

installGlobals()

const createRequestHandler = _createRequestHandler

const viteDevServer = await import('vite').then(vite =>
	vite.createServer({
		server: { middlewareMode: true },
	}),
)

const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))

app.use(
	'/fonts',
	express.static('/public/fonts', { immutable: true, maxAge: '1y' }),
)

app.use(compression())

if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	// Remix fingerprints its assets so we can cache forever.
	app.use(
		'/assets',
		express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
	)

	// Everything else (like favicon.ico) is cached for an hour. You may want to be
	// more aggressive with this caching.
	app.use(express.static('build/client', { maxAge: '10d' }))
}

morgan.token('url', req => decodeURIComponent(req.url ?? ''))
app.use(
	morgan(
		'tiny',
		// {
		// 	skip: (req, res) =>
		// 		res.statusCode === 200 &&
		// 		(req.url?.startsWith('/resources/note-images') ||
		// 			req.url?.startsWith('/resources/user-images') ||
		// 			req.url?.startsWith('/resources/healthcheck')),
		// }
	),
)

async function getBuild() {
	const build = viteDevServer
		? viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: // @ts-ignore this should exist before running the server
			// but it may not exist just yet.
			await import('./build/server/index.js')

	// not sure how to make this happy 🤷‍♂️
	return build as unknown as ServerBuild
}

app.all(
	'*',
	createRequestHandler({
		getLoadContext: (_: any, res: any) => ({
			cspNonce: res.locals.cspNonce,
			serverBuild: getBuild(),
		}),
		// @sentry/remix needs to be updated to handle the function signature
		build: getBuild,
	}),
)

const desiredPort = Number(process.env.PORT || 3000)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})

const server = app.listen(portToUse, () => {
	const addy = server.address()
	const portUsed =
		desiredPort === portToUse
			? desiredPort
			: addy && typeof addy === 'object'
				? addy.port
				: 0

	if (portUsed !== desiredPort) {
		console.warn(
			chalk.yellow(
				`⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
			),
		)
	}
	console.log(`🚀  We have liftoff!`)
	const localUrl = `http://localhost:${portUsed}`
	let lanUrl: string | null = null
	const localIp = ipAddress() ?? 'Unknown'
	// Check if the address is a private ip
	// https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
	// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
	if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
		lanUrl = `http://${localIp}:${portUsed}`
	}

	console.log(
		`
${chalk.bold('Local:')}            ${chalk.cyan(localUrl)}
${lanUrl ? `${chalk.bold('On Your Network:')}  ${chalk.cyan(lanUrl)}` : ''}
${chalk.bold('Press Ctrl+C to stop')}
		`.trim(),
	)
})

closeWithGrace(async () => {
	await new Promise((resolve, reject) => {
		server.close(e => (e ? reject(e) : resolve('ok')))
	})
})
