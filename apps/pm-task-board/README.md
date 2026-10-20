# PM 任务看板 · 周报生成（pm-task-board）

面向交付产品经理的个人效率 Web 工具：多客户项目任务看板 + 一键生成本周工作周报 Markdown。
纯前端 SPA，数据仅存于浏览器 LocalStorage，无后端、无账号。

## 技术栈

- React 18 + TypeScript 5（strict）
- Vite 6
- Tailwind CSS 3
- Vitest + React Testing Library + jsdom

Node 版本要求：**>= 18**（推荐 18 / 20 LTS）。

## 目录结构

```
apps/pm-task-board/
├── index.html
├── package.json
├── tailwind.config.js / postcss.config.js
├── tsconfig*.json
├── vite.config.ts / vitest.config.ts
└── src/
    ├── main.tsx              # React 入口
    ├── App.tsx               # 根组件（布局 + 组合子组件）
    ├── index.css             # Tailwind 入口 + 基础样式
    ├── types/                # Task / Status / Priority 等类型与常量
    ├── utils/                # 纯函数：时间、任务操作、周报格式化、统计、存储、种子数据
    ├── hooks/                # useTasks（LocalStorage 持久化）、useToast
    ├── components/           # Board / TaskCard / StatsCards / WeeklyReportPanel / TaskFormDialog / Toast
    └── test/                 # 单元测试 + setup
```

## 安装与运行

在 `apps/pm-task-board/` 目录下执行：

```bash
# 安装依赖
npm install

# 本地开发（默认端口 5174，可自动顺延）
npm run dev

# 生产构建（产物输出到 dist/）
npm run build

# 预览构建产物
npm run preview

# 运行单元测试（Vitest）
npm run test
```

> 本子项目是独立 package（自带 `node_modules`），不修改仓库根的火锅 demo（`hdl-order-demo`）代码与脚本；根目录原有的 `npm run dev / build / lint` 仍可正常使用。

## 使用说明

1. **新建任务**：点击右上角「+ 新建任务」，填写标题、所属项目（预置"奔驰""宝马"，也可自由输入）、优先级，提交后任务默认进入"待办"列顶部。
2. **切换状态**：
   - 方式 A：任务卡上点击「待办 / 进行中 / 已完成」按钮，立即切换到目标列顶部；
   - 方式 B：将任务卡拖拽到目标列中释放，效果与点击一致。
3. **编辑任务**：任务卡点击「编辑」，可修改标题、项目、优先级（状态请通过切换按钮/拖拽）。
4. **删除任务**：任务卡点击「删除」→「确认删除」二次确认后移除。
5. **查看统计**：顶部三张卡片实时显示任务总数、本周完成率、按项目分布。
6. **生成周报**：点击「一键生成周报」，下方预览区出现 Markdown 文本；点击「复制」写入剪贴板（Clipboard API 不可用时自动降级到 `execCommand`，失败时保留可选中文本兜底），成功/失败有 Toast 提示。

## 口径与已知限制

### 周报统计范围（时间口径）

- **本周**：浏览器**本地时区**的自然周，从**周一 00:00:00.000** 至生成周报的**当前时刻**。
- **纳入规则**：仅纳入 `updatedAt` 落在本周窗口内、且当前 `status` 为 `done` 或 `doing` 的任务；`todo` 一律不纳入。
  - 这样做的含义：本周内"被处理过"（创建、编辑、状态变更都会刷新 `updatedAt`）且当前已完成/正在做的事项会出现在周报中；很久以前已完成且本周没再动的任务不会污染周报。
- 分组：一级按「本周已完成 / 进行中」分组；同组条目按 `updatedAt` 倒序；进行中条目后缀「（优先级：高/中/低）」，已完成条目不显示优先级；某分组为空时保留标题并显示"无"。

### 本周完成率口径

- **分子**：本周窗口内当前 `status === 'done'` 且 `updatedAt` 在本周内的任务数（与周报"本周已完成"一致）。
- **分母**：本周"涉及任务总数" = `createdAt` 或 `updatedAt` 落在本周窗口内的任务数（不限当前状态）。
- **取整**：四舍五入到整数；分母为 0 时显示 "—"。

### 数据存储

- 仅使用浏览器 LocalStorage，key 为 `pm-task-board:tasks`，版本号 key 为 `pm-task-board:version`（当前为 `1`）。
- LocalStorage 读写均 `try/catch`；在隐私模式/被禁用/配额满/解析失败时，页面降级为内存态并在顶部给出黄色提示条，不白屏。
- 首次进入且无任何任务时，会写入 4 条跨项目/跨状态的种子示例以便直接看到看板效果；可自行删除。

### 兼容性与范围

- 目标浏览器：最新版 Chrome / Edge / Safari 桌面端；不做移动端/暗色模式深度适配，仅做基本响应式。
- 不包含：多用户/登录/后端/数据库、评论/附件/提醒、周报导出为文件/邮件/历史存档、复杂拖拽排序、国际化。
- 清空浏览器数据或手动清除 LocalStorage 会导致任务丢失。

## 单元测试

核心纯函数独立导出以便测试，覆盖两类核心逻辑：

1. `src/utils/taskOps.ts` 中的 `changeTaskStatus`：验证返回新对象、`status` 变更、`updatedAt` 刷新、原对象不可变；以及 `createTask`/`editTask` 的字段校验与不可变语义。
2. `src/utils/weeklyReport.ts` 中的 `formatWeeklyReport`：构造跨项目 / done / doing / todo / 非本周任务的混合输入，验证分组、项目前缀、优先级后缀、空分组占位、日期范围。

运行 `npm run test` 即可执行全部用例。
