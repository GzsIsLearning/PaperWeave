---
slug: "ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling"
title: "RingMo: A Remote Sensing Foundation Model with Masked Image Modeling"
authors:
  - "Xian Sun"
  - "Peijin Wang"
  - "Wanxuan Lu"
  - "Zicong Zhu"
  - "Xiaonan Lu"
  - "Qibin He"
  - "Junxi Li"
  - "Xuee Rong"
  - "Zhujun Yang"
  - "Hao Chang"
  - "Qinglin He"
  - "Guang Yang"
  - "Ruiping Wang"
  - "Jiwen Lu"
  - "Kun Fu"
year: 2022
venue: "IEEE TGRS 2022"
tags: [remote-sensing, foundation-model, self-supervised, masked-image-modeling, vit, swin-transformer]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: false
code_url: "https://github.com/... (MindSpore, claimed to be released)"
compute: "8×V100 32GB"
dataset_access: private
---

> **Abstract:** First generative self-supervised (MIM) foundation model framework for remote sensing. Collects 2M optical RS images (0.1-30m resolution, 6 continents) from satellite + aerial platforms. Uses ViT-B/Swin-B encoder with lightweight decoder. Proposes PIMask (Patch Incomplete Mask) strategy to preserve small object information. Evaluated on 8 datasets across 4 tasks (scene classification, object detection, semantic segmentation, change detection), achieving SOTA.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — First to apply generative MIM (not contrastive) for RS foundation model. PIMask is a domain-specific improvement over random masking. The 2M-image dataset is large but not the largest at time of publication. However, the paper convincingly demonstrates that RS-specific MIM pre-training beats ImageNet supervised and self-supervised baselines across 4 diverse tasks.
- Soundness: 4/5 — Extensive experiments on 8 datasets with controlled ablations (data volume, epoch count, mask strategy). However, the dataset is not publicly released and training details (batch size 128 per GPU on V100s) mean the total compute is 8×200 epochs which is significant. The paper compares fairly with supervised ImageNet pre-training and self-supervised ImageNet pre-training, showing consistent advantages for pixel-level tasks (detection, segmentation, CD) but only marginal gains on classification.
- Relevance: 4/5 — RingMo is a foundational work in the RS foundation model space, directly inspiring later works like RingMo-Sense, RingMo-Lite, and countless subsequent RS MIM papers. Its PIMask insight — that random masking destroys small objects in RS images — is an important domain lesson.

**Key Insights:**
1. **First RS MIM framework:** RingMo was the first paper to propose generative self-supervised learning (specifically Masked Image Modeling) for remote sensing foundation models, departing from the contrastive learning paradigm that dominated RS SSL at the time (SeCo, GeoKR, MoCo-variants).
2. **PIMask strategy:** The Patch Incomplete Mask addresses a core RS challenge — random masking in MIM can completely erase small/dense objects that are characteristic of RS images. By masking only partially within selected patches, PIMask preserves small-object information while maintaining overall mask ratio.
3. **Data scaling law in RS:** Ablations show clear benefits from more data (100W -> 150W -> 200W images) and more training epochs (100 -> 200), establishing that RS foundation models benefit from scaling in the same way as NLP/CV foundation models.
4. **Domain gap quantification:** ISSP (ImageNet self-supervised pre-training) consistently underperforms ISP (ImageNet supervised) on RS tasks, confirming that self-supervised ImageNet weights amplify the RS-natural domain gap. RingMo's RS-pretrained weights close and surpass this gap.
5. **Task-agnostic benefit:** RingMo improvements are largest on pixel-level tasks (change detection +0.7 F1, detection +0.7 mAP) vs. image-level tasks (classification), suggesting MIM-learned representations are especially beneficial for localization tasks.

