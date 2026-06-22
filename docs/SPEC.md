# Paperweave Protocol v1.0

> **本文档定义 Paperweave v1 的正式规范，包括知识模型、文件格式、目录结构、API 契约、摄取流水线和 Agent 交互标准。**
>
> 版本：1.0.0 | 状态：Draft | 最后更新：2025-06-22

---

## 一、五层知识模型（Five-Layer Knowledge Model）

Paperweave 将学术文献组织为五个层级，从底层不可变的原始数据到顶层合成知识。

### L0 — Raw Source Material（原始论文）

**目录：** `paperweave/L0_raw/<slug>/`

**语义：** 不可变层。每篇论文的原始全文和元数据。L0 是单点真相（single source of truth），所有上层分析必须基于 L0 内容。

**内容文件：**

| 文件 | 必需 | 格式 | 说明 |
|------|------|------|------|
| `full.md` | 是 | Markdown | MinerU 提取的全文，含图表、公式、表格 |
| `review.md` | 否 | Markdown + YAML 前言 | 人类/Agent 的结构化审读笔记 |
| `images/` | 是 | 目录 | 从 PDF 提取的图片文件 |
| `code/` | 否 | 目录 | 克隆的开源代码仓库（去除 .git/ 和大文件） |

**Slug 命名约定：** 小写字母 + 连字符（lowercase-hyphens），截断至约 80 字符。示例：`visual-instruction-tuning`、`ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling`

**不可变性原则：** `full.md` 和 `images/` 一旦生成不得修改。如需重新提取，应生成新的 slug 版本。

---

### L1 — Ecology（文献社交生态）

**目录：** `paperweave/L1_ecology/`

**语义：** 回答"谁和谁合作？有哪些研究社区？"维护三个注册表文件，每次读论文时更新。

**文件：**

| 文件 | 格式 | 说明 |
|------|------|------|
| `authors.md` | Markdown | 作者 → 论文列表 + 所属机构 |
| `institutions.md` | Markdown | 机构 → 论文列表 + 核心作者 |
| `journals.md` | Markdown | 期刊/会议 → 论文列表 + L4 页面链接 |

**更新规则：**
- 每次完成论文阅读后更新
- 同一作者/机构/期刊只增不删，合并信息
- 并行读取时使用 `/tmp/weaver-N-l1.json` 临时文件，最后由父进程合并

---

### L2 — Lineage（方法演化）

**目录：** `paperweave/L2_lineage/<domain>/<task>/<approach>.md`

**语义：** 回答"方案怎么一步步演进的？"按 domain → task → approach 三级组织。

**目录结构：**

```
L2_lineage/
  <domain>/               ← 领域（如 remote-sensing, multimodal, cv）
    <task>/               ← 任务（如 classification, segmentation, vlm）
      <approach>.md       ← 方法论文
    dataset/<name>.md     ← 数据集论文
    benchmark/<name>.md   ← 基准论文
    survey/<name>.md      ← 综述论文
```

**YAML 前言 schema：**

```yaml
---
title: "页面标题"
slug: "unique-slug"
created: "2025-01-15"
updated: "2025-06-20"
type: "approach"           # approach | dataset | benchmark | survey
domain: "remote-sensing"   # L2 领域
task: "classification"     # L2 任务
approach: "vit-based"      # 方法名（仅 type=approach）
tags: [rsfm, transformer]
sources:                   # 引用的 L0_raw slug 列表
  - "ringmo"
  - "satmae"
---
```

**页面模板（9 部分）：**

1. **Overview** — 方法概述与范式演变
2. **Evolution Timeline** — ASCII 时间线
3. **Comparison Table** — 必填对比表（Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight）
4. **Design Taxonomy** — 按设计维度分组
5. **Cross-Paper Synthesis** — 5 篇以上论文时必填
6. **Current SOTA** — 各 benchmark 最佳方法
7. **Deployability Assessment** — open_source / code_url / compute / dataset_access
8. **Open Issues** — 综合论文结论
9. **Related Approaches** — 交叉链接

