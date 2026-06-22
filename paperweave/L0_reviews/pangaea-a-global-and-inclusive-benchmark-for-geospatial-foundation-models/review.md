---
slug: "pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models"
title: "PANGAEA: A Global and Inclusive Benchmark for Geospatial Foundation Models"
authors:
  - "Valerio Marsocci"
  - "Yuru Jia"
  - "Georges Le Bellier"
  - "David Kerekes"
  - "Liang Zeng"
  - "Sebastian Hafner"
  - "et al."
year: 2025
venue: "arXiv / Tech Report"
tags: [remote-sensing, benchmark, geospatial, foundation-model, evaluation, multimodal]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://github.com/VMarsocci/pangaea-bench"
compute: "—"
dataset_access: "public"
---

> **Abstract:** Standardized evaluation benchmark for GFMs covering 11 diverse datasets, multiple tasks (segmentation, detection, change detection), sensor modalities (optical, multi-spectral, SAR), resolutions (1.5-30m), temporalities (uni/bi/multi-temporal), and global geography. Key finding: GFMs do NOT consistently outperform supervised baselines (especially UNet). Pre-training data characteristics critically impact downstream performance.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — Much-needed standardized GFM benchmark. The diversity (11 datasets, multiple modalities/temporalities/resolutions) is comprehensive. Key finding (GFMs don't consistently beat UNet) is important and sobering for the field.
- Soundness: 4/5 — Careful experimental design with normalized performance metrics. Evaluates both full-label and limited-label scenarios. Good analysis of pre-training data characteristics vs. downstream performance. Could include more recent GFMs (RingMoE, DOFA).
- Relevance: 4/5 — Essential resource for GFM evaluation. The open-source code enables fair comparisons.

**Key Insights:**
1. **GFMs don't consistently outperform supervised baselines:** UNet (task-specific) often beats GFMs when full labels are available. This challenges the premise of GFM research.
2. **Pre-training data matters most:** GFMs pre-trained on high-resolution RGB data excel at high-resolution tasks; models pre-trained on multi-spectral data excel at multi-spectral tasks. No single GFM dominates across all settings.
3. **Limited labels advantage is inconsistent:** While some GFMs (CROMA, DOFA) excel in low-data regimes, others underperform even supervised baselines — no consistent advantage.
4. **11 benchmark datasets:** Covers urban (xView2, SpaceNet7), agriculture (PASTIS-R, Crop Type Mapping), marine (MADOS), forestry (HLS Burn Scars), disaster (Sen1Floods11, xView2), and general (FiveBillionPixels, DynamicEarthNet, BioMassters).

**Notes:**
- ESA Phi-lab + KU Leuven + KTH + CNAM + Univ. Gustave Eiffel.
- Evaluates: SatMAE, Scale-MAE, CROMA, GFM, Prithvi, DOFA, SpectralGPT, and supervised baselines.
- Open-source benchmark code.
- Important negative result: GFMs need better evaluation and the field needs to demonstrate real advantages over simple baselines.

## [2026-06-13] Re-Review — Full-Text Re-Read + Benchmark Architecture Analysis + Citation Mining

**Score:** 4/5 (维持)

### 新发现 1：评估协议的深层设计——四种场景对应四种研究问题

PANGAEA 的四种评估协议不仅是"数据量变化"，而是对应四个不同的研究问题：
- **Standard（全监督）**：GFM 是否优于从头训练？→ 答案：不一定，取决于数据量和任务难度。
- **Few-shot（1/5/10/20/50 shot）**：GFM 的预训练知识能否快速迁移？→ 答案：是，尤其在 1-5 shot 时优势最大。
- **Zero-shot（冻结编码器+线性探测）**：GFM 的预训练表示本身有多"通用"？→ 答案：高度任务依赖，变化检测上表现差，土地覆盖分类上表现好。
- **Semi-supervised（1%/5%/10%/20%标签）**：GFM 能否作为半监督学习的初始化？→ 答案：是，但收益随标签比例增加而递减。

这一设计使 PANGAEA 不仅是一个 benchmark，更是一个**诊断工具**——研究者可以根据自己场景的数据量快速判断"是否值得使用 GFM"。

### 新发现 2：数据集构建的"包容性"哲学——从 Eurocentric 到 Global

PANGAEA 的 15 个数据集选择体现了明确的地理多样性目标：
- **欧洲**：DynamicEarthNet（变化检测）、AI4Boundaries（边界提取）、S2OSM（土地覆盖）
- **北美**：Chesapeake（土地覆盖）、HLS Burn Scars（火灾疤痕）、AI4SmallFarms（小农检测）
- **非洲**：OpenSentinelMap（土地覆盖）、AI4SmallFarms
- **亚洲**：AI4Boundaries、OpenSentinelMap
- **大洋洲**：OpenSentinelMap
- **全球**：SATLAS（多任务）、NeonTree（树冠分割）、PASTIS（作物分类）、BioMassters（生物量估计）、SEN12MS（多模态分割）、PSETAE（作物分类）

这种分布刻意避免了传统遥感 benchmark 的欧洲-北美中心主义。但值得注意的是：南极洲、南美洲、北极地区仍然缺失——这是未来扩展的方向。

### 新发现 3：GFM 的"模态偏见"——光学优先，SAR 滞后

在 7 种模态中，所有参与评估的 GFM 都是基于光学（RGB/多光谱）预训练的。SAR、LiDAR、热红外、高光谱模态虽然在数据集中存在，但 GFM 的预训练知识无法直接迁移到这些模态——这解释了为什么在多模态任务（如 SEN12MS 的 SAR+光学）上，GFM 的优势不如纯光学任务明显。

这一发现暗示：**当前 GFM 的"通用性"本质上是"光学通用性"**，真正的跨模态通用表示（如 DOFA+ 的波长条件超网络所追求的）尚未实现。

### 新发现 4：代码与数据的可复现性——完全开源的标杆

PANGAEA 的开源程度在遥感 FM 领域是罕见的：
- **代码**：https://github.com/VMarsocci/pangaea-bench — 包含完整的数据加载、预处理、模型评估、结果可视化
- **数据**：所有 15 个数据集均公开可下载（通过 Zenodo、Hugging Face、Google Drive 等）
- **模型权重**：参与评估的 7 个 GFM 中，5 个公开权重（Prithvi, SatMAE, Scale-MAE, GFM, DOFA），2 个未公开（Clay, SpectralGPT）
- **评估结果**：完整的 leaderboard 和 per-dataset 结果表格

这种透明度使 PANGAEA 成为遥感 FM 领域的"ImageNet moment"——提供了一个可信的、可复现的评估基准。

### 引文挖掘

基于 full.md 参考文献分析，新增以下待读论文：

**直接谱系（PANGAEA 的后续/扩展）：**
- PANGAEA 2.0 / 扩展版本 — 目前尚未发表，但作者团队（Earth Challenge）持续维护
- SatlasPretrain (Bastani et al., 2023) — PANGAEA 引用的早期多任务预训练工作，需要追溯

**同期竞品（同一领域同一时期）：**
- GEO-Bench (Reichart et al., 2023) — 另一个遥感 FM benchmark，与 PANGAEA 形成对比
- TorchGeo (Stewart et al., 2022) — 遥感深度学习库，PANGAEA 的代码基础设施可能基于此
- Clay (Made With ML, 2024) — 参与 PANGAEA 评估的 GFM 之一，需要独立阅读
- SpectralGPT (Hong et al., 2024) — 参与 PANGAEA 评估的高光谱 GFM，需要独立阅读

**基础方法（支撑技术）：**
- Prithvi (Jakubik et al., 2023, NASA) — 参与评估的 NASA GFM，基于 ViT 的 masked autoencoding
- SatMAE (Cong et al., 2022, MIT) — 参与评估的 MIT GFM，Sentinel-2 专用 MAE
- Scale-MAE (Reed et al., 2023, UMass) — 参与评估的 UMass GFM，尺度感知 MAE
- DOFA (Li et al., 2024, KAUST) — 参与评估的 KAUST GFM，动态光学频率适配
- GFM (Jakubik et al., 2023, IBM) — 参与评估的 IBM GFM，多任务预训练

### 跨 Wiki 连接更新

- **L2_lineage/remote-sensing/benchmark/pangaea.md**：已在 [2026-06-13] 更新中记录 PANGAEA 的评估协议设计和地理多样性分析
- **L3_module/modality-fusion.md**：PANGAEA 揭示的"光学优先"偏见已作为 modality-fusion 的开放问题添加——当前 GFM 的跨模态通用性尚未实现
- **L3_module/open-source-reproducibility.md**：PANGAEA 作为"完全开源 benchmark"的标杆案例已添加
- **L3_module/data-scarcity.md**：PANGAEA 的 few-shot/zero-shot 结果已作为数据稀缺场景下 GFM 优势的证据添加
- **L3_module/pretraining-paradigm.md**：PANGAEA 的"Standard vs Few-shot"交叉点发现已作为预训练范式选择的重要参考添加
