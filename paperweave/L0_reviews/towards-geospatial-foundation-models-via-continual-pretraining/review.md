---
slug: "towards-geospatial-foundation-models-via-continual-pretraining"
title: "Towards Geospatial Foundation Models via Continual Pretraining"
authors:
  - "Matias Mendieta"
  - "Boran Han"
  - "Xingjian Shi"
  - "Yi Zhu"
  - "Chen Chen"
year: 2023
venue: "ICCV 2023"
tags: [remote-sensing, foundation-model, continual-pretraining, distillation, mim, swin-transformer]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://github.com/mmendiet/GFM"
compute: "93.3 hours on V100 (GFM)"
dataset_access: "public (GeoPile from public sources)"
---

> **Abstract:** Proposes GFM — continual pretraining from ImageNet-22k using multi-objective learning: (1) distillation from frozen ImageNet teacher + (2) MIM on geospatial data (GeoPile: 600K diverse images). Outperforms SatMAE, SeCo, and ImageNet-22k baselines on 7 downstream tasks with less compute. ARP +3.31% over ImageNet-22k.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — Key insight: standard continual pretraining (initialize with ImageNet weights then MIM on RS) barely helps. The distillation+MIM multi-objective paradigm is effective. Also shows that Sentinel-2 data alone is suboptimal for MIM pretraining (low entropy → easy reconstruction → poor learning).
- Soundness: 4/5 — Strong evaluation on 7 diverse tasks with ARP metric. Ablation on data sources, training epochs, and pretraining paradigms. Carbon footprint accounting is a nice touch. However, GFM evaluation doesn't compare with concurrent works like SkySense or RingMoE.
- Relevance: 4/5 — Practical paradigm for building RS FMs efficiently. Shows that starting from ImageNet-22k + efficient continual pretraining beats training from scratch.

**Key Insights:**
1. **Data diversity > data scale for RS MIM:** Sentinel-2 (1.3M images, avg entropy 3.9) performs worse than GeoPile (600K diverse images, avg entropy 4.6). MIM needs high-entropy data to learn effectively — uniform landscapes (ocean, desert, forest) make reconstruction too easy.
2. **Vanilla continual pretraining is ineffective:** Simply initializing with ImageNet-22k weights and continuing MIM on RS data gives only +0.3% ARP gain. The model needs a stronger signal to overcome the domain gap.
3. **Distillation + MIM works:** Using frozen ImageNet-22k teacher as a distillation target during RS MIM pretraining (GFM) gives +3.31% ARP with 93.3h V100 training — much better than SatMAE's 768h for -0.5% ARP.
4. **GeoPile composition:** 600K images from NAIP (1m), RSD46-WHU, MLRSNet, RESISC45, PatternNet — diverse GSDs (0.1m-30m) and scene types.

**Notes:**
- UCF + AWS + Boson AI. Swin-B backbone.
- GFM: teacher initialized with ImageNet-22k weights (frozen), student randomly initialized. Multi-objective: feature distillation loss + MIM reconstruction loss.
- 7 downstream tasks: change detection (LEVIR-CD, OSCD), classification (AID), multi-label classification (BigEarthNet), semantic segmentation (Potsdam), super-resolution.
- Code available. Minimal compute (93h V100, 13.3 kgCO2).
- Published at ICCV 2023.

## [2026-05-06] Re-review (Full Text Re-read)

**Score: 4/5** (维持原评分)

**新增洞察:**

1. **蒸馏最优位置在 Stage 3** — 论文系统消融了在 Swin 不同 stage 进行特征蒸馏的效果（图 5a），发现 Stage 3 最优。原理：Stage 3 给大部分网络提供教师监督，同时让最后几层（Stage 4）纯学领域特定特征。这与常识相符——Stage 1 太浅（无法传递充分知识），Stage 4 太深（限制领域自适应）。这一发现对设计任何持续预训练架构都有指导意义。

2. **学生初始化策略的关键发现** — 随机初始化学生（而非用 ImageNet 权重初始化学生）是最优选择（图 5b）。如果将教师和学生都初始化为 ImageNet 权重，过度引入自然图像偏差会损害领域自适应。**"有偏见的教师 + 无偏见的学生 = 最佳收敛"** 这是一个值得铭记的设计原则。

3. **时序对（Temporal Pairs）反而有害** — 在 GFM 框架中，给教师和学生输入不同时间点的图像（TP）比输入同一图像（SI）效果更差（OSCD F1: 57.03 vs 58.41；DSFIN F1: 62.48 vs 67.92）。这说明在持续预训练+蒸馏的设定下，时序变化引入了不必要的噪声而非信息增益。这与 SeCo（依赖时序正样本的对比学习）形成鲜明对比——不同的预训练范式对数据增强策略的偏好完全不同。