**创建阈值：** 0。即使只有一篇论文也可以创建页面。

---

### L3 — Module（问题驱动）

**目录：** `paperweave/L3_module/<problem>.md`

**语义：** 回答"这个领域有什么问题？试过什么方案？"按问题组织，不按方法组织。

**YAML 前言 schema：**

```yaml
---
title: "模块标题"
slug: "unique-slug"
created: "2025-01-15"
updated: "2025-06-20"
domain: "remote-sensing"
tags: [fusion, multimodality]
related_l2:               # 相关的 L2 页面
  - "remote-sensing/vlm/late-fusion"
related_l3:               # 相关的 L3 页面
  - "data-scarcity"
---
```

**页面模板（7 部分）：**

1. **Problem Definition** — 问题定义与为什么难
2. **Design Axes** — 关键设计维度与权衡
3. **Solution Strategies** — 按方法类型组织，附论文证据
4. **Evolution** — 方案随时间的变化
5. **Paper Mapping** — 各范式对应的论文
6. **Open Problems** — 尚未解决的问题
7. **Related Problems** — 与其他 L3 模块的交叉链接

---

### L4 — Editorial（出版指南）

**目录：** `paperweave/L4_editorial/<venue>.md`

**语义：** 回答"投哪里？怎么定位？"

**内容：** 期刊/会议的组织化页面，包含关键论文、接收率、审稿指南、投稿策略。

---

### Meta Files（元文件）

| 文件 | 位置 | 格式 | 说明 |
|------|------|------|------|
| `to-read.md` | `paperweave/to-read.md` | Markdown | 引用挖掘队列，格式：`- Short Name (Authors, Year) — Venue — N` |
| `AGENT.md` | `paperweave/AGENT.md` | Markdown | Agent 操作规则 |
| `SCHEMA.md` | `paperweave/SCHEMA.md` | Markdown | 框架宪法——分类法、标签、页面模板 |
| `index.md` | `paperweave/index.md` | Markdown | 所有 wiki 页面的完整目录 |
| `log.md` | `paperweave/log.md` | Markdown | 只追加的审计日志 |

---

## 二、文件命名约定

| 项目 | 约定 | 示例 |
|------|------|------|
| L0 slug | `lowercase-hyphens`，≤80 字符 | `visual-instruction-tuning` |
| L1 文件名 | 固定名称 | `authors.md`, `institutions.md`, `journals.md` |
| L2 文件名 | `<approach>.md`（方法）或 `<name>.md`（数据集/基准/综述） | `vit-based.md`, `aid.md` |
| L2 目录 | `lowercase-hyphens` | `remote-sensing/classification/` |
| L3 文件名 | `<problem>.md` | `modality-fusion.md` |
| L4 文件名 | `<venue>.md` | `cvpr.md`, `ieee-tgrs.md` |
| Meta 文件名 | `lowercase-hyphens.md` | `to-read.md`, `index.md` |

**Slug 唯一性原则：** 所有 slug 在各自命名空间内必须唯一。L0 slug 全局唯一。L2 的 `domain/task/approach` 三元组唯一。

---

## 三、YAML Frontmatter Schema

### L0 review.md 前言

```yaml
---
slug: "paper-slug"                # 必填，L0 slug
title: "Full Paper Title"         # 必填
authors:                          # 必填
  - "Author One"
  - "Author Two"
year: 2024                        # 必填
venue: "CVPR 2024"                # 必填，若无则填 "arXiv"
tags: [domain, method, task]      # 必填，5 槽标签系统
score: 4                          # 必填，1-5
contribution: 4                   # 可选，新颖性 1-5
soundness: 4                      # 可选，严谨性 1-5
relevance: 5                      # 可选，相关性 1-5
open_source: true                 # 可选，true | false | partial
code_url: "https://..."           # 可选
compute: "8×A100 80GB"            # 可选
dataset_access: "public"          # 可选，public | private | upon-request | synthetic
---
```

### L2 页面前言

