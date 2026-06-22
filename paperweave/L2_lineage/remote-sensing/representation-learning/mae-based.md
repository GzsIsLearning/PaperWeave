---
title: MAE-based Pre-training for Remote Sensing
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: remote-sensing
task: representation-learning
approach: mae-based
tags: [remote-sensing, transformer, mae, self-supervised, pre-training, architecture, representation-learning]
sources:
  - L0_raw/croma-remote-sensing-representations-with-contrastive-radar-optical-masked-autoe
  - L0_raw/masked-autoencoders-are-scalable-vision-learners
  - L0_raw/rethinking-transformers-pre-training-for-multi-spectral-satellite-imagery
  - L0_raw/prithvi-eo-2-0-a-versatile-multitemporal-foundation-model-for-earth-observation-applications
  - L0_raw/ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling
  - L0_raw/ringmo-lite-a-remote-sensing-multi-task-lightweight-network-with-cnn-transformer
  - L0_raw/ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-
  - L0_raw/satmae-pre-training-transformers-for-temporal-and-multi-spectral-satellite-image
  - L0_raw/satswinmae-efficient-autoencoding-for-multiscale-time-series-satellite-imagery
  - L0_raw/seamo-a-season-aware-multimodal-foundation-model-for-remote-sensing
  - L0_raw/simmim-a-simple-framework-for-masked-image-modeling
  - L0_raw/skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr
  - L0_raw/summit-a-sar-foundation-model-with-multiple-auxiliary-tasks-enhanced-intrinsic-c
  - L0_raw/towards-geospatial-foundation-models-via-continual-pretraining
  - L0_raw/针对多模态遥感数据的自监督策略模型预训练方法---中国知网
zotero_keys: []
confidence: high
---

# MAE-based Pre-training for Remote Sensing

## Overview

Masked Autoencoder (MAE) 将图像划分为 patch，随机 mask 大部分（~75%），用可见 patch 编码后重建被 mask 的部分。核心思想：让模型学会从部分信息推断整体，从而习得鲁棒的视觉表示。

在遥感领域，MAE 经历了从单模态光学 → 时序多光谱 → SAR + 多模态融合的演进，参数量从 ~86M（ViT-B）膨胀到 14.7B（RingMoE）。近两年出现两个重要新分支：持续预训练（continual pretraining）从 ImageNet 权重起步降低计算门槛，以及空间-光谱双分支 MAE 同时挖掘多模态遥感数据的几何与光谱特性。

## Evolution Timeline

```
2021  MAE (He et al.)              ← CV 通用框架，75% mask ratio
  │
2022  RingMo (Sun, IEEE TGRS)      ← 首个 RS 生成式 MIM，210 万图像，PIMask
  │   SatMAE (Cong, NeurIPS)       ← 首个时序+多光谱 MAE，时间/光谱分组编码
  │
2023  SatMAE++ (Noman, NeurIPS)    ← 多尺度 MAE，卷积上采样块替代金字塔解码器
  │   CROMA (Fuller, NeurIPS)      ← 雷达-光学 MAE 联合对比学习，2D-ALiBi
  │
2024  SkySense (Guo, CVPR)         ← 多模态多粒度对比+MAE，2.06B 参数，因子化编码器
  │   SatSwinMAE (Nakayama)         ← Swin + 3D MAE 多尺度时间序列，64 A100
  │   GFM (Mendieta, WACV)          ← 持续预训练：ImageNet→RS 教师-学生蒸馏+MIM
  │
|2025  RingMoE (Sun)                 ← 14.7B MoE 多模态 MIM，物理信息重建
  │   SeaMo (中科院空天院)           ← 渐进式 MAE + 季节-多模态融合
  │   SUMMIT (Du, 哈工大)            ← SAR 专用 MAE + 去噪/边缘/散射点辅助任务
  │   双分支自监督 (知网)            ← 空间-光谱双分支 MAE，dual-attention Transformer
  │   Prithvi-EO-2.0 (IBM/NASA)      ← 4.2M HLS 全球采样，3D PE + 元数据(t/l)嵌入，600M
```

## Comparison Table

