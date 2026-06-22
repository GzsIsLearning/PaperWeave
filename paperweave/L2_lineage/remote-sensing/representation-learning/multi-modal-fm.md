---
title: Multi-modal Foundation Models for Remote Sensing
created: 2026-04-29
updated: 2026-06-07
type: lineage
domain: remote-sensing
task: representation-learning
approach: multi-modal-fm
tags: [remote-sensing, multimodal, foundation-model, pre-training, self-supervised, sar, optical, multi-spectral, hypernetwork, moe]
sources:
  - L0_raw/a-semantic-enhanced-multi-modal-remote-sensing-foundation-model-for-earth-observ
  - L0_raw/any-optical-model-a-universal-foundation-model-for-optical-remote-sensing
  - L0_raw/bridging-remote-sensors-with-multisensor-geospatial-foundation-models
  - L0_raw/earth-ai-unlocking-geospatial-insights-with-foundation-models-and-cross-modal-re
  - L0_raw/foundation-models-for-generalist-geospatial-artificial-intelligence
  - L0_raw/neural-plasticity-inspired-multimodal-foundation-model-for-earth-observation
  - L0_raw/on-the-foundations-of-earth-foundation-models
  - L0_raw/pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models
  - L0_raw/ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-
  - L0_raw/seamo-a-season-aware-multimodal-foundation-model-for-remote-sensing
  - L0_raw/a-foundation-model-for-the-earth-system
  - L0_raw/remote-sensing-meta-modal-representation-for-missing-modality-land-cover-mapping
  - L0_raw/mtmamba-enhancing-multi-task-dense-scene-understanding-via-mamba-based-decoders
  - L0_raw/terramind-any-to-any-generative-multimodal-foundation-model-for-earth-observation
confidence: high
---

# 多模态遥感基础模型

## 概述

遥感天然是多模态的——光学（RGB/多光谱/高光谱）、SAR、时序数据、地理元数据从不同物理机制捕获地球表面的互补信息。多模态遥感基础模型（Multi-modal RS Foundation Model）的核心命题是：**如何用一个统一的模型处理物理特性截然不同的传感器数据，同时保持跨模态语义对齐，且计算成本可控？**

这一领域的演进经历了三个关键范式转换：

1. **对齐范式（2023）**：分别编码再跨模态对齐——CROMA 用对比学习对齐 SAR-光学特征，msGFM 用跨传感器 MIM 配对重建。这一阶段的模型通常 100M 参数以内，支持 2-4 种模态。

2. **统一范式（2024-2025）**：寻找一个"统一参数"来桥接异构传感器。DOFA/DOFA+ 提出波长条件超网络——将中心波长作为神经可塑性的触发信号，动态生成每个波段的嵌入权重。AOM 提出通道独立分词器（SiTok），使任意波段的光学数据可被同构处理。这一范式的核心洞见是：**异构传感器的差异本质上是连续的（波长的变化），而非离散的**。

3. **语义增强与规模化范式（2025-）**：RingMoE 将 Mixture-of-Experts 架构首次引入 RS FM，用模态专家/协作专家/共享专家三元设计处理 4 种模态，总参数 14.7B。SkySense++ 在 Nature MI 发表，将语义标签融入预训练实现了 in-context learning，使得模型可在 few-shot 场景下零微调工作。同时，Earth AI（Google）展示了多模态 RS FM 在真实应急响应中的 agentic 编排能力。

最令人警醒的发现来自 PANGAEA benchmark：**当前的多模态 RS FM 在充分标注数据下并未始终超越有监督基线（如 UNet）**。这揭示了领域内一个深刻的效率悖论——数十亿参数的预训练模型，在特定任务上可能被精心训练的轻量模型反超。然而，在少标签场景和跨模态泛化任务中，FM 的优势无可替代。

Zhu 等人在 Nature Communications Earth & Environment 上提出了理想 Earth FM 的 11 个必备特性：地理位置嵌入、地理平衡表示、尺度感知、波长嵌入、多传感器、时变、任务无关、碳最小化、不确定性量化、物理一致性、VLM/LLM 利用——目前没有任何模型满足全部 11 项。

## 演化时间线

