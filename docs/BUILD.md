# Paperweave v1 完整构建指南

> **本文档面向研究者，详细说明如何从零搭建 Paperweave 的完整环境，直到系统正常运行。**

---

## 目录

1. [环境要求](#1-环境要求)
2. [克隆项目与虚拟环境](#2-克隆项目与虚拟环境)
3. [安装依赖](#3-安装依赖)
4. [配置环境变量](#4-配置环境变量)
5. [初始化知识库目录](#5-初始化知识库目录)
6. [启动 Reader 服务器](#6-启动-reader-服务器)
7. [配置 MinerU API](#7-配置-mineru-api)
8. [连接 Zotero（可选）](#8-连接-zotero可选)
9. [运行摄取流水线](#9-运行摄取流水线)
10. [设置定时任务（Cron）](#10-设置定时任务cron)
11. [测试验证](#11-测试验证)
12. [目录结构总览](#12-目录结构总览)

---

## 1. 环境要求

| 项目 | 要求 | 说明 |
|------|------|------|
| **操作系统** | Linux / macOS | 推荐 Ubuntu 20.04+ 或 macOS 12+ |
| **Python** | 3.10+ | 必须。检查：`python3 --version` |
| **pip** | 最新版 | 升级：`pip install --upgrade pip` |
| **Git** | 2.30+ | 克隆仓库和代码审查 |
| **磁盘空间** | ≥ 50 GB | PDF、提取图片、克隆代码仓库 |
| **MinerU API Key** | 必填 | 注册地址：https://mineru.net |
| **LLM API Key** | 必填 | DeepSeek 或 OpenAI 兼容接口 |
| **Zotero** | 可选 | v7+，用于去重和文献管理 |

---

## 2. 克隆项目与虚拟环境

```bash
# 克隆项目
git clone https://github.com/nousresearch/paperweave-v1.git
cd paperweave-v1

# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# 确认 Python 版本
python --version
# 预期输出: Python 3.10.x 或更高
```

> **提示：** 每次打开新终端操作 Paperweave 时，都需要先执行 `source .venv/bin/activate` 激活虚拟环境。

---

## 3. 安装依赖

项目有两份依赖文件：根目录的 `requirements.txt`（顶层基础依赖）和 `papereader/requirements.txt`（Reader 完整依赖）。

```bash
# 确保虚拟环境已激活
source .venv/bin/activate

# 安装 Reader 完整依赖（推荐）
pip install -r papereader/requirements.txt

# 如果只需要基础工具
pip install -r requirements.txt
```

`papereader/requirements.txt` 包含：

```
fastapi          # Web 框架
uvicorn          # ASGI 服务器
pydantic         # 数据验证
pyyaml           # YAML 解析
requests         # HTTP 客户端
python-dotenv    # 环境变量加载
markdown-it-py   # Markdown 解析
Pillow           # 图片处理
tqdm             # 进度条
```

---

## 4. 配置环境变量

Paperweave 有两份 `.env.example` 模板：
- `papereader/.env.example` — 完整配置模板（推荐使用）
- `.env.example` — 精简配置模板

### Step 1：复制模板

```bash
# 推荐：使用 papereader 的完整模板
cp papereader/.env.example .env
```

### Step 2：编辑 .env 文件

```bash
nano .env   # 或用你喜欢的编辑器
```

必填字段：

```env
# 项目根目录（绝对路径）
PAPERWEAVE_ROOT=/mnt/disk1/Gongzs/paperweave-v1

# DeepSeek API（LLM 服务）
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# LLM 模型配置
LLM_MODEL=deepseek-chat
LLM_TEMPERATURE=0.3

# Agent 配置
AGENT_CMD=hermes
AGENT_TIMEOUT=120

# Reader 服务器端口
PAPERWEAVE_PORT=8899

# MinerU API（PDF 提取）
MINERU_TOKEN=your-mineru-token
```

可选字段：

```env
# API 鉴权 token（不设置则无需鉴权）
# PAPERWEAVE_AUTH_TOKEN=your-secret-token
```

### Step 3：验证配置

```bash
# 确认 .env 存在
ls -la .env

# 检查关键字段是否已填写（不应出现 your-key 等占位符）
grep -E "DEEPSEEK_API_KEY|MINERU_TOKEN" .env
```

---

## 5. 初始化知识库目录

Paperweave 的知识库（wiki）使用五层目录结构。首次部署需要创建这些目录。

```bash
# 确保在项目根目录
cd /mnt/disk1/Gongzs/paperweave-v1

# 创建 wiki 目录结构
mkdir -p paperweave/L0_raw
mkdir -p paperweave/L1_ecology
mkdir -p paperweave/L2_lineage
mkdir -p paperweave/L3_module
mkdir -p paperweave/L4_editorial

# 创建元文件（只追加的日志和队列）
touch paperweave/to-read.md
touch paperweave/index.md
touch paperweave/log.md

# 创建 L1 生态注册表
cat > paperweave/L1_ecology/authors.md << 'EOF'
# Authors Registry

> 作者 → 论文列表 + 所属机构。每次读论文后更新。
EOF

cat > paperweave/L1_ecology/institutions.md << 'EOF'
# Institutions Registry

> 机构 → 论文列表 + 核心作者。每次读论文后更新。
EOF

cat > paperweave/L1_ecology/journals.md << 'EOF'
# Journals Registry

> 期刊/会议 → 论文列表 + L4 页面链接。每次读论文后更新。
EOF

# 验证目录结构
find paperweave/ -type d | sort
```

预期输出：

```
paperweave/
paperweave/L0_raw
paperweave/L1_ecology
paperweave/L2_lineage
paperweave/L3_module
paperweave/L4_editorial
```

---

## 6. 启动 Reader 服务器

Paperweave Reader 是一个基于 FastAPI 的 Web 阅读器，支持论文全文浏览、LLM 翻译和对话。

### 方式一：使用启动脚本（推荐）

```bash
cd reader
bash start.sh
```

服务器默认监听 `http://localhost:8899`。

### 方式二：直接启动

```bash
cd /mnt/disk1/Gongzs/paperweave-v1
python reader/server.py --host 0.0.0.0 --port 8899
```

### 验证服务器

```bash
# 终端中看到：
# Starting paperweave reader → http://localhost:8899
# INFO:     Uvicorn running on http://0.0.0.0:8899

# 另一个终端测试
curl http://localhost:8899/api/papers?page=1
```

预期返回（空知识库）：

```json
{"total": 0, "page": 1, "pages": 0, "papers": []}
```

### 导出单篇论文为 HTML

```bash
cd reader
bash start.sh export <slug>
# 输出到 /tmp/<slug>.html，可通过微信分享
```

---

## 7. 配置 MinerU API

MinerU 是 PDF 精准解析服务，将论文 PDF 转为结构化 Markdown（含图表、公式、表格）。

### Step 1：获取 API Key

1. 访问 https://mineru.net 注册账号
2. 在控制台获取 API Token
3. 填入 `.env` 的 `MINERU_TOKEN` 字段

### Step 2：测试 API 连通性

```bash
# 加载 .env 中的 token
source .env 2>/dev/null || export $(grep -v '^#' .env | xargs)

# 测试 API
python tools/mineru_extract.py --help
```

预期输出：显示使用帮助，无报错。

### Step 3：试提取一篇论文

```bash
# 从 arXiv URL 提取
python tools/mineru_extract.py \
  --url "https://arxiv.org/pdf/2304.08485.pdf" \
  --slug "visual-instruction-tuning"

# 或从本地 PDF 提取
python tools/mineru_extract.py \
  --file /path/to/paper.pdf \
  --slug "my-paper-slug"
```

提取结果输出到 `paperweave/L0_raw/<slug>/`：

```
paperweave/L0_raw/visual-instruction-tuning/
├── full.md          ← 全文 Markdown
└── images/          ← 提取的图表
```

> **注意：** MinerU API 有速率限制。大批量提取时建议串行调用，每篇间隔 5-10 秒。

---

## 8. 连接 Zotero（可选）

Zotero 集成用于论文去重和批量导入。Paperweave 通过 `zotero_bridge.py` 直接读取 Zotero 的 SQLite 数据库。

### Step 1：安装 Zotero

从 https://www.zotero.org 下载安装 Zotero 7，并同步至少一次以生成 `zotero.sqlite`。

### Step 2：配置数据库路径

Zotero SQLite 默认路径：
- **Linux:** `~/Zotero/zotero.sqlite`
- **macOS:** `~/Zotero/zotero.sqlite`
- **Windows:** `%USERPROFILE%\Zotero\zotero.sqlite`

如果使用 Nutstore（坚果云）同步，路径可能是自定义的。编辑 `.env` 或直接设置环境变量：

```bash
export ZOTERO_DB="/path/to/your/zotero.sqlite"
```

### Step 3：测试 Zotero 连接

```bash
python -c "
from tools.zotero_bridge import ZoteroBridge
zb = ZoteroBridge()
print(zb.stats())
"
```

预期输出：Zotero 库的统计信息（论文总数、合集数、附件数等）。

### Step 4：从 Zotero 合集批量导入元数据

```bash
# 导入合集 ID 为 12345 的所有论文元数据
bash tools/ingest.sh 12345

# 限制数量
bash tools/ingest.sh 12345 10
```

> **说明：** `ingest.sh` 仅导入元数据（metadata.json）。PDF 全文提取需要额外运行 `mineru_extract.py`。

---

## 9. 运行摄取流水线

完整的论文摄取流水线：搜索 → 质量过滤 → 去重 → 提取 → 分类 → 构建 L2 页面。

### 9.1 命令行逐步操作

```bash
# 激活虚拟环境
source .venv/bin/activate
cd /mnt/disk1/Gongzs/paperweave-v1

# Step 1：搜索 arXiv
# 访问 https://arxiv.org/search/ 手动搜索，或使用 Semantic Scholar API

# Step 2：下载 PDF 并提取全文
python tools/mineru_extract.py \
  --url "https://arxiv.org/pdf/XXXX.XXXXX.pdf" \
  --slug "paper-slug-name"

# Step 3：检查提取结果
cat paperweave/L0_raw/paper-slug-name/full.md | head -50
ls paperweave/L0_raw/paper-slug-name/images/

# Step 4：使用 Agent 自动阅读和 review
python tools/agent.py read --slug "paper-slug-name"

# Step 5：查看 review 结果
cat paperweave/L0_raw/paper-slug-name/review.md

# Step 6：检查引用挖掘结果
cat paperweave/to-read.md
```

### 9.2 Agent 批量操作

```bash
# 随机读 3 篇 L0_raw 中的论文
python tools/agent.py read --batch 3

# 扫描待读队列
python tools/agent.py scan

# 查找超过 30 天未重读的论文
python tools/agent.py check
```

### 9.3 构建 L2/L3 知识页面

L2 谱系页面和 L3 问题页面目前由 Agent 或人类手动构建。参考格式见 `examples/` 目录：

```bash
# 查看示例
ls examples/L1_ecology/
ls examples/L2_lineage/
ls examples/L3_module/
ls examples/L4_editorial/
```

---

## 10. 设置定时任务（Cron）

使用 cron 实现每日自动策展，让系统持续演化。

### 10.1 每日自动阅读策展

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天早上 9:00 随机读 2 篇论文）
0 9 * * * cd /mnt/disk1/Gongzs/paperweave-v1 && /mnt/disk1/Gongzs/paperweave-v1/.venv/bin/python tools/agent.py read --batch 2 >> paperweave/log.md 2>&1
```

### 10.2 每日引用队列扫描

```bash
# 每天中午 12:00 扫描 to-read.md 并尝试摄入新论文
0 12 * * * cd /mnt/disk1/Gongzs/paperweave-v1 && /mnt/disk1/Gongzs/paperweave-v1/.venv/bin/python tools/agent.py scan >> paperweave/log.md 2>&1
```

### 10.3 定期数据同步（如果使用 Nutstore）

```bash
# 每天凌晨 2:00 从 Nutstore 下拉 Zotero 数据
0 2 * * * cd /mnt/disk1/Gongzs/paperweave-v1 && bash tools/sync.sh down >> /tmp/paperweave-sync.log 2>&1

# 每天凌晨 3:00 上传 wiki 到 Nutstore
0 3 * * * cd /mnt/disk1/Gongzs/paperweave-v1 && bash tools/sync.sh up >> /tmp/paperweave-sync.log 2>&1
```

### 10.4 验证 cron 是否正常工作

```bash
# 查看 cron 日志
grep CRON /var/log/syslog | tail -20     # Linux
# 或
tail -20 /tmp/paperweave-sync.log

# 查看 wiki 活动日志
tail -30 paperweave/log.md
```

---

## 11. 测试验证

完成以上所有步骤后，运行以下验证清单：

### 11.1 环境验证

```bash
# Python 版本
python --version | grep -q "3.1" && echo "✓ Python OK"

# 虚拟环境
which python | grep -q ".venv" && echo "✓ venv OK"

# 关键依赖
python -c "import fastapi, uvicorn, yaml, requests, dotenv; print('✓ dependencies OK')"
```

### 11.2 配置验证

```bash
# .env 存在且含关键字段
test -f .env && grep -q "DEEPSEEK_API_KEY" .env && grep -q "MINERU_TOKEN" .env && echo "✓ .env OK"
```

### 11.3 Wiki 结构验证

```bash
# 目录存在
test -d paperweave/L0_raw && test -d paperweave/L1_ecology && test -d paperweave/L2_lineage && test -d paperweave/L3_module && test -d paperweave/L4_editorial && echo "✓ wiki structure OK"

# 元文件存在
test -f paperweave/to-read.md && test -f paperweave/index.md && test -f paperweave/log.md && echo "✓ wiki meta files OK"
```

### 11.4 Reader 服务器验证

```bash
# 启动服务器（后台）
cd reader && bash start.sh &
sleep 3

# 测试 API
curl -s http://localhost:8899/api/papers?page=1 | python -m json.tool

# 停止服务器
kill %1
```

### 11.5 MinerU 连通性验证

```bash
python -c "
import os, sys
sys.path.insert(0, 'tools')
from dotenv import load_dotenv
load_dotenv()
token = os.environ.get('MINERU_TOKEN', '')
print(f'✓ MINERU_TOKEN loaded: {\"yes\" if token else \"NO — check .env\"}')
"
```

### 11.6 端到端测试

```bash
# 完整流程测试：提取一篇短论文并阅读
python tools/mineru_extract.py --url "https://arxiv.org/pdf/1706.03762.pdf" --slug "attention-is-all-you-need"

# 如果提取成功
test -f paperweave/L0_raw/attention-is-all-you-need/full.md && echo "✓ Extraction OK"

# 使用 Agent 阅读
python tools/agent.py read --slug "attention-is-all-you-need"
test -f paperweave/L0_raw/attention-is-all-you-need/review.md && echo "✓ Review OK"
```

---

## 12. 目录结构总览

```
paperweave-v1/                        ← 项目根目录
│
├── docs/                             ← 📚 所有文档（入口）
│   ├── README.md                     ← 项目总览与快速开始
│   ├── BUILD.md                      ← 本文档 — 完整构建指南
│   ├── SPEC.md                       ← Protocol 规范与 API 契约
│   ├── AGENTS.md                     ← AI Agent 操作手册
│   ├── GUIDE.md                      ← 完整用户指南
│   └── LICENSE                       ← MIT 许可证
│
├── reader/                           ← 🌐 Web Reader 服务器
│   ├── server.py                     ← FastAPI 主程序
│   ├── export.py                     ← 论文导出（HTML）
│   ├── start.sh                      ← 启动脚本
│   └── static/                       ← 前端资源
│       ├── index.html                ← 单页应用入口
│       └── js/                       ← JavaScript 模块
│
├── tools/                            ← 🔧 核心工具脚本
│   ├── agent.py                      ← Agent 自动阅读入口
│   ├── mineru_extract.py             ← MinerU PDF 提取
│   ├── zotero_bridge.py              ← Zotero SQLite 桥接
│   ├── batch_extract.py             ← 批量 PDF 提取
│   ├── retry_file_extract.py        ← 失败重试
│   ├── figview.py                   ← 图表查看器
│   ├── img2ascii.py                 ← 图片转 ASCII
│   ├── ingest.sh                     ← Zotero 批量导入
│   ├── sync.sh                       ← Nutstore 同步
│   └── pi-curate.sh                  ← pi 策展脚本
│
├── scripts/                          ← 📜 辅助脚本
│   ├── toread_filter.py              ← to-read 队列过滤
│   └── rereview.py                   ← 重新审读工具
│
├── papereader/                       ← 📦 Reader 模块（WIP）
│   ├── requirements.txt              ← Reader 依赖
│   └── .env.example                  ← 完整配置模板
│
├── paperweave/                       ← 📦 核心 Python 包（WIP）
│
├── skills/                           ← 🤖 Agent 技能定义（WIP）
│
├── examples/                         ← 📄 示例知识页面
│   ├── L1_ecology/                   ← L1 生态示例
│   ├── L2_lineage/                   ← L2 谱系示例
│   ├── L3_module/                    ← L3 问题模块示例
│   └── L4_editorial/                 ← L4 出版指南示例
│
├── paperweave/                             ← 📖 知识库（运行时数据）
│   ├── L0_raw/<slug>/                ← 原始论文全文
│   │   ├── full.md                   ← MinerU 提取的全文
│   │   ├── review.md                 ← 审读笔记
│   │   ├── images/                   ← 提取的图表
│   │   └── code/                     ← 克隆的开源代码
│   ├── L1_ecology/                   ← 作者/机构/期刊注册表
│   ├── L2_lineage/                   ← 方法演化谱系
│   ├── L3_module/                    ← 问题驱动模块
│   ├── L4_editorial/                 ← 出版指南
│   ├── to-read.md                    ← 待读队列
│   ├── index.md                      ← 完整目录
│   └── log.md                        ← 只追加审计日志
│
├── .env                              ← 🔑 环境变量（不提交 git）
├── .env.example                      ← 环境变量模板
├── .gitignore                        ← Git 忽略规则
└── requirements.txt                  ← 顶层依赖
```

### 各目录职责速查

| 目录 | 职责 | 读/写 | 谁操作 |
|------|------|-------|--------|
| `docs/` | 项目文档 | 人类写，所有人读 | 项目维护者 |
| `reader/` | Web 服务器 | 开发写，运行时读 | 开发者 |
| `tools/` | 工具脚本 | 人类/Agent 执行 | 所有人 |
| `papereader/` | Reader 包 | 开发写 | 开发者 |
| `paperweave/` | 核心包 | 开发写 | 开发者 |
| `skills/` | Agent 技能 | 开发写，Agent 读 | 开发者 |
| `examples/` | 示例页面 | 只读参考 | 所有人 |
| `paperweave/` | 知识库数据 | 人类/Agent 读写 | 所有人 |
| `.env` | 密钥配置 | 人类配置，程序读取 | 部署者 |

---

*Paperweave v1 BUILD.md — 从零到运行的完整指南。如有疑问，请先查阅 docs/ 下的其他文档。*