4. **GeoPile 数据消融的深度分析** — 移除任何单一数据集都会导致 ARP 下降，但最关键发现是：**仅保留 NAIP 未标注数据时 ARP 从 3.31 骤降至 0.53**，而仅保留标注数据时 ARP=1.50。人工标注/精选的数据集对预训练质量的贡献远大于未标注数据。这是对"更多数据"思路的有力反思——**数据质量 > 数据量**，尤其在预训练数据选择时。

5. **RGB-only 的限制** — 论文仅使用 RGB 波段，对多光谱下游任务（BigEarthNet 12波段、SpaceNet2 8波段）仅随机初始化额外通道。这实际上**低估了 GFM 在多光谱任务上的潜力**。如果使用光谱感知的初始化策略（如 DOFA/AOM 的波长编码），GFM 性能可能有额外提升。

6. **MIM vs 纯蒸馏的对比** — 消融实验（表9）显示：纯 MIM（w/o teacher）和纯蒸馏（w/o MIM）各有千秋——MIM 在分割和超分上更好，蒸馏在变化检测和少样本分类上更好。两者的组合（GFM）在几乎所有任务上都是最优或次优。这验证了**多目标预训练的必要性**。

**交叉Wiki关联:**

- [[L3_module/model-efficiency]] — GFM 是"效率悖论"的核心证据之一：93h V100 + 13.3kg CO₂ 的持续预训练方法在 7 个任务上 ARP +3.31%，超过 768h V100 + 109.44kg CO₂ 从头训练的 SatMAE。8× 计算节省是"效率革命"最关键的数据点之一。L3 中已引用该数据。

- [[L3_module/pretraining-paradigm]] — GFM 定义了"持续预训练"范式的标准配方：教师-学生蒸馏 + MIM。与 SoftCon（持续预训练 + 软对比）形成对照——两者都从 ImageNet 模型出发，GFM 用蒸馏传递知识，SoftCon 用 DINOv2 初始化 + 多标签软对比。这两个可以视为"持续预训练"范式的的两个子路线。

- [[L2_lineage/remote-sensing/representation-learning/mae-based]] — GFM 被归入"MIM + 持续预训练"设计分支。与 SeaMo 的渐进式训练共同代表了"高效预训练"方向。

- **新观察**：GFM 的"教师接收完整图像/学生接收掩码图像"设计，与 BYOL/DINO 的学生-教师框架（teacher 输出作为 student 目标）在形式上相似但实质上不同——GFM 的教师是**独立的外部知识源**（ImageNet），而非学生自身的 EMA。这启发了"外部知识蒸馏"这个独立的预训练策略类别。

**引文挖掘:**

| 类别 | 论文 | 理由 |
|------|------|------|
| 直接谱系 | SatMAE (Cong et al., 2022) — NeurIPS | 论文直接对比的 RS MIM 基准 |
| 直接谱系 | SeCo (Manas et al., 2021) — ICCV | 论文对比的 RS SSL 基准 |
| 范式基础 | SimMIM (Xie et al., 2021) — CVPR | GFM 使用的 MIM 框架基础 |
| 范式基础 | iBOT (Zhou et al., 2021) | MIM tokenizer 方向 |
| 范式基础 | Don't Stop Pretraining (Gururangan et al., 2020) — ACL | NLP 域持续预训练的启发性工作 |
| 关键对手 | MATTER (Akiva et al., 2021) | 变化检测基线 |
| 关键对手 | Tile2Vec (Jean et al., 2018) | 空间分布数据表示学习的早期工作 |

**to-read.md 建议新增:**
- Self-supervised pretraining improves self-supervised pretraining (Reed et al., 2022) — WACV — 1

## [2026-06-11] Re-review (Full Text Re-read #3)

**Score: 4/5** (维持原评分)

**新增洞察:**

1. **代码实现揭示的蒸馏细节** — 通过阅读 `models/teacher.py` 源码，发现 GFM 的蒸馏实现与论文描述有微妙但重要的差异：
   - 教师分支接收的是 **224×224 双线性插值后的图像**（`F.interpolate(x, (224, 224), mode='bilinear')`），而非论文中暗示的原始分辨率。这意味着教师特征是在低分辨率空间计算的，学生则在 192×192 的 MIM 空间学习——分辨率差异本身构成了一种"软正则化"。
   - 学生编码器输出 **两个流**：`r`（Stage 4 特征，用于 MIM 重建）和 `zs`（Stage 3 特征经 avgpool 后投影，用于蒸馏）。这与论文图 3 的双分支设计完全一致，但代码中 `SwinTransformerForSimMIM` 的 `forward` 返回 `(r, x)` 而非单一特征——说明 Stage 3 蒸馏特征和 Stage 4 MIM 特征是**从同一前向传播中分叉提取**的，计算效率很高。
   - `alpha` 参数（蒸馏损失权重）默认 1.0，但通过命令行可调——论文未报告 alpha 的消融，这是一个未被充分探索的超参空间。

