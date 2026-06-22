# Paperweave 知识库

## 这是什么

**👤 For Human**

一个精心维护的五层学术文献知识库 — 144 篇论文、61 个方法谱系页面、8 个问题模块、4 个期刊画像，覆盖遥感、计算机视觉、多模态、NLP、图学习等领域。

这不是演示。这是一个活跃的、研究者亲自维护的知识库，你可以克隆下来继续构建。每个页面都是全文通读、跨论文综合和引文挖掘的产物。

## 数据统计

**🤖👤 For Both**

- 144 篇论文（L0_raw，不含在仓库中 — 通过摄入流水线构建）
- 141 篇论文 review（评分、洞见、引文挖掘）
- 61 个 L2 方法谱系页面，覆盖 10 个研究领域
- 8 个 L3 问题模块
- 4 个 L4 期刊/会议画像
- 3 个 L1 生态注册表（461+ 作者、80 机构、36 期刊）

## 五层模型

**👤 For Human**

| 层级 | 目录 | 核心问题 | 内容 |
|------|------|----------|------|
| **L0** | `L0_raw/` | 原文是什么？ | 不可变层。论文全文、图片、代码。*（不含在仓库中 — 通过摄入流水线自行构建）* |
| **L1** | `L1_ecology/` | 谁和谁合作？ | 3 个注册表：461+ 作者、80 机构、36 期刊/会议 |
| **L2** | `L2_lineage/` | 方法如何演进？ | 61 个方法对比页面，domain → task → approach 三级组织 |
| **L3** | `L3_module/` | 存在哪些问题？ | 8 个跨论文问题综合分析，含证据和权衡 |
| **L4** | `L4_editorial/` | 投哪里？ | 4 个期刊/会议画像，含遥感工作定位策略 |

每一层从不同维度组织知识，层间通过 `[[wikilink]]` 交叉引用。

## 你可以用它做什么

**👤 For Human**

- **继续阅读**：克隆后用 papereader 阅读已 review 的论文
- **扩展**：L1 注册表和 L2 谱系页面设计为持续增长 — 添加你自己的论文
- **学习方法论**：研究 strand pages 了解如何组织自己的文献
- **构建自己的 wiki**：用 `docs/BUILD.md` 搭建摄入流水线，启动你自己的实例

## Review 格式

**🤖 For Agent**

Review 文件位于 `L0_reviews/<slug>/review.md`。每篇 review 是人类研究者和/或 AI Agent 通读全文后的产物。

**YAML frontmatter：**
- `title`、`authors`、`year`、`venue`
- `score`（1-5 综合评分）、`contribution`、`soundness`、`relevance`
- `tags` — 领域、方法类型、任务
- `open_source`、`code_url`、`compute`、`dataset_access`

**正文：**
- 摘要总结
- 带日期的 review 记录（初读 + 重读）
- 关键洞见和笔记
- 引文挖掘结果（发现的论文加入待读队列）

**撰写 review 时**，请使用上述结构。在 review 正文中使用 `[[wikilink]]` 交叉引用其他层级。统计：144 篇论文中已 review 141 篇，多篇含 2 次以上重读记录（2025-05 至 2026-06）。

## 目录结构

**🤖👤 For Both**

```
paperweave/
├── L0_reviews/        # 141 篇论文 review（评分、洞见、引文挖掘）
├── L1_ecology/        # 3 个注册表：作者、机构、期刊
├── L2_lineage/        # 61 个页面，覆盖 10 个研究领域
├── L3_module/         # 8 个问题综合分析
├── L4_editorial/      # 4 个期刊/会议投稿策略
├── README.md          # 英文版
└── README_zh.md       # 本文件
```

## 相关文档

- [docs/SPEC.md](../docs/SPEC.md) — 协议规范（五层模型、YAML schema、API 契约）
- [docs/GUIDE.md](../docs/GUIDE.md) — 完整用户指南（阅读流程、摄入、agent 使用）
- [docs/BUILD.md](../docs/BUILD.md) — 构建指南（环境搭建、摄入流水线、cron）