**Notes:**
- Code was to be released on MindSpore framework (Huawei's framework) — practical usability for PyTorch ecosystem is limited. No evidence of public code release found.
- Dataset (2M images) is private, assembled from Gaofen, JL-1, GeoEye, WorldView, QuickBird, SPOT, IKONOS, Landsat sources plus public datasets. Non-reproducible.
- Training: 8×V100 GPUs, 200 epochs, batch 128/GPU. Pre-training is expensive but within reach for well-funded labs.
- All experiments use UperNet for segmentation, OBBDetection for oriented detection, BIT for change detection — standard frameworks, fair baselines.
- Key baselines compared: ISP (ImageNet supervised pre-training), ISSP (ImageNet self-supervised pre-training — MAE/SimMIM weights on ImageNet).
- RingMo uses pixel-level L1 regression loss for reconstruction, similar to MAE/SimMIM.
- Published in IEEE TGRS 2022. Corresponding author: Kun Fu (AIRCAS).
- The paper explicitly notes that RingMo is weaker than ISP on scene classification tasks because MIM's pixel-level granularity doesn't match image-level classification objectives — an honest admission.

**Citation Mining — Worth Reading:**
- Seasonal Contrast (SeCo) — Manas et al. 2021, ICCV — Direct predecessor in contrastive RS SSL. Already in to-read.
- GeoKR (Li et al. 2021) — Geographical knowledge-driven representation learning. Already in to-read.
- RSP (Wang et al. 2022) — "An empirical study of remote sensing pretraining" — Used as baseline. Compare with RingMo.
- Geography-Aware SSL (Ayush et al. 2021, ICCV) — Geography-aware contrastive learning.
- MAE (He et al. 2021) — Core MIM method that inspired RingMo's architecture.
- SimMIM (Xie et al. 2021) — Alternative MIM approach compared in RingMo's design.
- FAIR1M (Sun et al. 2022) — Fine-grained object detection benchmark used in experiments.
- Self-supervised material and texture representation learning for RS (Akiva et al. 2021) — Contrastive approach for RS.
- Self-supervised audio-visual representation learning for RS (Heidler et al. 2021) — 多模态(音频+视觉)RS SSL，与RingMo同期，值得交叉对比。

## [2026-05-23] batch-read Re-review — Daily paperweave reading agent

**与CROMA的对比阅读（同一batch-read任务）：**
本re-review是在同日阅读CROMA论文后的交叉审视。

### 新发现1：PIMask的数学形式化与实现细节
论文公式(1)-(3)完整展示了PIMask的两步随机过程：(1) 通过RTG函数按比例α选出mask patch；(2) 对选中的patch按内部比例β做pixel级部分掩码。这比review中原先的描述"保留小目标"提供了更精确的数学理解——PIMask的核心是**粗粒度patch选择 + 细粒度pixel保留**的双层随机策略。与CROMA的独立75% masking相比，RingMo的PIMask保留了更多空间细节但增加了编码复杂度（因为masked patch仍需部分编码）。

### 新发现2：早期卷积层在patch embedding中的作用
论文§III-B1明确提到使用了"多层卷积patch embedding"（受Touvron et al. "Early convolutions help transformers see better"启发），且卷积核严格限制在patch内部不跨边界。这与CROMA的纯线性投影（ViT的线性输入层）形成对比——RingMo的卷积embedding隐含了更强的局部inductive bias，可能在密集小目标场景中更有优势。

### 新发现3：ISSP vs ISP差距的深层分析
论文§IV-E和§V详细分析了ISSP（ImageNet自监督预训练）低于ISP（ImageNet监督预训练）的原因：自监督的pixel-level建模放大domain gap。具体来说，在FAIR1M的难分小类别（A330飞机、拖拉机、客船）和DIOR的复杂组合类别（机场、高尔夫球场、火车站）上，ISSP表现显著下降。RingMo在这些类别上恢复甚至超越ISP。这一发现对理解**MIM预训练的domain适应性**有重要意义。

### 新发现4：与CROMA的关键差异对比

| 维度 | RingMo | CROMA |
|------|--------|-------|
| 模态 | 单模态光学 | SAR + 光学多模态 |
| 预训练目标 | 纯MIM (L1重建) | MIM + 对比学习联合 |
| 位置编码 | 标准1D可学习PE | 2D-ALiBi + X-ALiBi |
| 掩码策略 | PIMask (部分像素保留) | 独立75%随机掩码 |
| patch embedding | 多层卷积（含conv） | 线性投影（纯linear） |
| 数据规模 | 210万光学（私有） | 100万SAR-光学对（SSL4EO公开） |
| 开源 | ✗ (MindSpore闭源) | ✓ (PyTorch + HuggingFace权重) |
| 推理外推 | 不支持（固定输入尺寸） | 支持17.6×尺寸外推 |

### 新发现5：RingMo的局限性在CROMA视角下的重新解读
RingMo论文§V诚实承认：RingMo在scene classification这类image-level任务上弱于ISP监督预训练。CROMA通过引入对比学习部分弥补了这一缺陷——CROMA的linear probing表现远优于SatMAE纯MIM。这暗示**纯MIM的pixel-level特征在image-level任务上存在固有局限**，对比学习提供的global alignment可能是更通用的补充。

### 新发现6：未在review中提及的下游消融细节
- 变化检测LEVIR-CD上，RingMo(Swin-150W-200E†)的F1=91.86%，其中PIMask贡献约+0.04%（表VII）
- 语义分割iSAID上，数据量100w→150w→200w的mIoU提升为66.0→67.0→67.2%，增速递减
- 训练epoch 100→200的增益在150W数据上明显（iSAID mIoU +1.8%），但数据进一步增大时边际增益降低

### 引用挖掘 — 新增to-read候选
- **Heidler et al. 2021, "Self-supervised audio-visual representation learning for remote sensing data"** — arXiv 2108.00688. 多模态(音频+视觉)RS SSL，与RingMo同期但研究方向不同。
- **Touvron et al., "Early convolutions help transformers see better"** (NeurIPS 2021) — RingMo使用的conv patch embedding的来源。
- **RSP (Wang et al. 2022, IEEE TGRS)** — "An empirical study of remote sensing pretraining" — RingMo的baseline对比对象，对RS预训练的整体empirical评估。
- **ChangeFormer (Bandara & Patel 2022)** — RingMo在LEVIR-CD上对比的transformer-based CD方法。

### 跨Wiki连接
- [[L2_lineage/remote-sensing/representation-learning/mae-based.md]] — RingMo和CROMA都在此L2页面中，可补充PIMask vs 独立masking的消融对比
- [[L3_module/pretraining-paradigm.md]] — RingMo的MIM范式 vs CROMA的MIM+对比混合范式，可以补充到§2.3"遥感MIM谱系"表中
- [[L3_module/modality-fusion.md]] — RingMo是单模态vs CROMA多模态，可以用于对比不同模态融合策略
- 与SeaMo（渐进式MIM）的设计哲学对比：PIMask是"掩码策略优化"而SeaMo是"训练阶段分解"，两种不同的RS MIM改进路线

## [2026-05-28] SciJudge Re-Read

**Score:** 4/5
- **Contribution:** 4/5 — Remains the first MIM-based RS foundation model. PIMask's insight — that random masking destroys small RS objects — is a timeless domain lesson that later works (SeaMo's progressive masking, MaskDistill) implicitly build on. The 2M-image dataset was pioneering for its time (2022), establishing the data scaling law for RS.
- **Soundness:** 3/5 — Weakness in 2026 perspective: code not released (MindSpore), dataset private (cannot reproduce), and evaluation omits modern benchmarks (no BigEarthNet, no multi-modal evaluation). The "SOTA on 8 datasets" claim held in 2022 but comparison sets were incomplete even then (no comparison with SatMAE or SeCo on equal terms).
- **Relevance:** 4/5 — Foundational influence on the RS MIM lineage. RingMo → RingMo-Sense → RingMo-Lite → SeaMo forms a clear design trajectory. However, the single-optical-modality limitation makes it less relevant for current multi-modal RS needs.

