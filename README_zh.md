# Paperweave 

**🤖👤 For Both**

> **Paperweave 是一个面向 AI Agent 的学术文献知识库系统——把论文变成可查询、可演化、可协作的知识图谱。**

---

## Paperweave 做什么

**👤 For Human**

- **结构化知识图谱** — 5 层知识模型，从原始论文到出版策略全覆盖
- **全文精读阅读器** — 带 LLM 翻译 / chat / 高亮 / 星标的 Web Reader
- **AI Agent 原生** — 一个命令即可让 Agent 自动读论文、写 review、更新知识库
- **引用挖掘** — 阅读过程中自动发现关键引用，构建研究脉络

---

## 一个具体例子

**👤 For Human**

你把一篇 arXiv 论文拖进来，它：

1. **提取** — MinerU 把 PDF 转成 `full.md`，包含全文 + 图表 + 公式
2. **Review** — 你的 AI Agent 自动写出一份结构化 review：打分、核心洞见、代码审查
3. **分类** — 自动判定 domain → task → approach，归入对应的 Lineage 谱系
4. **精读** — 你在一个带 LLM 翻译 / chat / 高亮 / 星标的阅读器里逐段阅读
5. **引用挖掘** — 阅读过程中自动发现 3-8 篇关键引用，加入待读队列

```
arxiv.org/abs/2304.08485
       │
       ▼
   MinerU 提取
       │
       ▼
 paperweave/L0_raw/visual-instruction-tuning/
   ├── full.md          ← 全文 + 所有图表公式
   ├── review.md        ← Agent 写的结构化 review
   ├── images/          ← 提取的图片
   └── code/            ← 克隆的开源代码
       │
       ▼
   自动分类 → L2_lineage/multimodal/vlm/late-fusion.md
       │
       ▼
   Reader 里精读：高亮关键段落 → Chat 问具体问题 → 翻译晦涩句式
```

---

## Agent-First 安装

**🤖 For Agent**

```bash
git clone https://github.com/nousresearch/paperweave-v1.git && cd paperweave-v1 && python3 -m venv .venv && source .venv/bin/activate && pip install -r papereader/requirements.txt && cp papereader/.env.example .env
```

安装完成后，编辑 `.env` 填入 API keys，然后：

```bash
cd papereader && bash start.sh          # 启动阅读器服务器
python skills/paper-agent/agent.py ingest --arxiv <id>  # 摄入论文
python skills/paper-agent/agent.py review <slug>       # 自动阅读 + review
```

> 详细构建指南请参阅 [docs/BUILD.md](./docs/BUILD.md)

---

## 架构概览：五层知识模型

**👤 For Human**

```
                         ┌──────────────────────────┐
                         │   L4 — Editorial (出版)    │
                         │   投哪里？怎么定位？         │
                         ├──────────────────────────┤
                         │   L3 — Module (问题)       │
                         │   有什么问题？试过什么？      │
                         ├──────────────────────────┤
                         │   L2 — Lineage (演化)      │
                         │   方案怎么一步步演进的？      │
                         ├──────────────────────────┤
                         │   L1 — Ecology (生态)      │
                         │   谁和谁在合作？             │
                         ├──────────────────────────┤
                         │   L0 — Raw (原始)          │
                         │   不可变的论文全文           │
                         └──────────────────────────┘
```

| 层级 | 名称 | 回答的问题 | 位置 |
|------|------|-----------|------|
| **L0** | Raw Source Material | 我有哪些论文？ | `paperweave/L0_raw/<slug>/` |
| **L1** | Ecology (文献社交生态) | 谁和谁合作？ | `paperweave/L1_ecology/` |
| **L2** | Lineage (方法演化) | 方案怎么演进的？ | `paperweave/L2_lineage/<domain>/<task>/<approach>.md` |
| **L3** | Module (问题驱动) | 有什么问题？试过什么？ | `paperweave/L3_module/<problem>.md` |
| **L4** | Editorial (出版指南) | 投哪里？怎么定位？ | `paperweave/L4_editorial/` |

**L0 是不可变的原始论文全文（通过摄入流水线自行构建）。L1-L4 是不断演化的合成知识——144 篇论文、61 个谱系页面、8 个问题模块、4 个期刊画像，可直接阅读。**

---

## 快速开始

**👤 For Human**

```bash
# 启动 Web Reader
cd papereader && bash start.sh
# 浏览器访问 http://localhost:8899
```

**前提条件：**
- Python 3.10+
- MinerU API key（PDF 提取）：在 `.env` 中设置 `MINERU_TOKEN`
- （可选）Zotero SQLite 用于去重

---

## 文档索引

**🤖👤 For Both**

| 文档 | 内容 |
|------|------|
| [docs/SPEC.md](./docs/SPEC.md) | Paperweave Protocol v1.0 — 五层知识模型、文件格式、API 契约、摄取流水线、Agent 交互标准 |
| [docs/AGENTS.md](./docs/AGENTS.md) | AI Agent 操作手册 — 如何克隆、配置、启动、摄入论文、自动 review、常见故障排除 |
| [docs/GUIDE.md](./docs/GUIDE.md) | 完整用户指南 — 阅读流程、论文摄入、L2/L3 页面构建、自动化 cron |
| [docs/BUILD.md](./docs/BUILD.md) | 完整构建指南 — 从零搭建环境、配置、运行、测试 |

---

## 目录结构

**🤖👤 For Both**

```
paperweave-v1/
├── docs/                     📚 全部文档（SPEC、AGENTS、GUIDE、BUILD）
├── paperweave/               📖 知识库：144 篇论文、141 篇 review、
│   ├── L0_reviews/               61 个 L2 谱系页面、8 个 L3 问题模块、4 个 L4 期刊画像
│   ├── L1_ecology/
│   ├── L2_lineage/
│   ├── L3_module/
│   └── L4_editorial/
├── papereader/               🌐 Web Reader 参考实现
│   ├── server.py
│   ├── export.py
│   ├── start.sh
│   └── static/
└── skills/                   🤖 5 个封装技能（pdf-extract、zotero-bridge、
    ├── pdf-extract/              auto-ingest、paper-agent、curation）
    ├── zotero-bridge/
    ├── auto-ingest/
    ├── paper-agent/
    └── curation/
```

---

## 开源许可

MIT License — 详见 [LICENSE](./LICENSE)

---

*Paperweave v1 — "常看常新"：每一次重读，都是新的一次理解。*
