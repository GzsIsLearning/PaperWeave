---
slug: "ccnet-extracting-high-quality-monolingual-datasets-from-web-crawl-data"
title: "CCNet: Extracting High Quality Monolingual Datasets from Web Crawl Data"
authors:
  - "Guillaume Wenzek"
  - "Marie-Anne Lachaux"
  - "Alexis Conneau"
  - "Vishrav Chaudhary"
  - "Francisco Guzman"
  - "Armand Joulin"
  - "Edouard Grave"
year: 2020
venue: "LREC 2020"
tags: [NLP, data-processing, web-crawl, language-modeling, CCNet]
score: 3
contribution: 3
soundness: 4
relevance: 2
open_source: true
code_url: "https://github.com/facebookresearch/cc_net"
compute: "5000 CPU cores, 8.5h/snapshot"
dataset_access: public
---

> **Abstract:** CCNet提出自动化pipeline从Common Crawl中提取高质量单语数据集，通过去重、语言识别和基于Wikipedia语言模型困惑度的质量过滤，支持176种语言。

## [2026-05-02] Weave Review

**Score:** 3/5
- Contribution: 3/5 — 工程设计贡献：将fastText管道扩展到176种语言，引入基于Wikipedia LM perplexity的文档质量过滤。为后续LLM训练提供了关键数据基础设施（LLaMA等模型使用了CCNet数据）。
- Soundness: 4/5 — Pipeline各阶段有详细分析和消融（去重策略、LM过滤阈值等），提供了完整的数据统计和语言分布。
- Relevance: 2/5 — NLP数据预处理工程，与遥感领域直接关联较弱。但大规模数据清洗理念对遥感大数据集构建有参考价值。

**Key Insights:**
- 去重去除70%段落内容，主要是导航菜单、cookie警告等样板文本
- LM perplexity过滤有效提升语料质量：基于Wikipedia训练的LM对高质量文档给出低perplexity
- 处理一个CC snapshot仅需8.5小时（5000 CPU核），产出1.5B文档/174语言

**Notes:**
- Facebook AI Research出品
- 产出的数据集（CC-Net）被LLaMA等模型使用
- 与CommonCrawl、OSCAR等构成大规模语言数据集生态

## [2026-05-02] Verified — scores and insights reasonable. Quick re-scan confirmed.

## [2026-05-08] Re-review: 新见解、引用挖掘与跨 wiki 连接

### 新增洞察

1. **数据质量过滤的通用范式**：CCNet 提出的"去重 → LID → LM perplexity 过滤"三阶段 pipeline，实际上构建了一个**多层次数据质量信用评分体系**。去重去除样板文本（70%），LID 过滤混入的其他语言，LM perplexity 则作为语义质量的代理指标。这种分层过滤哲学后来被 FineWeb/FineWeb-Edu（HuggingFace 2024）继承并改进——使用更先进的 FastText 分类器替代 n-gram LM。

2. **LM perplexity 的语义局限性**：论文本身承认了一些高质量但词汇分布与 Wikipedia 差异大的文档（如专业论坛、技术博客）被放入 tail。这表明**perplexity 作为质量指标存在语义覆盖盲区**——高 perplexity 不一定意味着低质量。后续工作如 DCLM（DataComp-LM）使用更细致的质量标准来弥补这一不足。

3. **从段落去重到语义去重**：CCNet 的 SHA-1 哈希去重仅删除完全相同的段落，无法检测语义相似但表述不同的内容。2024-2025 年的工作开始使用句子嵌入（如 Sentence-BERT）进行语义级去重，这是对 CCNet 的重要扩展方向。

### 代码检查

- 仓库：https://github.com/facebookresearch/cc_net
- 结构：`cc_net/` 模块化设计，分 `hashes`, `mine`, `regroup` 三步
- `mine` 模块（`cc_net/mine.py`）是核心，集成了 dedup + LID + LM filtering
- `process_wet_file.py` 处理每个 WET 文件的解析和写入
- 使用 `func_argparse` 做 CLI 参数解析，支持配置文件（JSON）
- 依赖 KenLM（C++）和 SentencePiece，体现了对性能的重视
- 生产级设计：支持分布式执行、多语言配置、断点续传
- **与遥感领域的对比**：遥感数据清洗（如 fMoW 的 Geo-filtering、BigEarthNet 的 S1/S2 配准）远不如 NLP 领域成熟。CCNet 的自动化质量控制 pipeline 对构建大规模遥感预训练数据集（如 SSL4EO、GeoPile）有直接借鉴意义。

### Cross-Wiki 连接

- **L2_lineage/nlp/language-modeling/transformer-based.md**：CCNet 作为 LLM 数据基础设施的关键一环，与其他预训练工作（BERT, GPT, RoBERTa）形成完整数据链
- **L3_module/pretraining-paradigm.md**：CCNet 的数据质量哲学（"data quality > data quantity"）与遥感预训练中的"小规模高质量域内数据 > 大规模通用数据"观点一致
- **L3_module/data-scarcity.md**：遥感领域的"标注稀缺"类似于 NLP 中"低资源语言"问题。CCNet 对低资源语言的自动数据提取策略（为每个语言独立训练 LM）可直接映射到遥感中的"少样本地区/传感器"问题
- **L0_raw/foundation-models-in-remote-sensing-evolving-from-unimodality-to-multimodality.md**：该综述强调"预训练数据必须来自遥感域"，与 CCNet 的"target domain LM filtering"逻辑同构
- **L0_raw/on-the-foundations-of-earth-foundation-models.md**：Nature 2025 论文提出的地理多样化数据集需求，与 CCNet 的多语言数据覆盖策略形成跨域呼应

