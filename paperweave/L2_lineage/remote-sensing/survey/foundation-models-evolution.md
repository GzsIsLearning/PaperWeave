---
title: Foundation Models in Remote Sensing — Survey & Evolution
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: remote-sensing
contribution_type: survey
tags: [remote-sensing, foundation-model, survey, pretraining, self-supervised-learning]
sources:
  - L0_raw/self-supervised-learning-in-remote-sensing-a-review
  - L0_raw/foundation-models-in-remote-sensing-evolving-from-unimodality-to-multimodality
  - L0_raw/遥感基础模型发展综述与未来设想
  - L0_raw/遥感大模型进展与前瞻
confidence: high
---

# RS Foundation Models: 综述与演化全景

## Overview

遥感基础模型（RS FM）是当前地球观测领域最活跃的研究方向。本条目的核心目标不是罗列论文，而是**从四篇代表性中文/英文综述中提取模式、辨明趋势、识别盲点**。四篇综述覆盖了从 2022 到 2026 的时间跨度，分别从 SSL 分类学、单模态→多模态演化、感知→预测跃迁、预训练技术栈等视角切入 —— 合在一起，构成了理解 RS FM 全景的坐标系统。

| 综述 | 作者/机构 | 发表 | 视角 | 核心贡献 |
|------|---------|------|------|---------|
| SSL in RS: A Review | Yi Wang et al. (DLR/TUM) | IEEE MGRS 2022 | SSL 分类学 | Generative/Predictive/Contrastive 三级分类法；首次 RS SSL benchmark |
| 遥感大模型进展与前瞻 | 武大团队 | 武大学报 2023 | 预训练技术栈 | 三因素(数据/参数/技术)组织法；监督→无监督→多模态递进 |
| 遥感基础模型发展综述与未来设想 | Fu et al. | 遥感学报 2024 | 感知→预测跃迁 | 时序超像元概念；感知识别→认知预测蓝图 |
| FM in RS: Unimodal→Multimodal | Danfeng Hong et al. | IEEE MGRS 2026 | 单模态→多模态 | 105 篇 FM 系统综述；tutorial 式实操指南 |

## 三个共识模式 (Patterns Across All Four Surveys)

### 模式 1: 预训练范式从二分走向三分

四篇综述共同揭示了一个关键事实：CV 领域常用的 Generative/Contrastive 二分法在 RS 中不够用。

- **Wang et al. (2022)** 最早明确提出 **Predictive** 作为独立第三类别：空间上下文预测、光谱波段预测、时序预测等 pretext tasks 是 RS 独有的，在 CV 综述中要么被归入 Generative 要么被忽视
- **武大 (2023)** 将方法分为「对比式自监督」「掩码图像建模」「视觉-文本多模态」，后两者可视为 Predictive 和 Generative 的细化
- **Fu et al. (2024)** 在对比/生成基础上增加了「时序感知」和「认知预测」两个新类别
- **Hong et al. (2026)** 以模态数为主轴，但每个模态内部也遵循相似的范式分级

**合意**：RS FM 的预训练范式应使用三级分类 —— **Contrastive / Generative (MIM) / Predictive (pretext)**。Predictive 是 RS 的特色贡献，包含了空间/光谱/时序/地理四种 pretext 家族。

### 模式 2: 从单模态到多模态是不可逆的方向

四篇综述跨越 2022-2026，清晰地记录了一个趋势：

```
2022 (Wang):   SSL 几乎全部单模态 (Sentinel-2 RGB)
2023 (武大):   单模态为主，视觉-文本多模态开始出现 (RemoteCLIP, RSGPT)
2024 (Fu):     单模态感知趋于成熟，时序多模态成为新增长点
2026 (Hong):   单模态→多模态已构成主线，105 篇中 > 40% 涉及多模态
```

**关键转折点**：2024 年 CVPR 上的 SkySense（多模态多粒度）和 RemoteCLIP（视觉-文本）标志着 RS FM 正式进入多模态时代。但这带来了一个新问题 ——

### 模式 3: 感知饱和，预测崛起

四篇综述在时间线上依次推进一个共识：**感知任务（分类/检测/分割）在 RS FM 上的提升空间正在收窄**。

- **Wang (2022)**: SSL 在分类上已匹敌监督，但下游泛化仍未系统研究
- **武大 (2023)**: 指出十亿参数模型出现收益递减，架构比规模更重要
- **Fu (2024)**: 首次明确提出感知→预测跃迁，将认知预测（天气预报/云预测/移动目标）作为下一代 FM 的核心任务
- **Hong (2026)**: 多模态 FM 在感知任务上全面 SOTA，但 CO₂ 通量预测、灾害预警等预测任务几乎空白

## 分类体系对比：四篇综述如何切分 RS FM 空间

