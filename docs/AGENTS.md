# AGENTS.md — Paperweave v1 AI Agent 操作手册

> **本文档面向 AI 编程 Agent（如 Hermes Agent、Claude Code、OpenCode）。按照以下步骤，Agent 可以自行完成 Paperweave 的完整部署和操作。**
>
> 如果文档与代码有冲突，以代码实现为准。

---

## 一、环境要求

- **Python 3.10+**（必须）
- **pip** 最新版
- **Git**（用于克隆代码仓库）
- **MinerU API Key**（PDF 提取服务）
- （可选）**Zotero 7** + SQLite 数据库（用于论文去重）

---

## 二、安装与配置

### Step 1: 克隆项目

```bash
git clone https://github.com/nousresearch/paperweave-v1.git
cd paperweave-v1
```

### Step 2: 创建虚拟环境并安装依赖

```bash
python3 -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### Step 3: 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下必要配置：

```env
# === 必填 ===
MINERU_TOKEN=your_mineru_api_token_here    # MinerU API 密钥
LLM_API_KEY=your_llm_api_key_here          # LLM API Key（用于 chat/translate/review）
LLM_BASE_URL=https://api.deepseek.com/v1   # LLM API 地址
LLM_MODEL=deepseek-chat                     # LLM 模型名称

# === 可选 ===
ZOTERO_DB_PATH=/path/to/zotero.sqlite      # Zotero 数据库路径（用于去重）
WIKI_PATH=./wiki                           # Wiki 路径（默认 ./wiki）
READER_HOST=0.0.0.0                        # Reader 服务器监听地址
READER_PORT=8000                           # Reader 服务器端口
LOG_LEVEL=INFO                             # 日志级别
```

`.env.example` 模板内容（Agent 可据此生成）：

```env
# Paperweave v1 Configuration
# 复制此文件为 .env 并填入实际值

# MinerU API (PDF extraction) — 必填
MINERU_TOKEN=

# LLM API (chat / translate / review) — 必填
LLM_API_KEY=
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# Zotero dedup — 可选
ZOTERO_DB_PATH=

# Reader server — 可选
READER_HOST=0.0.0.0
READER_PORT=8000

# Logging — 可选
LOG_LEVEL=INFO
```

---

## 三、启动 Reader 服务器

### 确认依赖安装正确

```bash
python -c "import paperweave; print('OK')"
```

应输出 `OK` 且无报错。

### 启动服务器

```bash
python -m paperweave.reader
```

服务器启动后：

```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 验证服务器

```bash
curl http://localhost:8000/api/papers?page=1
```

预期返回（初次部署 wiki 为空）：

```json
{"total": 0, "page": 1, "pages": 0, "papers": []}
```

### 启动参数

```bash
python -m paperweave.reader --host 0.0.0.0 --port 8000 --reload
```

- `--reload`：开发模式，代码变更时自动重启
- `--wiki-path ./wiki`：指定 wiki 目录路径
- `--no-open`：不自动打开浏览器

---

## 四、摄入论文（Ingest Papers）

### Step 1: 搜索论文

```bash
# 在 arXiv 上搜索
python -m paperweave.agent ingest search "remote sensing foundation model" --max 10
```

### Step 2: 检查质量

摄取前先检查论文是否通过质量过滤：

```bash
python -m paperweave.agent ingest check "2304.08485"
```

输出示例：

```
PASS: Visual Instruction Tuning (NeurIPS 2023)
  Venue: NeurIPS — S-tier ✓
  Citations: 1500+
  → Eligible for ingestion
```

### Step 3: 去重检查

```bash
python -m paperweave.agent ingest dedup "Visual Instruction Tuning"
```

输出示例：

```
NOT FOUND: 论文不在 Zotero 中，也不在已有 L0_raw 中
→ 可以摄入
```

### Step 4: 提取全文

```bash
python -m paperweave.agent ingest extract \
  --arxiv-id "2304.08485" \
  --slug "visual-instruction-tuning" \
  --language en
```

流程：
1. 下载 PDF 从 arXiv
2. 调用 MinerU API 提取全文
3. 生成 `paperweave/L0_raw/visual-instruction-tuning/full.md`
4. 提取图片到 `paperweave/L0_raw/visual-instruction-tuning/images/`
5. 创建空的 `review.md`（含 YAML 前言模板）

### Step 5: 自动分类

```bash
python -m paperweave.agent ingest classify "visual-instruction-tuning"
```

输出示例：

```
Classified: multimodal → vlm → late-fusion
L2 page: paperweave/L2_lineage/multimodal/vlm/late-fusion.md
```

### Step 6: 一键摄入（组合以上所有步骤）

```bash
python -m paperweave.agent ingest run \
  --query "remote sensing foundation model" \
  --max 5 \
  --auto-classify
```

交互式确认每篇论文后再执行提取。

---

## 五、自动审读（Autonomous Review）

### 单篇审读

```bash
python -m paperweave.agent review "visual-instruction-tuning"
```

Agent 将自动执行完整的阅读流程：
1. 加载 `review.md`（如存在）
2. 加载相关 L2 谱系页面 + 1-2 个 L3 问题页面
3. 完整阅读 `full.md`
4. （如有开源代码）克隆并审查代码
5. 更新 `review.md`，追加新的审读章节
6. 更新 L1 生态注册表
7. 引用挖掘 → 更新 `to-read.md`
8. 更新 `index.md` 和 `log.md`

