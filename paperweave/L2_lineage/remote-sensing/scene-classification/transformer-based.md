---
title: Transformer-based Scene Classification for Remote Sensing
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: remote-sensing
task: scene-classification
approach: transformer-based
tags: [remote-sensing, scene-classification, transformer, swin, cnn, clip, prompt-learning, few-shot, cross-attention]
sources:
  - L0_raw/deeply-understanding-features-to-achieve-efficient-remote-sensing-image-classifi
  - L0_raw/stmsf-swin-transformer-with-multi-scale-fusion-for-remote-sensing-scene-classifi
  - L0_raw/few-shot-remote-sensing-image-scene-classification-with-clip-and-prompt-learning
  - L0_raw/a-novel-transformer-network-with-a-cnn-enhanced-cross-attention-mechanism-for-hy
zotero_keys: []
confidence: medium
---

# Transformer-based Scene Classification for Remote Sensing

## 1. Overview

遥感场景分类经历了从轻量 CNN 特征精炼 → Swin Transformer 多尺度融合 → CLIP prompt learning 少样本 → CNN-Transformer 混合交叉注意力的范式演进。基于 4 篇代表性论文，演进路径可归纳为：

```
2019-2022  CNN 时代 (ResNet/VGG/DenseNet + 注意力增强)
  │  核心范式：ImageNet 预训练 CNN backbone → 全连接分类
  ↓
2022-2024  轻量CNN精炼 (DUF-Net)
  │  Character Refinement + Weight Mapping：不增加深度的特征质量提升
  ↓
2024-2025  Transformer/Swin 时代 (STMSF)
  │  Swin + SAPN spatial attention + multi-scale fusion
  │  CLIP+Prompt Few-Shot：冻结CLIP + prompt learning，16-shot 达85-95%
  ↓
2024-now   CNN-Transformer 混合 (TNCCA)
     CNN 增强交叉注意力 + 多尺度双分支 HSI 输入
```

当前处于范式过渡期：Swin Transformer 在多尺度场景分类中展现优势，但轻量 CNN 仍具实用价值。CLIP prompt learning 在少样本场景下开辟了新路径。

## 2. Evolution Timeline

```
2022      CNN 特征精炼
  │   DUF-Net (Chen)               ← Character Refinement + Weight Mapping
  │                                    2D CNN，轻量高效，RESIC45/UCM/RSSCN7
  │
2024      CNN-Transformer 交叉
  │   TNCCA (Wang, Remote Sensing) ← CNN-enhanced Cross-Attention Transformer
  │                                    多尺度双分支 HSI 输入，Indian Pines/Pavia/Salinas
  │
2025      Swin + Prompt
  │   STMSF (Duan, Remote Sensing) ← Swin-S + SAPN spatial attention + 多尺度融合
  │                                    UCM 99.01%/99.58%, AID, NWPU
  │   CLIP+Prompt Few-Shot         ← 冻结CLIP + 4种prompt learning对比
  │                                    9数据集 k-shot，16-shot达85-95%
```

## 3. Comparison Table

| Paper | Year | Venue | Score | Backbone | Method | Datasets | Best Metric | Compute | Code |
|-------|------|-------|-------|----------|--------|----------|-------------|---------|------|
| **DUF-Net** | 2026 | preprint | 3 | 2D CNN (轻量) | CR精炼 + WM权重映射 | RESIC45, UCM, RSSCN7 | — | 单GPU | ✗ |
| **STMSF** | 2025 | Remote Sensing (MDPI) | 3 | Swin-S (ImageNet-1k) | SAPN空间注意力 + 多尺度融合 | UCM, AID, NWPU | UCM 99.58% (80% train) | 4×RTX 3080 | ✗ |
| **CLIP+Prompt** | 2025 | preprint | 3 | CLIP (冻结) | 4种prompt learning对比 | 9数据集 k-shot | 16-shot 85-95% | GTX 1080Ti | △ |
| **TNCCA** | 2024 | Remote Sensing (MDPI) | 3 | 3D/2D混合CNN + Transformer | CNN增强交叉注意力 + 双分支多尺度 | Indian Pines, Pavia U, Salinas | — | 单GPU | ✗ |

> **Score**: 4篇论文均发表在中等 venue (MDPI Remote Sensing 或预印本)，贡献属增量改进 (3/5)。STMSF 的 UCM 指标 (99.58%) 具有竞争力。

