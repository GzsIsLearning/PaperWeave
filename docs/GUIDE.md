# Paperweave — 文献策展系统

> **领域无关的五层学术文献组织系统。**
> 对论文进行分类，构建知识地图，每次重读都让你的理解更进一步。
>
> 项目根目录：`${PAPERWEAVE_ROOT}/`
> Wiki：`paperweave/` — 文档与知识库
> 工具：`tools/` — MinerU 提取、同步、Zotero 桥接、Agent
> 遗留：`legacy/` — 归档项目 (pi-wiki-manager)

---

## 目录

1. [什么是 Paperweave](#1-什么是-paperweave)
2. [快速入门](#2-快速入门)
3. [五层知识模型](#3-五层知识模型)
4. [阅读论文](#4-阅读论文)
5. [从 arXiv 摄取论文](#5-从-arxiv-摄取论文)
6. [构建 L2 谱系页面](#6-构建-l2-谱系页面)
7. [构建 L3 模块页面](#7-构建-l3-模块页面)
8. [参考](#8-参考)

---

## 1. 什么是 Paperweave

Paperweave 是一个文献策展系统，将学术论文组织成**五层知识层次结构**：

| 层级 | 名称 | 核心问题 |
|-------|------|----------|
| L0 | 原始素材 | 我有哪些论文？ |
| L1 | 生态 | 谁和谁合作？ |
| L2 | 谱系 | 解决方案如何演化？ |
| L3 | 模块 | 存在哪些问题？ |
| L4 | 编辑 | 该投向哪里？ |

每一层都有独特的目的，从不可变的论文存储到合成知识。

### 核心理念

- **每次阅读都是精读。** 不存在"快速浏览"或"粗读"——每次读论文都必须读全文（`full.md`）。
- **引文挖掘不是独立任务。** 它在精读过程中自然发生。读到 Related Work 部分时，发现了值得读的新论文——立刻更新 `to-read.md`。
- **常看常新。** 随着积累的知识重温，每次重读都可能发现新洞见。
- **开放设计。** 任何人（人也好，Agent 也好）遵循本指南即可使用本系统。

---

## 2. 快速入门

```bash
# 浏览 Wiki 结构
ls paperweave/

# 查看所有已摄取论文
ls paperweave/L0_raw/

# 查看引文挖掘队列
cat paperweave/to-read.md

# 查看最近活动
tail -20 paperweave/log.md
```

### 前提条件

- **Python 3.10+** 用于脚本
- **MinerU API Key**（用于 PDF 提取）：在项目根目录 `.env` 中设置 `MINERU_TOKEN`
- **Git** 用于代码审查（克隆仓库）

### 关键文件

| 文件 | 用途 |
|------|---------|
| `paperweave/AGENT.md` | Agent 操作规则 |
| `paperweave/SCHEMA.md` | 框架宪章与分类法 |
| `paperweave/index.md` | 所有 Wiki 页面的完整目录 |
| `paperweave/log.md` | 仅追加式审计日志 |
| `paperweave/to-read.md` | 引文挖掘队列 |
| `tools/mineru_extract.py` | PDF → full.md 提取（通过 MinerU API） |
| `tools/sync.sh` | Nutstore WebDAV 同步 |
| `tools/zotero_bridge.py` | Zotero SQLite 查询 |

---

## 3. 五层知识模型

```
paperweave/
├── L0_raw/              L0：不可变原始素材
├── L1_ecology/          L1：谁和谁合作？
├── L2_lineage/          L2：解决方案如何演化？
├── L3_module/           L3：存在哪些问题？
├── L4_editorial/        L4：该投向哪里？
├── to-read.md           元：引文挖掘队列
├── AGENT.md             元：Agent 操作规则
├── SCHEMA.md            元：框架宪章
├── index.md             元：所有页面目录
└── log.md               元：仅追加审计日志
```

### L0 — 原始素材

**位置：** `paperweave/L0_raw/<slug>/`

每篇论文以标题的 slug 命名，每个目录包含：

| 文件 | 内容 |
|------|---------|
| `full.md` | 论文全文（MinerU 提取），含图表、公式、表格 |
| `review.md` | 人/Agent 审读笔记、评分、引文挖掘、代码审查 |
| `images/` | 提取的图片 |
| `code/` | 克隆的代码仓库（如果开源） |

**Slug 规范：** 小写、连字符分隔、截断到约 80 字符。
示例：`ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling`

**`full.md` 是唯一真相源。** 所有审读决定必须基于 full.md 内容。`review.md` 是产出（阅读记录），不是替代品。

### L1 — 生态（文献社交生态）

**位置：** `paperweave/L1_ecology/`

回答：*谁是关键玩家？有哪些研究社区？*

三个登记文件，每读一篇论文就更新：

| 文件 | 内容 |
|------|---------|
| `authors.md` | 作者 → 论文 + 所属机构 |
| `institutions.md` | 机构 → 论文 + 核心作者 |
| `journals.md` | 期刊/会议 → 论文 + 链接到 L4 编辑页面 |

### L2 — 谱系（方法演化）

**位置：** `paperweave/L2_lineage/<domain>/<task>/<approach>.md`

回答：*解决方案如何演化？*

方法论文遵循 `领域 → 任务 → 方法` 路径：

```
lineage/
  <domain>/
    <task>/
      <approach>.md        ← 方法论文
    dataset/<name>.md      ← 数据集论文
    benchmark/<name>.md    ← 基准论文
    survey/<name>.md       ← 综述论文
```

**门槛：** 0——即使只有一篇论文也创建页面。
**混合论文**（方法 + 数据集）同时出现在两个分支。

#### L2 方法页面模板（9 部分）

1. **YAML 前言** — title, created, updated, type, domain, task, approach, tags, sources
2. **概述** — 方法是什么，范式演变
3. **演化时间线** — ASCII 艺术时序弧线 + 里程碑
4. **对比表** — 必填：

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|

5. **设计分类法** — 按设计维度分组论文
6. **跨论文合成** — 5 篇以上论文的页面可选
7. **当前 SOTA** — 各基准的最佳方法
8. **待解决问题** — 从论文结论综合
9. **相关方法** — [[wikilinks]]

#### 可复现性评估（每张对比表必含）

| 字段 | 取值 | 问题 |
|-------|--------|----------|
| `open_source` | `true` / `false` / `partial` | 代码能跑吗？ |
| `code_url` | URL 或 `—` | 代码在哪？ |
| `compute` | 如 `8×A100 80GB` 或 `—` | 算力够吗？ |
| `dataset_access` | `public` / `private` / `upon-request` / `synthetic` | 数据拿得到吗？ |

### L3 — 模块（问题驱动）

**位置：** `paperweave/L3_module/<problem>.md`

回答：*这个研究领域存在哪些问题？*

按**问题**组织，而非按方法。每个页面：

1. **问题定义** — 为什么难
2. **设计轴** — 关键权衡维度
3. **解决策略** — 按方法类型组织，附带论文证据
4. **演化** — 解决方案如何随时间变化
5. **开放问题** — 什么还没解决
6. **相关问题** — 跨链接到其他 L3 模块

遥感关键 L3 模块主题：
- `modality-fusion` — 融合范式（early/intermediate/late/cross-attention/MoE）
- `geo-foundation-models` — RS 基础模型的设计问题
- `model-efficiency` — 架构/数据/训练/推理效率
- `data-scarcity` — 自监督、小样本、迁移、弱标签
- `pretraining-paradigm` — 目标 × 数据源 × 规模的权衡

### L4 — 编辑（出版指南）

**位置：** `paperweave/L4_editorial/`

回答：*该投向哪里？*

按期刊/会议组织，包含关键论文、接收率、审稿指南。

### 元文件

| 文件 | 用途 |
|------|---------|
| `to-read.md` | 引文挖掘队列——汇总所有论文阅读。格式：`Paper (Authors, Year) — Venue — N` |
| `AGENT.md` | Agent 操作规则（AI Agent 操作 Wiki 前读取） |
| `SCHEMA.md` | 框架宪章——分类法、标签、页面模板 |
| `index.md` | 完整目录，含各领域页面数量 |
| `log.md` | 仅追加式所有操作审计日志 |

---

## 4. 阅读论文

> **每次阅读都是 full.md 的精读。**
> 引文挖掘不是独立任务——它在阅读过程中自然发生。
> review.md 是产出（阅读记录），不是捷径。

### 阅读流程

```
                  ┌─────────────────────────┐
                  │   是否有 review.md？      │
                  └────────────┬────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  读 review.md         │
                    │  ├── 核实信息          │
                    │  ├── 常看常新          │
                    │  ├── 发现新细节        │
                    │  ├── 对比已有工作      │
                    │  └── 挖掘引文          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  加载领域上下文       │
                    │  ├── 相关 L2 页面     │
                    │  └── 相关 L3 页面     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  读 full.md          │
                    │  ├── 验证 review      │
                    │  ├── 发现新内容        │
                    │  ├── 检查参考文献      │
                    │  └── 记录引文          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  如有代码：          │
                    │  ├── git clone       │
                    │  └── 审查代码         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  更新 review.md      │
                    │  ├── 修正/补充内容    │
                    │  ├── 新发现          │
                    │  ├── 引文挖掘结果     │
                    │  └── 代码审查         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  如需更新 L2/L3：    │
                    │  更新 L2/L3 页面     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  更新 to-read.md    │
                    │  （引文挖掘结果）     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  总结本次阅读         │
                    │  更新 index.md       │
                    │  写入 log.md         │
                    └──────────────────────┘
```

### 详细步骤

#### 步骤 1：阅读 review.md（如果存在）

重读论文的目标：

| 目标 | 问题 |
|------|----------|
| 核实 | YAML 前言是否正确？评分还合理吗？ |
| 常看常新 | 积累了更多知识后，对论文是否有新看法？ |
| 发现 | 上次遗漏了什么细节？ |
| 对比 | 与之后读过的论文相比如何？ |
| 引文挖掘 | 检查 Related Work、实验基线、直接前驱 |

#### 步骤 2：加载领域上下文（相关 L2 + L3）

**问题：** 没有积累知识就读论文，审读会很肤浅——你不知道这条谱系已有哪些方法、探索过什么设计权衡、存在哪些开放问题。

**解决方案：** 读 full.md 之前，先加载相关领域知识页面。**不是全部——只加载与这篇论文直接相关的。**

如何找到正确的页面：

1. **已分类的论文（review.md 已存在）：**
   ```
   # 阅读该论文所属的 L2 谱系页面
   read paperweave/L2_lineage/<domain>/<task>/<approach>.md
   ```

2. **新论文（刚摄取）：**
   ```
   # a: 从标题+摘要确定 domain/task
   # b: 找到最匹配的 L2 页面
   find paperweave/L2_lineage/<domain>/ -name "*.md"
   # c: 读取最佳匹配
   ```

3. **L3 模块页面——按相关性加载，不是全部：**
   - 根据论文的标签或领域：选择 1-2 个最相关的 L3 页面
   - 示例：遥感 VLM 论文 → `L3_module/modality-fusion.md` + `L3_module/geo-foundation-models.md`
   - 示例：自监督预训练论文 → `L3_module/pretraining-paradigm.md` + `L3_module/data-scarcity.md`
   - 不确定时，列出可用页面（`ls paperweave/L3_module/`），根据摘要关键词选择

**范围规则：**
- **最少：** 1 个 L2 页面（论文所属的）
- **最多：** 1 个 L2 页面 + 2 个 L3 页面
- **绝不加载全部 L2/L3**——这违背了目的。全量加载不是知识积累，是 token 浪费。

加载 L2 页面后，你知道：
- 这篇论文之前有哪些方法
- 该子领域的标准基线和基准
- 这篇论文在演化时间线中的位置

加载 L3 页面后，你知道：
- 该领域存在哪些开放问题
- 已记录的设计权衡
- 这篇论文解决（或没解决）哪些"未解问题"

#### 步骤 3：阅读 full.md

- 对照全文验证 review.md 中的论断
- 检查 References 部分，发现值得读的新论文
- 寻找之前遗漏的实验/讨论
- 记录新的关键洞见

#### 步骤 4：代码审查（如果开源）

```bash
# 克隆代码（跳过数据集和权重）
git clone --depth 1 --filter=blob:none <repo> paperweave/L0_raw/<slug>/code/
rm -rf code/.git code/*.pth code/*.ckpt code/data/

# 审查：
# - 实现与论文声明是否一致？
# - 实验是否支持结论？
# - 代码与同类工作相比如何？
```

输出写入 review.md 的 Notes 部分。

#### 步骤 5：更新 review.md

更新或创建论文的 `review.md`：

```yaml
---
slug: "paper-slug"
title: "Full Title"
authors:
  - "Author One"
  - "Author Two"
year: 2024
venue: "CVPR 2024"
tags: [domain, method, task]
score: 4
contribution: 4
soundness: 4
relevance: 5
open_source: true
code_url: "https://github.com/author/repo"
compute: "8×A100 80GB"
dataset_access: public
---

> **摘要：** 论文一句话总结。

## [YYYY-MM-DD] 阅读 / 重读

**评分：** 4/5
- 贡献度：4/5 — 原因
- 严谨性：4/5 — 原因
- 相关性：5/5 — 原因

**关键洞见：**
- 第一洞见
- 第二洞见

**笔记：**
- 期刊/会议信息、算力、代码可用性
- 备注的相关论文

**代码审查：**
- （如适用）
```

#### 步骤 6：更新 L2/L3（如需要）

如果论文揭示了新的跨论文模式或需要调整问题组织：

- 更新已有 L2 方法页面的对比表
- 用新的解决策略更新 L3 模块页面
- 不要在审完全部分类之前创建新的 L2 页面

#### 步骤 7：更新 to-read.md

引文挖掘在*阅读过程中*发生。发现值得读的论文时：

1. 检查是否已在 L0_raw 中（`grep -l "keyword" paperweave/L0_raw/*/review.md`）
2. 检查是否已在 to-read.md 中
3. 如果是新的：以格式 `- Short Name / Full Title (Authors, Year) — Venue — 1` 添加条目
4. 如果已列出：递增计数

**引文策展——质量优先于数量。** 不要把所有合格引用都倒进去。只选 3-8 篇对理解论文叙事至关重要的，按关系分类：

| 类别 | 包含什么 |
|----------|----------------|
| 直接谱系 | 直接前驱，同一团队 |
| 范式基础 | 论文依赖的基础技术 |
| 关键对手 | 论文声称击败的方法 |
| 设计空间对比 | 不同设计选择的兄弟方法 |

**以标题（而非 slug）对照 L0_raw 去重。** 许多论文的 slug 与惯用名无关（如 LLaVA = `visual-instruction-tuning`、CLIP = `learning-transferable-visual-models-from-natural-language-supervision`）。添加到 to-read.md 前，必须同时以短标题 grep review.md：

```bash
grep -ril "LLaVA|CLIP" paperweave/L0_raw/*/review.md 2>/dev/null
```

**质量过滤器**——只添加满足至少一项的论文：
- **顶会/顶刊：** Nature, Science, CVPR, ICCV, ECCV, NeurIPS, ICML, ICLR, AAAI, IJCAI, ACL, EMNLP, IEEE TGRS/GRSL, ISPRS, RSE, 遥感学报
- **RS 核心话题：** RS 基础模型、变化检测、高光谱、SAR、RS VLM
- **高影响力：** >20 引用 或来自顶级实验室（FAIR, DeepMind, OpenAI, MSR, Stanford, MIT, Berkeley, ETH, 清华, 北大, 武大LIESMARS, 中科院遥感所）
- **例外：** RS 核心论文（RS FM、RS+MoE/Mamba、高光谱+DL、SAR+DL、RS CD 新范式）即使低引用也收入

#### 步骤 8：总结 + 更新 index + 日志

- 审查 Wiki 是否需要结构调整
- 如果创建了新的 L2/L3 页面：更新 `index.md` 计数
- 追加 `log.md`：

```markdown
## YYYY-MM-DD action | description
- read: Paper Title (Authors, Year) — score N/5 — key takeaway
```

### 并行批量阅读（通过子 Agent）

处理大量论文时，委托给并行子 Agent：

```
delegate_task(tasks=[
  {goal: "阅读论文 A", context: "..."},
  {goal: "阅读论文 B", context: "..."},
  {goal: "阅读论文 C", context: "..."},
])
```

**规则：**
- 最多 3 个并行子 Agent
- 每个子 Agent 处理 1 篇论文
- L1_ecology（共享状态）→ 输出到 `/tmp/weaver-N-l1.json`，父进程稍后合并
- 每个子 Agent 遵循上述完整阅读流程

**子 Agent 上下文模板：**

```
Wiki: ${PAPERWEAVE_ROOT}/paperweave/
Paper slug: <slug>
full.md: <N> 行

按照 Paperweave 阅读流程操作：
1. 如果 review.md 存在：先读它
2. 加载相关 L2 谱系页面 + 1-2 个 L3 模块页面作为领域上下文
3. 完整阅读 full.md（不跳过）
4. 如果代码开源：克隆并审查
5. 更新/创建 review.md
6. 更新 L1_ecology 登记册
7. 如有新的 L2/L3 想法：更新页面
8. 更新 to-read.md（引文挖掘）
9. 更新 index.md + log.md
```

### 在其他 Agent 上运行流程（OpenCode、Claude Code 等）

阅读流程是 Agent 无关的。以下是一步一步的提示模板，可对任何编程 Agent 使用：

```
你正在对一篇论文运行 Paperweave 阅读流程。
项目：${PAPERWEAVE_ROOT}/
Wiki：${PAPERWEAVE_ROOT}/paperweave/

## 步骤 1：阅读 GUIDE.md 第 4 节（阅读论文）
阅读 GUIDE.md "阅读论文"部分的完整阅读流程。

## 步骤 2：加载领域上下文
找到并阅读这篇论文相关的 L2 谱系页面。
再读 1 个相关的 L3 模块页面。

## 步骤 3：阅读论文
论文 slug：<slug>

1. 阅读 ${PAPERWEAVE_ROOT}/paperweave/L0_raw/<slug>/review.md（如果有）
2. 完整阅读 ${PAPERWEAVE_ROOT}/paperweave/L0_raw/<slug>/full.md

## 步骤 4：产出新知识
在 ${PAPERWEAVE_ROOT}/paperweave/L0_raw/<slug>/review.md 末尾写入新章节，格式：

## [YYYY-MM-DD] 重读 — <agent-name>

**我读了：** 
- L2 页面：<路径>
- L3 页面：<路径>
- full.md：<行数> 行

**此前审读中未包含的新洞见：**
1. <你自己的分析，结合 L2/L3 上下文>
2. ...

**引文挖掘：** 从 References 部分列出 2-3 篇通过质量过滤器且尚未收入 L0_raw/ 的论文

**跨 Wiki 连接：**
- 对比 [[L2_lineage/...]]
- 关联 [[L3_module/...]]

## 步骤 5：更新 to-read.md
追加新的引文条目。更新顶部计数。

## 步骤 6：更新 log.md
追加：## [YYYY-MM-DD] re-read | <论文标题> — score X/5 | L2 <页面> + L3 <页面> context, full.md <N> 行，<M> 个新洞见 + <K> 个引文挖掘
```

---

## 5. 从 arXiv 摄取论文

### 流水线

```
搜索 → 质量过滤 → 去重 → 抓取 → 原始页面 → 分类 → L2 页面
```

### 步骤 1：搜索 arXiv

两种方法：

**方法 A — web_search（发现）：**

```
web_search("site:arxiv.org remote sensing foundation model 2025")
```

**方法 B — arXiv API（结构化元数据）：**

```
python3 tools/search_arxiv.py "<query>" --max 10 --sort date
```

### 步骤 2：质量过滤

只摄取满足至少一项条件的论文：

| 等级 | 遥感 | CV | ML/AI | NLP |
|------|---------------|----|-------|-----|
| S | ISPRS, RSE, Nature | CVPR, ICCV, ECCV | NeurIPS, ICML, ICLR | ACL, EMNLP |
| A | IEEE TGRS, GRSL | AAAI, IJCAI | JMLR, TPAMI | NAACL, TACL |
| A- | 遥感学报 | WACV, BMVC | AISTATS, UAI | CoNLL |

**兜底：** citationCount > 20 或来自顶级实验室。
**例外：** RS 核心话题（RS FM、RS+MoE/Mamba、高光谱+DL、SAR+DL、RS CD 新范式）——一律收取。

通过 Semantic Scholar 检查期刊/会议：

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:<id>?fields=publicationVenue,citationCount"
```

### 步骤 3：对照 Zotero 去重

```python
import sqlite3, re

DB = "${PAPERWEAVE_ROOT}/path/to/zotero.sqlite"  # Path to your Zotero SQLite database

def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def check_exists(title):
    """Check if paper exists in Zotero by title similarity."""
    norm = normalize(title)
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("""
        SELECT i.key, (SELECT v.value FROM itemData d
            JOIN itemDataValues v ON d.valueID = v.valueID
            JOIN fields f ON d.fieldID = f.fieldID
            WHERE d.itemID = i.itemID AND f.fieldName = 'title') as title
        FROM items i
        WHERE i.itemTypeID IN (
            SELECT itemTypeID FROM itemTypes
            WHERE typeName IN ('journalArticle','conferencePaper','preprint')
        )
    """).fetchall()
    for row in rows:
        if row['title'] and len(norm) > 20:
            n2 = normalize(row['title'])
            if norm in n2 or n2 in norm:
                return (True, row['title'], row['key'])
            w1, w2 = set(norm.split()), set(n2.split())
            if len(w1) > 5 and len(w2) > 5:
                overlap = len(w1 & w2) / min(len(w1), len(w2))
                if overlap > 0.75:
                    return (True, row['title'], row['key'])
    return (False, None, None)
```

### 步骤 4：抓取 + 创建原始页面

```bash
# 获取元数据
web_extract(urls=["https://arxiv.org/abs/<id>"])

# 提取全文（如需）
python3 tools/mineru_extract.py \
  --url "https://arxiv.org/pdf/<id>" \
  --slug "<paper-slug>" \
  --language en
```

输出位于 `paperweave/L0_raw/<slug>/full.md` 和 `paperweave/L0_raw/<slug>/images/`。

**批量提取——两阶段策略：**

阶段 1 — URL 优先（快速）：
```bash
cd ${PAPERWEAVE_ROOT}
python3 -u tools/batch_extract.py
```
使用 arXiv/DOI URL（如果有），回退到文件上传。有速率限制（提交间隔 10s）。可断点续传——跳过 `full.md` 已存在的论文。

阶段 2 — 文件重试剩余论文（较慢）：
```bash
python3 -u tools/retry_file_extract.py
```
从 Zotero zip 附件提取 PDF，通过 `mineru_extract.py --file` 上传。处理阶段 1 无法通过 URL 获取的付费墙论文（Elsevier、IEEE、Springer）。

预期产率：~67% 通过 URL（阶段 1）+ ~30% 通过文件（阶段 2）+ ~2% 无法提取（磁盘无 zip 文件）。

**提取后诊断检查清单：**
```bash
# 1. 检查所有 L0_raw 条目都有 full.md + images/
for d in paperweave/L0_raw/*/; do
  name=$(basename "$d"); ok="Y"
  [ ! -f "$d/full.md" ] && ok="N"; [ ! -d "$d/images" ] && ok="N"
  [ "$ok" != "Y" ] && echo "不完整: $name"
done && echo "完成"

# 2. 检查提取进度
ls paperweave/L0_raw/*/full.md | wc -l
```

### 步骤 5：分类到 L2

确定 `domain → task → approach`：

```python
def classify(title, abstract, categories):
    text = (title + " " + abstract).lower()
    # 领域关键词
    if any(k in text for k in ['remote sensing', 'satellite', 'sar', 'hyperspectral']):
        domain = 'remote-sensing'
    elif any(k in text for k in ['vision-language', 'multimodal', 'vlm']):
        domain = 'multimodal'
    elif any(k in text for k in ['image', 'segmentation', 'detection']):
        domain = 'computer-vision'
    # ... 更多领域
    return (domain, task, approach)
```

### 步骤 6：更新 L2 页面

将论文添加到对应 L2 方法页面的对比表中。如果该方法的页面尚不存在，用模板新建。

### 步骤 7：摄取后检查清单

- [ ] 论文出现在 `paperweave/L0_raw/<slug>/`
- [ ] 论文被至少一个 L2 方法页面引用（`sources` 前言字段）
- [ ] `index.md` 反映新计数
- [ ] `log.md` 有摄取摘要
- [ ] 无重复（Zotero 检查已通过）

---

## 6. 构建 L2 谱系页面

### 从零搭建

使用 L2 页面模板（见上文 §3）。批量构建时：

```python
# 批量创建目录
for domain, tasks in taxonomy.items():
    for task in tasks:
        mkdir -p f"paperweave/L2_lineage/{domain}/{task}/"

# 生成页面
for page_spec in pages:
    write_file(f"paperweave/L2_lineage/{page_spec['path']}", template_content)
```

### 从论文中提取数据用于对比表

为方法页面的每篇论文提取：

| 字段 | 来源 | 示例 |
|-------|--------|---------|
| title | full.md 标题 | "RingMo" |
| year | full.md 元数据 | 2022 |
| venue | 出版信息 | "IEEE TGSR" |
| method | 摘要 + 方法部分 | MAE + Swin Transformer |
| pretraining_data | 数据集部分 | {dataset, size, resolution, sources} |
| downstream_tasks | 实验 | scene_classification: AID, NWPU |
| key_metrics | 结果表格 | {"DIOR mAP50": "75.90%"} |
| compute | 方法/附录 | 8×A100-80G, 300 epochs |
| code_url | 结论/GitHub | "https://..." |

**不要用正则从 MinerU 输出提取。** MinerU 混合了 Markdown、HTML 表格和 LaTeX——正则完全不行。使用子 Agent 读取每篇 full.md 并提取结构化数据。

### 覆盖度检查

构建/更新方法页面后，验证每篇 L0_raw 论文都有 L2 归宿：

```python
all_slugs = set(os.listdir("paperweave/L0_raw"))
all_sources = set()
# 从所有 L2 页面前言的 `sources` 字段收集所有 slug
uncovered = all_slugs - all_sources
# 目标：>80% 覆盖率
```

---

## 7. 构建 L3 模块页面

L3 页面是**按问题组织**的，而非按方法。回答了 *"这个领域哪些关键问题还没解决？不同论文如何应对？"*

### 结构

1. **问题定义** — 为什么难
2. **设计轴** — 关键权衡维度
3. **解决策略** — 按方法类型，附带论文证据
4. **演化** — 解决方案如何随时间变化
5. **论文映射** — 哪些论文属于哪个范式
6. **开放问题** — 什么还没解决
7. **相关问题** — 跨链接到其他 L3 模块

### 关键 L3 主题（遥感）

| 模块 | 核心问题 |
|--------|---------------|
| `modality-fusion` | 早融合 vs 晚融合 vs 交叉注意力 vs MoE？ |
| `geo-foundation-models` | 什么造就优秀的 RS FM？MAE vs 对比学习 vs 监督？ |
| `model-efficiency` | 如何在不牺牲精度的情况下降低算力？ |
| `data-scarcity` | 自监督、小样本、迁移、弱标签——哪种在什么情况下最有效？ |
| `pretraining-paradigm` | MIM vs 对比学习 vs 监督——不同规模下的权衡？ |

---

## 8. 参考

### 标签分类法

5 个固定槽位：

| 槽位 | 含义 | 示例 |
|------|---------|---------|
| 领域 (Domain) | L2 领域范围 | `remote-sensing`, `cv`, `nlp`, `graph` |
| 方法 (Method) | L2 方法粒度 | `transformer`, `cnn`, `contrastive`, `moe` |
| 任务 (Task) | L2 任务粒度 | `classification`, `segmentation`, `detection` |
| 属性 (Attribute) | 跨切面 | `dataset`, `benchmark`, `survey`, `theory` |
| 元 (Meta) | 关于知识的知识 | `comparison`, `controversy`, `tutorial` |

**扩展规则：** 优先用 `已有标签-1 + 已有标签-2`，而非创建新标签。

### 评分标准

| 分数 | 含义 |
|-------|---------|
| 5 | 卓越——改变了我的思考方式 |
| 4 | 优秀——愿意在其基础上构建或引用 |
| 3 | 尚可——有用但是增量性的 |
| 2 | 薄弱——有重大缺陷 |
| 1 | 差——不值得读 |

子维度：`contribution`（新颖性）、`soundness`（严谨性）、`relevance`（与研究的相关性）。

### 变更后需更新的文件

1. `SCHEMA.md` — 如果阈值或分类规则改变
2. `AGENT.md` — 如果工作流步骤改变
3. `index.md` — 每次结构变化（创建/归档/拆分）
4. `log.md` — 每次操作（仅追加）
5. `to-read.md` — 每次读论文（引文挖掘）

### 常见陷阱

| 陷阱 | 解决方案 |
|---------|----------|
| review.md 太简略，无法支持引文挖掘 | 始终读 full.md。review.md 是产出，不是输入。 |
| 子 Agent 在大型 full.md 上超时 | 1000+ 行 → 使用 pro 模型或缩小批量 |
| 领域名称不一致 | 阶段 1 分类后始终做归一化 |
| 并行子 Agent 导致 L1 文件冲突 | 输出到 /tmp/weaver-N-l1.json，集中合并 |
| 孤儿论文（无 L2 归宿） | 每次重建后运行覆盖度检查 |
| MinerU 产物堆积 | 提取后清理 layout.json、content_list.json |
| 子 Agent 年份提取错误 | 手动验证年份，尤其是预印本 |
