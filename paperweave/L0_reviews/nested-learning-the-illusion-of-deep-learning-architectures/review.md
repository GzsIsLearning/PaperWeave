---
slug: "nested-learning-the-illusion-of-deep-learning-architectures"
title: "Nested Learning: The Illusion of Deep Learning Architectures"
authors:
  - "Ali Behrouz"
  - "Meisam Razaviyayn"
  - "Peilin Zhong"
  - "Vahab Mirrokni"
year: 2025
venue: "NeurIPS"
tags: [ml-theory, optimization, transformers, associative-memory, continual-learning]
score: 4
contribution: 5
soundness: 3
relevance: 3
open_source: false
code_url: ""
compute: "8×GPU (340M-1.3B models)"
dataset_access: public
---

> **Abstract:** Nested Learning (NL) reformulates deep learning models as nested, multi-level optimization problems, revealing that everything from SGD with momentum to Transformers are associative memory systems compressing their own "context flow." Presents HOPE: a self-referential sequence model with continuum memory system (CMS) that learns to modify its own update rule.

## [2026-05-02] Review

**Score:** 4/5
- Contribution: 5/5 — Radically novel perspective. The mathematical decomposition showing that optimizers (SGD, Adam, momentum) are associative memories, and that Transformers are multi-level nested optimization problems, is intellectually profound. HOPE architecture operationalizes these insights.
- Soundness: 3/5 — The theoretical framework is compelling but experiments are limited. Only language modeling + commonsense reasoning reported in main paper (much relegated to appendix due to NeurIPS page limits). HOPE shows good but not dominant results (1.3B: 20.53 ppl Wiki, 52.26 avg on benchmarks). Claims about "higher-order in-context learning" need more validation.
- Relevance: 3/5 — The associative memory as optimizer insight is broadly applicable. The continuum memory system (MLPs with different update frequencies) is relevant to multi-temporal EO modeling. However, this is primarily a theoretical ML paper, not an applied one.

**Key Insights:**
- Gradient descent with momentum = 2-level associative memory: inner level stores gradients, outer level updates weights.
- Adam with a small modification is the optimal associative memory for model gradients (proven in appendix).
- HOPE's continuum memory system: MLPs for different frequency bands, enabling knowledge storage at multiple timescales.
- Self-referential Titans: model learns to modify its own update algorithm, going beyond fixed recurrence.

**Citation Mining:**
- Nested Learning [this paper] — theoretical foundation
- SGD with momentum [Polyak, 1964] — optimizer as associative memory
- Titans [Behrouz et al., 2024] — self-referential architecture
- Muon [Jordan et al., 2024] — deep optimizer

**L1 Ecology Observations:**
- HOPE's continuum memory system (MLPs at different frequencies) is relevant for multi-temporal RS modeling
- Associative memory as optimizer insight could improve RSFM optimization
- Self-referential architectures (learning to modify own update rule) could enable adaptive RSFM

## [2026-06-11] Re-review (Full Text Re-read #2)

**Score: 4/5** (维持原评分)

**新增洞察:**

1. **Nested Learning 与 Attention is Not All You Need 的理论互补** — 重读两篇论文后，发现它们从不同角度解释了 Transformer 有效性的同一底层机制：
   - Dong et al. (2021) 从**前向动力学**证明：纯 self-attention 导致 rank collapse（双指数收敛到 rank-1），而 skip connection 是阻止崩塌的最强防御。
   - Behrouz et al. (2025) 从**优化动力学**证明：Transformer 的每一层都是嵌套优化问题，skip connection + LayerNorm + MLP 共同构成了多频率更新的记忆系统。
   - **互补性**：Dong 告诉我们"没有 skip connection 会发生什么"，Behrouz 告诉我们"有了 skip connection 后优化器在做什么"。两者合起来构成 Transformer 完整理论图景。

2. **HOPE 的 Continuum Memory System 对遥感时序建模的启发** — CMS 的核心思想是不同频率的 MLP 块对应不同时间尺度的知识存储（高频块处理短期模式，低频块处理长期模式）。这与遥感时序数据的**多尺度时间结构**天然匹配：
   - 高频（日/周尺度）：作物生长快速变化、天气变化
   - 中频（月/季节尺度）：物候周期、季节更替
   - 低频（年/多年尺度）：土地利用变化、城市化进程
   - **迁移思路**：将 CMS 的频率分层思想应用于遥感时序编码器，可能实现"一次前向传播同时提取多时间尺度特征"，而无需显式的多尺度窗口设计（如 Prithvi 的 3D PE 或 SeaMo 的渐进式训练）。

