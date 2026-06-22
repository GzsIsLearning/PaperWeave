---
slug: "seamo-a-season-aware-multimodal-foundation-model-for-remote-sensing"
title: "SeaMo: A Season-Aware Multimodal Foundation Model for Remote Sensing"
authors:
  - "Xuyang Li"
  - "Chenyu Li"
  - "Gemine Vivone"
  - "Danfeng Hong"
year: 2025
venue: "arXiv / Tech Report"
tags: [remote-sensing, foundation-model, multimodal, seasonal, masked-image-modeling, mae]
score: 3
contribution: 3
soundness: 3
relevance: 3
open_source: false
code_url: "—"
compute: "—"
dataset_access: "private"
---

> **Abstract:** Season-aware multimodal VFM integrating spatial, spectral, and seasonal RS data via MIM. Uses unaligned spatial region selection, multi-source input fusion, and temporal-multimodal fusion blocks with cross-attention. Multi-stage pretraining: unimodal → multimodal → seasonal-multimodal.

## [2026-05-02] Review — Full-Text Reading

**Score:** 3/5
- Contribution: 3/5 — The explicit seasonal-temporal modeling and multi-stage pretraining paradigm are interesting. Temporal-Multimodal fusion block with cross-attention is a reasonable design. However, the paper reads more like a technical report than a mature publication — lacks clear comparisons with strong baselines.
- Soundness: 2/5 — Limited quantitative evaluation. Many figures but few detailed result tables. Ablation studies mentioned but not shown with sufficient detail. Hard to assess practical performance.
- Relevance: 3/5 — The season-awareness concept is growing in importance. Similar ideas in SpectralGPT and temporal RS FMs.

**Key Insights:**
1. **Multi-stage pretraining:** Unimodal → multimodal → seasonal-multimodal, progressively increasing complexity.
2. **Unaligned spatial region selection:** Intentionally creates partial spatial misalignment across temporal images to increase spatial diversity, unlike standard aligned approaches.
3. **Temporal-Multimodal fusion block:** Cascade cross-attention to fuse multi-season, multi-modal data.

**Notes:**
- AIRCAS/CAS + Southeast Univ. + CNR-IMAA + Univ. of Tokyo. Danfeng Hong's group.
- Based on MAE framework with ViT encoder.
- Limited results available — seems early-stage work.

## [2026-06-07] Re-review: 再读 full.md + 图片分析 + L2/L3 上下文后的新洞察

### 图片分析新发现

1. **整体架构图（Figure 1）**：SeaMo 的架构是一个**非对称的 encoder-decoder 多模态 MAE**。关键设计细节：
   - 输入层：Sentinel-2（12 通道光学）和 Sentinel-1（VV/VH SAR）分别经过独立的 Patch Embedding（模态特定 tokenizer）
   - 编码器：统一的 ViT-Base 处理拼接后的可见 token（光学+SAR 的可见 patch 在 token 维度拼接，非通道维度）
   - TM Fusion Block：级联交叉注意力，query 来自一个模态，key/value 来自另一模态+前一季节的信息
   - 解码器：模态特定的重建头（光学和 SAR 各自有独立的 decoder），权重跨季节共享
   - **关键发现**：SeaMo 的编码器是统一的（所有模态共享），但解码器是分离的——这与 CROMA（双编码器+融合 Transformer）和 RingMoE（MoE 路由）形成鲜明对比。统一编码器的设计假设是：光学和 SAR 的低层特征可以在同一表示空间中学习。

2. **TM Fusion Block 图（Figure 3）**：交叉注意力的设计比文字描述更精妙。每个时间步 t：
   - 光学特征作为 query，SAR 特征作为 key/value → 产生融合后的光学表示
   - SAR 特征作为 query，光学特征作为 key/value → 产生融合后的 SAR 表示
   - 同时，前一季节的特征通过全连接层 f 与当前季节特征融合，作为下一时间步的辅助 query
   - 这种**双向交叉注意力 + 时间递归**的设计使复杂度为 O(T·M·N²) 而非 O(T²·M²·N²)，其中 T=4 季节，M=2 模态，N=token 数。

3. **三阶段预训练策略对比图（Figure 4）**：
   - 左（Single-Time Unimodal）：纯 MAE，无模态交互，仅空间重建
   - 中（Single-Time Multimodal）：单时间点多模态拼接输入编码器，有模态交互但无时序
   - 右（Multi-Time Multimodal + TM Block）：完整设计，时序+模态联合融合
   - Ablation（Table 12）证实：Multimodal-Temporal-TM（完整版）> Multimodal-Temporal（无 TM Block）> Multimodal（单时间）> Unimodal。TM Block 的贡献在 SAR 任务上尤为显著（BEN-SAR: +0.49 mAP）。

4. **区域选择策略图（Figure 2）**：
   - Same Location：所有季节从同一区域裁剪 → 重建任务过于简单
   - Partial Overlap：部分重叠（默认 [50%,100%] 裁剪率）→ 最优，强制模型学习时间不变的空间属性
   - Disjoint：完全不重叠 → 过于困难，性能下降
   - Ablation（Table 10）证实：Partial Overlap [50%,100%] 在 6 个下游任务上取得最佳或次佳表现。

