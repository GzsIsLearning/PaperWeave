---
slug: "agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m"
title: "AgriFM: A Multi-source Temporal Remote Sensing Foundation Model for Agriculture Mapping"
authors:
  - "Wenyuan Li"
  - "Shunlin Liang"
  - "Keyan Chen"
  - "Yongzhe Chen"
  - "Han Ma"
  - "Jianglei Xu"
  - "Yichuan Ma"
  - "Yuxiang Zhang"
  - "Shikang Guan"
  - "Husheng Fang"
  - "Zhenwei Shi"
year: 2025
venue: "Remote Sensing of Environment (submitted)"
tags: [remote-sensing, foundation-model, agriculture, temporal-modeling, Swin-Transformer]
score: 4
contribution: 4
soundness: 4
relevance: 5
open_source: true
code_url: "http..."
compute: "未明确（大规模多源预训练）"
dataset_access: public
---

> **Abstract:** AgriFM提出同步时空降采样策略（基于Video Swin Transformer），在2500万+多源时序遥感影像上使用GLC_FCS30D土地覆盖比例进行监督预训练，统一支持多种农业制图任务。

## [2026-05-02] Weave Review

**Score:** 4/5
- Contribution: 4/5 — 首次将Video Swin Transformer引入遥感FM（同步时空降采样），创新性地使用土地覆盖比例作为预训练监督信号（而非MAE或对比学习），利用地理坐标自动获取监督标签。通用解码器设计统一多种任务。
- Soundness: 4/5 — 与三类方法全面对比：（1）ViT-based RSFMs (Prithvi, SatMAE, Galileo, SMARTIES) (2) Swin-based无时序模型 (PIS, GFM) (3) 传统DL (CNNs/LSTMs)。多任务评估（农地制图、田块边界、LULC、特定作物）。但消融实验细节不够充分。
- Relevance: 5/5 — 农业遥感FM、时序处理、多源数据融合均与用户研究方向高度相关。

**Key Insights:**
- 同步时空降采样策略：时间降采样与空间降采样同步进行，使不同长度的时序输入产生一致维度的特征图——解决可变长度时序输入的关键工程挑战
- 用GLC_FCS30D土地覆盖产品提取土地覆盖比例作为预训练监督，利用EMA teacher网络减少监督噪声——这一设计利用了遥感数据天然带有地理坐标的优势，几乎零成本获取监督信号
- Video Swin Transformer比ViT更适合农业制图：层次化特征提取保留了fine-grained空间细节（对田块级别制图至关重要），同时支持联合时空处理
- ViT的固定16×16 patch可能损害逐像素分类的空间精度，而AgriFM的层次化结构避免了这一问题
- 预训练数据包含MODIS (250m/500m), Landsat-8/9 (30m), Sentinel-2 (10m/20m)三种分辨率，体现跨传感器泛化

**Notes:**
- 香港大学地理系出品（Shunlin Liang组，定量遥感领域知名团队）
- 合作单位：北京航空航天大学（Zhenwei Shi组，遥感FM领域知名）、武汉大学
- 预训练数据集：25,244,211张影像（MODIS 1.5M + Landsat 13.4M + Sentinel-2 10.3M序列）
- 时序输入：每步随机采样16帧（从全年序列中），最小序列长度16
- 预训练目标：L1 loss回归8类土地覆盖比例

## [2026-05-02] Verified — scores and insights reasonable. Quick re-scan confirmed.

## [2026-05-20] Re-review: 每日阅读Agent深度重读

### 新增洞察

1. **非配对多源学习策略（关键架构选择）**：AgriFM 刻意避免不同卫星数据源之间的空间对齐——每个预训练步骤处理不同位置、不同时相的 Sentinel-2/Landsat/MODIS 序列。通过土地覆盖比例作为语义桥实现特征空间对齐。这一设计在遥感中具有原则性意义：它绕开了多源遥感数据对齐（几何校正、重采样）的工程难题，让模型自学跨传感器的语义对应关系。这与 RingMoE 的模态/协作/共享专家的三元 MoE 路由和 CROMA 的跨模态对比学习形成了互补——AgriFM 用共享预训练目标而非共享架构参数来实现跨模态表示对齐。

