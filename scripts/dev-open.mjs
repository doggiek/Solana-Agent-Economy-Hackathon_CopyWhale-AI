import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const port = process.env.PORT || '3000'
const host = process.env.HOST || 'localhost'
const url = `http://${host}:${port}`
const require = createRequire(import.meta.url)
const nextBin = require.resolve('next/dist/bin/next')
const nextArgs = [nextBin, 'dev', ...process.argv.slice(2)]

const child = spawn(process.execPath, nextArgs, {
  stdio: 'inherit',
  env: process.env,
})

let browserOpened = false

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error('Failed to start Next.js dev server:', error)
  process.exit(1)
})

async function waitForServer() {
  while (!browserOpened && !child.killed) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
      if (response.ok) {
        browserOpened = true
        openBrowser(url)
        return
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

function openBrowser(targetUrl) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'

  const args =
    process.platform === 'win32'
      ? [targetUrl]
      : [targetUrl]

  const opener = spawn(command, args, {
    stdio: 'ignore',
    detached: true,
    shell: process.platform === 'win32',
  })

  opener.unref()
}

waitForServer()
