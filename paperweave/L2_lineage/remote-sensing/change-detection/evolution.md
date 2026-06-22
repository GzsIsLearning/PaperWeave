---
title: 遥感变化检测范式演进 — 从代数运算到基础模型
created: 2026-04-29
updated: 2026-05-18
type: lineage
domain: remote-sensing
task: change-detection
approach: evolution
tags: [remote-sensing, change-detection, foundation-model, transformer, cnn, contrastive-learning, unsupervised, survey]
sources:
  - L0_raw/adaptvfms-rscd-advancing-remote-sensing-change-detection-from-binary-to-semantic
  - L0_raw/change-aware-sampling-and-contrastive-learning-for-satellite-images
  - L0_raw/change3d-revisiting-change-detection-and-captioning-from-a-video-modeling-perspe
  - L0_raw/segment-change-model-scm-for-unsupervised-change-detection-in-vhr-remote-sensing
  - L0_raw/semantic-aware-remote-sensing-change-detection-with-multi-scale-cross-attention
zotero_keys: []
confidence: high
---

# 遥感变化检测范式演进：从代数运算到基础模型

## 1. 概述：CD 范式演进的五阶段

遥感变化检测（Change Detection, CD）经历了从简单代数运算到大规模基础模型的范式跃迁。基于 5 篇代表性论文的深度分析，可将演进路径归纳为五个阶段：

```
代数法（CVA/PCA, 2000s）
  │  逐像素差分/比值，无学习能力，对光照/季节敏感
  ↓
CNN-based（2015-2020）
  │  U-Net/Siamese CNN 提取特征后差分，局部感受野，监督训练
  ↓
Transformer/Attention 混合（2021-2023）
  │  自注意力/交叉注意力捕获双时相全局依赖，BIT-CD, ChangeFormer
  ↓
基础模型范式（2023-2025）
  │  SAM/CLIP/X3D 借力大规模预训练，零样本→微调→任务统一
  ↓
自监督/无监督+多任务统一（2023-now）
    摆脱标注依赖 + 统一 BCD/SCD/BDA/CC，CACo, Change3D
```

当前处于第4-5阶段的过渡期：基础模型在 BCD 上已超越传统方法，但无监督方法和语义级变化检测仍是开放挑战。

## 2. 演化时间线

```
2015-2020  CNN 时代
  │  FC-Siam-Diff, FC-Siam-Conc, SNUNet-CD, DASNet
  │  核心范式：Siamese CNN encoder → feature differencing → decoder
  │
2021      BIT-CD (Chen, TGRS)        ← 首个纯 Transformer CD: semantic tokens + Transformer encoder
2022      ChangeFormer (Bandara, IGARSS)  ← 层次化 Transformer，与 MSCANet 架构最相似
  │       SwinSUNet (Zhang, TGRS)        ← Swin Transformer backbone
  │
2023      *** 范式分水岭 ***
  │   SCM (Tan, arXiv)               ← FastSAM+CLIP 零样本无监督，LEVIR-CD F1=62.80
  │   CACo (Mall, CVPR)              ← 自举式变化感知对比学习，无需外部标注
  │   SLDDNet (Fu, TGRS)             ← 阶段式长短距离依赖
  │
2024      *** 基础模型爆发 ***
  │   Change3D (Zhu, CVPR)            ← 视频建模：感知帧+X3D-L，1.60M参数统一4任务
  │   SAM-CD (Ding, TGRS)             ← SAM 适配变化检测
  │   Segment Any Change (Zheng)       ← 零样本变化检测
  │   Change-Agent (Liu)               ← MLLM 交互式变化分析
  │   SEIFNet (Huang, TGRS)           ← 时空增强+层级融合
  │
2025      *** 语义化+多模态 ***
  │   AdaptVFMs (Jiang, JAG)          ← SAM+CLIP RS微调，BCD→SCD 升级，42K微调数据集
  │   MSCANet (Zheng, Sensors)        ← CNN+Cross-Attn+语义图压缩，O(n²)→O(n)
  │   ChangeMamba (2024/2025)         ← Mamba 状态空间模型引入 CD
  │   CGNet (2024/2025)              ← 变化引导网络
```

## 3. 论文对比总表

