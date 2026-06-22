---
slug: "self-supervised-learning-in-remote-sensing-a-review"
title: "Self-supervised Learning in Remote Sensing: A Review"
authors:
  - "Yi Wang"
  - "Conrad M Albrecht"
  - "Nassim Ait Ali Braham"
  - "Lichao Mou"
  - "Xiao Xiang Zhu"
year: 2022
venue: "IEEE GRSM 2022"
tags: [remote-sensing, survey, self-supervised-learning, contrastive, generative, predictive]
score: 4
contribution: 3
soundness: 4
relevance: 4
open_source: false
code_url: "—"
compute: "—"
dataset_access: "public"
---

> **Abstract:** Comprehensive survey of SSL methods (generative, predictive, contrastive) in RS context. Provides taxonomy, benchmark of modern SSL algorithms on BigEarthNet/SEN12MS/So2Sat, studies data augmentations for RS, and identifies future directions.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5 (as survey)
- Contribution: 3/5 — Comprehensive overview but limited novel technical contribution. Main value is the taxonomy and benchmark. The data augmentation study (which augmentations matter for RS) is practically useful.
- Soundness: 4/5 — Good taxonomy linking CV SSL methods to RS applications. Benchmark covers 3 datasets with multiple SSL methods. Well-structured survey.
- Relevance: 4/5 — Excellent reference for anyone starting in RS SSL. Covers the full landscape.

**Key Insights:**
1. **Taxonomy:** Generative (AE, GAN, MAE), Predictive (spatial, spectral, temporal pretext tasks), Contrastive (MoCo, SimCLR, BYOL variants).
2. **Data augmentation matters for RS:** Different from natural images — color jittering can be harmful for RS where spectral information is crucial. Spatial augmentations (crop, flip) are safer.
3. **SSL benchmarks for RS:** BigEarthNet (multi-label, Sentinel-2), SEN12MS (land cover, Sentinel-1/2), So2Sat (SAR+optical). Provides fair comparisons.
4. **Future directions identified:** Multi-modal SSL, temporal SSL, domain adaptation, efficient SSL, ViT-based SSL for RS.