**Key Insights:**
1. **PIMask's mathematical subtlety now fully appreciated:** The two-level randomization (patch selection via α=75%, intra-patch masking via β) creates a "soft masking" that preserves partial spatial structure. This is conceptually superior to both random masking (MAE) and block masking (SimMIM) for RS, where small objects are frequent. The key trick is that masked patches still pass through the encoder with visible pixels → this is computationally different from MAE where masked patches are dropped entirely.
2. **Data scaling law confirmation but qualification needed:** The 100w→150w→200w gain on iSAID (66.0→67.0→67.2%) shows clear diminishing returns. More importantly, the data is uniformly high-resolution optical (0.1-30m, dominated by sub-meter data from Chinese satellites). This means RingMo's "scale law" is specific to one data type and may not generalize to mixed-modality settings.
3. **RingMo's honest admission about classification weakness (Sec V)** — MIM underperforms supervised ImageNet on scene classification — is now understood as a fundamental MIM limitation. CROMA (contrastive+MIM) and subsequent hybrid methods have confirmed this: pixel-level reconstruction doesn't learn image-level discriminative features well. This drives the current consensus that pure MIM is insufficient for RS foundation models.
4. **The ISSP < ISP finding** (ImageNet self-supervised pre-training worse than supervised for RS) has important implications for current practice: it means self-supervised ImageNet weights (MAE, SimMIM, DINO) may be worse starting points than supervised ImageNet weights for RS fine-tuning — a counterintuitive finding that merits more investigation in the era of DINOv2 and SAM.

