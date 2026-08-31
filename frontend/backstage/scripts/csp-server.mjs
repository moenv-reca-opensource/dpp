import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const port = Number(process.env.PORT || 4174)
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
}
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'"
].join('; ')

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url || '/', `http://${request.headers.host}`).pathname
  )
  let target = resolve(root, `.${pathname}`)
  if (!target.startsWith(`${root}${sep}`) && target !== root) {
    response.writeHead(403).end('Forbidden')
    return
  }
  try {
    if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html')
  } catch {
    target = resolve(root, 'index.html')
  }
  response.setHeader('Content-Security-Policy', contentSecurityPolicy)
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader('Content-Type', mime[extname(target)] || 'application/octet-stream')
  try {
    response.end(await readFile(target))
  } catch {
    response.writeHead(404).end('Not found')
  }
})

server.listen(port, '127.0.0.1', () => console.log(`Strict CSP preview: http://127.0.0.1:${port}`))
