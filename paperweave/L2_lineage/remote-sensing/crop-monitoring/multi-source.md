---
title: Multi-source Crop Monitoring in Remote Sensing
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: remote-sensing
task: crop-monitoring
approach: multi-source
tags: [remote-sensing, crop-monitoring, agriculture, foundation-model, multi-sensor, biophysical, dataset, temporal]
sources:
  - L0_raw/cropharvest-a-global-dataset-for-crop-type-classification
  - L0_raw/a-large-scale-multitask-multisensory-dataset-for-climate-aware-crop-monitoring-i
  - L0_raw/generating-an-annual-30m-rice-cover-product-for-monsoon-asia-2018-2023-using-har
  - L0_raw/estimating-crop-biophysical-parameters-from-satellite-based-sar-and-optical-obse
  - L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m
  - L0_raw/corn-yield-estimation-under-extreme-climate-stress-with-knowledge-encoded-deep-l
  - L0_raw/mitigating-ndvi-saturation-in-imagery-of-dense-and-healthy-vegetation
zotero_keys: []
confidence: high
---

# Multi-source Crop Monitoring in Remote Sensing

## 1. Overview

作物遥感监测经历了从单传感器分类到多源融合、从离散数据集到大规模预训练基础模型（FM）的范式跃迁。基于 5 篇代表性论文，演进路径可归纳为三个阶段：

```
2018-2021  数据集标准化时代
  │  CropHarvest: 多源单点标签整合，S1+S2+ERA5+SRTM
  │  核心范式：标准化数据集 → 下游训练
  ↓
2022-2024  多源融合+大规模制图时代
  │  CropClimateX: 多模态立方体数据集，遗传算法优化采样
  │  30m Rice Cover: FM (Prithvi) 首次大陆级作物制图
  ↓
2025-now   农业专用 FM 时代
  │  Crop Biophysical: 自监督 GFM → 生物物理参数 (VWC, 高度)
  │  AgriFM: Video Swin Transformer 时序 FM，2500万+ 预训练
     从"分类"到"参数反演"，从"通用FM迁移"到"农业专用FM"
```

核心驱动因素：传感器融合深度增加（S1 SAR + S2 光学 + Landsat + MODIS + 气象）→ FM 预训练取代手工特征工程 → 从 what (分类) 到 how much (生物物理参数)。

## 2. Evolution Timeline

```
2021  CropHarvest (Tseng, NeurIPS Datasets)  ← 首个全球作物分类统一数据集
       90K+样本，20数据源，S1+S2+ERA5+SRTM，单像素提取
       cropharvest Python 包，torchvision API
  │
2025  30m Rice Cover (Fang, RSE submitted)
       ← 首个FM大陆级作物制图：Prithvi GFM + CNN分支 → Monsoon Asia 30m水稻
       OA 84.14%，F1 83-90%；HLS Landsat+Sentinel 融合
  │   CropClimateX (Höhl, Scientific Data)
       ← 多模态多任务数据集：1527 US县，6.3TB，15500 minicubes
       S1+S2+Landsat-8+MODIS+Daymet+USDM+土壤+地形
       遗传算法+SGA优化采样：减少43%数据量保留93%作物区域
  │
2025  Crop Biophysical (Hashemi, preprint)
       ← 首个GFM生物物理参数估计：S1 SAR+S2光学+气候 → VWC R²=0.90, 高度 R²=0.89
       MAE自监督预训练，15M ViT
  │   AgriFM (Li, RSE submitted)
       ← 首个农业专用时序FM：Video Swin Transformer，2500万+影像
       土地覆盖比例监督预训练 → 农地制图/田块边界/LULC/特定作物
       同步时空降采样 → 可变长度时序统一处理
```

## 3. Comparison Table

