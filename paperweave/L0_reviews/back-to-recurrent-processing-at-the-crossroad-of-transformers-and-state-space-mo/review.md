---
slug: "back-to-recurrent-processing-at-the-crossroad-of-transformers-and-state-space-mo"
title: "Back to Recurrent Processing at the Crossroad of Transformers and State-Space Models"
authors:
  - "Matteo Tiezzi"
  - "Michele Casoni"
  - "Alessandro Betti"
  - "Tommaso Guidi"
  - "Marco Gori"
  - "Stefano Melacci"
year: 2025
venue: "Nature Machine Intelligence (Review)"
tags: [transformer, state-space-model, RNN, survey, sequence-modeling]
score: 4
contribution: 3
soundness: 4
relevance: 4
open_source: false
code_url: ""
compute: "N/A (综述)"
dataset_access: public
---

> **Abstract:** 综述了Transformer和State-Space Model交叉地带涌现的新一代循环模型，统一在"recurrence"框架下讨论线性递归单元(LRU)、Mamba等新架构，分析其在大规模生成模型中的潜力和挑战。

## [2026-05-02] Weave Review

**Score:** 4/5
- Contribution: 3/5 — 综述性质，主要贡献是将Transformer、SSM和现代RNN统一在recurrence框架下进行系统性梳理。视角新颖（将attention视为一种"parallel recurrence"），但无新方法提出。
- Soundness: 4/5 — 覆盖了从Elman RNN到Mamba/Linear Recurrent Units的完整谱系，包括线性RNN、deep SSMs、continuous-time models。分析深入，对梯度流（BPTT中的Jacobian乘积）有理论阐述。
- Relevance: 4/5 — 对遥感时序数据处理有重要参考价值。SSM/Mamba等新架构可能在遥感时序（物候、变化检测时序）中替代Transformer，提供线性复杂度。

**Key Insights:**
- 当前新架构（Linear RNNs, SSMs, Mamba等）融合了RNN的序列处理和Transformer的并行训练能力
- SSM从连续时间动力系统出发，通过离散化得到RNN形式的递推——统一了两种视角
- 线性递归单元（LRU）去除了非线性激活，使BPTT中的Jacobian乘积简化，梯度更稳定
- 对遥感FM的启示：SSM/Mamba架构可能更适合处理长时序遥感数据（如多年NDVI序列）

**Notes:**
- IIT + University of Siena出品，发表于Nature MI
- 与Mamba (Gu & Dao, 2023)和LRU (Orvieto et al., 2023)等构成新一代序列建模技术栈

## [2026-05-02] Verified — scores and insights reasonable. Quick re-scan confirmed.

## [2026-05-25] Re-Review

**深度重读洞察：**
- **Hybrid architectures 是当前最值得关注的路线**：Griffin (Google DeepMind, 2024) 将 gated linear recurrences 与 local attention 混合，Jamba (AI21, 2024) 结合 transformers + Mamba + MoE，Zamba (2024) 用单个 shared attention 模块配合 Mamba backbone。Poli et al. (ICML 2024) 的系统研究表明：约 1/4 自注意力层 + 3/4 SSM 层是计算最优的混合比例。这直接反驳了 "attention is all you need" 的纯粹主义。
- **SSD (Structured State Space Duality, Dao & Gu, ICML 2024)** 是本文发表后的关键理论进展：它证明 SSM 和 structured masked attention 是彼此的 dual，由此诞生的 Mamba-2 将并行投影和归一化层引入 SSM 设计，模糊了 transformer 和 SSM 的边界。本文作为 Nature MI Review 恰好发表于这一转折点之前，未能覆盖 Mamba-2，是其时效性局限。
- **线性递归的表达能力边界** 已被 Jelassi et al. (ICML 2024) 形式化证明：SSM 在复制/召回任务上弱于 transformer。这解释了为什么 pure SSM (如 Mistral 7B 的 attention-only  competitor) 在复杂语言建模上仍落后，也解释了 hybrid 方案的必然性。
- **硬件效率是算法设计的硬约束**：FlashAttention-2 通过 tiling 和重计算解决内存墙；Griffin 的 custom TPU kernel 和 chunked vector memory 设计表明，线性复杂度算法若无硬件感知实现，理论优势无法兑现。这对遥感星载/机载边缘部署有重要启示。
- **Online infinite-length learning** 是本文提出的开放方向之一，但现有 BPTT 算法均针对有限序列设计。Zucchet et al. (NeurIPS 2023) 的 forward-mode gradient 和 Marschall et al. (JMLR 2020) 的在线 RNN 学习框架是潜在路径，但尚未与 SSM 结合。

**对遥感的迁移价值（新增）：**
- 遥感时序数据（多年物候、变化检测时序）具有天然的长序列特性，但当前遥感 FM 几乎全部基于 Transformer（SatMAE, Prithvi, SeaMo 等）。本文梳理的 linear recurrence + diagonal state matrix + exponential parameterization 技术栈可直接迁移到遥感时序编码器设计，替代昂贵的自注意力。
- 具体切入点：将 SatMAE 的时间编码器从 transformer 替换为 LRU 或 Mamba block，可将时序复杂度从 O(T²) 降至 O(T)，同时保留长程依赖能力。这在高时间分辨率卫星（PlanetScope 1-5天重访）的长时序分析中尤为关键。

**Citation Mining：**
- `[NEW]` Dao & Gu, "Transformers are SSMs", ICML 2024 — SSD 理论统一框架
- `[NEW]` Poli et al., "Mechanistic design and scaling of hybrid architectures", ICML 2024 — 混合架构比例优化
- `[NEW]` De et al., "Griffin", 2024 — Google DeepMind 的 LRU+local attention 混合
- `[NEW]` Beck et al., "xLSTM", NeurIPS 2025 (advanced online) — LSTM 的现代化 revival
- `[NEW]` Jelassi et al., "Repeat after me: transformers are better than state space models at copying", ICML 2024 — SSM 表达能力边界
- `[NEW]` Team Jamba, "Jamba-1.5", 2024 — Transformer-Mamba-MoE 工业级架构
- `[NEW]` Glorioso et al., "Zamba", 2024 — 7B SSM-transformer 混合
- `[NEW]` Zucchet et al., "Online learning of long-range dependencies", NeurIPS 2023 — 前向梯度在线学习

**跨 wiki 连接：**
- 关联 [[L3_module/model-efficiency]] — 线性递归模型（LRU, Mamba）是"效率悖论"中挑战大 Transformer 的核心技术路线；Griffin/Jamba 的硬件感知设计为遥感边缘部署提供参考
- 关联 [[L3_module/pretraining-paradigm]] — SSM 预训练范式仍处于早期，尚未出现遥感领域的 SatMAE-for-SSM；这是潜在的范式空白
- 关联 [[L2_lineage/nlp/language-modeling/transformer-based]] — 该 L2 页面需更新以纳入 SSM/hybrid 分支，当前仅覆盖到 Attention Residuals (2025)，缺少 Mamba/SSD 谱系
