---
title: 遥感视觉语言模型演进 — 从跨模态对齐到 MoE 路由
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: remote-sensing
task: vision-language
approach: evolution
tags: [remote-sensing, vlm, moe, vision-language, cross-modal-alignment, hallucination, mixture-of-experts]
sources:
  - L0_raw/mind-the-modality-gap-towards-a-remote-sensing-vision-language-model-via-cross-m
  - L0_raw/vhm-versatile-and-honest-vision-language-model-for-remote-sensing-image-analysis
  - L0_raw/rs-moe-a-vision-language-model-with-mixture-of-experts-for-remote-sensing-image-
  - L0_raw/rsunivlm-a-unified-vision-language-model-for-remote-sensing-via-granularity-orie
  - L0_raw/skymoe-a-vision-language-foundation-model-for-enhancing-geospatial-interpretatio
zotero_keys: []
confidence: high
---

# 遥感视觉语言模型演进：从跨模态对齐到 MoE 路由

## 1. Overview

遥感视觉语言模型 (RS VLM) 经历了从通用 VL 迁移（无配对数据两阶段对齐）到 RS 专用架构（数据驱动的诚实 QA + MoE 解耦）的范式演进。基于 5 篇代表性论文，演进路径可归纳为：

```
2024  PAINT (Mind the Gap)     ← 跨模态对齐：权重插值+蒸馏，无需RS图文配对
  │
2024  RSUniVLM (PKU)            ← G-MoE：按粒度 (图像/区域/像素) 分3专家，端到端统一
  │                               Text4Seg 将分割掩码表示为文本描述符
  │
2025  VHM (AAAI 2025)           ← 数据驱动：丰富描述训练 + 诚实性评估，CLIP+Vicuna-7B
  │                               VersaD 1.4M + HnstD 45K，12类任务
  │   RS-MoE (IEEE TGRS 2025)    ← Instruction Router：按Caption子任务 (主题/地物/关系) 分解
  │                               ViT-G+Vicuna-7B，1B追平13B通用VLM
  │   SkyMoE (arXiv 2025)        ← Adaptive Router + 8专家 + 对比数据增强
  │                               Count-Varying Cutout 解决计数虚高
```

当前处于 VLM 快速迭代期：5篇论文来自4个不同团队，架构选择（视觉编码器、LLM、MoE路由策略）高度分化，尚未收敛。

合并自 [[vlm-based]] 和 [[moe-based]]。

## 2. Evolution Timeline

```
2024  *** RS VLM 元年 ***
  │   PAINT (Zavras, arXiv)        ← 跨模态权重插值 (α=0.5) + 蒸馏
  │   RSUniVLM (Liu, arXiv)        ← 首个统一图像/区域/像素三级 RS VLM
  │                                    G-MoE: 按粒度分3专家，training-free routing
  │
2025  *** 架构分化 + 诚实性 ***
  │   VHM (Pang, AAAI)             ← 首次诚实性评估 + 丰富描述训练
  │                                    VersaD 1.4M (Gemini-Vision生成)
  │   RS-MoE (Lin, IEEE TGRS)      ← 首个 RS MoE-VLM，Caption子任务分解
  │                                    RSICap 2585张人工标注
  │   SkyMoE (Liu, arXiv)          ← 自适应路由 + 对比增强联合设计
  │                                    MGRS-Bench 5类×21数据集
```

## 3. Comparison Table

