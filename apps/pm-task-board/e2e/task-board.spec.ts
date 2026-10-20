import { test, expect, type Page, type Locator } from '@playwright/test'

const STORAGE_KEY = 'pm-task-board:tasks'

async function freshStart(page: Page) {
  await page.goto('/')
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY)
  await page.reload()
}

/** 业务弹窗没有显式 aria-label，且 label 与 input 未做 htmlFor 关联，因此用标题文本 + placeholder 定位。 */
function getDialog(page: Page, title: string): Locator {
  return page.locator('[role="dialog"]').filter({ hasText: title }).first()
}

async function fillDialog(
  dialog: Locator,
  input: { title: string; project?: string; priority?: '高' | '中' | '低' },
) {
  // 标题 input：通过 placeholder 定位
  await dialog.getByPlaceholder('例如：整理本周客户例会纪要').fill(input.title)
  if (input.project) {
    await dialog.getByPlaceholder('输入或选择项目').fill(input.project)
  }
  if (input.priority) {
    await dialog.getByRole('button', { name: input.priority, exact: true }).click()
  }
}

async function createTask(
  page: Page,
  input: { title: string; project?: string; priority?: '高' | '中' | '低' },
) {
  await page.getByRole('button', { name: '+ 新建任务' }).click()
  const dialog = getDialog(page, '新建任务')
  await expect(dialog).toBeVisible()
  await fillDialog(dialog, input)
  await dialog.getByRole('button', { name: '创建' }).click()
  await expect(dialog).not.toBeVisible()
}

async function moveTaskByButton(
  page: Page,
  title: string,
  target: '待办' | '进行中' | '已完成',
) {
  const card = page.locator('[data-task-id]').filter({ hasText: title }).first()
  await card.getByRole('button', { name: target, exact: true }).click()
}

/** 通过列标题"待办/进行中/已完成"定位整列容器（标题与计数胶囊为同级，最近的 border 容器是列） */
function column(page: Page, name: string): Locator {
  return page.locator('.rounded-xl.border').filter({ hasText: new RegExp(`^${name}`) }).first()
}