| 维度 | Wang (2022) SSL综述 | 武大 (2023) 大模型综述 | Fu (2024) 基础模型综述 | Hong (2026) FM综述 |
|------|-------------------|----------------------|----------------------|-------------------|
| **一级分类** | SSL 方法类型 | 预训练监督类型 | 感知/认知功能 | 模态数量 |
| **二级分类** | Gen/Pred/Cont | 监督/无监督/多模态 | 单时序感知/多时序感知/认知预测 | 光学/SAR/光谱/多模态/VL |
| **覆盖范围** | 250+ 引用 | 技术为核心 | 感知→预测全链条 | 105 篇 FM 论文 |
| **独特贡献** | Predictive 独立分类 | 预训练技术细节 | 时序超像元概念 | Tutorial + 实操 |
| **时间覆盖** | ~2019-2022 | ~2020-2023 | ~2020-2024 | ~2021-2025 |

## 技术栈递进：从 SSL 到 FM 再到预测模型

四篇综述合在一起揭示了一个三阶段递进的技术栈：

### 阶段 1: SSL 时代 (2019-2022) —— 方法探索期

**代表**: MoCo, SimCLR, BYOL, MAE 在 RS 的初探
**特点**: 关注单个数据集上的 SSL vs 监督对比，验证"域内 SSL >> ImageNet"
**核心发现** (来自 Wang 2022):
- 数据增强方面：遥感图像对几何变换更敏感（nadir 视角），颜色/光谱变换更稳健
- Predictive pretext tasks (地理位置/时序预测) 是 RS 独有优势
- 多模态 SSL (SAR+光学) 被识别为最重要但最不成熟的未来方向

### 阶段 2: FM 构建期 (2022-2024) —— 规模化与多模态化

**代表**: SatMAE → RingMo → SkySense → RemoteCLIP
**特点**: 大规模预训练数据 + 大参数模型 + 多模态融合
**四个关键决策** (来自武大 2023 + Hong 2026):

| 决策维度 | 路线 A | 路线 B | 当前共识 |
|---------|--------|--------|---------|
| 预训练数据 | 自建大规模 (RingMo 210万, SkySense 2150万) | 复用社区数据 (SSL4EO-S12) | 数据质量/多样性 > 纯规模 |
| 模型架构 | CNN 基础 (ResNet) | ViT/Swin 基础 | ViT 为主流，Swin 在 SAR/多尺度有优势 |
| 预训练目标 | 纯 MIM (RingMo) | 对比+MIM (CROMA/SkySense) | 融合优于单一 |
| 可复现性 | 闭源 (RingMo/SkySense) | 开源 (SatMAE/CROMA) | 开源生态仍是瓶颈 |

### 阶段 3: 认知预测期 (2024-未来) —— 从感知到推理

**核心概念** (来自 Fu 2024):

Fu et al. 提出 RS FM 的下一代方向是**通用预测模型**，其理论基础是「**时序超像元**」概念：从复杂变化场景中提取具有稳定规律性的时序像元特征集合。四个探索方向：

1. **多域时序数据表示**：融合光学/SAR/气象/地形等多源时序
2. **超像元稳定特征提取**：海量时序中自动发现稳定模式
3. **对象-环境交互建模**：超图 Transformer 建模地物与环境间的时空交互
4. **多任务互推理**：地表覆盖变化 → 移动目标轨迹 → 气象演变 联合推理

Preliminary experiments 在 3 个预测任务（移动目标预测/降水临近预报/云预测）上 ~11M 帧训练，所有指标超越 SOTA。**感知 FM 在认知预测任务上的迁移能力是下一个重大开放问题。**

## 数据格局：从 ImageNet 到 RS-native

四篇综述一致确认了一个重大转变：

```
★ 事实 1 (Wang 2022): RS SSL 的最大发现——域内 SSL >> ImageNet 监督预训练
★ 事实 2 (武大 2023): 多份独立研究 (Chen, Risojević) 重复验证了上述结论
★ 事实 3 (Fu 2024):  当前 RS FM 数据仍以单平台为主，多平台/多模态/时序数据严重利用不足
★ 事实 4 (Hong 2026): 预训练数据规模差异巨大 (40万→2150万) → 缺少标准化 benchmark
```

**数据层共识**：
- ImageNet 预训练在 RS 中已彻底过时
- SSL4EO-S12 是当前最接近"社区标准"的预训练基准
- 但缺乏统一的数据规模/多样性/模态覆盖标准 → Pangaea benchmark (2025) 试图填补

## 盲点与分歧：四篇综述暴露的未解决问题

### 1. Predictive 方法的地位之争

| 综述 | Predictive 定位 | 理由 |
|------|---------------|------|
| Wang (2022) | 独立一级类别 | RS 特有 pretext tasks 无法归入 Gen/Cont |
| 武大 (2023) | 未独立分类 | 以预训练技术而非 pretext 类型为主轴 |
| Fu (2024) | 未来核心方向 | 感知→预测跃迁，Predictive 是桥 |
| Hong (2026) | 未独立分类 | 以模态演进为主轴 |