| Paper | Year | Venue | Score | Visual Enc | LLM | Key Innovation | Tasks | Best Metric | Compute | Code |
|-------|------|-------|-------|-----------|-----|---------------|-------|-------------|---------|------|
| **PAINT** | 2024 | preprint | 4 | CLIP (patched to multispec) | CLIP text enc | 跨模态权重插值+蒸馏，无需图文配对 | 零样本分类+跨模态检索 | BigEarthNet-19 74.69% (↑58%) | — | [✓](https://github.com/Orion-AI-Lab/MindTheModalityGap) |
| **VHM** | 2025 | AAAI | 5 | CLIP-ViT-L (多层级) | Vicuna-7B | 丰富描述+诚实QA；VersaD 1.4M + HnstD 45K | 12类 (含诚实) | SC avg 85.13% | 16×A100 | [✓](https://github.com/opendatalab/VHM) |
| **RS-MoE** | 2025 | IEEE TGRS | 4 | ViT-G/14 | Vicuna-7B | Instruction Router按子任务分解Caption | 2类 (Caption+VQA) | RSICap BLEU4 42.55 | — | [✓](https://github.com/CongcongWen1208/RS-MoE) |
| **RSUniVLM** | 2024 | arXiv | 5 | SigLIP-400M | Qwen2-0.5B (~1B) | G-MoE按粒度(图像/区域/像素)；Text4Seg统一掩码 | 6类 (SC+VQA+VG+CC+CD+Seg) | RSVQA-LR 92.05% | 4×A40/30h | ✗ |
| **SkyMoE** | 2025 | arXiv | 4 | CLIP-ViT-L (504×504) | Vicuna-7B | Adaptive Router+8专家+对比数据增强+Count-Varying Cutout | 5类×21数据集 | RSVQA-LR 93.13% | 6×A800 | ✗ |

> **Score**: VHM (AAAI) 和 RSUniVLM (首个统一架构) 贡献最高 (5/5)。RS-MoE 首个RS MoE-VLM。SkyMoE 联合设计最优。PAINT 是跨模态对齐奠基石。

## 4. Design Taxonomy

### 4.1 核心设计四问

本领域论文围绕四个核心设计问题展开：

| 设计问题 | 选项分布 | 趋势 |
|---------|---------|------|
| **视觉编码器选什么？** | CLIP-ViT-L ×3, ViT-G, SigLIP | CLIP 系列占优但仍分歧 |
| **LLM 用什么？** | Vicuna-7B ×3, Qwen2-0.5B, CLIP text enc | Vicuna 是事实标准，Qwen2 是新兴替代 |
| **对齐方法？** | 权重插值 (PAINT), 数据驱动训练 (VHM), 投影层对齐 (RS-MoE/RSUniVLM/SkyMoE) | 投影层对齐 + instruction tuning 是主流 |
| **如何控制幻觉？** | 数据过滤 (VHM 丰富描述), MoE解耦 (?), 诚实性评估 (VHM HnstD) | 仅 VHM 系统研究，MoE 的幻觉控制是开放问题 |

### 4.2 MoE 路由策略三向度

```
┌─────────────────────────────────────────────────────────────────┐
│                    RS VLM MoE 三种路由策略                        │
│                                                                 │
│  RSUniVLM G-MoE:         RS-MoE Router:        SkyMoE:          │
│  按粒度分专家             按子任务分解           数据增强引导      │
│  ┌──────┐               ┌──────┐              ┌──────┐          │
│  │Image │ ← scene cls   │主题  │ ← scene      │局部  │ ← obj    │
│  ├──────┤               ├──────┤              ├──────┤          │
│  │Region│ ← VG, VQA     │地物  │ ← object     │全局  │ ← ctx    │
│  ├──────┤               ├──────┤              └──────┘          │
│  │Pixel │ ← Seg, CD     │关系  │ ← spatial    Count-Varying     │
│  └──────┘               └──────┘              Cutout控制密度    │
│                                                                 │
│  Training-free gate       Training-free gate    Data-driven     │
│  端到端统一6任务           Caption子任务分解      联合超加和增益    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 对齐方法演进

| 方法 | 代表 | 配对数据需求 | 核心机制 | 局限 |
|------|------|-----------|---------|------|
| **权重插值** | PAINT | 零配对 | α=0.5 融合 RS 视觉 + 通用 VL，保持 ImageNet 性能仅降1.27% | 仅适用 CLIP-like 架构 |
| **投影层对齐** | RS-MoE, RSUniVLM, SkyMoE | 中等 (指令数据) | 冻结视觉编码器+LLM，仅训练投影层+MoE | 依赖指令数据质量 |
| **数据驱动** | VHM | 大量 (1.4M) | Gemini-Vision 生成丰富多句描述，用数据教会模型 | 数据生成VLM偏见传导 |

### 4.4 任务覆盖对比

```
PAINT:   [零样本分类] [跨模态检索]                          ← 无指令跟随
VHM:     [SC] [VQA] [VG] [CC] [诚实QA] ... ×12类           ← 最广任务覆盖
RS-MoE:  [Caption] [VQA]                                   ← 聚焦Caption
RSUniVLM:[SC] [VQA] [VG] [CC] [CD] [Seg]  ×6类            ← 唯一含像素级(Seg/CD)
SkyMoE:  [SC] [VQA] [VG] [CC] [计数] ×5类                  ← 唯一含计数评估
```

## 5. Key Insights per Paper

### 5.1 PAINT: 无需配对数据的跨模态对齐 (2024)

**核心思路**: CLIP 在自然图像上训练，遥感多光谱图像与 RGB 分布不同导致 modality gap。PAINT 提出 CLIP 视觉编码器权重插值——将通用 CLIP 视觉权重与遥感微调权重线性融合 (α=0.5)，配合跨模态蒸馏。

**关键创新**: 
- 权重插值保持 ImageNet 性能仅降 1.27%
- 跨模态蒸馏让 CLIP text encoder 学习遥感语义
- BigEarthNet-19 零样本从 15.18% → 72.04%（近5倍提升）

**设计意义**: PAINT 证明了"不需要图文配对也可以构建 RS VLM"——这对标注稀缺的遥感领域是颠覆性的。但 PAINT 仅覆盖零样本分类和检索，不支持指令跟随。

**局限**: 依赖 CLIP 架构；不支持多轮对话和指令任务。

### 5.2 VHM: 诚实性——RS VLM 的未被探索维度 (AAAI 2025)

**核心思路**: VHM 首次将"诚实性"引入 RS VLM 评估。HnstD 数据集包含事实性/欺骗性问题对。用 Gemini-Vision 生成的**丰富多句描述**训练，使模型对 RS 图像建立更全面的理解。

**关键数据**:
| Honest QA 类型 | 示例问题 | 表现 |
|---------------|---------|------|
| 物体存在性 (factual) | "图中是否有汽车？" | 81.50% |
| 物体存在性 (deceptive) | "图中是否有飞机？" (实际没有) | 93.33% ✅ |
| 颜色属性 | "图中的车是什么颜色？" | — |
| 位置属性 | "建筑物在图像的左侧吗？" | — |
| 视觉定位 | 丰富描述训练使定位提升超 43% | — |

**核心发现**: 丰富多句描述（vs 稀疏单句）训练使得 VLM 对 RS 图像建立更全面的理解——视觉定位任务提升超 43%。

**为什么重要**: 之前的 RS VLM 都在追求"更多任务、更高指标"，VHM 第一次问"模型说的是实话吗？"——这是从能力维度到可信维度的质变。

**局限**: 不支持像素级感知 (分割/变化检测)；诚实性仅覆盖4类问题；数据依赖 Gemini-Vision。

### 5.3 RS-MoE: 用子任务分解提升 Caption 质量 (IEEE TGRS 2025)

**核心思路**: 首个 RS MoE-VLM。Instruction Router 将 Caption 任务隐式分解为主题描述、地物识别、空间关系三个子任务——让不同专家各司其职。

**关键创新**:
- 两阶段训练：Stage I LoRA 适配 RS → Stage II 仅训练 MoE 层
- Instruction Router 不是显式的 hard routing，而是通过指令理解隐式分配
- 1B 参数模型在 Caption 任务上追平 13B 通用 VLM

**RSICap 数据集**: 2585 张遥感影像，每张有 5 句人工标注描述——是目前最精细的 RS Caption 数据。

**设计意义**: 证明了"把 Caption 拆成子任务 + MoE 分工"比"一个模型硬扛所有描述维度"更有效。

**局限**: 仅支持 Caption + VQA 两类任务；未涉及像素级感知。

### 5.4 RSUniVLM: 粒度导向统一——从图像到像素 (arXiv 2024)

**核心思路**: 首个端到端统一图像/区域/像素三级 RS VLM。G-MoE 按粒度（Image/Region/Pixel）分三个专家，training-free routing 根据任务类型自动选择专家。Text4Seg 将分割掩码表示为文本描述符。

**为什么是里程碑**: 之前的 VLM 要么只做图像级（VHM/Caption），要么只做像素级（分割模型）。RSUniVLM 实现了"同一个模型，看全景用 Image Expert，看局部用 Region Expert，做分割用 Pixel Expert"。

**关键创新**:
- G-MoE 按粒度解耦：图像专家处理场景分类/VQA，区域专家处理 VG，像素专家处理分割和变化检测
- Text4Seg: 将分割掩码表示为文本描述符 → 统一在 language space 中处理
- ~1B 总参数（SigLIP + Qwen2-0.5B），4×A40/30h 可训练

**局限**: 代码未公开；仅 Qwen2-0.5B 作 LLM backbone，更大 LLM 的效果未知。

### 5.5 SkyMoE: 数据增强与 MoE 联合设计 (arXiv 2025)

**核心思路**: 不是先做增强再做 MoE，而是将数据增强和 MoE 路由**联合设计**——对比增强引导专家解耦局部/全局特征。8-expert Adaptive Router。

**关键创新**:
1. **Context-disentangled augmentation**: 增强策略刻意制造局部密集 vs 全局稀疏的对比，引导不同专家学习不同粒度的特征
2. **Count-Varying Cutout**: 随机遮盖不同数量的物体——解决 RS VQA 中常见的"计数虚高"问题（模型倾向于高估计数）
3. **超加和增益**: 数据增强+MoE 联合设计产生 1+1>2 的效果——VQA 提升 +6.56%

**MGRS-Bench**: 5类（SC/VQA/VG/CC/计数）×21 数据集，是目前最全面的 RS VLM 评测基准之一。

**局限**: 代码未公开；6×A800 训练成本；多轮对话不支持。

## 6. Cross-Paper Observations

### 6.1 视觉编码器分裂

| 编码器 | 使用论文 | 分辨率 | 特点 |
|--------|---------|--------|------|
| CLIP-ViT-L | VHM, SkyMoE, PAINT(patched) | 224/336/504 | 与 Vicuna 对齐成熟 |
| ViT-G/14 | RS-MoE | — | 更大容量 |
| SigLIP-400M | RSUniVLM | — | 更现代的 CLIP 变体 |

**未收敛问题**: 哪个视觉编码器对 RS VLM 最优？CLIP-ViT-L 是当前主流选择但更多是路径依赖而非系统性对比的结论。

### 6.2 MoE 训练策略趋同

全部三篇 MoE 论文采用两阶段训练：Stage I（LoRA 适配 RS 视觉+LLM）→ Stage II（仅训练 MoE 层）。这反映出 MoE 在 RS VLM 中的训练范式正在收敛。

### 6.3 开源危机

5篇论文中仅 3 篇开源（PAINT、VHM、RS-MoE）。RSUniVLM (最高贡献 5/5) 和 SkyMoE 均未开源。RS VLM 领域的开源率低于 RS FM 领域。

### 6.4 多轮对话空白

全部 5 篇论文均不支持多轮对话——RS VLM 的多轮交互能力是空白领域。

## 7. Hallucination 控制：当前状态与开放问题

| 论文 | 幻觉处理 | 方法 |
|------|---------|------|
| PAINT | ❌ 未涉及 | — |
| VHM | ✅ 系统研究 | HnstD 诚实性评估 + 丰富描述减少幻觉 |
| RS-MoE | ❌ 未涉及 | — |
| RSUniVLM | ❌ 未涉及 | — |
| SkyMoE | △ 间接 | Count-Varying Cutout 解决计数偏差 |

**核心开放问题**: MoE 架构是否因专家解耦而天然降低幻觉？目前没有任何实证支持。VHM 的非 MoE 路线（数据驱动）是目前唯一系统处理幻觉的方案。MoE + 诚实性评估的结合可能产生突破。

## 8. Open Issues

- **视觉编码器选择**: CLIP-ViT-L vs ViT-G vs SigLIP——基于架构比较而非实证的最优选择
- **MoE + 幻觉**: MoE 架构能否解耦"事实性"和"创造性"从而降低幻觉？无研究
- **多轮对话**: 全部论文不支持——这是 VLM 走向实用化的门槛
- **像素级 VL 统一**: RSUniVLM 用 Text4Seg 统一但未开源——这一方向的复现和验证缺失
- **开源**: 5篇仅3篇开源，社区基准建立受阻
- **FM 依赖**: PAINT 依赖 CLIP，VHM 依赖 Gemini-Vision 生成数据——上游 VLM 偏见传导至 RS VLM

## 9. Related Approaches

- [[../representation-learning/contrastive-based]] — CLIP/RemoteCLIP 是 VLM 视觉编码器基础
- [[../representation-learning/multi-modal-fm]] — SkySense 等多模态 FM 可替代 CLIP 作视觉编码器
- [[../../../multimodal/vision-language/vlm-based]] — 通用 VLM (LLaVA, DeepSeek-VL, Qwen-VL)
- [[../../../multimodal/vision-language/moe-based]] — 通用 MoE-VLM (VLMixer, MoE-LLaVA)

> 本页合并了原 [[vlm-based]] 和 [[moe-based]] 的内容。两子页面保留但标记为已合并。
