---
title: Contrastive-based Pre-training for Remote Sensing
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: remote-sensing
task: representation-learning
approach: contrastive-based
tags: [remote-sensing, contrastive, self-supervised, pre-training, representation-learning]
sources:
  - L0_raw/geography-aware-self-supervised-learning
  - L0_raw/seasonal-contrast-unsupervised-pre-training-from-uncurated-remote-sensing-data
  - L0_raw/multi-label-guided-soft-contrastive-learning-for-efficient-earth-observation-pre
  - L0_raw/skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr
  - L0_raw/change-aware-sampling-and-contrastive-learning-for-satellite-images
  - L0_raw/momentum-contrast-for-unsupervised-visual-representation-learning
  - L0_raw/learning-transferable-visual-models-from-natural-language-supervision
zotero_keys: []
confidence: high
---

# Contrastive-based Pre-training for Remote Sensing

## Overview

对比学习通过拉近正样本对、推远负样本对来学习表示。遥感数据的独特之处在于**正样本不需要人工标注** —— 利用卫星重访产生的时间维度、GPS 坐标、季节变化、以及免费土地覆盖产品，即可构造高质量的正负样本对。这条路线经历了从"硬正负"到"软对比"、从单模态到多模态、从百万级到十亿级参数的演化，核心驱动力是**巧用外部免费资源降低标注/计算成本**。

## Evolution Timeline

```
2020  MoCo (He, CVPR)               ← 动量编码器 + 动态队列，CV 通用对比学习框架
  │
2021  SeCo (Mañas, ICCV)            ← 季节变化 = 免费自然增强，多子空间解耦时变/时不变
  │   GASSL (Ayush, ICCV)           ← GPS + 时间戳作为免费监督，MoCo-v2 + TP/Geo pretext
  │                                   两个 ICCV 2021 工作确立了"域内 SSL >> ImageNet"共识
  │
2023  CACo (Mall, CVPR)             ← 自举式变化感知：特征距离比 + GMM 自动发现地表变化
  │
2024  SoftCon (Wang, IEEE TGRS)     ← 多标签软对比 + DINOv2 跨域持续预训练，100ep 匹敌 1000ep
  │   SkySense (Guo, CVPR)          ← 2.06B 因子化编码器 + 多粒度对比 + Geo-Context Prototype
  │
2025  (+Prompt learning, cross-modal distillation 等延伸方向)
```

## Design Philosophy: How to Get Free Labels in RS

遥感对比学习的核心命题是：**如何不用人工标注定义正样本？** 四种范式递进回答这个问题：

| 范式 | 方法 | 正样本定义 | 监督来源 | 成本 |
|------|------|----------|----------|------|
| **时间不变假设** | SeCo | 同地点不同季节 = 正样本 | 卫星重访周期 | 零 |
| **地理位置约束** | GASSL | 同地点相近时间 = 正样本；K-Means 地理位置分类 = pretext | GPS 元数据 | 零 |
| **变化感知自适应** | CACo | 特征距离比判断是否变化 → 变化时推远 | 自举式伪标注 | 零 |
| **多标签软对比** | SoftCon | 土地覆盖多标签相似度 = 连续"正度"权重 | Dynamic World 免费产品 | 零标注成本，需下载 |
| **多模态因子化** | SkySense | 同地点多模态多时相 + Geo-Context Prototype 聚类 | 卫星多传感器 | 零 |

## Comparison Table