## 4. Design Taxonomy

### 4.1 架构路线对比

```
CNN 路线 (轻量高效)
  DUF-Net: CR精炼空间特征分布 + WM动态重分配通道-空间语义
  优势：参数量少、单GPU可训、部署友好
  代价：全局建模能力弱于Transformer

Swin Transformer 路线 (多尺度全局)
  STMSF: Swin-S + SAPN (FPN + spatial attention) + 多尺度特征拼接
  优势：层次化窗口注意力，UCM 99.58%
  代价：4×RTX 3080，ImageNet-1k 预训练依赖

CLIP 路线 (少样本迁移)
  CLIP+Prompt: 冻结 CLIP + CoOp/CoCoOp/PLOT/PromptSRC
  优势：极低训练资源(GTX 1080Ti)，16-shot 达高准确率
  代价：无 RS 预训练，依赖 CLIP 的通用视觉知识

CNN-Transformer 混合 (双重优势)
  TNCCA: CNN提取多尺度局部特征 + Transformer交叉注意力融合
  优势：局部+全局互补，少样本稳健
  代价：HSI专用，场景分类扩展性未验证
```

### 4.2 多尺度策略对比

| 论文 | 多尺度策略 | 融合方式 |
|------|----------|---------|
| **DUF-Net** | WM模块多尺度特征交互融合 | 通道-空间动态重分配 |
| **STMSF** | Swin层次化特征 + FPN + SAPN | 多尺度特征图拼接 → GAP |
| **TNCCA** | 双分支不同patch大小 (7×7/13×13) | CNN增强交叉注意力双向融合 |

### 4.3 标注效率

| 训练样本需求 | 代表论文 | 典型设定 |
|------------|---------|---------|
| **全监督 (50-80%)** | STMSF, DUF-Net | 50-80% 训练集 |
| **少样本 (≤16-shot)** | CLIP+Prompt | 16-shot 达 85-95%, GTX 1080Ti |
| **极少样本 (5-10/类)** | TNCCA | 每类5-10样本仍稳健 |

## 5. Key Insights per Paper

### 5.1 DUF-Net: 轻量 CNN 的特征精炼 (2026)

**核心思路**: 不增加模型深度，通过两个互补模块提升 CNN 特征质量——CR (Character Refinement) 优化空间特征分布，WM (Weight Mapping) 动态重分配通道-空间语义信息。

**为什么重要**: 遥感场景分类在边缘/星上部署需要轻量模型。DUF-Net 证明"精炼现有特征"比"堆叠更多层"更高效。

**局限**: 仅评估了标准场景分类数据集；与 Transformer 方案的对比不足；缺乏 FLOPs/推理时间量化分析。

### 5.2 STMSF: Swin + 多尺度融合的标准化方案 (MDPI RS 2025)

**核心思路**: Swin-S (ImageNet-1k 预训练) → SAPN (Spatial Attention Pyramid Network) → 多尺度特征拼接分类。SAPN 在 FPN 的 top-down pathway 中嵌入空间注意力 (GAP+GMP → conv7×7 → sigmoid)。

**实验结果**:
| Dataset | Train Ratio | STMSF | 对比 |
|---------|------------|-------|------|
| UCM | 50% | 99.01% | 接近 MDRCN (CNN-based) |
| UCM | 80% | 99.58% | 领先 |
| AID | 20% | — | 超 HHTL +0.53% |
| NWPU | 10%/20% | — | 10%和20%训练比均最优 |

**设计意义**: STMSF 不是架构创新，而是工程实现——Swin + FPN + spatial attention 的标准组合在 RS 场景分类上的最佳实践验证。300 epoch 训练 + cosine LR 调度的扎实工程使指标领先。

**局限**: 代码未开源；仅 Swin-S 单一 backbone；无跨数据集泛化测试；发表于 MDPI Remote Sensing (审稿周期短，影响因子中等)。

### 5.3 CLIP+Prompt: 少样本场景分类的轻量路径 (2025 preprint)

**核心思路**: 冻结 CLIP 视觉+文本编码器，仅训练 prompt tokens。系统对比 4 种 prompt learning 方法 (CoOp, CoCoOp, PLOT, PromptSRC) 在 9 个 RS 场景分类数据集上的 k-shot 性能。

