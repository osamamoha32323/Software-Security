import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function terminalNotifierPlugin(): Plugin {
  return {
    name: 'terminal-notifier',
    configureServer(server) {
      server.middlewares.use('/api/terminal-log', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const timestamp = new Date().toLocaleTimeString('ar-EG')
              const output = [
                '',
                '\x1b[32m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m',
                '\x1b[36m║ 📧 [SecureShop Security Service - Terminal Notification]          ║\x1b[0m',
                `\x1b[33m║ المستخدم : ${data.name || 'عميل جديد'} (${data.email})\x1b[0m`,
                `\x1b[1m\x1b[32m║ 🔑 رمز تأكيد الحساب :  >>> [   ${data.code}   ] <<<                ║\x1b[0m`,
                `\x1b[90m║ التوقيت   : ${timestamp}                                            ║\x1b[0m`,
                '\x1b[32m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m',
                ''
              ].join('\n')
              console.log(output)
              if (process.stdout && typeof process.stdout.write === 'function') {
                // Ensure immediate flush in all terminal types
              }
            } catch (err) {
              console.error('Error in terminalNotifierPlugin:', err)
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          })
        } else {
          res.writeHead(405)
          res.end()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), terminalNotifierPlugin()],
})