| Paper | Year | Venue | Score | Core Method | Pretrain Data | Modalities | Best Metric | Compute | Code |
|-------|------|-------|-------|-------------|---------------|------------|-------------|---------|------|
| **MoCo** | 2020 | CVPR | 5 | 动量编码器 + 动态队列 (CV 通用) | ImageNet | RGB | ImageNet 线性评估 SOTA | 8×V100 | [✓](https://github.com/facebookresearch/moco) |
| **SeCo** | 2021 | ICCV | 5 | 多子空间对比 (Z0全不变/Z1季节不变/Z2增强不变)；城市周边高斯采样 | 自建 100万 Sentinel-2 (无标注) | RGB | BigEarthNet 87.81% mAP (FT) | ResNet-50, 200ep | [✓](https://github.com/ServiceNow/seasonal-contrast) |
| **GASSL** | 2021 | ICCV | 4 | 时间正样本对 (TP) + k-Means 地理位置分类 (Geo) pretext；MoCo-v2 框架 | fMoW 36万 + GeoImageNet 54万 | RGB | fMoW 74.42% Top-1, SpaceNet 78.51 mIoU | ResNet-50, 200ep | [✓](https://github.com/sustainlab-group/geography-aware-ssl) |
| **CACo** | 2023 | CVPR | 4 | 自举式变化感知对比：ratio估计变化+GMM二分类；改进城市中心高斯采样(σ=5km) | 自建 100万/10万 Sentinel-2 (4年间隔) | RGB | EuroSat 95.90% (linear), OSCD 52.11 F1 | ResNet-50, 1000ep/200ep | [✓] |
| **SoftCon** | 2024 | IEEE TGRS | 5 | 多标签软对比损失 + DINOv2 持续预训练；Dynamic World 免费标注 | SSL4EO-S12-ML 78万 | MS + SAR | BigEarthNet 86.8 mAP (linear, 100ep!)；SAR 首次 > 多光谱 | ViT-B, 8×A100/15h | [✓](https://github.com/zhu-xlab/softcon) |
| **SkySense** | 2024 | CVPR | 5 | 因子化编码器 + 多粒度对比 (像素/实例/原型) + Geo-Context Prototype | 自建 2150万 时序 (光学+MS+SAR) | HR光学 + MS时序 + SAR时序 | 16数据集7任务 SOTA, iSAID 70.91 mIoU | 2.06B params, 80×A100-80G | 权重 TBD |

### SeCo vs GASSL: 两条互补路线 (both ICCV 2021)

2021 年的两个 ICCV 工作问题相同（如何用免费遥感特性做对比学习）但路线互补：

| 维度 | SeCo (Mañas, ServiceNow) | GASSL (Ayush, Stanford) |
|------|-------------------------|------------------------|
| **正样本来源** | 季节变化 → 不同时间同一地点 | GPS 坐标 → 同地点相近时间戳 |
| **核心创新** | 多子空间对比：解耦时变/时不变 | 地理位置分类 pretext：k-Means 聚类 GPS 坐标 |
| **表示空间** | Z0(全不变) + Z1(季节不变) + Z2(增强不变) | 单一表示但被 TP/Geo 两项 pretext 驱动 |
| **采样策略** | 城市周边高斯采样避免全海/全沙漠 | fMoW 时序多样性 + GeoImageNet 空间多样性 |
| **关键发现** | 域内 SSL >> ImageNet 监督预训练 | TP+Geo 两项简单改进 = 追平监督学习 |
| **代码** | ✓ | ✓ |
| **最佳下游** | BigEarthNet 87.81% mAP, OSCD 46.94% F1 | fMoW 74.42% Top-1, SpaceNet 78.51 mIoU |

两个工作的启示：遥感对比学习的监督信号根本不缺 —— 时间、空间、季节都是免费的，而**如何设计表示空间来利用这些信号才是关键**。

## Key Design Dimensions

### 正样本定义 —— 从硬到软的演进

| 时代 | 方法 | 正样本定义 | 优势 | 局限 |
|------|------|----------|------|------|
| 2021 | SeCo, GASSL | 同地点不同时间 = 正 (硬正负) | 简单有效，零成本 | 变化检测任务中这是错误的 |
| 2021 | SeCo 多子空间 | 解耦为季节不变量 / 增强不变量 | 优雅处理变化检测矛盾 | 子空间数目需人为指定 |
| 2023 | CACo | 自动判断是否变化 → 推远 | 自举式发现真实地表变化 | 极端场景 GMM 估计不准 |
| 2024 | SoftCon | 多标签相似度 → 连续权重 | 引入语义粒度，100ep 高效 | 依赖外部标注产品 |
| 2024 | SkySense | Geo-Context Prototype → 区域语义聚类 | 宏观地理先验融入表示 | 2.06B 参数训练代价高 |

### 外部资源利用策略 —— 效率革命

```
SeCo 2021:     自建 1M 图像 + 200 epoch                           → 87.81% mAP
GASSL 2021:    fMoW 36万 + GeoImageNet 54万 + 200 epoch          → 74.42% Top-1
CACo 2023:     100k 图像 + 智能采样策略                            → 匹敌 SeCo 1M
SoftCon 2024:  78万 图像 + DINOv2 初始化 + 100 epoch              → 86.8 mAP (linear)
SkySense 2024: 2150万 图像 + 2.06B 参数 + 1000 epoch              → 70.91 mIoU (iSAID)
```

**核心启示**：SoftCon 用 100 epoch 达到 SkySense (1000 epoch, 2.06B 参数) 同水平的 BigEarthNet 性能。**持续预训练（从 DINOv2 起步）+ 免费外部标注（Dynamic World）+ 软对比损失**是当前性价比最高的路线。而 SkySense 在更复杂的下游任务（分割/检测）上贡献了不可替代的收益 —— 两条路线并不矛盾，取决于应用场景的粒度和预算。

### 增强策略: 遥感 vs CV

| 增强方式 | CV (ImageNet) | RS (遥感) | 原因 |
|---------|---------------|-----------|------|
| 旋转/翻转 | ✓ 常用 | ✗ 需谨慎 | nadir 视角下 90°/180° 旋转不自然 |
| 颜色/光谱变换 | ✓ | ✓✓ 最稳健 | 大气条件、传感器差异天然存在 |
| 季节变化 | N/A | ✓✓✓ 独特优势 | Sentinel-2 免费 5 天重访，天然正样本 |
| 地理采样 | N/A | ✓✓ 独特优势 | GPS 坐标提供空间先验 |
| 云覆盖 | N/A | ✓ 潜在 | 同一地点不同时间有无云 → 自然 occlusions |

## Current SOTA

| Downstream | Dataset | Best | Metric | Contrastive vs MAE |
|-----------|---------|------|--------|---------------------|
| 多标签分类 | BigEarthNet-10% | SoftCon ViT-B | 86.8 mAP (linear, 100ep) | 匹敌 SkySense (2.06B, 1000ep) |
| 场景分类 | EuroSAT | SeCo | ~99% | 接近饱和 |
| 时序场景分类 | fMoW | GASSL | 74.42% Top-1 | +10%+ vs ImageNet 预训练 |
| 变化检测 | OSCD | CACo | 52.11 F1 | CACo 专为此任务设计 |
| SAR 分类 | BigEarthNet-SAR | SoftCon ViT-B | 82.5 mAP | 首次 SAR > 多光谱 |
| 语义分割 | iSAID | SkySense | 70.91% mIoU | 2.06B 对比+MAE 融合 |
| 变化检测 | LEVIR-CD | SkySense | 92.58% F1 | |
| 建筑密度估计 | PhilEO | SatSwinMAE | — | 3D MAE 更优 (回归任务) |

## Efficiency Revolution: 2021 → 2024

2021-2024 年间，对比学习发生了质变——从"更多数据+更多算力"转向"巧用外部资源"：

1. **SeCo → GASSL (2021)**: 证明两个简单 pretext (TP+Geo) 即可追平监督学习，不需要精心设计多子空间
2. **GASSL → CACo (2023)**: 自适应正负样本——不再假设同地点=正，而是通过数据驱动判断
3. **CACo → SoftCon (2024)**: 从硬正负变成软权重，Continuous pretraining + 免费标注 = 极致效率
4. **SeCo/SoftCon → SkySense (2024)**: 对比学习在多模态+大规模预训练中的终极形态 —— 因子化编码器 + 多粒度 + Geo-Context

## Design Space Summary: 三向张力

对比学习在 RS 中的核心设计张力存在于三个维度：

```
            表示空间复杂度
            (多子空间 vs 单空间)
                 ▲
                / \
               /   \
              /     \
             /       \
            /         \
   正样本硬度 ───────────► 外部资源依赖
  (硬正负→软)         (零成本→DW→DINOv2)
```

| 方法 | 正样本硬度 | 表示空间 | 外部依赖 | 效率 |
|------|----------|---------|---------|------|
| SeCo | 硬 (同地点) | 多子空间 (3) | 无 | 中 |
| GASSL | 硬 (时间+Geo) | 单空间 | 无 | 高 |
| CACo | 自适应 | 单空间 | 无 | 高 |
| SoftCon | 软 (连续权重) | 单空间+DINOv2 | Dynamic World + DINOv2 | 极高 |
| SkySense | 硬+软混合 (多粒度) | 多模态 因子化 | 大规模数据 | 低 (计算) |

## Open Issues

- **变化检测 vs 分类的矛盾**：SeCo 的多子空间设计是优雅解，SoftCon 的软对比从标注端缓解，根本解决需要任务感知的动态表示空间
- **软对比的理论基础**：SoftCon 打开了新范式——用粗粒度标注引导细粒度表征学习——但多标签噪声的上限在哪里？标签粒度与表征质量的 scaling law 是什么？
- **Geo-Context 的泛化性**: SkySense 的 Geo-Context Prototype 需要大规模全球数据训练，在区域级应用中是否必要？
- **SAR 对比学习**：SoftCon 首次证明 SAR 可以优于多光谱 —— 但 SAR 独特的 speckle 噪声和几何畸变如何被对比学习利用？
- **从对比到生成式**：CROMA 和 SkySense 已证明两者融合有效，最优融合策略（权重/阶段/粒度）仍是开放问题

## Related Approaches

- [[mae-based]] — MAE 是生成式替代方案，CROMA/SkySense 已融合两者
- [[multi-modal-fm]] — 多模态 FM 在对比 + MAE 基础上加入 MoE
- [[../survey/foundation-models-evolution]] — RS 基础模型综述