| Paper | Year | Venue | Score | Method | CD Type | Datasets | Key Metric | Compute | Code |
|-------|------|-------|-------|--------|---------|-----------|------------|---------|------|
| **CACo** | 2023 | CVPR | 5/5 | 变化感知对比学习 + GMM 自举 | BCD（表征预训练） | OSCD, xView2, LEVIR-CD | OSCD F1 52.11 (+8.5% vs SeCo) | 未披露 | ✗ |
| **SCM** | 2023 | arXiv | 3/5 | FastSAM 分割 + CLIP PSA 过滤 | BCD（无监督） | LEVIR-CD, WHU-CD | LEVIR F1 62.80 | 超算中心 | ✓ |
| **Change3D** | 2024 | CVPR | 5/5 | 感知帧 + X3D-L 视频编码 | BCD+SCD+BDA+CC | LEVIR, WHU, SECOND, xBD, LEVIR-CC | LEVIR F1 91.82, WHU F1 94.56 | 1×RTX 3090 | ✓ |
| **AdaptVFMs** | 2025 | JAG (Elsevier) | 4/5 | SAM+CLIP RS微调 + SCDM | BCD → SCD 升级 | DSIFN, CLCD, SYSU | SYSU F1 +17.57% | 12×RTX 3090 | ✓ |
| **MSCANet** | 2025 | Sensors (MDPI) | 2/5 | CNN + Cross-Attn + 语义图压缩 | BCD | CDD, LEVIR, SYSU | LEVIR F1 91.02, CDD F1 96.19 | 未披露 | ✗ |

> **Score 说明**：CACo 和 Change3D 均发表于 CVPR（顶会），贡献和实验质量最高（5/5）。AdaptVFMs 发表于 JAG（IF 7.5，RS 领域认可度高），贡献扎实（4/5）。SCM 为 arXiv 预印本，方法巧妙但指标偏低（3/5）。MSCANet 发表于 Sensors MDPI（IF 3.4，审稿极短），消融实验存在矛盾且未开源（2/5）。

## 4. 设计分类学 (Design Taxonomy)

### 4.1 监督范式

| 范式 | 代表论文 | 标注需求 | 优势 | 局限 |
|------|---------|---------|------|------|
| **全监督** | AdaptVFMs, MSCANet, Change3D | 像素级变化标签 | 性能最高（LEVIR F1 90+） | 标注成本极高 |
| **无监督（零样本）** | SCM | 无训练标签 | 零成本部署 | LEVIR F1 仅 62.80 |
| **自监督预训练** | CACo | 仅需双时相影像对 | 预训练后可迁移到多个下游 CD 任务 | 下游仍需微调标签 |
| **FM 微调** | AdaptVFMs | 42K 图文对 + CD 标签 | 借力 FM 感知能力，快速收敛 | FM 版本依赖 |

### 4.2 CD 任务类型

```
BCA (Binary Change Detection)  ←──────── 5 篇论文全覆盖，最成熟
  │   二值变化/不变，LEVIR-CD/WHU-CD/CDD 基准
  │
SCD (Semantic Change Detection) ←────── AdaptVFMs, Change3D (2/5)
  │   从"变没变"到"什么变成了什么"
  │   瓶颈：SECOND 数据集 Change3D F1 仅 62.83
  │
BDA (Building Damage Assessment) ←──── Change3D (1/5)
  │   灾后建筑损毁分级，xBD 数据集
  │
CC (Change Captioning) ←────────────── Change3D (1/5)
      用自然语言描述变化，LEVIR-CC 数据集
```

### 4.3 维度分类

| 维度 | 分布 | 论文 |
|------|------|------|
| **2D 像素级** | 主流 | CACo, SCM, AdaptVFMs, MSCANet |
| **2D 对象级** | 通过 SAM 分割实现 | SCM, AdaptVFMs |
| **3D 时间轴（视频建模）** | 仅 Change3D | 将双时相视为 3D 时空体 |
| **像素→语义升级** | AdaptVFMs | 1×1 卷积适配器 + CLIP 语义分类 |

### 4.4 架构骨干

```
FM 路线：
  FastSAM 分割器 → SCM
  SAM + CLIP     → AdaptVFMs
  X3D-L 视频编码  → Change3D

自监督路线：
  ResNet-50 + 对比学习 → CACo

CNN/Transformer 混合路线：
  CNN Encoder + Cross-Attention + 语义图压缩 → MSCANet
```

