---
title: Open-source and Reproducibility Crisis in Remote Sensing Foundation Models
created: 2026-04-29
updated: 2026-04-29
type: module
problem: open-source-reproducibility
tags: [remote-sensing, open-source, reproducibility, foundation-model, meta]
sources:
  - L0_raw/on-the-foundations-of-earth-foundation-models.md
  - L0_raw/pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models.md
  - L0_raw/foundation-models-in-remote-sensing-evolving-from-unimodality-to-multimodality.md
zotero_keys: []
confidence: high
---

# Open-source and Reproducibility Crisis

## Problem Definition

遥感基础模型领域存在严重的**开放性危机**：绝大多数 SOTA 模型（SkySense, RingMo, Any-Optical-Model, SeaMo, SkyMoE 等）未开源代码或模型权重。社区无法复现、无法公平比较、无法在其基础上构建。

## Scope

通过扫描本 wiki 中 12 个多模态遥感 FM：

| 状态 | 数量 | 代表 |
|------|------|------|
| 完全开源（代码+权重） | ~2 | SatMAE, SatSwinMAE |
| 部分开源（代码无权重） | ~2 | — |
| 完全闭源 | ~8 | SkySense, RingMo, RingMoE, SeaMo, Any-Optical, SkyMoE, SUMMIT, Neural Plasticity FM |

## Root Causes

1. **商业利益**：遥感 FM 有巨大商业价值（农业保险、军事、灾害），模型权重是核心资产
2. **数据版权**：训练数据往往是商业卫星影像，不可公开分发
3. **算力门槛**：即使开源，8×A100 的训练成本也排除了大多数研究者
4. **缺乏标准 benchmark**：PANGAEA (2025) 和 SatlasPretrain (2023) 是好的开始，但尚未被广泛采用

## Consequences

- 论文声称的 SOTA 无法独立验证
- 新方法只能与少数开源的 baseline 比较
- 领域进步速度受限于少数有资源的机构
- 学术界的监督和纠错机制失效

## Potential Solutions

| Solution | Feasibility | Example |
|----------|-------------|---------|
| 标准化 benchmark + 排行榜 | 高 | PANGAEA |
| 公开预训练数据（非原始影像） | 中 | SatlasPretrain |
| 开源小型 reference 模型 | 高 | 类似 ViT-Tiny 的 RS 版本 |
| 学术-工业协议 | 低 | 需要机构推动 |

## Related Problems

- [[data-scarcity]] — 不开源加剧标注稀缺
- [[benchmark-standardization]] — 评估标准是开放性的前提

### 2026-06-12 跨引用更新（Daily Reading Agent 重读 AdaptVFMs + HMoE）

**AdaptVFMs-RSCD 的开源模式：**
- GitHub 仓库（https://github.com/Jiang-CHD-YunNan/RS-VFMs-Fine-tuning-Dataset）仅包含 42K 遥感图文对数据集 + README，**无训练/推理代码**
- 属于典型的"**数据开源但模型闭源**"模式——研究者可以复现微调数据集，但无法独立验证模型权重和训练过程
- 与 ERA (Google Research, Nature 2025) 的"API依赖型开源"形成对比：ERA 代码可用但依赖 Gemini API，AdaptVFMs 数据集可用但模型不可复现

**MFG-HMoE 的开源模式：**
- GitHub 仓库（https://github.com/Mr-Bamboo/MFG-HMoE）**完整开源**：训练/测试代码、模型架构、预训练权重（Google Drive）
- 基于 BasicSR 框架，依赖清晰（HAT + TTST），可复现性高
- 但论文发表于 IEEE GRSL（快报期刊，5 页限制），实验深度受篇幅限制——"**代码全开源但论文浅**"的另一种可复现性挑战

**反思：**
- 遥感 FM 领域的开源危机呈现**两极分化**：要么完全闭源（SkySense/RingMo），要么部分开源（AdaptVFMs 仅数据），少数完全开源（MFG-HMoE、Change3D、SatMAE）
- "数据开源+模型闭源"比"完全闭源"略好，但仍无法独立验证——社区需要**训练代码 + 模型权重 + 评估协议**的三重开源标准