2. **波段适配策略的工程智慧** — `load_pretrained()` 函数中的波段适配代码展现了遥感预训练的实际工程挑战：
   - ImageNet-22k 预训练权重是 3 通道（RGB），而 Sentinel-2 有 12 通道、SpaceNet2 有 8 通道。
   - 代码通过 `temp[:,[3,2,1],:,:] = checkpoint_model['patch_embed.proj.weight']` 实现波段重排——将预训练权重的 RGB 映射到 Sentinel-2 的 BGR 顺序（通道 3,2,1）。
   - 对于多光谱任务，额外通道是**随机初始化**的。这与论文中 "Potentially improving performance even further though the employment of additional data modalities will be an intriguing avenue for future research" 的表述一致——GFM 在光谱维度上的潜力确实被低估了。

3. **GeoPile 数据熵的深层含义** — 重读 Table 1 和 Figure 2 后，意识到 Sentinel-2（熵 3.9）vs GeoPile（熵 4.6）vs ImageNet（熵 5.1）的熵梯度揭示了一个更普遍的规律：**MIM 预训练的数据熵存在一个"甜点区间"**。熵太低（Sentinel-2）→ 重建太简单 → 学不到有用表示；熵太高（ImageNet）→ 虽然是好表示，但域不匹配。GeoPile 的 4.6 恰好处于"足够复杂以驱动学习，又足够接近遥感域"的平衡点。这与 SimMIM 的 AvgDist 最佳区间 [10, 20] 的发现形成呼应——两者都指向"预训练难度"的定量控制。

4. **SatMAE 的负结果价值** — 论文多次强调 SatMAE 在多个任务上不如 ImageNet-22k 基线（OSCD F1 45.02 vs 52.35，DSFIN F1 64.98 vs 69.62，SpaceNet2 PSNR 22.742 vs 23.279）。这些负结果通常不会在论文中被如此明确地呈现，但 GFM 的作者选择将它们作为**持续预训练必要性的证据**。这是一种诚实的科学写作——SatMAE 的 768h V100 训练 + 109.44kg CO₂ 的负结果，与 GFM 的 93.3h + 13.3kg CO₂ 的正结果形成强烈对比，构成了"效率革命"叙事的核心支柱。

5. **时序对（TP）实验的隐藏信息** — Table 10 中 TP vs SI 的对比不仅证实了时序变化对蒸馏有害，还揭示了一个更深层的问题：**SeCo 的 100k 样本在 SI 设置下表现（OSCD 58.41）已接近其 1M 样本（58.87）**。这说明 SeCo 数据的质量/多样性问题比规模问题更严重——与 GeoPile 的 600k 优于 SeCo 1M 的结果一致。

**交叉Wiki关联更新:**

- [[L3_module/pretraining-paradigm]] — GFM 的"教师接收完整图像/学生接收掩码图像"设计，与 BYOL/DINO 的学生-教师框架在形式上相似但实质上不同——GFM 的教师是**独立的外部知识源**（ImageNet），而非学生自身的 EMA。这启发了"外部知识蒸馏"这个独立的预训练策略类别。与 SoftCon（DINOv2 初始化 + 软对比）形成"持续预训练"范式的两个子路线。

- [[L3_module/model-efficiency]] — GFM 的 8× 计算节省（93.3h vs 768h）是效率革命的关键数据点。但代码审查发现，GFM 使用 8×V100 而 SatMAE 也使用 8×V100——节省 purely 来自算法设计（蒸馏+MIM 联合优化），而非硬件差异。这使得比较更加公平和有力。

- [[L3_module/modality-fusion]] — GFM 的 RGB-only 预训练策略限制了其在多光谱任务上的性能（BigEarthNet 额外通道随机初始化）。这与 DOFA/AOM 的波长感知编码形成对比——GFM 若结合波长条件权重生成，可能在多光谱任务上获得额外增益。

- [[L2_lineage/remote-sensing/representation-learning/mae-based]] — GFM 在 MAE-based 谱系中的定位需要更新：从"持续预训练"子类扩展为"外部知识蒸馏+MIM"的独立分支。与 SeaMo 的渐进式训练共同代表"高效预训练"方向，但方法学上完全不同（蒸馏 vs 渐进）。

**引文挖掘更新:**

| 类别 | 论文 | 理由 |
|------|------|------|
| 直接谱系 | Self-supervised pretraining improves self-supervised pretraining (Reed et al., 2022) — WACV | 论文引用的持续预训练相关工作，分层预训练方法 |
| 方法基础 | Don't Stop Pretraining (Gururangan et al., 2020) — ACL | NLP 域持续预训练的启发性工作，已存在但值得重读 |
| 关键对比 | SatMAE (Cong et al., 2022) — NeurIPS | 论文直接对比的 RS MIM 基准，已存在 |
| 工程参考 | SimMIM (Xie et al., 2022) — CVPR | GFM 基于的 MIM 框架，已存在 |
| 新方向 | DINOv2 (Oquab et al., 2023) | SoftCon 使用的持续预训练起点，与 GFM 的 ImageNet-22k 形成对比 |

**to-read.md 建议新增:**
- DINOv2: Learning Robust Visual Features without Supervision (Oquab et al., 2023) — arXiv