### 批量审读

```bash
python -m paperweave.agent review batch \
  --slugs "ringmo" "satmae" "skysense" \
  --parallel 3
```

最多 3 个并发子 Agent，每个处理 1 篇论文。

### 日常策展（Daily Curator）

```bash
python -m paperweave.agent curate
```

随机选择一篇 14 天内未策展的论文，重新阅读并重新评分。"常看常新"原则。

---

## 六、常用操作速查

```bash
# 查看所有已摄入论文
ls paperweave/L0_raw/

# 统计论文数量
ls -d paperweave/L0_raw/*/ | wc -l

# 查看某篇论文的 review
cat paperweave/L0_raw/visual-instruction-tuning/review.md

# 全文搜索（命令行）
grep -rl "foundation model" paperweave/L0_raw/*/full.md

# 按标签查找
grep -l "remote-sensing" paperweave/L0_raw/*/review.md

# 查看引用挖掘队列
cat paperweave/to-read.md

# 查看最近活动
tail -30 paperweave/log.md

# 覆盖率检查
python -m paperweave.agent check coverage

# 验证 wiki 结构完整性
python -m paperweave.agent check structure

# 运行测试
python -m pytest tests/ -v
```

---

## 七、常见故障排除

### 问题：`ModuleNotFoundError: No module named 'paperweave'`

**原因：** 未安装 paperweave 包或虚拟环境未激活。

**解决：**
```bash
source .venv/bin/activate
pip install -e .          # 以开发模式安装
```

### 问题：MinerU 提取失败，返回 401

**原因：** `MINERU_TOKEN` 未设置或已过期。

**解决：**
```bash
# 检查 .env 文件
cat .env | grep MINERU_TOKEN
# 确认 token 有效
curl -H "Authorization: Bearer $MINERU_TOKEN" https://api.mineru.net/v1/health
```

### 问题：`full.md` 生成了但内容为空或乱码

**原因：** PDF 是扫描版（非文本 PDF），或 MinerU 解析失败。

**解决：**
- 检查原始 PDF 是否可选中文字
- 尝试其他来源的 PDF（如 Semantic Scholar 的 PDF 链接）
- 手动检查 `paperweave/L0_raw/<slug>/ERROR.md` 中的错误信息

### 问题：Zotero 去重无法连接数据库

**原因：** `ZOTERO_DB_PATH` 路径错误或 SQLite 数据库被锁定。

**解决：**
```bash
# 检查文件是否存在
ls -la $ZOTERO_DB_PATH
# 如果 Zotero 正在运行，先关闭 Zotero
# 或者在 .env 中留空 ZOTERO_DB_PATH 跳过去重
```

### 问题：Reader 启动后 `curl` 返回 Connection Refused

**原因：** 服务器未成功启动，或端口被占用。

**解决：**
```bash
# 检查端口占用
lsof -i :8000
# 更换端口启动
python -m paperweave.reader --port 8001
# 查看启动日志中的错误信息
```

### 问题：LLM chat/translate 返回空或超时

**原因：** `LLM_API_KEY` 未设置或 API 端点不可达。

**解决：**
```bash
# 验证 API 配置
cat .env | grep LLM_
# 测试 API 连通性
curl -H "Authorization: Bearer $LLM_API_KEY" $LLM_BASE_URL/models
```

### 问题：Agent review 时 subagent 超时

**原因：** `full.md` 过大（1000+ 行），Agent 上下文窗口不足。

**解决：**
- 使用更大上下文的 LLM 模型
- 减少并行数量：`--parallel 1`
- 对超长论文分块：Agent 自动分块处理，每次处理 ≤500 行的文本段

### 问题：Wiki 结构被意外破坏

**解决：**
```bash
# 运行结构验证
python -m paperweave.agent check structure
# 检查 git diff 查看变更
git diff paperweave/
# 恢复误操作
git checkout -- paperweave/<affected-file>
```

---

## 八、Agent 行为约束

遵循以下规则以确保知识库一致性：

1. **只追加不覆盖：** `review.md` 的审读章节追加到末尾，使用独立的时间戳标题 `## [YYYY-MM-DD] Review`。永远不要覆盖已有的审读内容。
2. **L0 不可变：** `full.md` 和 `images/` 生成后绝不修改。
3. **全文阅读：** 任何审读必须完整阅读 `full.md`。不能用 `review.md` 替代全文。
4. **上下文加载限制：** 审读前加载 1 个 L2 页面 + 最多 2 个 L3 页面。禁止加载全部页面。
5. **引用精选：** 每次阅读只挖掘 3-8 篇关键引用，不倾倒所有参考文献。
6. **变更后更新 Meta：** 任何结构性变更后更新 `index.md`。任何操作后追加 `log.md`。
7. **并行安全：** 并行子 Agent 的 L1 写入输出到 `/tmp/weaver-N-l1.json`，由父 Agent 统一合并。

---

*Paperweave v1 AGENTS.md — Agent 自主操作 Paperweave 的权威参考。*