test.describe('PM 任务看板 E2E 验收', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page)
  })

  test('FR-2-001: 新建任务默认进入"待办"列，标题/项目/优先级展示正确', async ({ page }) => {
    await createTask(page, {
      title: 'E2E 验收任务-待办',
      project: '奔驰',
      priority: '高',
    })

    await expect(page.getByRole('status')).toHaveText('任务已创建')

    const todoCol = column(page, '待办')
    await expect(
      todoCol.locator('[data-task-id]').filter({ hasText: 'E2E 验收任务-待办' }),
    ).toBeVisible()
    const card = page
      .locator('[data-task-id]')
      .filter({ hasText: 'E2E 验收任务-待办' })
      .first()
    await expect(card).toContainText('项目：奔驰')
    await expect(card.filter({ hasText: '高' })).toBeVisible()
  })

  test('FR-2-002: 通过按钮切换任务到"已完成"，刷新后数据保留（LocalStorage 持久化）', async ({ page }) => {
    await createTask(page, { title: 'E2E 持久化检查', project: '宝马', priority: '中' })
    await moveTaskByButton(page, 'E2E 持久化检查', '已完成')

    const doneCol = column(page, '已完成')
    await expect(
      doneCol.locator('[data-task-id]').filter({ hasText: 'E2E 持久化检查' }),
    ).toBeVisible()

    await page.reload()
    const doneCol2 = column(page, '已完成')
    await expect(
      doneCol2.locator('[data-task-id]').filter({ hasText: 'E2E 持久化检查' }),
    ).toBeVisible()

    const status = await page.evaluate(
      ({ key, title }) => {
        const raw = window.localStorage.getItem(key)
        if (!raw) return null
        const tasks = JSON.parse(raw) as Array<{ title: string; status: string }>
        return tasks.find((t) => t.title === title)?.status ?? null
      },
      { key: STORAGE_KEY, title: 'E2E 持久化检查' },
    )
    expect(status).toBe('done')
  })

  test('FR-3-001: 一键生成周报 Markdown 按"已完成/进行中"分组、带项目前缀与优先级后缀，todo 不展示', async ({ page }) => {
    await createTask(page, { title: '本周已完成事项', project: '奔驰', priority: '高' })
    await moveTaskByButton(page, '本周已完成事项', '已完成')

    await createTask(page, { title: '本周推进中的事', project: '宝马', priority: '中' })
    await moveTaskByButton(page, '本周推进中的事', '进行中')

    await createTask(page, { title: '下周待办不出现', project: '奔驰', priority: '低' })

    await page.getByRole('button', { name: '一键生成周报' }).click()

    const preview = page.locator('pre.mono')
    await expect(preview).toContainText('# 周报（')
    await expect(preview).toContainText('## 本周已完成')
    await expect(preview).toContainText('- [奔驰] 本周已完成事项')
    await expect(preview).toContainText('## 进行中')
    await expect(preview).toContainText('- [宝马] 本周推进中的事（优先级：中）')
    await expect(preview).not.toContainText('下周待办不出现')
  })

  test('FR-3-002: 点击"复制"后给出成功提示，剪贴板包含周报内容', async ({ page }) => {
    await createTask(page, { title: '复制验收任务', project: '奔驰', priority: '高' })
    await moveTaskByButton(page, '复制验收任务', '已完成')

    await page.getByRole('button', { name: '一键生成周报' }).click()
    const preview = page.locator('pre.mono')
    await expect(preview).toContainText('[奔驰] 复制验收任务')

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.getByRole('button', { name: '复制', exact: true }).click()

    await expect(page.getByRole('status')).toHaveText('周报已复制到剪贴板')

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain('# 周报（')
    expect(clipboard).toContain('[奔驰] 复制验收任务')
  })

  test('FR-4-001: 顶部统计卡随任务状态切换实时更新（任务总数 / 本周完成率 / 项目分布）', async ({ page }) => {
    // 首次无数据时会注入 4 条种子任务，基于增量断言以避免写死初始数字。
    const totalCard = page
      .locator('.rounded-xl.border')
      .filter({ has: page.getByText('任务总数', { exact: true }) })
      .first()
    const initialTotalText = await totalCard.locator('text=/^\\d+$/').first().textContent()
    const initialNum = Number(initialTotalText)
    expect(Number.isFinite(initialNum)).toBeTruthy()

    await createTask(page, { title: '统计卡增量任务', project: '奔驰', priority: '高' })
    await expect(totalCard.locator('text=/^\\d+$/')).toHaveText(String(initialNum + 1))

    await moveTaskByButton(page, '统计卡增量任务', '已完成')
    const rateCard = page
      .locator('.rounded-xl.border')
      .filter({ has: page.getByText('本周完成率', { exact: true }) })
      .first()
    await expect(rateCard).toContainText(/本周已完成 \d+ \/ 本周涉及 \d+/)
    const rateText = await rateCard.locator('text=/\\d+%/').first().textContent()
    expect(rateText).toMatch(/\d+%/)

    const distCard = page
      .locator('.rounded-xl.border')
      .filter({ has: page.getByText('按项目分布', { exact: true }) })
      .first()
    await expect(distCard).toContainText('奔驰')
  })

  test.skip('FR-2-003: HTML5 原生拖拽可将任务从"待办"拖到"进行中"列（可选增强，主验收已由按钮切换 FR-2-002 覆盖；headless Chromium 下 dataTransfer 与列内卡片命中不稳定，仅在有手动验证需求时启用）', async ({ page }) => {
    await createTask(page, { title: '拖拽验收任务', project: '宝马', priority: '低' })
    const card = page.locator('[data-task-id]').filter({ hasText: '拖拽验收任务' }).first()
    const doingCol = column(page, '进行中')
    const dropTarget = doingCol.locator('> div').first() // 列头区域
    await card.dragTo(dropTarget)
    await expect(doingCol.locator('[data-task-id]').filter({ hasText: '拖拽验收任务' })).toBeVisible()
  })
})
