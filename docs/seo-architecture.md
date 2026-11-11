# 渐进增强工作台与独立内容页

本地改造日期：2026-11-11。所有页面由内容源生成，没有推送、部署或提交站点地图。

## 内容和路由

- `packs/*/meta.json`：条目唯一来源，显式的三位 `id` 永久固定。名称、摘要和双语 `public.locales` 编辑内容用于详情页；Pro 的 `spec`、`use`、`ask` 和导出资源不进入公开详情。
- `content/identities.json`：既有 ID 和 slug 的身份基线。更改 slug 时须在该条目的 `public.aliases` 保留旧 slug；构建拒绝无别名的更名。
- `tools/public-content.mjs`：公开字段白名单，同时供静态页面与托管目录使用。向源记录增加字段不会自动将其公开。
- `tools/seo.mjs`：从同一内容源生成双语首页、素材包列表、14 个素材包的详情列表、324 项双语条目页面、语言切换、相关条目、结构化数据、分享标题封面、robots、站点地图、工作台入口和 404。
- `tools/homepage.mjs`：使用原工作台模板和 `studio/strings.js` 的同源界面文案，生成 `/zh/` 与 `/en/` 的首屏工作台 HTML。标题、说明、24 个真实条目、分类链接和详情链接直接存在于响应中；没有按浏览器或爬虫身份提供不同页面。原脚本将同一页面增强为搜索、实时动画、收藏、弹窗和组合工具，不重定向到另一个应用。
- `public.locales` 保存公开用途、限制、接入建议，可按条目独立完善。公开说明不能通过复制付费规格补足，也不能虚构参数、使用案例或验证日期。新 12 项和微交互 24 项已按机制逐条编写这些说明；较早条目的说明结合已有公开摘要和素材包场景，后续应继续精编。

路由：`/zh/`、`/en/`；`/{lang}/packs/`；`/{lang}/packs/{pack}/`；`/{lang}/motions/{id}-{slug}/`；兼容工作台 `/studio/`。`/zh/`、`/en/` 默认就是可索引的完整工作台；`/studio/` 用于历史链接、picker 与多选分享，保持 noindex。条目 ID、类型、分级和渲染实现保持不变。

680 个语言页面中有 648 个动效详情 URL。磁吸与涟漪的两组近似参考通过 `public.canonicalId` 指向主要介绍，保留变体的可用 URL 和权益；其变体不写入 Sitemap。其他条目可以设置 `public.indexable:false` 暂停索引，直到公开说明完善。canonical 及 Sitemap 不是强制收录或排名承诺。

## 生成与预览

- `npm run build`：生成原目录与 API 导出，以及 `out/public/` 下的内容站；开发服务器对内容路由优先读取该目录。
- `npm run dev`：默认 `http://127.0.0.1:4173`。根入口默认进入中文工作台首页；历史 `#ID`、`pack`、`picks`、`pick`、`cb` 等参数转入工作台，并保留查询参数与 hash。JavaScript 关闭后仍可通过语言链接进入静态正文。
- 原工作台检索、收藏、组合、复制和 CLI picker 回调继续使用。`base` 指回站点根目录，允许静态子路径部署；只有兼容路径 `/studio/` 使用 noindex，语言首页允许索引。渲染器资源允许抓取。
- 语言路径决定初始语言，优先于浏览器存储和 `lang` 查询参数；首页切换语言导航到对应语言路径，保留分类、子类、排序、搜索、收藏筛选、多选及当前详情 hash。分类筛选按钮旁有分类页入口，卡片画布提供快捷弹窗，标题真实链接进入独立详情，鼠标与键盘均可操作。
- 单条 prompt、代码导出所附预览网址指向独立详情；多选分享和 CLI 回调留在兼容工作台。
- 详情页的文字与导航随 HTML 返回，不依赖浏览器执行脚本。预览仅在用户按下播放后加载当前素材包。尊重减少动态偏好，离屏和页面隐藏时暂停。
- 分享图为自动生成的双语 SVG 标题封面，标注为说明封面，不冒充动画截图。部分分享平台对 SVG 的兼容性有限，可后续为同一路径增加真实预览 PNG。

## 发布产物与域名策略

`npm run package` 生成 GitHub Pages 镜像到 `dist/`，默认资源和导航前缀 `/motion-prompt/`，全部镜像内容页面 noindex、canonical 指向 `https://motion.yipoo.com/`，不另发布竞争的 Sitemap。可通过 `PUBLIC_BASE_PATH` 指定其他静态子路径。

`npm run build:vercel` 生成 `.vercel/output/static/`，重新生成根路径版本，不依赖镜像页面的资源前缀。正式 canonical 固定使用正式主域；Preview 页面全部带 noindex，并由原有 HTTP 头再次禁止索引。正常生产发布生成包含可索引页面的 Sitemap。页面更新时间未录入时不伪造 lastmod。

Vercel 为 `/api/v1/` 下的原始规格、prompt、目录数据及共享代码返回 `X-Robots-Tag: noindex, follow`，允许抓取但不参与索引，避免与正式详情竞争。该规则不覆盖 `assets/runtime.js`、`studio/locale.js` 或预览渲染器。开发服务器使用相同响应头。GitHub Pages 无逐资源响应头能力，镜像 HTML 延续全站 noindex 与正式域 canonical 策略；原始 API 不加入 Sitemap，不声称其纯文本已获得同等 HTTP noindex 控制。公开演示资产不受 robots 全局屏蔽。

Vercel 对旧 slug 别名返回 308，对未知路径返回真实 404。纯静态镜像的旧 slug 使用带 canonical 的静态跳转页；该平台不具备同等逐条 HTTP 状态控制。根入口使用轻量兼容页，避免 HTTP 跳转丢失历史 hash 或 picker 参数。

## 验证与维护

1. `npm run build && npm run check:seo`：检查 648 详情、真实正文、单 H1、canonical、互指语言、站内链接、JSON-LD、Sitemap、无付费规格渗漏与白名单哨兵。
2. `npm run build:vercel` 后运行 `node tools/verify-seo.mjs dist`、`node tools/verify-seo.mjs .vercel/output/static`，覆盖镜像子路径与正式构建。
3. `node tools/verify-access.mjs` 验证纯静态包；`node tools/verify-access.mjs .vercel/output/static` 额外验证私有函数资源。纯静态 CI 不再依赖 Vercel 的私有构建文件。
4. 工作台回归通过 `TEST_URL=http://127.0.0.1:4173/studio/ npm test`；复制状态通过同样的 `TEST_URL` 运行 `npm run test:copy`，验证中英文成功反馈、恢复标签和失败不假报。
5. `npm run test:homepage` 检查首页无 JavaScript 的真实卡片和链接、路径语言、切换语言后的状态、实时预览、键盘详情导航、复制反馈、多选分享以及手机横向分类导航。原全功能回归也可以用 `TEST_URL=http://127.0.0.1:4173/zh/ npm test` 运行。证据位于 `.oil-ui/seo/`。

新增条目时先分配未使用 ID、登记 identities 基线、设定 slug/tier、添加双语公开说明和演示，再构建检查；不手工编辑生成页面。不自动创建搜索词、筛选组合或框架排列的索引页。