**问题**: Predictive 到底是独立范式还是 Gen/Cont 的子类？这在 CV 社区有争议，但 RS 的时序预测/地理预测等 pretext 具有领域特殊性。

### 2. 数据规模效应的边际递减

武大 (2023) 指出 Cha et al. 的十亿参数模型出现明显收益递减。Hong (2026) 的数据显示预训练数据差异 50× (40万→2150万) 但下游性能提升不成比例。**FM 的 scaling law 在 RS 中是否成立？** SoftCon 的 100 epoch 匹敌 SkySense 1000 epoch 是反例还是特例？

### 3. 感知→预测的迁移能力

Fu (2024) 的初步实验用了简单架构而非其提出的超图 Transformer，说明感知 FM 的表示未必直接适用于预测任务。**需要新的预训练目标还是新的架构？**

### 4. 开源生态

Hong (2026) 明确指出 RS 社区 FM 的三个核心问题：认知不足/分类缺失/使用指南匮乏。最大的问题是：**大部分 SOTA FM (RingMo/SkySense/SatSwinMAE) 不公开权重或代码**，严重阻碍公平比较和下游应用。

## Timeline: 四篇综述覆盖的里程碑

```
2019-2020  MoCo/SimCLR/BYOL/SimSiam 陆续提出
2021      ICCV: SeCo + GASSL —— 域内 SSL >> ImageNet
2022      NeurIPS: SatMAE —— 首个时序/光谱 MAE
          IEEE TGRS: RingMo —— 首个 RS 生成式 MIM
          ★ Wang et al. SSL 综述 (IEEE MGRS)
2023      ICCV: GFM, Scale-MAE —— 规模化探索
          ★ 武大 遥感大模型综述
2024      CVPR: SkySense —— 多模态多粒度 FM
          TPAMI: SpectralGPT —— 首个光谱 FM
          ★ Fu et al. 基础模型综述 (遥感学报)
2025      RingMoE, SUMMIT, HyperSIGMA, DOFA
          Pangaea benchmark —— 标准化评测
2026      ★ Hong et al. FM 综述 (IEEE MGRS)
```

## 深层解读: 四条暗线

在方法分类的表面之下，四篇综述共同揭示了 RS FM 发展的四条深层逻辑：

### 暗线 1: 从「有没有」到「好不好」

2022 年的问题是「能不能用 SSL？」→ 2024 年是「如何大规模多模态预训练？」→ 2026 年是「如何公平比较？」。RS FM 正在从 feasibility-driven 转向 rigor-driven。

### 暗线 2: 中国 vs 国际的互补性

武大 (2023) 和 Fu (2024) 两篇中文综述与 Wang (2022) 和 Hong (2026) 的英文综述形成互补：中文侧重技术深度和未来蓝图（时序超像元、超图 Transformer），英文侧重分类体系严谨性和量化 benchmark。合读可获得全貌。

### 暗线 3: 遥感 vs 计算机视觉的张力

Wang (2022) 最清晰地揭示了这场张力：CV 的 SSL 进展不能直接移植到 RS（几何增强、nadir 视角、多光谱维度、时序密度），但 RS FM 也不能闭门造车（ViT/Swin/MoE 等技术注入是必经之路）。SkySense 和 CROMA 证明了两边最好技术的融合才是最优解。

### 暗线 4: 从论文到产品的鸿沟

Hong (2026) 提到 RS 社区对 FM 认知不足 —— 这意味着学术界和产业界之间存在巨大的知识 gap。评测基准的缺失（直到 Pangaea 2025）、代码/权重不公开、缺少下游适配指南，都是鸿沟的体现。

## Summary: 从四篇综述看 RS FM 的下一步

| 方向 | 成熟度 | 关键挑战 |
|------|-------|---------|
| 单模态光学 FM | 高 | 接近性能饱和 |
| 时序/光谱 FM | 中 | 大规模时序数据训练成本 |
| SAR FM | 低 | 数据量、物理特性建模 (SUMMIT 是起点) |
| 多模态融合 FM | 中 | 融合策略最优性、跨传感器泛化 |
| 视觉-语言 FM | 低 | RS 图文配对数据稀缺 |
| 认知预测 FM | 极低 | 感知 FM 表示不可直接迁移 |
| 标准化评测 | 低 | Pangaea 是重要一步，但覆盖还不够 |
| 高效训练/部署 | 中 | SoftCon/GFM continual 是方向，RingMoE-1B 是工程探索 |

## Related

- [[../representation-learning/mae-based]] — MAE 生成式路线
- [[../representation-learning/contrastive-based]] — 对比学习路线
- [[../representation-learning/multi-modal-fm]] — 多模态 FM 方法
- [[../benchmark/pangaea]] — GFM 公平评测基准
