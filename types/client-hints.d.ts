export declare const ClientHints: {
	readonly cookieName: 'CH-prefers-color-scheme'
	readonly getValueCode: "window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'"
	readonly fallback: 'light'
	readonly transform: (value: string) => 'dark' | 'light'
}

/**
 * Subscribe to changes in the user's color scheme preference. Optionally pass
 * in a cookie name to use for the cookie that will be set if different from the
 * default.
 */
export declare function SubscribeToSchemeChange(
	subscriber: (value: 'dark' | 'light') => void,
	cookieName?: string,
): () => void