## 5. 当前 SOTA（综合评估）

### 5.1 BCD（二值变化检测）

| Dataset | SOTA Method | F1 | IoU | Year | Paradigm |
|---------|------------|-----|-----|------|----------|
| **LEVIR-CD** | Change3D | **91.82** | 83.69 | 2024 | FM (X3D-L) |
| **WHU-CD** | Change3D | **94.56** | — | 2024 | FM (X3D-L) |
| **CDD** | MSCANet | **96.19** | 92.67 | 2025 | CNN+Cross-Attn |
| **SYSU-CD** | MSCANet | **80.76** | 67.72 | 2025 | CNN+Cross-Attn |

> ⚠️ **注意**：MSCANet 在 CDD/SYSU-CD 上的结果引用自原论文且未在同一环境下复现 baseline，与 Change3D 的结果不可直接对比。Change3D 在 LEVIR-CD 和 WHU-CD 上的领先优势更可信（CVPR 2024，开源可复现）。

### 5.2 SCD（语义变化检测）

| Dataset | SOTA Method | mIoU | Year |
|---------|------------|------|------|
| **SECOND** | Change3D | F1 **62.83** | 2024 |
| **DSIFN** | AdaptVFMs | — | 2025 |
| **CLCD** | AdaptVFMs | — | 2025 |
| **SYSU** | AdaptVFMs | F1 +17.57% vs 第二名 | 2025 |

> SCD 整体性能远低于 BCD（SECOND F1 62.83 vs LEVIR F1 91.82），语义变化检测仍是重大开放问题。

### 5.3 自监督预训练 → 下游 CD

| 预训练方法 | 下游任务 | 数据集 | F1 | 训练数据量 | 对比 |
|-----------|---------|--------|-----|----------|------|
| CACo (自举) | BCD | OSCD | **52.11** | 100K 无标签 | SeCo 1M: 43.67 |
| CACo (自举) | BCD | LEVIR-CD | — | 100K 无标签 | — |

> CACo 仅用 100K 无标签数据匹敌 SeCo 1M 的预训练效果，证明了"变化感知采样"的高效性。

### 5.4 无监督（零训练）

| Method | Dataset | F1 | 资源需求 |
|--------|---------|-----|---------|
| SCM (FastSAM+CLIP) | LEVIR-CD | 62.80 | 超算中心推理 |
| SCM (FastSAM+CLIP) | WHU-CD | 61.81 | 超算中心推理 |

## 6. 关键洞察与方法论提炼

### 6.1 CACo：变化感知的自监督革命（CVPR 2023）

**核心思路**：不需要任何变化标签。通过计算双时相特征距离在时间轴上的相对比例，自动识别变化区域，然后用这些伪标签训练对比学习模型。

```
时间序列:  t₁ → t₂ → t₃ → t₄
特征距离:  d(t₁,t₂)  d(t₂,t₃)  d(t₃,t₄)
变化判断:  d(短期)/d(长期) 比率 + GMM 自动阈值
```

**关键创新**：自举式（bootstrap）变化估计——短时序特征距离与长时序特征距离的比值天然编码了"变化显著性"，无需人工阈值。

**局限**：未开源代码；在 LEVIR-CD 上的直接 CD 结果未报告；预训练后下游仍需微调。

### 6.2 SCM：完全无训练的零样本 CD（arXiv 2023）

**核心思路**：FastSAM 分别分割双时相影像 → CLIP 文本 prompt（"a building" / "a road"）过滤伪变化 → 输出变化图。

```
双时相影像 → FastSAM 分割 ↓
                         → 实例匹配 → PSA 过滤（CLIP） → 变化图
            FastSAM 分割 ↑
```

**PSA（Pseudo-change Suppression Algorithm）**：CLIP 文本 prompt 判断分割实例的语义类别，若两时相实例语义一致但位置偏移 → 视为伪变化并抑制。这是巧妙利用 VL 模型语义知识的案例。

**致命局限**：LEVIR-CD F1 仅 62.80，与有监督方法（90+）差距巨大。完全无训练意味着无法适应特定场景的成像条件。

