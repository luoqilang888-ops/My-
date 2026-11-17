# 罗辑 AI · 企业 AI 案例库

国内企业 AI 落地案例库（V2），包含 **363 条条目**：

- 303 条公开项目、名单或一线访谈记录
- 60 条适合小商家与独立开发者参考的实施方案（**不是已成交项目**）

覆盖 19 个行业，支持关键词检索、行业筛选、深度分类、项目拆解、技术组件参考与来源跳转。

## 使用

- **完整独立网页版：** [打开 `index.html`](./index.html)（GitHub 上可以查看源代码，浏览器展示需要通过 GitHub Pages）
- **可编辑源码：** [src/](./src/) 包含 `index.html`、`styles.css`、`app.js`、`data.js`、`data/cases.json`
- 若需在本地直接使用：下载当前目录的 `index.html`，用 Chrome 或 Edge 打开即可，无需服务器。

## 数据使用说明

- 公开项目的来源可能是政府/协会入选名单，很多没有披露完整技术架构；页面展示的“建议实现”不能当作真实部署记录。
- 60 条小微方案是基于常见业务痛点设计的参考 MVP，**不是经过验证的变现收益案例**。
- 部分协会名单项目属于数字化实践，并非均为 AI 模型部署；请以原始来源为准。
- 对外引用请保留项目来源，原始文章版权属于原权利人。

## GitHub Pages

当前项目发布到现有公开仓库 `luoqilang888-ops/My-` 下的独立目录，不影响仓库其他资料。

仓库包含自动发布工作流：`.github/workflows/enterprise-ai-case-library-pages.yml`。使用 GitHub Actions 将 `enterprise-ai-case-library/src/` 部署到 Pages，**需在仓库 Settings → Pages → Build and deployment → Source 设为 GitHub Actions**，然后执行该工作流。部署成功后预计站点地址：

https://luoqilang888-ops.github.io/My-/

这个地址只有在 GitHub Pages 成功部署并实际返回网页后才能视为正式入口。若已有 Pages 网站，请先检查，因同一个仓库的 Pages 网站只能发布一个站点，启用此流程会将其替换。

## 更新

主站源码位于 `src/`，独立网页 `index.html` 是打包副本。建议修改 `src/`，维护 `data/cases.json`，生成对应的 `data.js`。