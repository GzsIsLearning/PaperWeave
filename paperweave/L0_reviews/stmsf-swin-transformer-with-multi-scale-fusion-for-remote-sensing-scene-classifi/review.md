---
slug: "stmsf-swin-transformer-with-multi-scale-fusion-for-remote-sensing-scene-classifi"
title: "STMSF: Swin Transformer with Multi-Scale Fusion for Remote Sensing Scene Classification"
authors:
  - "Yingtao Duan"
  - "Chao Song"
  - "Yifan Zhang"
  - "Puyu Cheng"
  - "Shaohui Mei"
score: 2
contribution: 2
soundness: 3
relevance: 2
open_source: false
code_url: null
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** Swin Transformer with multi-scale fusion for RS scene classification. Multi-scale feature fusion module + Spatial Attention Pyramid Network (SAPN). Evaluated on AID, RESISC45, WHU-RS19.

## [2026-05-02] Comprehensive Review

**Score:** 2/5
- Contribution: 2/5 — Incremental improvement on Swin Transformer; multi-scale fusion is not novel
- Soundness: 3/3 — Reasonable experiments on 3 datasets with SOTA comparisons
- Relevance: 2/5 — General RS classification, no VLM/MoE connection

**Key Insights:**
1. Multi-scale feature fusion module for Swin Transformer to handle varying object scales in RS scenes.
2. Spatial Attention Pyramid Network (SAPN) enhances coarse feature context.
3. Outperforms CNN and ViT baselines on AID, RESISC45, WHU-RS19.
4. Published in Remote Sensing (MDPI), 2025.

**Notes:**
- Remote Sensing 2025, Northwestern Polytechnical University + Hanshan Normal University.
- Standard scene classification approach with no MoE or VLM components.
- Code not released.

## [2026-06-02] Re-review — Daily Paperweave Reading Agent

**新增洞察：**

1. **基础 Swin 的强基线效应**：消融实验（Table 4）显示，仅用顶层特征的 Vanilla Swin-S 在 NWPU@20% 已达 91.60%，超越大多数 CNN 方法。这说明 Swin Transformer 本身的层次化窗口注意力在 RS 场景分类中比 ViT 有先天优势——多尺度的基线已被 Swin 隐式提供。

2. **SAPN 的真实增益大小**：在 NWPU 上 FPN → SAPN 的改进为 92.88→94.95（@10%）和 93.88→94.95（@20%），即 FPN 贡献 ~3.1%，SAPN 的空间注意力额外贡献 ~1.2%。改进有意义但不革新，属于"工程组合优于单点创新"的典型案例。

3. **Grad-CAM 揭示的注意力陷阱**：Figure 10 的失败案例（稀疏住宅区中网球场导致误分类为网球场）揭示了空间注意力机制的双刃剑效应——视觉显著但语义无关的特征会误导模型。这一现象在 L3 模块 [[../L3_module/multi-scale-feature-extraction.md]] 讨论的"连续尺度表示"问题上具有启示意义。

4. **计算效率的隐忧**：STMSF (48.85M 参数, 8.60G FLOPs) 相比纯 Swin-S (48.81M, 8.54G) 几乎没有增加计算量，说明多尺度融合模块是高效的。但论文未量化推理速度（FPS），且 4×RTX 3080 的训练开销在部署场景中仍然偏高。

5. **跨数据集泛化测试缺失**：仅测试了同数据集不同划分比的指标，未做 UCM→AID→NWPU 的跨数据集泛化测试。这是遥感场景分类领域普遍存在的问题（L2 页面 transformer-based.md Section 8 已指出），STMSF 未能填补这一空白。

**引用挖掘：**
- 论文引用 MDRCN (Dai et al., 2024) 在 UCM@80% 以 99.64% 超越 STMSF 的 99.58%——MDRCN 使用多尺度密集残差相关网络 + CNN 路线，证明在 UCM 小数据集上 CNN 仍有竞争力
- 论文引用的 HHTL (Ma et al., 2022) 作为 Transformer baseline，在同方同源对比中有参考价值
- 未引用 RemoteCLIP 或任何 VLM 方法——论文发表于 2025 年但未涉及 vision-language 范式

**跨 Wiki 连接：**
- [[../L3_module/multi-scale-feature-extraction.md]] — STMSF 的 SAPN 直接解决该 L3 模块指出的"信息丢失在自顶向下路径"问题，是 FPN+空间注意力的工程验证
- [[../L2_lineage/remote-sensing/scene-classification/transformer-based.md]] — 本文作为该 L2 页面的核心信源之一，其 Swin-S + SAPN 方案被标注为 2025 年场景分类的标准工程方案
- [[../L3_module/modality-fusion.md]] — 本文未涉及多模态，但其多尺度融合思路可扩展到光学-SAR 跨模态场景