**Notes:**
- DLR / TU Munich (Xiao Xiang Zhu's group).
- 860 lines — very comprehensive. Covers CV SSL methods + RS applications.
- Published in IEEE GRSM 2022.
- Good reference section covering all major RS SSL works up to 2022.

## [2026-05-17] Re-Review — 深度精读与增量洞察

> **背景:** 本次重审是在阅读 full.md 全文、L2 lineage (foundation-models-evolution.md)、L3 模块 (pretraining-paradigm.md, geo-foundation-models.md) 并深入分析论文中的关键图表（Fig.3 分类学、Fig.24 基准测试、Fig.25 数据增强消融、Fig.26 有限标签实验）后完成的。从 2026 年的后见视角回看此 2022 年的综述，可以发现许多前瞻性的贡献和时代的局限。

### 新增洞察

**1. 三级分类法的历史地位得到了证实**

论文提出的 Generative / Predictive / Contrastive 三级分类法（Fig.3）在后续 4 年中经受住了检验。L2 lineage 页面确认了这一分类法的持久价值："Predictive 是 RS 的特色贡献"。与后来的综述（Hong et al. 2026, 武大 2023, Fu et al. 2024）对比发现，本文是唯一将 Predictive 明确提升到与 Generative/Contrastive 同级地位的工作。后续综述大多以模态数或预训练技术为主轴，但本文的 Predictive 独立分类在四种综述中唯一被完整继承的是 Wang et al. (2022) 自身。

**2. 数据增强研究的预见性——"裁剪主导论"**

Fig.25 的数据增强消融实验揭示了该论文最被低估的贡献：在 BigEarthNet 上，去掉裁剪后 SwAV 和 BarlowTwins 性能暴跌（SwAV 从 ~79% 降至 ~59%，BarlowTwins 从 ~79% 降至 ~51%），而仅保留裁剪（crop_only 0.2）即可接近完整增强管道的性能。这意味着 **对于遥感 SSL，几何增强（especially 激进的随机裁剪）远重要于颜色/光谱增强**。这一发现在后续被 SeCo（季节对比）、SoftCon（持续预训练）等工作的增强策略设计中系统性地采纳。论文中明确指出"color jittering 在遥感中需要谨慎使用"——这在 2022 年是超前于 CV 领域共识的。

**3. SimSiam 在遥感中容易坍塌——一个被历史验证的警告**

Fig.24(b) 展示了 SimSiam 训练 10 epoch 后损失剧烈振荡并坍塌的现象。论文对此提出了明确警告，并建议"在实际应用中最好加上动量编码器或其他技巧"。回头看，这一发现具有前瞻性：后来在 RS 中成功的不需要负样本的方法（如 DINO、iBOT）都使用了更复杂的防止坍塌机制（centering + sharpening、momentum encoder），而非 SimSiam 的极简设计。

**4. 基准测试的局限性——"少标签"场景才是 SSL 真正的主场**

Fig.24(a) 的 Linear Probing 基准显示自监督方法在 BigEarthNet 上最高仅达 83%（vs 监督 88%），差距显著。但 Fig.26 的有限标签实验揭示了一个关键事实：当标签比例降至 1% 及以下时，自监督微调的 mAP 比从头监督高出 6-13 个百分点。这直接映射到 L3 geo-foundation-models 模块的核心结论——"标注稀缺（≤10% 标签）是 GFM 的核心价值场景"。论文以实验数据系统性地验证了 RS SSL 的核心价值主张。

**5. 引文开采与跨 Wiki 连接**

| 论文中引用的代表性工作 | 在 PaperWeave 中的对应条目 | 连接类型 |
|---------------------|--------------------------|---------|
| SeCo (Mañas et al. 2021) | L0_raw/seasonal-contrast | 直接引用，SeCo 是域内 SSL >> ImageNet 的标志性证明 |
| Geography-Aware SSL (Ayush et al. 2021) | L0_raw/geography-aware-self-supervised-learning | 直接引用，RS 特有 Pretest 任务 |
| Tile2Vec (Jean et al. 2019) | — | 未收录，是 RS 最早 SSL 工作之一 |
| MoCo-v2 (Chen et al. 2020) | — | 论文基准中最强方法 |
| MAE (He et al. 2022) | L0_raw/masked-autoencoders-are-scalable-vision-learners | 被定位为 Generative 类的突破，后成 RS FM 主流 |
| BigEarthNet, SEN12MS, So2Sat | L0_raw 中对应条目 | 三个基准数据集 |
| SimCLR (Chen et al. 2020) | — | 参照方法，其数据增强策略被直接用于 RS |
| CPC, DIM | — | InfoNCE / MI 路线的源头工作 |

**6. "未来方向"的兑现情况（2026 年回看）**

| 论文中提出的未来方向 (2022) | 兑现情况 (2026) | 代表性后续工作 |
|---------------------------|----------------|--------------|
| 多模态 SSL | ✅ 完全兑现 | CROMA (NeurIPS 2023), SkySense (CVPR 2024) |
| 时序 SSL | ✅ 部分兑现 | SatMAE (NeurIPS 2022), SeaMo (2025) |
| 高效 SSL / 计算效率 | ✅ 超额兑现 | SoftCon (100ep=SOTA), SeaMo (200 GPU-h=SOTA) |
| ViT-based SSL for RS | ✅ 完全兑现 | MoCo-v3, DINO, SatMAE (均基于 ViT) |
| 大规模未筛选数据预训练 | ✅ 部分兑现 | SSL4EO-S12, SkySense 2150万 |
| 预训练任务/数据增强的系统研究 | ⚠️ 仍不充分 | PANGAEA (2025) 是重要一步但远未完备 |
| 任务导向的弱监督学习 | ⚠️ 新兴方向 | AgriFM (2025), SoftCon (2024) 利用免费标签 |
| 模型坍塌的理论解释 | ❌ 仍不充分 | 基本理论理解仍然有限 |

**7. 论文中引用的代表性图表视觉分析**

- **Fig.3 (分类学树图)**: 展示了完整的 SSL 三级分类体系：Generative (AE, GAN) → Predictive (空间/光谱/时序/其他) → Contrastive (负采样/聚类/蒸馏/冗余减少)。该分类至今仍是 RS SSL 领域最广泛引用的参照框架。
- **Fig.24 (基准测试柱状图)**: MoCo-v2 在三个数据集上均为最优自监督方法（BigEarthNet ~83%, So2Sat ~54%, SEN12MS ~63%），证实负采样方法在 RS 中的鲁棒性。SimSiam 表现最不稳定。
- **Fig.25 (数据增强消融)**: 最关键的发现是 crop_only(0.2) 与 baseline 性能相当，而去除裁剪（no_crop）导致 SwAV/BarlowTwins 崩溃。这确立了"裁剪是 RS SSL 唯一必需增强"的早期证据。
- **Fig.26 (有限标签实验)**: 在 0.1% 标签下，自监督微调 ~78.5% vs 监督 ~65%，差距达 13.5 个百分点。随着标签增多差距缩小，印证了 SSL 的核心价值场景是极度标注稀缺。

### 评分调整建议

**维持原有评分**: 4/5
- 从 2026 年回看，该综述的贡献比初评时估计的更大。其"裁剪主导论"和 Predictive 独立分类这两个洞察被后续发展充分证实，具备持续影响力。
- 但作为 2022 年的工作，其基准测试规模有限（100 epoch, ResNet-18），且没有覆盖后续兴起的关键主题（MoE、持续预训练、弱监督）。评分维持不变，但贡献维度的理解应上调。

### 开放问题

1. 本文的"裁剪主导论"在 SAR 和超光谱数据上是否成立？PANGAEA 的初步证据暗示 SAR 数据可能需要不同的增强策略。
2. 本文的 Generative/Predictive/Contrastive 分类是否还能容纳新的 SSL 范式（如 VLM 对比学习、in-context learning）？可能需要将多模态 VLM 作为第四类别加入。
3. 本文基准中 SimSiam 的坍塌是否与 RS 数据的固有特性（nadir 视角、多目标场景）有关？与自然图像的对比实验值得进一步研究。
