const host = 'acb8420703c2.ngrok.app';
export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url)
		const target = `https://${host}${url.pathname}${url.search}`

		if (request.headers.get("upgrade")?.toLowerCase() === "websocket") {
			const wsResponse = await fetch(target, {
				headers: request.headers,
			})
			return wsResponse
		}

		const newHeaders = new Headers(request.headers)
		newHeaders.set("host", host)

		const proxyRequest = new Request(target, {
			method: request.method,
			headers: newHeaders,
			body: request.body,
			redirect: "follow"
		})

		const response = await fetch(proxyRequest)

		const respHeaders = new Headers(response.headers)
		respHeaders.set("Access-Control-Allow-Origin", "*")

		return new Response(response.body, {
			status: response.status,
			headers: respHeaders
		})
	}
}
