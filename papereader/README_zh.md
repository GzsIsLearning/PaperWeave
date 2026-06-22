# Papereader — Web 阅读器

## 这是什么

**👤 For Human**

Papereader 是 Paperweave 知识库的 Web 阅读前端，提供论文全文浏览、翻译、Agent 讨论、标注高亮等功能。

## 快速启动

**👤 For Human**

```bash
cd papereader

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API Key 和路径

# 启动服务
python server.py --port 8899
```

启动后访问 http://localhost:8899 即可使用。

也可以使用封装脚本：

```bash
bash start.sh
```

## API 端点

**🤖 For Agent**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/papers?search=` | 列出所有论文，支持搜索 |
| GET | `/api/paper/{slug}` | 获取论文全文及元数据 |
| GET | `/api/paper/{slug}/image/{filename}` | 获取论文图片（MinerU 提取） |
| POST | `/api/translate` | 翻译选中文本（英文→学术中文） |
| POST | `/api/chat` | 带论文上下文和知识库的 Agent 讨论 |
| POST | `/api/chat/stream` | SSE 流式 Agent 对话 |
| POST | `/api/highlight` | 保存高亮标注到论文 |
| DELETE | `/api/highlight/{slug}` | 删除高亮标注 |
| GET | `/api/sessions` | 获取聊天会话列表 |
| POST | `/api/sessions` | 保存聊天会话 |
| GET | `/api/stars` | 获取收藏论文列表 |
| POST | `/api/stars` | 保存收藏论文列表 |
| GET | `/api/stats` | 知识库统计信息 |
| GET | `/` | Web 阅读器首页 |

## 配置

**🤖 For Agent**

所有配置通过 `.env` 文件管理（参考 `.env.example`）：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PAPERWEAVE_ROOT` | 项目根目录路径 | 自动检测 |
| `DEEPSEEK_API_KEY` | LLM API 密钥 | — |
| `DEEPSEEK_BASE_URL` | LLM API 地址 | `https://api.deepseek.com` |
| `LLM_MODEL` | 使用的模型 | `deepseek-chat` |
| `LLM_TEMPERATURE` | 生成温度 | `0.3` |
| `AGENT_CMD` | Agent 命令行（如 `hermes`） | — |
| `AGENT_TIMEOUT` | Agent 超时秒数 | `120` |
| `PAPERWEAVE_PORT` | 服务端口 | `8899` |
| `PAPERWEAVE_AUTH_TOKEN` | API 鉴权令牌 | 不启用鉴权 |

## 链接

**🤖👤 For Both**

详细的使用指南和配置说明请参阅 [docs/ 目录](../docs/)，特别是：
- [docs/GUIDE.md](../docs/GUIDE.md) — 使用指南
- [docs/SPEC.md](../docs/SPEC.md) — 完整规范