**关键发现**:
- PromptSRC (自正则化) 在极低样本下最鲁棒
- 16-shot 可达 85-95% 准确率——接近全监督的 50%+ 训练效果
- GTX 1080Ti 即可训练——适合资源受限场景

**为什么重要**: 遥感场景分类的标注成本高——CLIP+prompt 让"少量标注样本 + 冻结基础模型"成为可行范式。

**局限**: 无 RS 领域预训练——CLIP 对遥感特有场景 (如农田/港口/机场) 的语义理解可能偏差；仅评估了标准 prompt learning，未探索 RS 专用 prompt 设计。

### 5.4 TNCCA: HSI 的 CNN + Transformer 交叉注意力 (MDPI RS 2024)

**核心思路**: 双分支网络对同一 HSI 像素取不同大小 patch (如 7×7 和 13×13) → 3D/2D 混合 CNN 提取多尺度浅层特征 → CNN 增强的交叉注意力 (用 2D 卷积生成不同尺度的 Q/K/V) → 分类。

**关键创新**:
- CNN-enhanced cross-attention: 用 2D 卷积和空洞卷积生成不同感受野的 Q/K/V——比标准交叉注意力更好地保留 CNN 的局部空间结构
- 在极少量训练样本下（每类5-10个）依然稳健

**局限**: HSI 场景专用，向 RGB 场景分类迁移未验证；对比方法不够新（缺2023-2024 SOTA）；仅 OA/AA/Kappa 指标；代码未开源。

## 6. Cross-Paper Observations

- **多尺度是共同主题**: 4篇论文全部涉及多尺度特征处理——DUF-Net 的 WM 交互融合、STMSF 的 FPN、TNCCA 的双分支输入、CLIP+Prompt 的隐式多尺度（CLIP 视觉编码器层次化特征）
- **开源率极低**: 4篇论文无一完全开源（CLIP+Prompt "代码待公开"）——阻碍基准建立
- **CNN并未死亡**: 在资源受限场景（DUF-Net 单GPU, CLIP+Prompt GTX 1080Ti），轻量 CNN 方案仍有竞争力
- **数据集覆盖不足**: 主要数据集 UCM (21类 2100张), AID (30类 10000张), NWPU (45类 31500张) ——类内多样性和地理覆盖有限

## 7. 场景分类 vs 地物分类

| 维度 | 场景分类 (Scene) | 地物/像素分类 (Land Cover) |
|------|-----------------|-------------------------|
| **粒度** | 图像级：整幅图像属于某场景 | 像素/对象级：每个像素属于某地物 |
| **典型数据集** | UCM, AID, NWPU-RESISC45 | Indian Pines, Pavia U (HSI); GID, LoveDA (RGB) |
| **核心挑战** | 场景复杂性 (多物体组合) | 类间混淆 (光谱相似) |
| **本页覆盖** | DUF-Net, STMSF, CLIP+Prompt | TNCCA (HSI，但方法通用) |

> 地物分类 (pixel-level) 另见 [[../image-classification/transformer-based]] 和 [[../semantic-segmentation/]].

## 8. Open Issues

- **跨数据集泛化**: 4篇均未测试跨数据集泛化——UCM 训练 → AID 测试。这是真实应用的刚需
- **细粒度场景**: 现有数据集类间差异大（机场 vs 农田）——细粒度场景分类（如不同城市功能区）仍是空白
- **开源与可复现性**: 零完全开源——社区基准对比可信度受损
- **RS 专用 CLIP**: CLIP+Prompt 用通用 CLIP——RemoteCLIP 等 RS 专用 CLIP 的 prompt learning 效果待探索
- **模型规模-性能权衡**: Swin-S → Swin-B/L 的 scaling law 在 RS 场景分类中未被研究

## 9. Related Approaches

- [[../image-classification/transformer-based]] — 遥感图像分类的通用 Transformer 方法
- [[../image-classification/contrastive-based]] — 对比学习在 RS 分类中的应用
- [[../representation-learning/contrastive-based]] — CLIP/RemoteCLIP 的 RS 对比预训练
- [[../semantic-segmentation/transformer-based]] — 像素级分类 (Swin/SegFormer)
- [[../../../multimodal/vision-language/clip-based]] — 通用 CLIP 与 prompt learning