```
2023  CROMA (Fuller, NeurIPS)       ← SAR-光学双编码器 + 跨模态 Transformer，对比+MAE 双目标
  │   Prithvi (Jakubik, IBM/NASA)   ← 首个大规模 geospatial FM (100M)，HLS 1TB MAE 预训
  │   msGFM (Han, CVPR 2024)        ← 跨传感器 MIM + MoE，证明从头预训练优于 ImageNet 蒸馏
  │
2024  SkySense (Guo, CVPR)          ← 2.06B 因子化编码器 + 多粒度对比 + Geo-Context PE
  │   DOFA (Xiong, arXiv)           ← 波长条件超网络，单一模型适配任意波段 SAR+光学+高光谱
  │   DOFA+  (Xiong, arXiv)         ← DINOv2 初始化 + 仅 41 万图像 3 天 8×L40 = PANGEA SOTA
  │   PANGAEA (Xiong, NeurIPS)      ← 首个标准化 GFM benchmark，揭示 FM 并不始终击败有监督基线
  │
2025  SeaMo (中科院空天院, arXiv)     ← 渐进式 MIM + TM Fusion Block 交叉注意力，200 GPU-h 训 SOTA
  │   RingMoE (Sun/中科院, arXiv)   ← 14.7B MoE MIM，模态/协作/共享专家三元组，512×Ascend
  │   SkySense++ (Wu, Nature MI)    ← 掩码语义学习 + in-context few-shot learning，12 任务 7 领域
  │   AOM (Li, 东南大学, arXiv)      ← 通道独立分词 SiTok + MAPE 多尺度 PE，任意波段光学统一
  │   Earth AI (Google)             ← 三域 FM 家族 (Imagery/Population/Environment) + Gemini Agent
  │   TerraMind (Jakubik, IBM/ESA/NASA, ICCV) ← 首个 any-to-any 生成式多模态 EO 模型，双尺度预训练+TiM
  │   "On the Foundations..." (Zhu, ← 定义理想 Earth FM 的 11 特性框架，系统评估 SOTA gap
  │    Nature Comm. Earth & Env.)
  │
  └──→ 范式收敛点：统一表示 (DOFA/AOM) + 语义注入 (SkySense++) + 规模化 MoE (RingMoE) + 生成范式 (TerraMind)
       + 实用主义 (SeaMo: RTX 4090 可训; DOFA+: 41 万样本 3 天)
```

## 综合对比表