### 6.3 Change3D：视频建模统一 CD 四任务（CVPR 2024）

**核心思路**：将变化检测重新定义为**视频理解**——在双时相影像间插入 **N 个可学习感知帧**（learnable perception frames），堆叠为 [T1, P₁, P₂, ..., P_N, T2] 的微视频，用预训练的 X3D-L（Kinetics 视频分类模型）直接编码。

```
传统 CD:   T1 → Encoder → ┌──────┐ → Decoder → Change Map
           T2 → Encoder → │ CD   │
                           │ Module│
Change3D:  [T1, P₁, P₂, ..., T2] → X3D-L Video Encoder → Lightweight Decoder → Change Map
                                   ↑ 感知帧在视频编码中与双时相交互
```

**关键创新**：
1. **感知帧（Perception Frames）**：可学习参数 + 双时相特征作为条件输入，替代传统 CD 模块。感知帧在 X3D-L 的 3D 卷积中与 T1、T2 的特征自然交互
2. **极小参数量**：仅 1.60M 可训练参数（SOTA 方法的 6%），1×RTX 3090 即可训练
3. **统一多任务**：同一架构同时输出 BCD map、SCD map、BDA 分级、CC 描述

**为什么有效**：X3D-L 在 Kinetics-400 上预训练学到的**运动感知能力**恰好是变化检测所需的核心能力——捕捉时间维度上的差异。感知帧作为"可学习的变化查询"在 3D 卷积中查询变化信息。

**当前最优**：LEVIR-CD F1 91.82、WHU-CD F1 94.56，均为已知最高。

### 6.4 AdaptVFMs：从二值到语义的 CD 升级（JAG 2025）

**核心思路**：将 VFMs（SAM+CLIP）适配到遥感 CD，不仅输出"变没变"，还输出"什么变成了什么"。

```
传统 CD pipeline:         AdaptVFMs pipeline:
  T1 → CNN → diff → 变化图      T1 → FastSAM → 实例掩码 ┐
  T2 → CNN ┘                                     ├→ SCDM → SCD 图
                                 T2 → FastSAM → 实例掩码 ┘
                                 CLIP → 语义分类 (42K RS图文微调)
```

**三个核心贡献**：
1. **RS VFM Fine-tuning Dataset**：42,000 遥感图文对，用于微调 CLIP 使其适配遥感语义空间
2. **1×1 卷积适配器**：在微调 FastSAM 时优于 3×3 和 5×5 卷积——保持空间信息的同时进行通道线性组合，避免大核平滑丢失细节
3. **SCDM（语义信息变化检测模块）**：三档语义权重（0.5/1.0/2.0）加权特征差分，抑制不变区域噪声、放大变化信号

**实验结果**：在 SYSU 数据集上 F1 提升 17.57%、mIoU 提升 17.77%，远超第二名——证明 VFMs 微调在特定遥感场景能带来阶跃式提升。

**局限**：仅支持 RGB 图像；SCD 语义标签准确率仅 ~70%（建筑 82.5% 最高，植被 44.3% 较低）；需要 12×RTX 3090 GPU。

### 6.5 MSCANet：CNN+Attention 混合的过渡方案（Sensors 2025）

**核心思路**：CNN 提取多尺度特征 → 语义图生成模块压缩空间分辨率 → 交叉注意力双向交互 → 变化图。

```
双时相影像 → 共享 CNN Encoder → 多尺度特征
                                    ↓
                              语义图生成 (非线性投影, H×W → 7×7)
                                    ↓
                              语义图 ↔ 特征图 交叉注意力 (双向)
                                    ↓
                              PCM 局部细节 + Decoder → 变化图
```

**唯一亮点**：语义图压缩将注意力复杂度从 O(n²) 降至 O(n)，但这一设计与 PVT/SegFormer 中的 spatial reduction attention 高度相似。

**严重问题**：
- **消融实验矛盾**：在 LEVIR-CD 上 Baseline 的 Precision (92.45 vs 90.65)、Recall (88.42 vs 87.46)、IoU (82.47 vs 80.22)、OA (99.04 vs 98.90) 四项指标均优于加了 Cross-Attention 的 MSCA，仅 F1 略高 (91.02 vs 90.39)——CA 模块实际上损害了模型性能
- **无参数量/FLOPs/推理时间对比**：结论中承认"参数量大"却从未量化
- **未开源代码**：数据可用性声明为"on reasonable request"
- **baseline 对比不公**：所有 baseline 结果直接引用原论文，非同一环境复现

