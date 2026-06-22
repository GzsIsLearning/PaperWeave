---
slug: "continuous-thought-machines"
title: "连续思维机 / CTM (Continuous Thought Machines)"
authors: ["Luke Darlow", "Ciaran Regan", "Sebastian Risi", "Jeffrey Seely", "Llion Jones"]
year: 2025
venue: "NeurIPS 2025"
tags: [神经动态, 生物启发, 推理, 循环网络, 神经同步, neural-dynamics, biologically-inspired, reasoning, recurrent, synchronization]
score: 4
contribution: 5
soundness: 4
relevance: 4
open_source: false
code_url: "https://github.com/SakanaAI/CTM"
compute: "8× H100 GPU (ImageNet), 1× H100 (其他任务)"
dataset_access: public
---

> **摘要：** 连续思维机（CTM）是一种受生物启发的神经架构，通过两项核心创新将神经时序重新引入基础计算元素：(1) 神经元级模型（NLMs），每个神经元用私有权重处理输入信号的历史；(2) 神经同步作为隐表示，神经元级活动的时间相关性构成模型的核心操作原理。

## [2026-06-10] 评审

**评分：** 4/5
- **贡献度：** 5/5 — CTM 引入了两项真正新颖的架构原语：神经元级模型（NLMs）和神经同步作为学习的隐表示。这些不是渐进式改进，而是对神经网络如何利用时序动态的原理性重新思考。论文定位为分享创新而非追逐 SOTA，这种态度令人耳目一新且诚实。
- **严谨性：** 4/5 — 数学表述干净且动机充分（第3节）。同步的递归计算（附录H）将复杂度从 O(D²t) 降至每 tick O(D_sub)。消融实验（附录G.3）严格证明了 NLMs 和同步都是必要的——单独任一都不足够。然而，部分实验显示出较高的种子方差（图19），且论文承认由于优先保证广度，深度对比有限。
- **相关性：** 4/5 — 该工作处于生物启发AI、测试时计算扩展和可解释性的交叉点。涌现行为（自适应计算、"看图前先扫视"、迷宫的内部世界模型）是时序动态所能解锁能力的引人注目的展示。其对更广泛社区的相关性取决于这些原语能否在已展示的任务之外扩展。

**核心洞察：**
- **神经元级模型（NLMs）** 用作用于处理滚动FIFO历史pre-activation的每神经元私有MLP，替代了标准激活函数。这是点神经元和详细生物物理模型之间的中层抽象，在保持可微分和可处理的同时实现了复杂的时序动态。
- **神经同步** 被直接用作注意力和输出的隐表示，计算为神经元激活历史之间的指数衰减内积。这与将同步视为事后分析涌现属性的先前工作不同。
- **原生自适应计算** 无需显式halting机制即可涌现：基于确定性的损失函数（在最小损失和最大确定性tick处同时优化）允许模型自然地为更难的输入分配更多内部tick。
- **2D迷宫求解的内部世界模型** 无需位置编码即可涌现——CTM 纯粹通过注意力和神经动态构建空间表示，通过顺序重复应用同一模型从 39×39 泛化到 99×99 迷宫。
- **涌现可解释性：** CTM 在分类前"扫视"图像（无训练信号），在UMAP投影激活上表现出行波，并发展出不同的注意力头特化（迷宫中的全局vs局部路径跟随）。
- **算法学习：** 在奇偶校验和排序任务上，CTM 学习可解释的序列策略（正向或反向扫描），等待时间与问题难度相关。
- **通过同步实现记忆：** 在Q&A MNIST中，CTM 通过基于同步的激活组织来回忆在NLM记忆窗口之外观察到的数字，这是标准RNN中不存在的一种记忆形式。

**备注：**
- **会议：** NeurIPS 2025。论文是一份扩展技术报告，附有大量附录（共2382行）。
- **算力：** ImageNet-1K 在 8× H100 GPU 上训练50万轮；其他任务使用 1× H100。迷宫：100万轮；奇偶校验：20万轮。
- **局限性：** (1) 由于内部序列维度，训练时间延长。(2) NLMs 增加了参数量（vs标准激活函数）。(3) 作者明确声明优先广度而非深度对比，因此 SOTA 基准不是重点。(4) 部分任务种子方差较高（如奇偶校验）。(5) 代码声明"发表时提供"并"包含在补充材料中"——GitHub仓库（https://github.com/SakanaAI/CTM）随后发布。
- **ImageNet性能：** 在uncropped数据上，使用ResNet-152骨干网络和50个内部tick，top-1为72.47%，top-5为89.89%——对于未经广泛超参搜索的新架构而言，虽非SOTA但 respectable。

**代码审查：**
- 论文包含详细的伪代码（清单1-6），涵盖完整前向传播、NLM einsum实现、同步计算和损失函数。递归同步公式（附录H）对高效实现特别有价值。代码可在 https://github.com/SakanaAI/CTM 获取。