3. **优化器即联想记忆的工程含义** — 论文证明 Adam（经小修改后）是模型梯度的最优联想记忆。这意味着：
   - 当前遥感 FM 训练使用的 AdamW / LAMB 等优化器，本质上是在做"梯度压缩"——将训练数据的信息流压缩到权重更新中。
   - **Deep Momentum Gradient Descent (DMGD)** 的提出——用 MLP 替代线性的 momentum 矩阵——可能直接提升遥感 FM 的收敛速度和最终性能。对于计算资源有限的遥感研究者，这是一个"换优化器就能提升"的实用方向。
   - Muon 优化器（Newton-Schulz 迭代）被证明是 NL 框架中"非线性输出"的特例——这解释了为什么 Muon 在大模型训练中表现优异。

4. **Self-Referential Titans 的持续学习潜力** — HOPE 架构中模型学会修改自己的更新规则，这与当前 LLM 的"预训练后冻结"范式形成根本对比。对遥感 FM 的启示：
   - 当前遥感 FM（Prithvi、SkySense 等）都是静态的——预训练后权重冻结，仅通过 fine-tuning 适应下游任务。
   - 如果引入自修改机制，遥感模型可以在部署后持续从新观测数据中学习，而无需完整的重新训练——这对**星上处理**和**实时监测系统**有巨大价值。
   - 但论文的实验规模（1.3B 参数，Wiki ppl 20.53）远小于当前主流 LLM，自修改机制在大规模视觉模型上的有效性尚未验证。

5. **Nested Learning 的"幻觉"隐喻** — 论文标题中的 "Illusion" 并非贬义，而是指深度学习架构的**表面复杂性**（层数、参数量）掩盖了其底层的**统一结构**（嵌套优化、联想记忆）。这与当前遥感 FM 领域的"规模军备竞赛"形成有趣对照：
   - RingMoE（14.7B）和 SkySense（2.06B）追求表面复杂性
   - SoftCon（86M）和 SeaMo（86M）通过聪明的设计（软对比、渐进式训练）达到同等或更好的性能
   - NL 的理论框架暗示：**增加"嵌套层级"（更多频率、更深记忆）可能比单纯增加层数/参数量更有效**——这为"效率革命"提供了理论支撑。

**交叉Wiki关联更新:**

- [[L2_lineage/general/theory/attention-analysis]] — NL 与 Dong et al. 的 rank collapse 分析形成完整互补。Skip connection 阻止前向表示崩塌（Dong），LayerNorm 的方差导数重缩放阻止反向梯度失稳（Xu），而 NL 揭示了优化器本身作为记忆系统的嵌套结构。三者共同构成 Transformer 的"完整理论解剖"。

- [[L3_module/pretraining-paradigm]] — NL 的"增加嵌套层级 > 增加层数"洞见，为遥感预训练的效率革命提供了理论依据。SeaMo 的渐进式训练（Phase 1→Phase 2）可以重新理解为"增加预训练阶段的嵌套层级"，而非简单的"分阶段训练"。

- [[L3_module/model-efficiency]] — DMGD（Deep Momentum Gradient Descent）作为 NL 框架下的新型优化器，可能成为遥感 FM 训练的"免费午餐"——在不改变架构的情况下，仅通过更换优化器提升性能。这与 SoftCon 的"免费标注+免费 FM"效率哲学一致。

- [[L3_module/geo-foundation-models]] — HOPE 的 CMS 多时间尺度记忆系统与遥感时序数据的物候周期结构天然匹配。Prithvi 的 3D PE（时间/高/宽）和 SeaMo 的季节感知设计都可以被重新表述为 CMS 的特例——这暗示了一个更通用的"遥感时序编码理论"的可能性。

**引文挖掘更新:**

| 类别 | 论文 | 理由 |
|------|------|------|
| 理论基础 | Fast Weight Programs (Schmidhuber, 1992; Schlag et al., 2021) | NL 中 linear attention = FWP 的重新发现，已存在 |
| 优化器 | Muon (Jordan et al., 2024) | NL 框架下非线性输出的特例，已存在 |
| 记忆模型 | Titans (Behrouz et al., 2024) | HOPE 的前身，自修改序列模型，已存在 |
| 神经科学 | Synaptic tagging (Frey & Morris, 1997) | 论文引用的记忆巩固理论基础 |
| 持续学习 | Test-time training (Akyürek et al., 2024) | 与 HOPE 的自修改机制形成对照 |

**to-read.md 建议新增:**
- Synaptic tagging and long-term potentiation (Frey & Morris, 1997) — Nature
- The surprising effectiveness of test-time training for few-shot learning (Akyürek et al., 2024) — ICML
