import { defineConfig, devices } from '@playwright/test'

// 独立子包（pm-task-board）的 E2E 配置，复用仓库根约定：
// - 默认使用系统 Chromium（由 PLAYWRIGHT_CHROMIUM_PATH 指定，否则回退 /opt/chromium.org/chromium/chrome）
// - webServer 自动启动 apps/pm-task-board 的 dev server（默认 5174）
// - 不执行 playwright install（浏览器由环境预装）
const CHROMIUM_PATH =
  process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/chromium.org/chromium/chrome'
const PORT = Number(process.env.PLAYWRIGHT_PORT || 5174)
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'on',
    headless: true,
    launchOptions: {
      executablePath: CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