### 引用矿

- **被 FineWeb 引用**：FineWeb (2024, HuggingFace) 借鉴了 CCNet 的层级过滤架构，但使用更先进的分类模型替代了 n-gram LM
- **被 LLaMA 引用**：LLaMA (Touvron et al., 2023) 的训练数据中包含了 CCNet 产出的数据
- **被 OSCAR 引用**：OSCAR (Ortiz Suarez et al., 2019) 相关工作对比
- **被 DCLM 引用**：DataComp-LM (Li et al., 2024) 在数据过滤部分的 baseline

### 与 Transformer 图谱的连接

CCNet 处于预训练数据供应链的关键节点：
```
Attention → BERT/GPT → CCNet (数据清洗) → BERT/RoBERTa/LLaMA
                                              ↓
                                          XLM-R, GPT-3, LLaMA
```

在遥感领域，类似的"数据供应链"尚未建立——缺少类似 Common Crawl 的统一遥感数据仓库和 CCNet 这样的自动化清洗 pipeline。

## [2026-06-07] Re-review: 再读 full.md + 图片分析 + 代码重审后的新洞察

### 图片分析新发现

1. **Pipeline 架构图（Figure 1）**：CCNet 的 pipeline 是一个**两阶段 MapReduce 架构**。第一阶段并行计算所有段落的 SHA-1 哈希（Paragraph hashes → .bin），第二阶段用这些哈希对原始 WET 文件进行去重+语言识别+LM 过滤。这种"先计算指纹、再过滤内容"的设计使得去重可以在 O(N) 时间内完成，而非 O(N²) 的成对比较。关键工程细节：1600 个 shard 并行处理，每个 shard 约 160 万文档。

2. **语言分布图（Figure 2/6）**：对数尺度下的语言文档数分布揭示了**严重的长尾效应**。英语占 7.06 亿文档，而 130+ 种语言的文档数不足 1000。这种分布与遥感数据集的地理偏见（北美/欧洲主导）形成跨域呼应——两者都面临"数据不平等"问题。

3. **perplexity 分布图（Figure 7）**：英语（训练于 534M 文本）的 perplexity 分布尖锐且集中在低值区（~500-600），而古吉拉特语（训练于仅 12M 文本）的分布平坦且右偏（~1100-1200）。这直接说明：**LM 过滤质量严重依赖于目标域训练数据的规模**。对遥感的启示：如果用少量遥感数据训练质量过滤 LM，其区分能力将显著弱于用大规模数据训练的版本。

### 代码重审新发现

- `cc_net/dedup.py` 中的 `str_hash` 使用 SHA-1 的前 64 位作为哈希键，通过 `flat_hash_set.py` 中的内存高效哈希集实现 O(1) 查询。去重范围可配置（1 shard 到全部 1600 shards），50 shards（3% 语料）是内存（40GB RAM）与去重效果的 sweet spot。
- `cc_net/perplexity.py` 使用 KenLM（C++）实现 5-gram Kneser-Ney LM，SentencePiece 做子词分词。`pp()` 函数将 log_score 转换为 perplexity：`10^(-log_score/length)`。
- `cc_net/mine.py` 的 `DEFAULT_PIPELINE` 明确列出了处理顺序：`dedup → lid → keep_lang → sp → lm → pp_bucket → drop → split_by_lang`。这个顺序至关重要——去重必须在语言识别之前（去除英语样板文本提升低资源语言的 LID 准确率，Figure 3 证实这一点）。

### 新洞察：数据质量评估的"代理指标陷阱"

CCNet 的核心假设是"Wikipedia 风格 = 高质量"。但 full.md 中作者自己也承认："Some documents despite being valid text ends up in the tail because they have a vocabulary very different from Wikipedia. This includes blog comments with spoken-like text, or very specialized forums with specific jargon." 这揭示了一个**代理指标盲区**：

- 对于 LLM 预训练，口语化文本和技术论坛内容可能同样有价值（甚至更有价值，因为它们覆盖 Wikipedia 未涉及的领域）。
- FineWeb/FineWeb-Edu（2024）后来用 fastText 分类器替代 n-gram LM，部分就是为了缓解这一问题。
- 对遥感的映射：如果用"标准遥感数据集"（如 BigEarthNet）作为质量基准来过滤新的遥感数据源，可能会系统性地排除非标准场景（如灾害响应、城市边缘、极地等）——这些恰恰是实际应用中最重要的场景。

### 跨 Wiki 连接更新

- **L2_lineage/nlp/language-modeling/transformer-based.md**：CCNet 的 pipeline 设计（两阶段 MapReduce + 可配置去重范围）为后续大规模数据处理系统（如 HuggingFace 的 datatrove）提供了架构模板。
- **L3_module/pretraining-paradigm.md**：CCNet 的"目标域 LM 过滤"策略与遥感预训练中的"域内数据优先"原则一致，但 CCNet 的代理指标局限性提醒我们：遥感数据质量评估不能仅依赖与现有数据集的相似度。
- **L3_module/data-scarcity.md**：低资源语言的数据提取策略（为每种语言独立训练 LM）可直接映射到遥感中的"少样本传感器/地区"问题——为每个传感器或地理区域独立训练质量评估模型可能是必要的。

### 引用矿更新

- **新增待读**：FineWeb (HuggingFace, 2024) — CCNet 的直接后继，用更先进的分类器替代 n-gram LM
- **新增待读**：DataComp-LM (Li et al., 2024) — 系统比较数据过滤策略对 LM 性能的影响
- **新增待读**：OSCAR (Ortiz Suárez et al., 2019) — CCNet 的前驱工作，异步 pipeline 设计