```yaml
---
title: "Approach Name"            # 必填
slug: "unique-slug"               # 必填
created: "2025-01-15"             # 必填，YYYY-MM-DD
updated: "2025-06-20"             # 必填，YYYY-MM-DD
type: "approach"                  # 必填，approach | dataset | benchmark | survey
domain: "remote-sensing"          # 必填
task: "classification"            # 必填（survey 可填 "general"）
approach: "vit-based"             # type=approach 时必填
tags: [rsfm, transformer]         # 必填
sources:                          # 必填，引用的 L0 slug
  - "ringmo"
  - "satmae"
---
```

### L3 页面前言

```yaml
---
title: "Module Title"             # 必填
slug: "unique-slug"               # 必填
created: "2025-01-15"             # 必填
updated: "2025-06-20"             # 必填
domain: "remote-sensing"          # 必填
tags: [fusion, multimodality]     # 必填
related_l2: []                    # 可选
related_l3: []                    # 可选
---
```

---

## 四、目录结构规范

```
paperweave-v1/
├── README.md                 # 项目 landing page
├── SPEC.md                   # 本文档 — 协议规范
├── AGENTS.md                 # AI Agent 操作手册
├── GUIDE.md                  # 完整用户指南
├── LICENSE                   # MIT License
├── .env.example              # 环境变量模板
├── requirements.txt          # Python 依赖
├── paperweave/               # Python package
│   ├── __init__.py
│   ├── reader/               # Web Reader 模块
│   │   ├── server.py         # FastAPI 服务器
│   │   ├── templates/        # 前端模板
│   │   └── static/           # 静态资源
│   ├── agent/                # Agent 模块
│   │   ├── ingest.py         # 论文摄取
│   │   ├── review.py         # 自动审读
│   │   └── curate.py         # 日常策展
│   ├── pipeline/             # 摄取流水线
│   │   ├── mineru.py         # MinerU API 客户端
│   │   ├── zotero.py         # Zotero 去重桥接
│   │   └── classify.py       # 自动分类
│   ├── models/               # 数据模型
│   │   ├── paper.py          # Paper 模型
│   │   ├── layer.py          # Layer 模型
│   │   └── wiki.py           # Wiki 状态模型
│   └── utils/                # 工具函数
│       ├── frontmatter.py    # YAML 前言解析
│       ├── slug.py           # Slug 生成
│       └── search.py         # 全文搜索
├── paperweave/                     # 知识库
│   ├── L0_raw/               # L0: 原始论文
│   │   └── <slug>/
│   │       ├── full.md
│   │       ├── review.md
│   │       ├── images/
│   │       └── code/
│   ├── L1_ecology/           # L1: 生态
│   │   ├── authors.md
│   │   ├── institutions.md
│   │   └── journals.md
│   ├── L2_lineage/           # L2: 谱系
│   │   └── <domain>/
│   │       └── <task>/
│   │           ├── <approach>.md
│   │           ├── dataset/
│   │           └── benchmark/
│   ├── L3_module/            # L3: 问题模块
│   │   └── <problem>.md
│   ├── L4_editorial/         # L4: 出版
│   │   └── <venue>.md
│   ├── to-read.md            # Meta
│   ├── index.md              # Meta
│   ├── SCHEMA.md             # Meta
│   ├── AGENT.md              # Meta
│   └── log.md                # Meta
└── tests/                    # 测试
    ├── test_reader.py
    ├── test_pipeline.py
    └── test_wiki.py
```

---

## 五、Reader API 契约

Web Reader 基于 FastAPI，提供以下端点：

### GET /api/papers

获取论文列表，支持分页和过滤。

**Query Parameters:**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | int | 1 | 页码（每页 20 条） |
| `domain` | string | — | 按领域过滤（对应 L2 domain） |
| `task` | string | — | 按任务过滤 |
| `tag` | string | — | 按标签过滤 |
| `sort` | string | `updated` | 排序字段：`updated`, `score`, `year`, `title` |
| `order` | string | `desc` | `asc` 或 `desc` |

**Response (200):**