| Paper | Year | Venue | Score | Sensors | Method | Key Task | Best Metric | Compute | Code |
|-------|------|-------|-------|---------|--------|----------|-------------|---------|------|
| **CropHarvest** | 2021 | NeurIPS | 4 | S1+S2+ERA5+SRTM | Dataset + RF/LSTM/MAML baselines | 作物类型分类 | Kenya F1 0.82 | N/A | [✓](https://github.com/nasaharvest/cropharvest) |
| **CropClimateX** | 2025 | Sci Data (Nature) | 4 | S1+S2+L8+MODIS+天气+土壤 | 遗传算法采样 + ZARR cube | 多任务农业监测数据集 | MODIS纯度47.8%, S2纯度93.7% | N/A | [✓](https://huggingface.co/datasets/torchgeo/CropClimateX) |
| **30m Rice Cover** | 2025 | RSE (submitted) | 4 | HLS (L8+S2 融合) | Prithvi GFM + CNN分支 | 水稻覆盖制图 | OA 84.14%, F1 83-90% | GFM推理 | ✗ |
| **Crop Biophysical** | 2025 | preprint | 4 | S1 SAR+S2光学+气候 | ViT MAE自监督 → STL-GFM | VWC + 作物高度 | VWC R²=0.90 (soybean) | 单GPU (15M参数) | [✓](https://github.com/MahyaSad/FoundationModel-CropBiophysicalParameters) |
| **AgriFM** | 2025 | RSE (submitted) | 4 | MODIS+L8+L9+S2 (3分辨率) | Video Swin Transformer + 土地覆盖比例预训练 | 农地制图/田块边界/LULC/特定作物 | 多任务领先 | 大规模预训练 | ✓ |

> **Score**: CropHarvest (NeurIPS 2021) 和 CropClimateX (Nature Sci Data) 为数据集贡献最高。AgriFM 和 Crop Biophysical 贡献在于首次将FM引入各自任务。30m Rice 是FM大陆级应用里程碑。

## 4. Design Taxonomy

### 4.1 数据融合层级

| 融合层级 | 代表论文 | 传感器组合 | 融合方式 |
|---------|---------|-----------|---------|
| **单像素多源** | CropHarvest | S1 + S2 + ERA5 + SRTM | 单像素时序提取，独立模态拼接 |
| **多模态立方体** | CropClimateX | S1 + S2 + L8 + MODIS + Daymet + USDM + 土壤 + 地形 | ZARR cube，统一时空网格 |
| **多分辨率预训练** | AgriFM | MODIS (250/500m) + L8/9 (30m) + S2 (10/20m) | 同步时空降采样，统一特征维度 |
| **SAR+光学+气候** | Crop Biophysical | S1 SAR + S2 光学 + 气候 | MAE联合自监督预训练 |

### 4.2 任务类型演进

```
Crop Type Classification (what)
  │  CropHarvest: 多类作物分类，肯尼亚/巴西/多哥基准
  ↓
Crop Cover Mapping (where, at scale)
  │  30m Rice: 大陆级水稻覆盖制图，30m分辨率
  ↓
Multi-task Agriculture (mapping + boundary + LULC + specific crop)
  │  AgriFM: 通用解码器统一多种下游任务
  │  CropClimateX: 数据集设计支持多种预测任务
  ↓
Biophysical Parameter Retrieval (how much)
     Crop Biophysical: VWC (植被含水量), 作物高度
     从离散类别到连续物理量
```

### 4.3 模型范式演进

| 范式 | 代表论文 | 预训练策略 | 标注需求 | 可泛化性 |
|------|---------|-----------|---------|---------|
| **传统ML** | CropHarvest (RF baseline) | 无 | 全标注 | 低 |
| **FM迁移** | 30m Rice (Prithvi) | 通用遥感MAE预训练 | CNN分支微调 | 中 |
| **自监督GFM** | Crop Biophysical (STL-GFM) | 自监督MAE on S1+S2 | 少量回归标签 | 高（泛化至灌溉区） |
| **专用农业FM** | AgriFM | 土地覆盖比例监督预训练 (零成本标签) | 下游微调 | 高（多任务统一） |

## 5. Key Insights per Paper

### 5.1 CropHarvest (NeurIPS 2021) — 标准化奠基

**核心贡献**: 首个大规模统一作物分类数据集。整合20个异构数据源，提供S1/S2/ERA5/SRTM四模态配对数据。

**为什么重要**: 在此之前，作物分类研究各自为政——不同数据集、不同标签体系、不同传感器。CropHarvest 提供了 harmonized pipeline 和 cropharvest Python 包，使跨地理区域的公平对比成为可能。

**局限**: 仅73%标签有完整卫星覆盖；单像素提取丢失空间上下文；二元标签占65.8%。

### 5.2 CropClimateX (2025) — 多模态+极端气候

**核心贡献**: 首次将 Sentinel-1/2、Landsat-8、MODIS、Daymet天气、USDM干旱指数、土壤和地形整合到统一 ZARR cube。遗传算法优化 minicube 采样。

**关键发现**:
- 像素纯度分析：MODIS (500m) 仅47.8% 纯度 → 对农业监测严重不足；Sentinel-2 (20m) 达93.7%
- 极端事件覆盖：99% minicubes 经历过中度干旱(D1)，19% 经历异常干旱(D4)
- 采样优化：SGA减少41%数据量覆盖93%作物区域

**与AgriFM互补**: 一个提供数据基础设施，一个提供预训练模型。

### 5.3 30m Rice Cover (2025) — FM大陆级应用

**核心贡献**: 首个将 NASA-IBM Prithvi GFM 用于大陆级水稻制图。HLS 数据（Landsat-8 + Sentinel-2 30m融合）+ Prithvi ViT backbone + CNN分支增强局部特征。

**为什么有效**: Prithvi 在 HLS 数据上预训练，恰好与输入数据分布匹配。CNN分支补偿了ViT固定patch对fine-grained空间细节的损失——这一设计选择与 AgriFM 用层次化 Video Swin 替代 ViT 的原因一致。

**局限**: 依赖特定 GFM (Prithvi)，FM 版本升级后需要重新验证。

### 5.4 Crop Biophysical Parameters (2025) — 从分类到参数反演

**核心贡献**: 首次将地理空间基础模型 (GFM) 应用于 VWC 和作物高度估计——从离散类别到连续物理量。STL-GFM (single-task learning) 优于 RF/XGBoost/MTL-GFM。

**为什么重要**: 这是任务范式的关键转折——之前的作物监测聚焦于分类 (是什么作物)，而参数反演直接提供可操作的物理量 (作物含水量、高度)。这对于灌溉决策、产量预测有更高的实用价值。

**关键发现**: 特征重要性排序——NDVI、NDWI、VH后向散射、降水量是主要驱动因子。模型泛化至训练数据中未出现的灌溉区。

### 5.5 AgriFM (2025) — 农业专用时序FM

**核心创新点**:

1. **同步时空降采样**: 时间降采样与空间降采样同步进行——解决可变长度时序输入产生不一致维度特征图的工程挑战
2. **零成本预训练监督**: 利用 GLC_FCS30D 土地覆盖产品 + EMA teacher 网络，自动获取土地覆盖比例标签——无需人工标注
3. **Video Swin Transformer**: 比 ViT 更适合农业制图——层次化特征保留细粒度空间细节（田块级制图关键），联合时空处理
4. **跨传感器预训练**: 25,244,211 张影像，覆盖 MODIS / Landsat-8/9 / Sentinel-2 三种分辨率

**Why Video Swin over ViT**: ViT 固定 16×16 patch 损害逐像素分类精度；Video Swin 的层次化结构在保持全局感受野的同时保留空间细节。这一点在30m Rice Cover需要用额外CNN分支补偿ViT局限中已得到间接验证。

## 6. Cross-Paper Observations

- **多源融合是共同趋势**: 5篇论文全部使用多传感器数据。S1 SAR (VV/VH) 的加入是农业监测的重要进展——穿透云层，对土壤湿度和植被结构敏感
- **从数据集到FM**: CropHarvest → CropClimateX (数据) → 30m Rice → Crop Biophysical → AgriFM (模型) 形成了完整的数据-模型飞轮
- **GFM依赖**: 30m Rice 依赖 Prithvi, Crop Biophysical 使用自训练 MAE GFM——GFM 版本锁定是潜在风险
- **分辨率关键性**: CropClimateX 的像素纯度分析定量证明了分辨率对农业监测的实质性影响

## 7. Open Issues

- **GFM 版本锁定**: 30m Rice 和 Crop Biophysical 均依赖特定 FM。FM 升级后微调适配器和验证需要重建
- **时序建模标准化**: AgriFM 的 Video Swin vs 30m Rice 的 ViT + CNN——农业时序 FM 的最优架构尚无定论
- **灌溉 vs 雨养**: Crop Biophysical 展示了灌溉区泛化，但系统性的灌溉/雨养农业区分能力未被研究
- **SAR 利用不足**: 虽然 S1 数据已纳入，但其在生物物理参数反演中的独立贡献未被系统分析

> **2026-05-20 更新**：AgriFM 通过10×L40大规模预训练和同步时空降采样，在田块边界检测上优势最大（76.27 F1 vs ViT-based 53-62 F1），证明了 Video Swin Transformer 的层次化结构对像素级任务的巨大优势。代码已开源：github.com/flyakon/AgriFM。详见 [[L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m]]。

## 8. Related Approaches

- [[../representation-learning/multi-modal-fm]] — Prithvi、SkySense 等多模态 FM 是农业领域迁移的基础
- [[../representation-learning/mae-based]] — MAE 自监督预训练是 Crop Biophysical 和 30m Rice 的共同基础
- [[../../../multimodal/time-series/]] — 农业时序建模 (Video Swin, LSTM)
- [[../dataset/crop-climate]] — CropClimateX 数据集详情