**引文挖掘（8篇）：**
- Reichert & Serre / 复值深度网络中的神经元同步 (Reichert & Serre, 2013) — arXiv — 同步作为涌现属性的先前工作，与CTM的学习隐表示形成对比。
- Graves / 循环神经网络的自适应计算时间 (Graves, 2016) — arXiv — 通过halting模块实现显式自适应计算；CTM原生实现此功能。
- PonderNet / 学习思考 (Banino et al., 2021) — arXiv — 用于循环推理的可学习halting机制。
- RIMs / 循环独立机制 (Goyal et al., 2019) — arXiv — 用于多步推理的模块化异步子网络。
- LTCNs / 液体时间常数网络 (Hasani et al., 2021) — AAAI — 微分方程驱动神经元；CTM以不同方式抽象时序动态。
- Quiet-STaR / 语言模型可以自学先思考再说话 (Zelikman et al., 2024) — arXiv — 语言模型中的隐式推理生成。
- Schwarzschild et al. / 你能学习一个算法吗？ (Schwarzschild et al., 2021) — NeurIPS — 循环网络从易到难泛化算法问题。
- Geiping et al. / 用隐式推理扩展测试时计算 (Geiping et al., 2025) — arXiv — 用于扩展测试时计算的循环深度方法，与CTM的内部tick范式同期。

## [2026-06-14] 二次重读 Re-review

**综述：** 本次重读深入 full.md 全文 2382 行，结合 L2_lineage 神经动态架构谱系和 L3_module 模态融合/模型效率模块，对 CTM 的架构原理和跨领域影响进行再审视。

### 新发现

1. **递归同步计算是工程实现的隐藏宝石。** 附录 H 将同步矩阵的 O(D²t) 复杂度降至每 tick O(D_sub)，通过递归更新使 CTM 在计算上可行。这一技巧本身可以独立提取为"时序相关性的高效递归计算"原语，不仅适用于 CTM，也可用于任何需要维护历史内积的时序模型。

2. **损失函数设计蕴含"元学习"思想。** 公式 (11) 同时优化最小损失 tick 和最大确定性 tick，这意味着模型在每个样本上自动学习"何时停止思考"。这与 PonderNet 的显式 halting 模块不同——CTM 的自适应计算是损失函数驱动的涌现行为。这种"双目标 tick 选择"策略可以迁移到任何需要自适应计算深度的循环架构。

3. **CTM 的注意力机制是"同步调制的外部感知"。** §3.4 中 attention 的 query 来自同步矩阵 S^t，而 key/value 来自外部数据（ResNet 特征提取器）。这意味着 CTM 不是用静态向量去"看"数据，而是用神经动态的时间相关性去"感知"数据——注意力权重反映的是"哪些神经元的历史活动与当前数据最相关"。这是一种全新的注意力语义。

4. **迷宫泛化的"策略复用"而非"参数扩展"。** 图 4c 显示 CTM 从 39×39 泛化到 99×99 是通过**重复应用同一模型**（re-applications）而非增加参数。这与 Transformer 的上下文长度扩展（需要更长训练序列或位置编码调整）形成对比。CTM 的内部世界模型允许它通过迭代应用同一策略来解决更大规模问题——这暗示了一种"计算即泛化"的新路径。

5. **ImageNet 的"扫视"行为与视觉 Transformer 的 registers 形成对照。** 图 2b 显示 CTM 在分类前主动"扫视"图像（无训练信号），这与 [[L0_raw/vision-transformers-need-more-than-registers]] 中讨论的 ViT 需要额外 registers 来聚合全局信息的问题形成有趣对照。CTM 不需要显式 registers——其内部时间动态天然产生类似"扫视"的全局信息聚合行为。

### 跨 Wiki 连接

- **L2_lineage/general/theory/neural-dynamics-architecture**: 建议补充 CTM 的"递归同步计算"（附录 H）作为独立技术原语，以及"双目标 tick 选择损失函数"作为自适应计算的新范式。CTM 的涌现可解释性（UMAP 行波、注意力头特化）为神经动态架构的可解释性研究提供了实证案例。
- **L3_module/modality-fusion.md**: CTM 的"同步调制注意力"（query = S^t, KV = 外部数据）为多模态融合中的"动态查询生成"提供了新思路。在遥感多模态融合中，是否可以用类似 CTM 的时序动态来生成跨模态注意力查询，而非使用静态的交叉注意力？
- **L3_module/model-efficiency.md**: CTM 的自适应计算（简单任务 10 tick 内停止，复杂任务持续计算）是推理效率的重要方向。与 V-MoE 的 BPR 机制（跳过不重要 patch）不同，CTM 的节省来自"时间深度"而非"空间稀疏"。两者可以互补：空间稀疏（BPR）+ 时间自适应（CTM）= 二维推理效率优化。
- **L3_module/pretraining-paradigm.md**: CTM 的神经元级模型（NLMs）是"预训练目标设计"的新维度。当前预训练范式（MIM、对比学习、next-token prediction）都假设神经元是静态激活函数。NLMs 将预训练目标扩展到了"神经元动态的学习"——每个神经元学习如何处理自己的历史。

### 建议新引文加入 to-read.md
- **Liquid Time-Constant Networks (Hasani et al., 2021)** — AAAI — 论文 §2 引用的微分方程驱动神经元，与 CTM 的 NLMs 形成技术对照。CTM 用离散历史 + 私有 MLP 替代了连续微分方程，但保留了时序动态的核心思想。
- **Neural Turing Machines (Graves et al., 2014)** — Nature — 外部记忆 + 注意力机制的先驱。CTM 的 History A^t 和 Z^t 可以视为一种"内部记忆"，但完全由神经动态驱动而非显式寻址。
- **The Kanerva Machine (Wu et al., 2018)** — NeurIPS — 分布式记忆架构，与 CTM 的同步矩阵作为表示的思路有共通之处。

**跨Wiki连接：**
- L2: [[L2_lineage/general/theory/neural-dynamics-architecture]]
- L3: [[L3_module/modality-fusion]], [[L3_module/model-efficiency]], [[L3_module/pretraining-paradigm]]