```json
{
  "total": 150,
  "page": 1,
  "pages": 8,
  "papers": [
    {
      "slug": "visual-instruction-tuning",
      "title": "Visual Instruction Tuning",
      "authors": ["Haotian Liu", "Chunyuan Li"],
      "year": 2023,
      "venue": "NeurIPS 2023",
      "tags": ["multimodal", "vlm", "instruction-tuning"],
      "score": 5,
      "has_code": true,
      "last_read": "2025-06-15"
    }
  ]
}
```

### GET /api/paper/{slug}

获取单篇论文的完整信息。

**Response (200):**

```json
{
  "slug": "visual-instruction-tuning",
  "frontmatter": { ... },
  "full_text": "markdown content...",
  "review": "review content...",
  "images": ["/api/paper/visual-instruction-tuning/images/fig1.png"],
  "code_available": true
}
```

### GET /api/paper/{slug}/images/{filename}

返回图片文件（Content-Type: image/png 或 image/jpeg）。

### GET /api/search

全文搜索。

**Query Parameters:**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `q` | string | (必填) | 搜索关键词 |
| `scope` | string | `all` | `all` | `title` | `abstract` | `fulltext` |
| `page` | int | 1 | 页码 |
| `limit` | int | 10 | 每页条数 |

**Response (200):**

```json
{
  "query": "remote sensing foundation model",
  "total": 23,
  "results": [
    {
      "slug": "ringmo",
      "title": "RingMo: A Remote Sensing Foundation Model...",
      "snippet": "RingMo introduces a masked image modeling approach...",
      "score": 0.87,
      "matched_in": "fulltext"
    }
  ]
}
```

### POST /api/translate

翻译指定文本。

**Request Body:**

```json
{
  "text": "The proposed method achieves state-of-the-art performance...",
  "source_lang": "en",
  "target_lang": "zh"
}
```

**Response (200):**

```json
{
  "translated": "所提出的方法在...上达到了最先进的性能",
  "source_lang": "en",
  "target_lang": "zh"
}
```

### POST /api/chat

与论文对话。

**Request Body:**

```json
{
  "slug": "visual-instruction-tuning",
  "message": "这篇论文的核心贡献是什么？",
  "context_type": "paper",
  "history": []
}
```

**Response (200):**

```json
{
  "reply": "这篇论文的核心贡献是...",
  "citations": ["visual-instruction-tuning §3.1"]
}
```

---

## 六、摄取流水线契约（Ingestion Pipeline）

### 流水线阶段

```
SEARCH → QUALITY FILTER → DEDUP → FETCH → RAW PAGE → CLASSIFY → L2 PAGE
```

### Phase 1: 搜索（Search）

**输入：** 搜索查询字符串
**输出：** 论文候选列表（arXiv ID + 元数据）

**接口：**

```python
def search_arxiv(query: str, max_results: int = 10, sort_by: str = "date") -> list[dict]:
    """
    返回：[{"arxiv_id": "2304.08485", "title": "...", "authors": [...], "year": 2023, "abstract": "..."}]
    """
```

### Phase 2: 质量过滤（Quality Filter）

**规则：**
- S 级期刊/会议：CVPR, ICCV, ECCV, NeurIPS, ICML, ICLR, ACL, EMNLP, ISPRS, RSE, Nature, Science
- A 级期刊/会议：IEEE TGRS/GRSL, AAAI, IJCAI, JMLR, TPAMI, NAACL, TACL
- 额外条件：citationCount > 20 或来自顶级实验室
- 例外：遥感核心课题（RS FM, RS+MoE/Mamba, hyperspectral+DL, SAR+DL）始终摄入

**接口：**

```python
def quality_filter(paper: dict) -> bool:
    """返回 True 表示通过质量过滤"""
```

推荐通过 Semantic Scholar API 验证 venue 和 citation count：

```
GET https://api.semanticscholar.org/graph/v1/paper/arXiv:<id>?fields=publicationVenue,citationCount
```

### Phase 3: 去重（Dedup）

**输入：** 论文标题
**输出：** (exists: bool, existing_title: str | None, zotero_key: str | None)

**方法：** 归一化标题后字符串匹配（子串或 75% 词重叠），同时检查 Zotero SQLite 和已有 L0_raw。

