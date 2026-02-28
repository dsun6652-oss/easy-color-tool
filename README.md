# 颜色格式转换工具

单页面 React 应用，支持 HEX、RGB、HSL 三种颜色格式互转，实时预览，一键复制。

**在线体验**：<https://dsun6652-oss.github.io/easy-color-tool>

## 功能

- **格式互转**：HEX ↔ RGB ↔ HSL 任意格式输入，自动转换
- **拾色器**：点击色块打开原生拾色器手动选色
- **实时预览**：输入任意格式，立刻显示对应颜色块
- **一键复制**：每个格式结果单独复制按钮
- **清空 / 重置**：清空所有输入，或重置为示例颜色
- **深色模式**：默认深色主题，风格与 easy-json-tool 统一
- **响应式布局**：适配移动端与桌面端

## 支持的格式

- **HEX**：`#fff`、`#ffffff`
- **RGB**：`rgb(255, 255, 255)`
- **HSL**：`hsl(0, 0%, 100%)`

## 运行

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 构建

```bash
npm run build
```
