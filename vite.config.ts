import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import type { IncomingMessage, ServerResponse } from 'http'

function localApiPlugin(): Plugin {
  return {
    name: 'local-api-serverless-plugin',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      Object.assign(process.env, env)

      if (fs.existsSync('.env.local')) {
        const lines = fs.readFileSync('.env.local', 'utf-8').split('\n')
        lines.forEach((line: string) => {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=')
            process.env[k.trim()] = v.join('=').trim()
          }
        })
      }

      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/')) {
          return next()
        }

        let body = ''
        req.on('data', (chunk: Buffer | string) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {}
            const mockReq = {
              method: req.method,
              headers: req.headers,
              body: parsedBody,
            }
            const mockRes = {
              status(code: number) {
                res.statusCode = code
                return this
              },
              json(data: unknown) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return this
              },
            }

            if (req.url === '/api/login') {
              const loginHandler = (await import('./api/login')).default
              return await loginHandler(mockReq, mockRes)
            }

            if (req.url === '/api/github-proxy') {
              const proxyHandler = (await import('./api/github-proxy')).default
              return await proxyHandler(mockReq, mockRes)
            }

            res.statusCode = 404
            res.end(JSON.stringify({ error: 'API route not found' }))
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            res.statusCode = 500
            res.end(JSON.stringify({ error: message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  esbuild: {
    drop: ['debugger'],
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