### Phase 4: 提取（Extract）

**工具：** MinerU API

**输入：** PDF URL 或本地文件路径
**输出：** `full.md` + `images/`

```bash
python -m paperweave.pipeline.mineru \
  --url "https://arxiv.org/pdf/2304.08485" \
  --slug "visual-instruction-tuning" \
  --language en
```

**输出位置：** `paperweave/L0_raw/<slug>/full.md` 和 `paperweave/L0_raw/<slug>/images/`

**错误处理：** 提取失败时创建 `paperweave/L0_raw/<slug>/ERROR.md` 记录错误信息。

### Phase 5: 分类（Classify）

**输入：** L0 slug（读取 `full.md` 或从元数据获取标题+摘要）
**输出：** (domain, task, approach) 三元组

**接口：**

```python
def classify_paper(slug: str) -> tuple[str, str, str]:
    """基于标题和摘要判定 domain → task → approach"""
```

### Phase 6: 更新 L2 页面（Update L2）

- 将论文添加到对应 L2 approach page 的 Comparison Table
- 如页面不存在，使用模板创建
- 更新页面 `sources` 前言 + `updated` 时间戳

---

## 七、Agent 交互契约（Agent Interaction Contract）

### Agent 读取知识库

Agent 应按以下顺序加载上下文：

1. **L0 论文本身：** `paperweave/L0_raw/<slug>/full.md` 和 `review.md`
2. **L2 谱系页面：** 至少 1 个（论文所属的 approach page）
3. **L3 问题页面：** 最多 2 个（与论文相关的 problem page）

**上下文加载规则：**
- 最少：1 个 L2 页面
- 最多：1 个 L2 页面 + 2 个 L3 页面
- 禁止加载所有 L2/L3 页面

### Agent 写入知识库

Agent 可执行以下写入操作：

| 操作 | 目标文件 | 方式 |
|------|---------|------|
| 创建/更新 review | `paperweave/L0_raw/<slug>/review.md` | 追加新的 `## [YYYY-MM-DD] Review` 章节 |
| 更新 L1 生态 | `paperweave/L1_ecology/*.md` | 追加条目，合并重复 |
| 创建/更新 L2 页面 | `paperweave/L2_lineage/<domain>/<task>/<approach>.md` | 更新对比表或创建新页面 |
| 创建/更新 L3 页面 | `paperweave/L3_module/<problem>.md` | 追加新方案策略或创建新页面 |
| 更新待读队列 | `paperweave/to-read.md` | 追加引用条目 |
| 更新索引 | `paperweave/index.md` | 更新页面计数 |
| 记录日志 | `paperweave/log.md` | 只追加 `## YYYY-MM-DD action | description` |

### Agent 并行操作

并行子 Agent 规则：

- 最多 3 个并发子 Agent
- 每个子 Agent 处理 1 篇论文
- L1 共享状态：子 Agent 输出到 `/tmp/weaver-N-l1.json`，父 Agent 合并
- L0/L2/L3 页面级别的写操作是独立的（不同 slug/页面不冲突）

### Agent 查询知识库

Agent 可通过以下方式查询：

```python
# 按 slug 查找论文
GET /api/paper/{slug}

# 全文搜索
GET /api/search?q=keyword&scope=fulltext

# 列出所有 L0 论文
GET /api/papers?domain=remote-sensing&sort=score

# 读取 L2 分类结构
glob("paperweave/L2_lineage/*/*/*.md")

# 按标签查找
grep -l "tag_name" paperweave/L0_raw/*/review.md
```

---

## 八、版本控制与迁移

- **paperweave/ 目录应纳入 Git 版本控制**
- L0_raw 的 `full.md` 和 `images/` 可以通过 `.gitignore` 排除（大文件）
- 架构变更时更新 SCHEMA.md
- 迁移脚本遵循：`migrate_v<N>_to_v<N+1>.py` 命名

---

*Paperweave Protocol v1.0 — 为 AI Agent 和人类研究者共同设计的知识基础设施。*