| 论文 | 年份 | 出处 | 评分 | 支持模态 | 预训练数据 | 架构 | 关键创新 | 参数量 | 训练成本 | 代码 |
|------|------|------|------|----------|-----------|------|----------|--------|---------|------|
| **CROMA** | 2023 | NeurIPS | 5 | SAR + MS | SSL4EO 100万对 | 双编码器+跨模态Transformer | 对比对齐+各自MAE重建，2D-ALiBi PE | 86M | 8×A100 | [开源](https://github.com/antofuller/CROMA) |
| **Prithvi** | 2023 | arXiv (IBM/NASA) | 5 | MS时序 (HLS 6波段) | HLS 1TB (CONUS) | ViT 3D MAE | 3D时空PE + 分层采样数据管道 | 100M | 64×A100 | [开源](https://huggingface.co/ibm-nasa-geospatial) |
| **msGFM** | 2024 | arXiv/CVPR | 4 | RGB+S2+SAR+DSM | GeoPile-2 200万 | Swin-Base + MoE | 跨传感器MIM配对重建，从头预训>蒸馏 | 89M | 8×V100 | [开源](https://github.com/boranhan/Geospatial_Foundation_Models) |
| **SkySense** | 2024 | CVPR | 5 | HR光学+MS时序+SAR时序 | 自建 2150万时序 | 因子化编码器+多粒度对比+Geo-Context | 时空模态解耦，地理位置感知对比学习 | 2.06B | 80×A100, 1000ep | 未开源 |
| **DOFA+** | 2024 | arXiv (TUM) | 5 | SAR+MS+RGB+HS (5模态) | 仅41万 (+DINOv2) | 波长条件超网络+ViT | 波长作统一参数，DINOv2初始化+分层蒸馏 | 300M | 8×L40, 3天 | [开源](https://github.com/zhu-xlab/DOFA) |
| **SeaMo** | 2025 | arXiv (中科院) | 4 | MS + SAR (4季) | SSL4EO 300万 | ViT-B + TM Fusion Block | 渐进式预训练策略，级联交叉注意力融合季节多模态 | 86M | RTX 4090, 200h | 未开源 |
| **RingMoE** | 2025 | arXiv (中科院) | 5 | 光学+MS+SAR-L1+S-L2 (4模态) | RingMOSS 4亿 | Swin+MoE (模态/协作/共享专家) | RSFM首次引入MoE，SAR-L1物理功率重建，动态剪枝14.7B→1B | 14.7B | 512×Ascend | 数据集开源 |
| **SkySense++** | 2025 | Nature MI | 5 | HR光学+MS光学+SAR (11+卫星) | RS-Rep 2150万 + RS-Sem | 多粒度对比+掩码语义学习 | 首个RS in-context FM，语义bank实现跨模态few-shot | ~2B | 80×A100, 336h | [部分开源](https://github.com/kang-wu/SkySensePlusPlus) |
| **AOM** | 2025 | arXiv (东南大学) | 4 | 光学任意波段+分辨率 | 156万 (S2+L8+RGB) | ViT-B + SiTok + MAPE | 通道独立分词+伪逆缩放多分辨率PE，跨传感器无缝泛化 | 86M | ViT-B, 220ep | 未开源 |
| **Earth AI** | 2025 | Google | 5 | 影像+人口+环境(三域) | Google内部大规模数据 | RS VLM + ViT + Gemini Agent | 三域FM家族+Gemini智能体编排，多模态协同11% R²提升 | 未公开 | 大规模 | 未开源 |
| **TerraMind** | 2025 | ICCV | 5 | 光学+SAR+DEM+LULC+NDVI+坐标+文本 (9模态) | TerraMesh 900万 | Transformer编码器-解码器 + FSQ分词器 | 双尺度(token+像素)预训练，any-to-any生成，TiM递归增强 | Base/Large | 32×A100, 6-10天 | [开源](https://github.com/ibm/terramind) |

## 设计维度分类

### 模态融合策略分类

多模态 RS FM 的融合策略在 2023-2025 年间经历了从"分而治之"到"统一表征"再到"动态路由"的演化：

```
┌──────────────────────────────────────────────────────────────────────┐
│                    多模态 RS FM 融合策略分类体系                        │
│                                                                      │
│  1. 对齐式 (Alignment-Based)                  代表：CROMA, msGFM     │
│     ┌─────────────────────┐                                       │
│     │ 模态A → Encoder_A → │                                        │
│     │ 模态B → Encoder_B → │→ 融合模块 (对比/交叉注意力/MIM) → 输出    │
│     └─────────────────────┘                                       │
│     特点：各模态独立编码，在高层语义空间对齐                            │
│     优点：灵活扩展新模态，训练稳定                                     │
│     缺点：模态间底层特征共享不足，参数冗余                              │
│                                                                      │
│  2. 统一式 (Unification-Based)              代表：DOFA/DOFA+, AOM   │
│     ┌──────────────────────────────────────┐                      │
│     │ 任意模态 → 统一参数化器(波长/通道索引) → 共享Encoder → 输出   │
│     └──────────────────────────────────────┘                      │
│     特点：通过连续参数(波长)或通道索引将异构输入映射到统一空间          │
│     优点：参数效率极高，天然支持新模态插值                              │
│     缺点：对底层物理差异极大的模态(如SAR vs 光学)对齐可能不足          │
│                                                                      │
│  3. 混合式 (Hybrid)              代表：SkySense, SkySense++         │
│     ┌─────────────────────┐                                       │
│     │ 模态A → Enc_A →      │                                       │
│     │ 模态B → Enc_B → 时序融合 → 多粒度对比/语义掩码学习 → 输出    │
│     │ 模态C → Enc_C →      │                                       │
│     └─────────────────────┘                                       │
│     特点：因子化编码各自模态，时序级融合，语义增强预训练                │
│     优点：可灵活支持不同模态组合，支持时序输入                          │
│     缺点：模态数量增加时编码器线性增长                                  │
│                                                                      │
│  4. 动态路由式 (Dynamic Routing)                 代表：RingMoE      │
│     ┌────────────────────────────────────────────┐                │
│     │ 输入Token → Router → ┌模态专家(独享)        │                │
│     │                      ├协作专家(跨模态共享)   │→ 共享Encoder  │
│     │                      └共享专家(全局知识)     │                │
│     └────────────────────────────────────────────┘                │
│     特点：MoE门控动态选择专家，模态专业化+跨模态协作统一架构            │
│     优点：参数规模可线性扩展至14.7B，推理时可按需剪枝至1B              │
│     缺点：需要大规模模态平衡的预训练数据，路由坍塌风险                  │
│                                                                      │
│  5. 时序感知式 (Temporal-Aware)              代表：SeaMo, Prithvi   │
│     ┌──────────────────────────────────────────────────────┐      │
│     │ 多季输入 → Encoder → TM Fusion Block(交叉注意力) → 解码 │      │
│     └──────────────────────────────────────────────────────┘      │
│     特点：在统一编码后，通过跨时间步的交叉注意力融合季节变化          │
│     优点：显式建模物候变化，提升时间感知任务性能                      │
│     缺点：时间步增加计算线性增长                                      │
│                                                                      │
│  6. 生成式Token范式 (Generative Token-Based)   代表：TerraMind     │
│     ┌──────────────────────────────────────────────────────┐      │
│     │ 任意模态 → Tokenizer → 离散Token序列 → 共享Encoder   │      │
│     │              ↓ 双尺度输入 ↓                            │      │
│     │         Pixel Patch + Token → 交叉熵预测目标Token      │      │
│     └──────────────────────────────────────────────────────┘      │
│     特点：将EO模态离散化为token词汇表，通过跨模态token分类学习关联    │
│     优点：天然支持any-to-any生成，压缩率250x-3000x，可复用LLM技术   │
│     缺点：模态特定tokenizer需单独训练，无法像DOFA那样插值新传感器    │
└──────────────────────────────────────────────────────────────────────┘
```

### 预训练范式分类

| 范式 | 代表模型 | 核心思想 | 优势 | 局限 |
|------|---------|---------|------|------|
| **纯 MIM** | Prithvi, SeaMo, msGFM | 随机掩码+重建原图 | 简单高效，不依赖配对数据 | 高层语义捕获弱 |
| **纯对比学习** | (早期 CL 模型) | 拉近正样本/推远负样本 | 语义判别力强 | 需精心设计正负样本对 |
| **MIM + 对比混合** | CROMA, SkySense, AOM | 同时重建局部+对齐全局语义 | 兼顾局部细节与全局语义 | 多目标平衡困难 |
| **知识蒸馏 MIM** | DOFA(+) | DINOv2 教师→MIM 学生+分层蒸馏 | 复用视觉先验，极低计算成本 | 依赖教师模型质量 |
| **语义掩码学习** | SkySense++ | 掩码语义标签→in-context重建 | 引入标签信息实现 few-shot | 需要大规模语义标注数据集 |
| **物理感知 MIM** | RingMoE (SAR-L1) | SAR 功率重建而非像素重建 | 嵌入物理先验 | 仅适用于有物理模型的模态 |
| **跨模态Token分类** | TerraMind | 双尺度输入→交叉熵预测目标token | 统一生成+判别，any-to-any | 模态特定tokenizer，无时间建模 |

### 架构骨架分类

| 骨架类型 | 代表模型 | 特点 |
|---------|---------|------|
| **ViT** | Prithvi, AOM, DOFA+ | 标准 Transformer，灵活但无层次结构 |
| **Swin Transformer** | SkySense, RingMoE, msGFM | 层次化窗口注意力，适合多尺度特征 |
| **ViT + MoE** | RingMoE | Swin 的 FFN 替换为 MoE 层，动态专家选择 |
| **ViT + 超网络** | DOFA/DOFA+ | 波长编码→动态生成 patch embedding 权重 |
| **因子化编码器** | SkySense/SkySense++ | 每模态独立 encoder + 共享 fusion encoder |

## 效率悖论

多模态 RS FM 领域最引人深思的现象是 **"逆规模化"悖论**——更大的预训练数据和计算量并不必然带来更优的下游性能：

| 模型 | 参数量 | 预训练数据量 | 计算成本 | SOTA 表现 | 效率指数 |
|------|--------|-------------|---------|----------|---------|
| **DOFA+** | 300M | **41万图像** | **8×L40, 3天** ⚡ | PANGEA 59.81 mIoU | ⭐⭐⭐⭐⭐ |
| **SeaMo** | 86M | 300万 | **RTX 4090, 200h** ⚡ | BigEarthNet-SAR SOTA | ⭐⭐⭐⭐⭐ |
| **RingMoE** | 14.7B | 4亿 | 512×Ascend 🔥 | 23/25 benchmark SOTA | ⭐⭐⭐ |
| **SkySense/SkySense++** | ~2B | 2150万 | 80×A100, 336-1000h 🔥 | 12任务7领域领先 | ⭐⭐ |
| **AOM** | 86M | 156万 | ViT-B, 220ep | GEO-Bench 63.98 mIoU | ⭐⭐⭐⭐ |

**核心洞察：**

1. **先验知识杠杆效应**：DOFA+ 的关键不是数据多，而是复用 DINOv2 的视觉先验。通过波长条件超网络桥接自然图像与遥感图像的域差距，仅需 41 万遥感图像微调即可超越从头预训练的数十亿参数模型。这暗示：**遥感 FM 的未来不在于更大的遥感数据，而在于如何高效迁移通用视觉知识**。

2. **架构创新 > 暴力扩数据**：SeaMo (86M 参数) 和 AOM (86M 参数) 均以 ViT-Base 级参数量取得 SOTA——渐进式预训练策略（SeaMo）和通道独立分词器（AOM）展示了精巧架构设计的力量。

3. **规模化并非无用**：RingMoE 的 14.7B MoE 确实在 23/25 benchmark 上领先，但其训练需要 512 块 Ascend GPU。对于大多数研究团队而言，这种规模的训练是不可及的。

4. **PANGAEA 的警告**：在充分标注数据下，多模态 FM 并不始终击败 UNet 有监督基线——这质疑了"预训练万能论"，并将研究焦点从"更大更强"拉回到"何时有用"。

## 当前 SOTA 格局

由于各模型在不同 benchmark 上评估、采用不同微调策略，直接对比困难。以下基于 PANGAEA 标准化评估及各自论文报告的最强结果：

| 任务域 | Benchmark | 当前最优 | 成绩 | 次优 | 
|--------|-----------|---------|------|------|
| **多模态分割** | WHU-OPT-SAR | RingMoE | 54.7 mIoU | — |
| **多模态分割** | DFC23 | RingMoE | 73.4 mIoU | — |
| **光学检测** | DIOR | RingMoE | 82.45 mAP50 | SkySense 78.73 |
| **场景分类** | NWPU-RESISC45 (10%) | RingMoE | 95.90% | SkySense 94.85% |
| **多模态分割** | PANGAEA (11数据集均值) | DOFA+ | 59.81 mIoU | — |
| **多模态分割** | PANGAEA (11数据集均值) | TerraMindv1-B | 59.29 mIoU | TerraMindv1-L ~61.3 |
| **跨传感器分割** | SPARCS (Landsat-8) | AOM | 68.5 mIoU | SpectralGPT 57.6 |
| **时序云去除** | HLS 云填补 | Prithvi | SSIM >0.9 | CGAN 基线 |
| **Few-shot分割** | 多数据集 | SkySense++ | +14.08% mIoU 提升 | SkySense |
| **SAR 分割** | SARSegL1 | RingMoE | +18.21% mIoU | 基线方法 |
| **农业分类** | Germany crop | SkySense++ | 87.14 mIoU | SkySense 85.99 |

**趋势总结**：
| **RingMoE 统治单模态/多模态检测分类**（受益于 14.7B 参数量 + MoE 架构）
| **DOFA+ 统治跨传感器泛化**（受益于波长统一参数 + DINOv2 先验）
| **AOM 统治光学跨传感器场景**（受益于通道独立分词器）
| **SkySense++ 统治 few-shot/应急场景**（受益于语义增强的 in-context learning）
| **TerraMind 统治生成式多模态**（受益于双尺度预训练 + any-to-any 生成 + TiM）

## 开放问题

### 1. 可复现性危机

10 篇核心论文中仅 3 篇完全开源（CROMA, Prithvi, DOFA+），2 篇部分开源（RingMoE 数据集公开, SkySense++ 部分代码）。SkySense、SeaMo、AOM、Earth AI 的权重和训练代码均未公开。这严重制约了社区在已有工作基础上持续改进。PANGAEA benchmark 的出现是进步——标准化评估至少让不同论文的结果可以横向对比——但当前各论文仍在不同 benchmark/设置下报告结果，使得"SOTA"声明难以验证。

### 2. 模态缺失鲁棒性

生产环境中往往无法保证所有模态都可用（卫星过境时间、云覆盖、传感器故障等）。现有模型大多在"全模态可用"的假设下设计和训练。DOFA 的波长插值和 SkySense++ 的模态缺失补全模块（masked modality completion）是重要的初步探索，但尚无模型系统性地在该问题上取得突破。

### 3. 物理一致性

Zhu 等人在"On the Foundations of Earth Foundation Models"中指出：物理一致性（第10项特性）是所有现有 EO FM 中最被忽视的维度。RingMoE 对 SAR-L1 的功率重建是少数将物理先验嵌入预训练目标的尝试，但距离真正物理约束的模型还有很远距离（如辐射传输方程约束、能量守恒约束等）。

### 4. 学术标杆 vs 真实部署的鸿沟

- Earth AI 是唯一展示真实应急响应部署的系统（Hurricane Helene 灾后分析）
- PANGAEA 揭示：在充分标注数据下，UNet 在许多任务上不输甚至优于 FM
- 学术 benchmark 通常使用"冻结 backbone + 线性探头"评估，但实际部署中 full fine-tuning 或 PEFT 更实用
- RingMoE 的动态剪枝 14.7B→1B 是解决部署效率的重要方向

### 5. 地理偏见

大部分模型的预训练数据集中于美国、中国和欧洲。RingMOSS 虽覆盖 57 个国家，但主要贡献仍来自 US/China/Japan。热带、极地、海洋区域的代表性严重不足。

### 6. 时序建模的不足

除 Prithvi (3时间步) 和 SeaMo (4季节) 外，现有模型对长时序的建模能力有限。Presto（<1M 参数）虽然小，但在长时间序列的像素级分类回归上表现出色——说明 FM 与时序专用模型之间存在互补而非替代关系。

### 7. 评估标准化

PANGAEA 是起点，但仍有不足：只评估冻结编码器，缺少检测/分类任务，不包含 VLM 评估。领域亟需一个类似 NLP 中 GLUE/SuperGLUE 的统一多模态 RS FM 评估框架——涵盖不同标注量级（1%/10%/100%）、不同微调策略（frozen/PEFT/full）、不同模态组合（单模态/双模态/全模态/模态缺失）。

## 未来方向

1. **通用视觉先验 + 轻量域适应的范式**（DOFA+ 路线）：利用 DINOv2/SAM 等 CV 大模型的知识，仅需少量 RS 数据微调即可取得 SOTA——这是资源受限团队的最可行路线。

2. **MoE 的实用化**：RingMoE 证明了 MoE 在 RS 多模态场景的有效性。未来的关键是如何让 MoE 在不依赖 512 块 GPU 的前提下可训？——稀疏激活、专家剪枝、知识压缩等方法至关重要。

3. **VLM/LLM 整合**：Earth AI 的 Gemini Agent 展示了将多模态 RS FM 与 LLM 编排相结合的巨大潜力。SkySense++ 的 in-context learning 为 RS FM 与 LLM 的深层整合提供了另一条路径。

4. **物理感知预训练**：将辐射传输模型、SAR 散射模型、大气校正等物理知识编码进预训练目标——而不是仅依赖数据驱动的像素重建。

## 相关方法

- [[mae-based]] — MIM（掩码图像建模）是多模态 FM 最主流的预训练组件，几乎所有模型都有 MIM 变体
- [[contrastive-based]] — 跨模态对比学习是对齐多模态表示的关键技术，CROMA/SkySense/DOFA 均使用
- [[moe-based]] — RingMoE 开创了 RS 领域的 MoE 多模态路由范式
- [[vlm-based]] — 多模态 FM 与视觉语言模型的融合方向（Earth AI, SkySense++, TerraMind)
- [[generative-token-based]] — TerraMind 开创的 any-to-any 生成式 token 范式，双尺度预训练 + TiM