### 2026-06-14 跨引用更新（Daily Reading Agent 重读 CTM + MiniMind-O）

**MiniMind-O：Omni 模型领域的完全开源标杆**

MiniMind-O (Gong, 2026) 是**多模态 omni 模型**领域罕见的完全开源案例，与遥感 FM 的闭源趋势形成鲜明对比：

| 维度 | MiniMind-O | 典型遥感 FM (SkySense/RingMoE) |
|------|-----------|-------------------------------|
| 代码 | ✅ Apache-2.0，完整 PyTorch 实现 | ❌ 闭源或 MindSpore 生态 |
| 权重 | ✅ HuggingFace/ModelScope 发布 | ❌ 未公开或需申请 |
| 训练数据 | ✅ Parquet 格式，完整序列布局 | ❌ 预处理管线隐式 |
| 训练配方 | ✅ 4×3090/~4h，可复现 | ❌ 80×A100/512×Ascend，不可复现 |
| 评估协议 | ✅ CER/WER 一致性评估，透明 | ❌ 部分未公开 |

- **独特贡献**：MiniMind-O 不仅开源了模型，还开源了**训练数据的具体序列格式**（9-stream：8 audio codebook + 1 text）。在 omni 模型领域，预处理管线（SenseVoice 前端、Mimi 编解码参数、CAM++ 嵌入提取、码流对齐）往往比模型架构更难复现。MiniMind-O 通过发布 Parquet 数据集实体化了这部分不可见的工程工作。
- **对遥感 FM 的启示**：遥感领域迫切需要类似的"完全可复现"标杆。当前 PANGAEA 提供了评估基准的开源，但训练数据（如 SkySense 的 80M 样本）和训练代码仍未公开。MiniMind-O 证明了即使在 0.1B 规模下，完全开源也能产生有价值的研究贡献。

### 2026-06-13 跨引用更新（Daily Reading Agent 重读 PANGAEA + AdaptVFMs）

**PANGAEA 的完全开源标杆：**
- PANGAEA 是遥感 FM 领域罕见的"完全开源"案例：代码（https://github.com/VMarsocci/pangaea-bench）、数据（15 个数据集全部公开）、评估协议（标准化训练/推理/评估流程）全部开放
- 7 个参与评估的 GFM 中 5 个公开权重（Prithvi, SatMAE, Scale-MAE, GFM, DOFA），2 个未公开（Clay, SpectralGPT）
- 这种透明度使 PANGAEA 成为"ImageNet moment"——可信、可复现的评估基准
- 与 AdaptVFMs 的"数据开源但模型闭源"形成鲜明对比：PANGAEA 证明了"完全开源"在遥感领域是可行的

**AdaptVFMs 的"数据开源但模型闭源"模式再确认：**
- GitHub 仓库仅包含 42K 数据集说明和下载链接，无训练/推理代码、无模型权重
- 属于典型的"数据开源但模型闭源"模式——研究者可以复现微调数据集，但无法独立验证模型权重和训练过程
- 与 Change3D（完整开源）和 PANGAEA（完整开源 benchmark）形成对比，AdaptVFMs 的可复现性存在明显缺口
- **启示**：遥感 FM 领域的"三重开源标准"（训练代码 + 模型权重 + 评估协议）需要社区共同推动，PANGAEA 是良好的起点

### 2026-05-27 跨引用更新

**ERA 的"API依赖型开源"案例：**
ERA (Google Research, Nature 2025) 是一个值得关注的新模式：代码仓库在 Apache 2.0 下开源（包含完整的 FUTS 算法实现、单元测试和示例），但核心依赖 Gemini API，沙箱实现（sandbox.py）仅提供抽象基类。这产生了"代码可用但结果不可复现"的矛盾——研究者可以阅读和理解算法，但无法在没有 Google API 密钥的情况下复现结果。这构成了一种新型的可复现性挑战：**API依赖型开源**。详见 [[../L0_raw/an-ai-system-to-help-scientists-write-expert-level-empirical-software/review.md]]。