| Paper | Year | Venue | Score | Masking Strategy | Backbone | Pretrain Data | Downstream (tasks/datasets) | Key Metric | Compute | Code |
|-------|------|-------|-------|-----------------|----------|---------------|---------------------------|------------|---------|------|
| MAE (He) | 2021 | CVPR | 5 | Random 75% | ViT-B/L/H | ImageNet-1K | ImageNet cls | 83.6% Top-1 (ViT-L FT) | 8×V100 | [✓](https://github.com/facebookresearch/mae) |
| RingMo | 2022 | IEEE TGRS | 4 | PIMask (部分不完备掩码，保留小目标) | ViT-B/Swin-B | 自建 210万 光学 (0.1-30m) | 场景分类×3, 检测×2, 分割×2, 变化检测×1 | 98.34% OA (AID 50%) | V100, 200ep | ✗ |
| SatMAE | 2022 | NeurIPS | 5 | 时间分组独立 mask + 光谱分组 mask | ViT-B | fMoW-Sentinel 71万 (13波段) | 分类×5, 分割×1 | 时间编码+光谱分组，独立masking>一致性 | 8×V100, 800ep | [✓](https://github.com/sustainlab-group/SatMAE) |
| SatMAE++ | 2023 | NeurIPS | 4 | 多尺度分层 mask (2/3 尺度) | ViT-B | fMoW-Sentinel 71万 (13波段) | 场景分类×4, 语义分割×2 | BigEarthNet mAP +2.5% vs SatMAE | 8×V100, 800ep | [✓] |
| CROMA | 2023 | NeurIPS | 5 | 独立 SAR+光学 MAE + 跨模态对齐 | ViT-B 双编码器 | SSL4EO-S12 100万对 (SAR+MS) | 分类×4, 分割×3, 多模态×2 | BigEarthNet 87.58% mAP | 8×A100-80G | [✓](https://github.com/antofuller/CROMA) |
| GFM (continual) | 2024 | WACV | 4 | 教师-学生蒸馏 + MIM (GeoPile 多源数据) | Swin-B | ImageNet-22k→GeoPile 600K | 分类×3, 分割×2, 检测×2 | 8×计算节省 vs 从头训练 | 8×V100 | [✓] |
| SatSwinMAE | 2024 | NeurIPS 2024 Workshop | 3 | 3D Swin window masking (per spatial slice) | Swin-B 3D | SSL4EO-S12 25万点×3季 (6波段) | 分割×5 (土地覆盖/洪水/火烧/作物) | Land cover +10.4% vs 现有FM (均值+1-4%) | 64×A100 | ✗ |
| 双分支自监督 | 2025 | 知网 | 4 | 空间分支(随机patch)+光谱分支(随机channel) | Dual-Attention ViT | Berlin (HSI+SAR) / Houston (HSI+LiDAR) | 地物分类×2 | Houston OA 93.51%, Berlin OA 73.23% | 4×RTX 4090 | ✗ |
| SUMMIT | 2025 | preprint | 4 | MIM + 去噪 + 边缘检测 + 散射点检测 (ATCM协调) | ViT-B | MuSID 56万 SAR (18数据集) | SAR分类×2, 检测×3, 实例分割 | SAR专用FM，首个物理特性辅助任务 | 4×RTX 4090 | [✓](https://github.com/Yunsans/SUMMIT) |
| Prithvi-EO-2.0 | 2024 | arXiv (IBM/NASA) | 4 | Random 75% + 3D random spatial-temporal masking | ViT-L/H (3D) | HLS 4.2M 全球 (6波段, 30m, 2014-2023) | GEO-Bench 12任务, 洪水/火烧/滑坡/作物/GPP/AGB | 600M-TL GEO-Bench综合最优，洪水IoU=83.1%, 滑坡1%数据67.0% | 300M: 80×A100, 21k GPU-h; 600M: 240×A100, 58k GPU-h | [✓](https://github.com/NASA-IMPACT/Prithvi-EO-2.0) |

## Key Design Progression

### Masking Strategy Evolution

| Strategy | Paper | Year | Details | Core Insight |
|----------|-------|------|---------|-------------|
| Random patch (75%) | MAE | 2021 | 均匀随机 mask, ViT-B | 高 mask 比例是关键，非对称编码-解码 |
| PIMask (部分不完备掩码) | RingMo | 2022 | 避免密集小目标全部 mask 丢失 | RS 图像小目标密集，随机 mask 可能漏光 |
| Temporal group + Spectral group | SatMAE | 2022 | 同时间戳 patch 同组 mask, 同波段同组 | 独立 masking 优于一致 masking；光谱编码可泛化 |
| Multi-scale hierarchical | SatMAE++ | 2023 | 卷积上采样块逐级重建多尺度图像 | 标准正弦编码足够，无需 GSD 位置编码 |
| Cross-modal MAE | CROMA | 2023 | SAR/光学各自 MAE + 跨模态对比对齐 | 单模态重建+多模态表示同时学习 |
| 3D window masking | SatSwinMAE | 2024 | Swin stage-wise 多尺度 3D mask | 层次化窗口注意力处理时序数据（线性复杂度） |
| Progressive MAE | SeaMo | 2025 | Phase 1 单时点 → Phase 2 多时点 | 渐进训练降低预训练难度 |
| Spatial + Spectral dual-branch | 双分支 | 2025 | 空间分支 mask 像素patch + 光谱分支 mask 波段channel | 空间注意+光谱注意解耦，加法性增益 |
| Multi-auxiliary SAR | SUMMIT | 2025 | MIM + 去噪 + 边缘 + 散射点，ATCM 加权协调 | SAR 物理特性为辅助任务设计提供先验 |

### Temporal Encoding Design Space

| Strategy | Paper | Year | Mechanism |
|----------|-------|------|-----------|
| Temporal group encoding | SatMAE | 2022 | 同时间戳 patch 共享可学习时间嵌入 |
| 3D patch partition + temporal modulation | SatSwinMAE | 2024 | 3D Swin 直接在时空维度建模 |
| Progressive temporal | SeaMo | 2025 | 先单时点后多时点渐进训练 |
| Factorized spatiotemporal | SkySense | 2024 | 因子化编码器：HSROI(高分辨率空间) + TMsI(时序多光谱) + TSARI(时序SAR) |
| 3D PE + 元数据嵌入 (T/L) | Prithvi-EO-2.0 | 2024 | 3D sin/cos位置编码(时间/高/宽) + 经纬度+年份+doy可学习加权求和，dropout=0.1 |

### Spectral Handling Designs

| Strategy | Paper | Year | Approach |
|----------|-------|------|----------|
| Spectral group encoding | SatMAE | 2022 | 光谱分组+可学习编码，独立于时间 |
| Standard sine encoding | SatMAE++ | 2023 | 多光谱数据 3 尺度重建 (RGB 用 2 尺度)，无需特殊编码 |
| Channel-level masking | 双分支 | 2025 | 随机 mask 整个光谱波段 → 强制从空间上下文推断 |
| Physical information reconstruction | RingMoE | 2025 | SAR-L1 复数信号重建，保留相位信息 |

### From Single to Multi-Modal

| Paper | Modalities | Fusion Strategy |
|-------|-----------|-----------------|
| RingMo, SatMAE | 光学/多光谱 | 单模态 |
| SatMAE++ | 多光谱 + RGB | 统一多尺度框架处理不同波段数 |
| CROMA | SAR + 多光谱 | 双 MAE + 跨模态对比学习对齐 |
| GFM (continual) | GeoPile 多源(光学+SAR+MS) | 持续预训练 + 教师-学生特征蒸馏 |
| SkySense | 高分辨率光学 + MS 时序 + SAR 时序 | 因子化编码器 + 多粒度对比 + Geo-Context Prototype |
| RingMoE | 光学 + MS + SAR-L1 + SAR-L2 | RMoE Layer (模态/协作/共享专家三元设计) |
| SeaMo | MS + SAR | TM Fusion Block (级联交叉注意力) |
| SUMMIT | SAR (纯SAR) | 多辅助任务协调 (ATCM) |
| 双分支 | HSI + SAR/LiDAR | Dual-Attention Transformer (空间注意+光谱注意并行) |

## Design Taxonomy

### 一级维度：预训练范式
```
MAE-based RS Pre-training
│
├── 纯 MIM (Masked Image Modeling)
│   ├── 单模态光学: RingMo, MAE(He)
│   ├── 时序+多光谱 MIM: SatMAE, SatMAE++
│   ├── 3D 时序 MIM: SatSwinMAE
│   └── 纯 SAR MIM: SUMMIT
│
├── MIM + 对比学习 (Hybrid)
│   ├── 跨模态对齐: CROMA (SAR↔光学)
│   └── 多模态多粒度: SkySense (对比+MAE+Geo-Context)
│
├── MIM + 知识蒸馏 (Continual)
│   └── 通用→RS 持续预训练: GFM (ImageNet→GeoPile)
│
├── MIM + MoE (Scaled Multi-modal)
│   └── 物理信息重建+MoE: RingMoE, SeaMo
│
└── 空间-光谱解耦 MIM
    └── 双分支自监督: 空间注意力+光谱注意力并行
```

### 二级维度：核心技术创新点

| Dimension | Representative Innovation | Paper |
|-----------|--------------------------|-------|
| 掩码策略 | PIMask 保留小目标, 光谱通道 mask, 3D window | RingMo, 双分支, SatSwinMAE |
| 时序编码 | Temporal group encoding, 3D Swin modulation | SatMAE, SatSwinMAE |
| 尺度处理 | Multi-scale MAE 分层重建, GSD-free | SatMAE++ |
| 跨模态 | 双 MAE+对齐, 因子化编码器, ATCM | CROMA, SkySense, SUMMIT |
| 训练效率 | Continual pretraining (8×), Progressive MAE | GFM, SeaMo |
| 物理感知 | SAR 散射点检测, L1 复数重建 | SUMMIT, RingMoE |

## Current SOTA (representative metrics)

| Downstream Task | Dataset | Best Method | Metric | Notes |
|----------------|---------|------------|--------|-------|
| 场景分类 | AID 50% | RingMo Swin-200W-200E | 98.34% OA | |
| 场景分类 | NWPU-RESISC45 20% | SkySense | 96.32% OA | |
| 多标签分类 | BigEarthNet 10% | CROMA ViT-B | 87.58% mAP | |
| 多光谱场景分类 | Houston2013 | SatMAE++ | +2.5% mAP vs SatMAE | 多尺度重建贡献 |
| 目标检测 | DIOR | RingMoE 1B KC | 82.45% mAP50 | |
| 语义分割 | iSAID | SkySense | 70.91% mIoU | |
| 语义分割(SAR) | DFC2020-SAR | SeaMo | 49.54% mIoU | |
| 变化检测 | LEVIR-CD | SkySense | 92.58% F1 | |
| 洪水分割 | Sen1Floods11 | SatSwinMAE | 91.12% mIoU | |
| SAR 地物分类 | Berlin (HSI+SAR) | 双分支 | 73.23% OA | 空间+光谱双分支，+1.98% vs SimCLRv2 |
| HSI+LiDAR 分类 | Houston (HSI+LiDAR) | 双分支 | 93.51% OA | +2.49% vs SimCLRv2 |

## Open Issues

- **数据规模 vs 质量**: 4 亿图像 (RingMoE) vs 300 万 (SeaMo)，后者用 RTX 4090 达到 SOTA，说明**数据质量/多样性**可能比规模更重要
- **SAR 专用 FM**: SUMMIT 首次针对 SAR 物理特性设计辅助任务，但仅 56 万图像。双分支方法在小数据上验证，大规模 SAR FM 仍待探索
- **空间-光谱解耦**: 双分支方法证明了空间 attention + 光谱 attention 的加法性增益，但仅在两个小规模 HSI 数据集上验证 —— 扩展到大尺度多光谱/SAR 数据是自然方向
- **持续预训练的经济性**: GFM 从 ImageNet 持续预训练节省 8× 计算，但教师-学生蒸馏的最优阶段选择仍缺乏理论支撑
- **可复现性**: RingMo 系列数据/权重不公开，SkySense 权重待释放，SatSwinMAE 代码未开源 —— 开源 RS FM 仍稀缺
- **轻量化**: RingMoE 支持 1B 参数部署，但相比 SeaMo (ViT-Base) 仍重 10×
- **跨传感器泛化**: 多数 FM 在单一传感器预训练，跨传感器 (Gaofen→Sentinel) 的性能下降尚未系统研究
- **多尺度 MAE 的理论支撑**: SatMAE++ 使用简单卷积上采样替代复杂金字塔解码器，背后的原理需要更深入分析

## Related Approaches

- [[contrastive-based]] — 对比学习是 MAE 的主要替代/互补范式（CROMA/SkySense 均融合两者）
- [[multi-modal-fm]] — 多模态 FM 从 MAE 延伸，加入 MoE、物理信息重建等
- [[../vision-language/moe-based]] — RingMoE 是 MAE + MoE 的交叉点