**定位**：MSCANet 是 CNN→Transformer 过渡期的典型代表，但实验严谨性和可复现性不足。其声称的"outperforms"在 LEVIR-CD 上实际低于 BIT-CD (IoU 82.19) 和 ChangeFormer (IoU 82.10)。

## 7. 开放问题

### 7.1 语义变化检测（SCD）瓶颈
SECOND 数据集上 Change3D F1 仅 62.83 vs BCD 的 91.82。从"检测变化"到"理解变化"的鸿沟反映了语义理解能力不足。AdaptVFMs 的 SCD 标签准确率仅 ~70%，植被类别甚至只有 44.3%。需要更强大的语义基础模型或更多的 RS 语义标注。

### 7.2 无监督与有监督的性能差距
SCM（无监督）LEVIR F1 62.80 vs Change3D（有监督）91.82——差距 29 个百分点。CACo 的 OSCD F1 52.11 也远低于有监督方法。无监督方法在实际部署中仍缺乏竞争力。

### 7.3 跨数据集泛化
当前论文均未进行 cross-dataset 泛化测试（如 CDD 训练→LEVIR 测试）。不同传感器、不同地理区域、不同季节的泛化能力是真实应用的刚需。

### 7.4 FM 依赖与版本锁定
SAM/CLIP/X3D 版本迭代快。SCM 和 AdaptVFMs 依赖特定版本 FM，AdaptVFMs 的微调数据集和适配器需要随 FM 升级而重建。缺乏与 FM 解耦的标准化适配方案。

### 7.5 计算效率的三极分化
- **重计算**：AdaptVFMs (12×RTX 3090)、SCM（超算中心推理）
- **轻计算**：Change3D (1×RTX 3090, 1.60M params)
- **不透明**：CACo（未披露）、MSCANet（承认参数量大但未量化）

计算效率的透明化和标准化是社区亟待解决的问题。

### 7.6 开源与可复现性危机
5 篇论文中仅 3 篇开源（SCM、Change3D、AdaptVFMs）。CACo (CVPR 2023) 和 MSCANet (Sensors 2025) 均未开源。顶会论文不开源削弱了基准对比的可信度。

### 7.7 CD 评估的标准化
各论文使用不同数据集、不同指标、不同 baseline 复现方式，导致结果不可直接对比。社区需要像 NLP 的 GLUE/SuperGLUE 那样的统一 CD 评测基准。

## 8. 交叉引用

### 8.1 直接相关 L2 页面
- [[foundation-model-based]] — 已合并入本页。SAM/CLIP/X3D 驱动的 CD 方法
- [[transformer-based]] — 已合并入本页。CNN+Transformer 混合 CD 架构
- [[../representation-learning/contrastive-based]] — CACo 的自监督对比学习范式
- [[../multi-modal-fm]] — RemoteCLIP、SkySense 等多模态 FM 可嵌入 CD pipeline

### 8.2 相关 L3 模块
- [[module/multi-scale-feature-extraction]] — MSCANet 的多尺度 + 语义图压缩、AdaptVFMs 的 1×1 卷积适配器均涉及多尺度权衡
- [[module/open-source-reproducibility]] — CACo、MSCANet 未开源的复现危机；FM 版本锁定的可复现性挑战
- [[module/data-scarcity]] — CACo（自监督）和 SCM（无监督）正是应对 CD 标注稀缺的解决方案
- [[module/modality-fusion]] — AdaptVFMs 仅支持 RGB，多光谱/SAR 的 CD 需要跨模态融合