2. **同步时空降采样的效率-性能权衡**：表 10 的消融是最具信息量的实验之一。无降采样版本在农地制图上略高（83.53 F1 vs 83.09），但在农业 LULC 制图（57.58 vs 60.49）上反而更低。这意味着：时间降采样不仅节省计算（减少 40-45% 训练时间、60-70% FLOPs、15-33% 显存），还可能通过正则化效应改善了复杂分类任务。这一效率-精度权衡曲线对视频 Swin 在遥感中的应用提供了直接设计指导。

3. **低数据 regime 的优势验证**：表 8 的数据效率实验显示，AgriFM 在标注数据减少到 5-10% 时的性能优势相比基线显著扩大。农地制图在 5% 数据下 AgriFM 74.27 F1 比第二好的 GFM 72.06 高出 2.21 个百分点；田块边界在 5% 数据下领先 3.76 个百分点。这一趋势对实际部署（标注成本昂贵的场景）有直接价值。

4. **Landsat vs Sentinel-2 的互补性已被定量刻画**：表 12 显示 Sentinel-2 + Landsat 融合在农地制图上从 83.09 提升至 85.61 F1（+2.5%），在田块边界上从 76.27 提升至 78.39 F1（+2.1%）。但 LULC 制图几乎无提升（60.49 → 60.57），说明 Landsat 的低时间分辨率（12帧/年）不足以提升高复杂性分类任务的性能。这定量定义了不同传感器的"有效融合阈值"。

### 与图谱的关键连接

- **L3_module/pretraining-paradigm.md**：AgriFM 的"免费监督预训练"是范式演进路线中"被低估的第三条路"的关键案例。其 40-45% 训练时间节省（表 10）可作为"效率革命"节的量化新证据——相比于 SeaMo 的 200 GPU-h，AgriFM 在 10×L40 上的预训练成本仍然可观但被同步降采样大幅降低。

- **L3_module/modality-fusion.md**：非配对多源学习策略为"模态缺失鲁棒性"提供了一个新案例——当某些传感器数据不可用时，模型在预训练阶段已经学会了从不完整的传感器组合中提取有用的土地覆盖比例信息。

- **L3_module/model-efficiency.md**：AgriFM 的 Video Swin backbone（减少 bias/gain 参数）和同步时空降采样共同构成了一个高效的农业制图模型。其"效率-性能权衡"曲线为 300M 级模型效率边界提供了新数据点。

### 引用矿

- **Li et al. (2021) Geographical Knowledge-Driven Representation Learning for Remote Sensing Images** (IEEE TGRS)：AgriFM 的监督预训练策略直接继承自此工作——Li 等人首次提出用地理先验（土地覆盖）作为遥感表示学习的监督信号。值得追踪其后续工作。

- **Qin et al. (2025) Spatiotemporal Masked Pretraining for Advancing Crop Mapping on Satellite Image Time Series with Limited Labels** (JAG)：与 AgriFM 同时期的竞争性工作，使用时空掩码（而非土地覆盖比例）作为预训练策略。两者的公平对比能揭示 MIM vs 监督预训练在农业领域的优劣。

- **Zhang et al. (2024c) GLC_FCS30D** (ESSD)：AgriFM 预训练监督信号的基础数据产品。它是全球首个 30m 分辨率、1985-2022 年连续、35 种细分类别的土地覆盖动态监测产品。

- **Marsocci et al. (2025) PANGAEA** (arXiv)：用于评估 FM 的全局基准。AgriFM 引用其为评估框架的一部分。

- **Wang et al. (2024) Multi-Label Guided Soft Contrastive Learning** (IEEE TGRS)：SoftCon 也使用 Dynamic World 自动标注作为预训练监督信号。AgriFM 和 SoftCon 共同验证了"免费遥感监督产品"作为预训练信号的可行性。

### 对工作的实际启示

1. **架构优先**：AgriFM 的最强结论是"对于农业制图任务，Video Swin Transformer 应当作为首选架构，域内预训练提供额外增益"——这一"架构优先、预训练其次"的结论值得推广到其他遥感密集预测任务。

2. **零成本监督 + 地理坐标**：遥感数据天然带有地理坐标，这意味着任何有地理覆盖范围的产品（土地覆盖、地形、气象、土壤）都可以作为预训练监督信号。这是遥感 FM 相对于自然图像 FM 的独特优势。

3. **低数据部署**：AgriFM 在 5% 标注数据下的稳健性能暗示了在半监督/弱监督农业制图场景中的直接应用潜力。
