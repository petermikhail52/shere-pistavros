import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const projectDirectory = dirname(fileURLToPath(import.meta.url))
const imagesDirectory = fileURLToPath(new URL('../Images/', import.meta.url))
const reviewDenialsPath = join(imagesDirectory, 'synaxarium-icon-review-denials.json')
const importerStatus = {
  running: false,
  startedAt: null,
  finishedAt: null,
  exitCode: null,
  output: [],
}

const readRequestBody = (request) => new Promise((resolve, reject) => {
  let payload = ''
  request.on('data', (chunk) => {
    payload += chunk.toString('utf8')
  })
  request.on('end', () => {
    payload = payload.trim()
    if (!payload) {
      resolve({})
      return
    }
    try {
      resolve(JSON.parse(payload))
    } catch {
      reject(new Error('Request body must be valid JSON.'))
    }
  })
  request.on('error', reject)
})

const loadReviewDenials = async () => {
  try {
    const raw = await readFile(reviewDenialsPath, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed.denied)) {
      return parsed
    }
  } catch {
    // No saved denial file yet.
  }
  return { version: 1, denied: [] }
}

const saveReviewDenials = async (denials) => {
  await mkdir(imagesDirectory, { recursive: true })
  await writeFile(reviewDenialsPath, `${JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    denied: denials,
  }, null, 2)}\n`)
}

const synaxariumImporterPlugin = () => ({
  name: 'synaxarium-image-importer',
  configureServer(server) {
    server.middlewares.use('/api/synaxarium-review-denials', async (request, response) => {
      response.setHeader('Content-Type', 'application/json')

      if (request.method === 'GET') {
        const denials = await loadReviewDenials()
        response.end(JSON.stringify(denials))
        return
      }

      if (request.method !== 'POST') {
        response.statusCode = 405
        response.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      try {
        const body = await readRequestBody(request)
        const sourceKey = body.sourceUrl || body.path
        if (!body.label || !sourceKey) {
          response.statusCode = 400
          response.end(JSON.stringify({ error: 'Denied candidate requires label and sourceUrl/path.' }))
          return
        }

        const denials = await loadReviewDenials()
        const nextDenied = [
          ...denials.denied.filter((entry) => (entry.sourceUrl || entry.path) !== sourceKey),
          {
            id: body.id,
            label: body.label,
            tradition: body.tradition,
            path: body.path,
            sourceUrl: body.sourceUrl,
            qualityScore: body.qualityScore,
            deniedAt: body.deniedAt || new Date().toISOString(),
          },
        ]
        await saveReviewDenials(nextDenied)
        response.statusCode = 202
        response.end(JSON.stringify({ version: 1, deniedCount: nextDenied.length }))
      } catch (error) {
        response.statusCode = 500
        response.end(JSON.stringify({ error: error.message || 'Could not save denied candidate.' }))
      }
    })

    server.middlewares.use('/api/synaxarium-image-importer', (request, response) => {
      response.setHeader('Content-Type', 'application/json')

      if (request.method === 'GET') {
        response.end(JSON.stringify(importerStatus))
        return
      }

      if (request.method !== 'POST') {
        response.statusCode = 405
        response.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      if (importerStatus.running) {
        response.statusCode = 409
        response.end(JSON.stringify({ error: 'The Synaxarium importer is already running.' }))
        return
      }

      importerStatus.running = true
      importerStatus.startedAt = new Date().toISOString()
      importerStatus.finishedAt = null
      importerStatus.exitCode = null
      importerStatus.output = ['Starting Wikimedia Commons importer...']

      const importer = spawn(globalThis.process.execPath, ['scripts/download-synaxarium-icons.mjs', '--all', '--per-saint', '8'], {
        cwd: projectDirectory,
        windowsHide: true,
      })
      const appendOutput = (chunk) => {
        importerStatus.output.push(...chunk.toString().split(/\r?\n/).filter(Boolean))
        importerStatus.output = importerStatus.output.slice(-80)
      }
      importer.stdout.on('data', appendOutput)
      importer.stderr.on('data', appendOutput)
      importer.on('close', (code) => {
        importerStatus.running = false
        importerStatus.finishedAt = new Date().toISOString()
        importerStatus.exitCode = code
        importerStatus.output.push(`Importer finished with exit code ${code}.`)
      })
      importer.on('error', (error) => {
        importerStatus.running = false
        importerStatus.finishedAt = new Date().toISOString()
        importerStatus.exitCode = 1
        importerStatus.output.push(`Importer failed: ${error.message}`)
      })

      response.statusCode = 202
      response.end(JSON.stringify(importerStatus))
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), synaxariumImporterPlugin()],
  publicDir: '../Images',
})