### 8.3 推荐的后续摄入（Citation Mining）
以下论文在 5 篇 review 中被反复引用/对比，建议纳入 L0_raw 并更新本页：
- **BIT-CD** (Chen et al., 2022, IEEE TGRS) — 首个纯 Transformer CD，LEVIR-CD 数据集发布者
- **ChangeFormer** (Bandara & Patel, 2022, IGARSS) — 层次化 Transformer CD，架构与 MSCANet 最相似
- **SwinSUNet** (Zhang et al., 2022, IEEE TGRS) — Swin Transformer CD
- **SAM-CD** (Ding et al., 2024, IEEE TGRS) — SAM 适配 CD 的早期工作
- **Segment Any Change** (Zheng et al., 2024) — 零样本变化检测
- **Change-Agent** (Liu et al., 2024) — MLLM 交互式变化分析
- **RemoteCLIP** (Liu et al., 2024) — 遥感视觉语言 FM
- **SkySense** (Guo et al., 2024, CVPR) — 多模态遥感 FM
- **ChangeMamba** (2024) — Mamba 状态空间模型引入 CD
- **CGNet** (2024) — 变化引导网络
- **SEIFNet** (Huang et al., 2024, IEEE TGRS) — 时空增强+层级融合
- **SLDDNet** (Fu et al., 2023, IEEE TGRS) — 阶段式长短距离依赖
- **ICIF-Net** (Feng et al., 2022, IEEE TGRS) — 尺度内交叉交互+尺度间融合

## 9. 方法论总结

| 范式 | 代表 | 核心思想 | 标注需求 | 性能天花板 | 部署难度 |
|------|------|---------|---------|-----------|---------|
| 自监督预训练 | CACo | 变化感知采样 → 对比学习 | 无 | 中（OSCD F1 52） | 中 |
| 零样本 FM | SCM | FastSAM+CLIP 直接推理 | 无 | 低（LEVIR F1 63） | 高（超算） |
| FM 微调 | AdaptVFMs | SAM+CLIP RS数据微调 → SCD | 42K图文+CD标签 | 高 | 高（12×3090） |
| 视频建模 FM | Change3D | 感知帧+X3D-L → 多任务统一 | CD标签 | 最高（LEVIR F1 92） | 低（1×3090） |
| CNN+Attention | MSCANet | 语义图压缩+交叉注意力 | CD标签 | 中高 | 中（参数量大） |

**趋势判断**：Change3D 的视频建模范式最可能成为下一代 CD 标准——参数极少、训练轻量、任务统一、指标最优。但无监督/自监督方法（CACo + SCM 路线）在标注稀缺场景下仍有不可替代的价值，两者的融合（如 CACo 预训练 + Change3D 感知帧）可能是更优解。

### [2026-06-12] 更新 — AdaptVFMs 重审（Daily Reading Agent）

**基于 full.md 重读 + 架构图分析 + 代码仓库验证的新发现：**
1. SCDM 核心创新：语义特征空间欧氏距离 + 分段权重（0.1/0.5 阈值 → 0.5/1.0/2.0 权重），非 naive 分割后比较
2. Table 6 消融：SAM 微调贡献 7.02% F1（CLCD），CLIP 仅追加 1.33%——**分割质量是瓶颈，语义分类相对容易**
3. 代码仓库仅开源数据集（42K 图文对），无训练/推理代码——"数据开源但模型闭源"模式
4. 数据集同义词扩展策略：farmland → field/cropland/cultivated/plantation/terrace（提升 CLIP 泛化）
5. 引文新发现：ViTamin (Chen et al., 2024, arXiv) 可扩展视觉模型；SAM 2 (Ravi et al., 2024, arXiv) 视频分割扩展；CDasXORNet (Chen et al., 2024, JAG) 同期刊 XOR 建模对比
6. 跨 wiki 连接：与 L3_module/multi-scale-feature-extraction.md 关联（1×1 Conv 适配器 = 无下采样多尺度融合）；与 L3_module/open-source-reproducibility.md 关联（部分开源模式）

### [2026-05-18] 更新 — Change3D 重审评分 5/5 确认

Change3D 经 full.md 全量重读后评分从 4/5 提升至 **5/5**。关键新发现：
1. Sec 9 信息论分析证明条件概率链从 4 项缩短为 2 项，总熵降低
2. 感知帧随机初始化一致优于固定初始化（Tab 14-15）
3. 预训练数据量-性能饱和点在 K400 的 75%（~1.4M 帧），远低于 CLIP 的 400M（Figure 5）
4. Cosine/Angular 损失在 SCD 上优于 L1/L2（Tab 16）——内容方向>幅值差异
5. Code 已验证（github.com/zhuduowang/Change3D），结构清晰，极简解码器设计