5. **SAR 水体分割可视化（Figure 12）**：SeaMo 在 Sentinel-1 SAR 数据上的分割结果与 Ground Truth 高度一致，尤其在细长的河道和碎片化水体边界上表现优异。这说明**多模态预训练（光学+SAR）能显著提升单模态（SAR）下游任务的特征质量**——一个关键的迁移学习证据。

### 与 L2/L3 上下文的新连接

1. **与 multi-modal-fm.md 的效率悖论呼应**：SeaMo（86M 参数，200 GPU-h，RTX 4090 可训）是 L2_lineage 中"效率革命"的典型代表。Table 16 显示全部下游微调仅需 112 GPU-h（分类 58h + 分割 52h + 变化检测 2h），总成本低于许多单任务监督模型的训练成本。

2. **与 modality-fusion.md 的融合策略分类**：SeaMo 属于"特征级融合（子类型 2c：渐进式融合）"——先单模态 MIM 学习空间表示，再 TM Block 在中间层注入时序信息。这与 CROMA（2a：独立编码+融合层）和 RingMoE（范式 5：MoE 路由融合）形成三条不同路线的对比。

3. **与 pretraining-paradigm.md 的渐进式设计**：SeaMo 的 Phase 1（25% 数据，20 epoch，无 TM Block）→ Phase 2（100% 数据，200 epoch，有 TM Block）是"渐进式预训练"的教科书案例。这种设计的优势在于：每阶段目标单一，训练稳定；前一阶段为后一阶段提供良好的初始化。

### 新洞察：SeaMo 的"隐性多任务学习"

重读 full.md 后发现一个被低估的设计：SeaMo 的重建目标是**归一化 patch 的 MSE**（Table 13c 证实 w/ norm > w/o norm），且光学和 SAR 的重建损失**独立计算后求和**。这意味着：

- 编码器同时学习两种物理机制（光学反射 + SAR 后向散射）的表示
- 但解码器是分离的，每种模态有独立的重建头
- 这种"共享编码器 + 分离解码器"的设计本质上是一种**多任务学习**：编码器必须提取对两种模态都有用的特征，而解码器则专门化到各自的物理空间
- 这与 CROMA 的"双编码器+融合"设计形成对比：CROMA 允许每种模态有独立的编码路径，而 SeaMo 强制它们在底层共享

**关键问题**：SeaMo 的统一编码器假设（光学和 SAR 的低层特征可共享）是否总是成立？PANGAEA 的警告（"添加 SAR 并不总是有帮助"）暗示这一假设可能在某些场景下失效。SeaMo 的消融并未测试"纯 SAR 编码器 vs 统一编码器"的对比——这是一个未被回答的问题。

### 新洞察：季节感知的"物候学先验"

SeaMo 使用 SSL4EO-S12 的 4 季节数据（春/夏/秋/冬），但 4 个季节采样点（约每 3 个月一次）掩盖了更精细的物候变化。对于农业监测等应用，关键的物候转换期（如播种→出苗→抽穗→成熟）可能在几周内完成，而 SeaMo 的 3 个月粒度无法捕捉这些快速变化。

- Prithvi（NASA/IBM）使用 HLS 数据，时间步更密集（约每 5 天），但仅 6 个光谱通道
- AgriFM 使用可变长度时序（Video Swin Transformer），可适应不同时间分辨率
- **未来方向**：将 SeaMo 的 TM Block 与 AgriFM 的同步时空降采样结合，实现"密集时序 + 多模态融合"

### 引用矿更新

- **新增待读**：SiamMAE (Gupta et al., 2023) — SeaMo TM Block 的灵感来源，Siamese MAE 用于视频表示学习
- **新增待读**：CropMAE (Eymaël et al., 2024) — 局部相关裁剪策略，SeaMo 的区域选择策略受其启发
- **新增待读**：SSL4EO-S12 (Wang et al., 2023) — SeaMo 的预训练数据集，多模态多时序自监督学习的基准数据

### 跨 Wiki 连接更新

- **L2_lineage/remote-sensing/representation-learning/multi-modal-fm.md**：SeaMo 的"统一编码器+分离解码器"设计应被纳入融合策略分类体系，作为"渐进式特征级融合"的典型案例。其效率指数（200 GPU-h = SOTA）进一步支撑了"架构创新 > 暴力扩数据"的论点。
- **L2_lineage/remote-sensing/representation-learning/mae-based.md**：SeaMo 的渐进式 MIM（Phase 1 空间 → Phase 2 时序）为 MAE-based RS FM 的预训练策略提供了新的设计维度。
- **L3_module/modality-fusion.md**：SeaMo 的 TM Block 是"时序感知式融合"的代表，其双向交叉注意力+时间递归的设计可作为该范式的详细案例。
- **L3_module/pretraining-paradigm.md**：SeaMo 的"隐性多任务学习"（共享编码器+分离解码器）揭示了 MIM 预训练中的多任务效应，这与 SoftCon 的"软对比"和 AgriFM 的"监督预训练"形成三条不同路线的对比。