**Compared to L2 Lineage:**
- [[L2_lineage/remote-sensing/representation-learning/mae-based]] — RingMo is the root node of the RS MIM branch. Its PIMask-encoder architecture directly seeds RingMoE (MoE + multi-modal) and SeaMo (progressive masking). The lineage now branches into: (a) MIM-only (this paper's legacy) vs (b) hybrid MIM+contrastive (CROMA) vs (c) knowledge-distilled MIM (MaskDistill).

**Notes:**
- Venue: IEEE TGRS 2022 (strong journal venue)
- Compute: 8×V100, 200 epochs, batch 128/GPU
- Dataset: 2.1M private images, 448×448 resolution, 0.1-30m
- Code: MindSpore (closed ecosystem, effectively not reusable)
- Key missing element vs 2022 standards: no comparison with SatMAE (the other major MIM RS paper from 2022), which would have been the most informative baseline
- Architecture: ViT-B/Swin-B encoder, lightweight MAE-style decoder

**Citation Mining (3-8 papers):**
- RingMo-Sense (Hou et al., 2023) — IEEE TGRS — 直接谱系: integrated multi-modal sensing with RingMo backbone
- RingMo-Lite (Wang et al., 2024) — arXiv — 直接谱系: lightweight distillation of RingMo for edge deployment
- SeaMo (Chen et al., 2024) — arXiv — 设计空间对比: progressive masking addresses PIMask's limitation (uniform masking across training)
- MaskDistill (Ren et al., 2024) — CVPR — 设计空间对比: distill from CLIP/SAM into MIM encoder, challenges RingMo's "from scratch" philosophy
- FAIR1M (Sun et al., 2022) — arXiv — 基准评估: one of the 8 evaluation datasets, fine-grained detection benchmark
- Early Convolutions Help Transformers See Better (Touvron et al., 2021) — NeurIPS — 范式基础: RingMo's conv patch embedding source inspiration

**原始 review 验证:**
- 2026-05-02 Review assessment (Score 4/5, Contribution 4) holds. The paper's historical importance as the first MIM RS FM is undiminished.
- 2026-05-23 Re-review's detailed PIMask math analysis and CROMA comparison table remain the best structural analysis in reviews.
- Key update needed: RingMo's "SOTA on 8 datasets" claim was valid in 2022 but has been superseded. The claim is now historically important rather than practically actionable.
- The cross-review table in the 2026-05-23 review comparing RingMo vs CROMA is exceptionally well-done.

**Cross-Review Diff (vs previous reviews):**
| Dimension | 2026-05-02 Review | 2026-05-23 Re-review | 2026-05-28 Re-read |
|---|---|---|---|
| Focus | First-time full reading | CROMA cross-reference | Temporal re-evaluation in 2026 |
| Architecture | Brief PIMask description | PIMask math formalization + conv embedding analysis | PIMask computational cost analysis (masked patches NOT dropped) |
| Data | Not deeply analyzed | Not deeply analyzed | Diminishing returns at scale, single-modality limitation |
| MIM limitation | Noted classification weakness | Detailed via CROMA comparison | Analysis of ISSP < ISP and implications for current practice |
| Code openness | Noted MindSpore | Noted closed-source | Impact assessment: non-reproducibility limits citation credibility |
