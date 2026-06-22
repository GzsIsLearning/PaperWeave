---
slug: "vision-transformers-need-more-than-registers"
title: "Vision Transformers Need More Than Registers"
authors:
  - "Cheng Shi"
  - "Yizhou Yu"
  - "Sibei Yang"
institutions:
  - "The University of Hong Kong (HKU)"
  - "Sun Yat-sen University"
date: "2026-03 (CVPR 2026)"
arxiv_id: "2602.22394"
venue: "CVPR 2026"
github: "https://github.com/ChengShiest/LAST-ViT"
category: "computer-vision"
tags: ["ViT", "feature artifact", "lazy aggregation", "patch score", "CLS token", "frequency domain", "dense prediction", "open-vocabulary"]
type: "method"

review_date: "2026-05-06"
reviewer: "Gongzs"
---

## Paper Review

### Key Contributions

1. 揭示 ViT 中各类 artifacts（高范数 token、attention deficit、密集特征不对齐）的统一根因：**Lazy Aggregation**——ViT 利用大量语义无关的背景 patch 作为编码全局语义的 shortcut。
2. 提出两个通用诊断指标：**Patch Score**（CLS-patch 余弦相似度）和 **Point-in-Box (PiB)**（最高分 patch 落入前景框的比例），跨监督范式可比。
3. 提出 **LaSt-ViT (LazyStrike ViT)**：通过频域稳定性分数进行逐通道 Top-K 选择性聚合，锚定 CLS token 到前景区域，零额外参数。
4. 在 12 个 benchmark 上验证，覆盖 label-supervised、text-supervised、self-supervised 三种预训练范式。

### Core Method

**Patch Score 定义：** S_p = (x_patch · Q_CLS) / (‖x_patch‖₂ ‖Q_CLS‖₂)
- 高 Patch Score = 与全局语义对齐强。实验发现：背景 patch 聚集在高分区，前景 patch 聚在低分区。

**Point-in-Box (PiB)：** 最高分 patch 落在前景 bounding box 内的图像比例。
- ResNet: 68.4 | ViT: 42.7 | ViT + Register: 41.5 ← Register 不加反降！

**LaSt-ViT 步骤：**
1. 1D FFT 沿 channel 维度变换 → Gaussian 低通滤波 → IFFT 恢复
2. 计算 Stability Score: S_ij = x̂_patch[i,j] / (|x̂ - x_patch| + ε)
3. 逐通道 Top-K Pooling：每个 channel j 选 K 个最稳定的 patch 平均
4. Vote Count v_i：patch i 被选中 channel 数 → 前景重要性指标

### Experimental Results

**Artifact Elimination：**
| Method | High Norm | PiB |
|--------|-----------|-----|
| ResNet | ✗ | 68.4 |
| ViT | ✓ | 42.7 |
| ViT + LazyStrike | ✗ | **55.1** (+12.4) |
| DINO-v1 | ✗ | 44.5 |
| DINO-v1 + LazyStrike | ✗ | **69.7** (+25.2) |

**Zero-shot Semantic Segmentation (mIoU%)：**
| Model | COCO-Obj | VOC20 | City. | ADE20K |
|-------|----------|-------|-------|--------|
| CLIP ViT-B/16 | 8.8 | 49.0 | 6.5 | 3.1 |
| + LazyStrike | 13.3 | **75.0** (+26) | 12.1 | 8.3 |
| CLIP ViT-L/14 | 3.0 | 17.1 | 2.7 | 1.6 |
| + LazyStrike | 15.0 | **72.4** (+55.3) | 12.3 | 8.4 |

**Open-Vocabulary Object Detection (AP50 Novel)：**
- F-ViT ViT-B/16: 17.5 → **33.3** (+15.8)
- F-ViT ViT-L/14: 24.7 → **39.1** (+14.4)

**Coarse Segmentation (VOC12 mIoU)：**
- ViT-B/16 Supervised: 22.3 → **32.8** (+10.5) ← 首次 label-supervised ViT 获得 emergent segmentation

**Object Discovery (CorLoc)：**
- LOST: 64.0 (VOC12) → LaSt-ViT: **67.6** (+3.6)，同时 FPS 55.9 vs 29.4

### Analysis — Lazy Aggregation 根因

1. **Masking Probe**：移除 50% 最高分 patch 对 ImageNet 准确率无影响甚至+1.2%。移除低分 patch 准确率骤降（70% mask → -60%）。
2. **时序动态**：PiB 从训练开始就低且恒定（~0.42-0.44），即使分类准确率持续提升。ResNet 的 PiB 显著更高。
3. **Patch Size 实验**：28×28 patch → 背景 token 减 10% → PiB 0.44→0.52，但准确率 62%→55%。验证粗粒度监督是原因之一。
4. **Window Attention 实验**：全窗 Attn → PiB 50.1→59.8，但准确率 72.3%→63.9%。验证全局依赖是原因之二。

**结论：** 全局依赖 + 粗粒度监督 → 背景 token 吸收扩散的前景语义 → ViT 仅靠背景就能分类正确。

### Key Insights (10)

1. **Lazy Aggregation** —— ViT 本质上是"懒惰"的：它用大量背景 patch 做全局语义的 shortcut，而非真正关注前景。这是所有 artifacts 的统一根因。

2. **Register 是创可贴** —— Register tokens 只抑制了症状（高范数 token），不治根因。ViT + Register 的 PiB 甚至低于原始 ViT (41.5 vs 42.7)。论文标题正是由此而来。

3. **频域物理直觉** —— 前景特征在 channel 维度的方差更低（语义更均质）→ 低通滤波后可筛选稳定 patch → CLS 锚定到前景。这是核心创新。

4. **EMERGENT 现象始于训练开始** —— PiB 从第 1 个 epoch 就低且恒定。这不是晚期副作用，而是 ViT 训练的固有偏差。

5. **监督范式无关** —— 无论是 label、CLIP 还是 DINO 预训练，LazyStrike 都有效。Patch Score 和 PiB 是通用诊断工具。

6. **Label-supervised ViT 首次获得 emergent segmentation** —— 此前 emergent property 被认为是 self-supervised 的特权。LaSt-ViT 在 label-supervised ViT 上 VOC12 mIoU 22.3→32.8。

7. **无额外参数** —— LaSt-ViT 不修改网络结构，只是替换 CLS 聚合方式。推理时 FFT + TopK 开销极小。

8. **CLIP ViT-L/14 零样本分割实现 4.2× 提升** —— VOC mIoU 17.1%→72.4%，不再是巧合，是系统性的 lazy aggregation 修复。

9. **高范数 token = 全局信息被"藏"在了背景 patch 里** —— 这才是 Register 篇中高范数 token 的本质：模型把全局信息存到了背景区域。Register 只是把这些 token 移走了，没解决扩散问题。

10. **RS ViT 编码器风险** —— CROMA/SatMAE 等 RS ViT 编码器如果存在同样的 lazy aggregation，它们的密集预测（分割、变化检测、作物监测）特征可能严重偏向背景。

### [2026-05-06] GUIDE.md 重读新发现

11. **K 值最优比例因监督范式而异。** Table 8 (text-supervised, 196 patches) 最优 K=98 (50%)；Table 9 (label-supervised, 49 patches) 最优 K=7 (14%)。CLIP 训练下语义扩散范围更广（需要更多 patch 参与聚合才能覆盖语义），label 训练下前景更集中（少数 patch 即可）。这说明 lazy aggregation 的程度不是常数，而是由监督信号的**语义粒度**决定的——更粗的监督信号（image-level label）导致更集中的前景语义，更细的信号（text alignment）导致更分散的语义。K 值的选择因此不是纯粹的超参调优问题，而是监督范式内在属性的反映。

12. **计算效率是隐藏的主要收益。** Object discovery Tab.7：CorLoc 67.6 vs LOST 64.0（+3.6pp），但 FPS 55.9 vs 29.4（+90%）。准确率改进只是副产物——真正的卖点是**不需要特征值分解、不需要多尺度推理**。LOST 的 eigenvector computation (O(N²)) 和 DINO-seg 的多尺度 forward pass 都被单次 FFT + TopK (O(N log N)) 替代。这个 2× 加速在 review 中被 "零额外参数" 的提法掩盖了——零参数 ≠ 零计算，关键是对手方法的计算开销更高。

13. **DINO-v1 是最大单点增益，揭示的是表达瓶颈而非能力瓶颈。** PiB 跨范式对比：ViT +12.4、CLIP +10.3、DINO-v1 **+25.2**。DINO-v1 的 emergent segmentation 本就在 "试图涌现"——它的特征已经有前景/背景分离的倾向（PiB 44.5 已经高于 ViT 42.7），只是被 lazy aggregation 压制了。LaSt-ViT 解开的不是能力瓶颈（教模型学会关注前景），而是**表达瓶颈**（让模型已经学会的东西能够表达出来）。这对 self-supervised ViT 的设计有直接启示：DINO 类的 emergent property 可能普遍存在但被 artifacts 掩盖，不一定需要更强的预训练目标，只需要更好的聚合策略。

### Remaining Problems

- Window attention 实验验证了全局依赖贡献于 lazy aggregation，但准确率下降 → 需要在分类与定位之间 trade-off
- 频域低通滤波的物理假设（前景语义均质）在某些 RS 场景（如复杂城市场景）可能不完全成立
- 论文只在 ImageNet-1k 预训练上验证，迁移到大型数据集的泛化性待验证
- K 值需要针对不同 backbone 和任务单独选择（Table 8/9）

### ⚠️ Critical Limitation — 频域稳定性假设的适用范围

LaSt-ViT 判定前景的默认假定是：

> **经 Gaussian 低通滤波后变化最小的 patch = 前景；变化大的 = 背景。**（Eq.5: Stability Score = 滤波后值 / |滤波后 − 原始|）

展开这条逻辑链：

```
低通滤波保留低频 = 保留 channel 维度变化慢的信号
                  ↓
          "变化慢" = 该 patch 的 channel 间值相近
                  ↓
    channel 间值相近 = 该 patch 的语义均质（论文的物理直觉）
                  ↓
         语义均质的区域 = 应该被 CLS 聚合（Top-K 选中）
```

链上每一步都是假设，不是定理：
- **低通 → 语义均质**：光滑先验，不是语义先验。水体、裸土、沙漠等大面积均质区域在频域上和 ImageNet 的前景一样"稳定"，但语义上它们是背景。
- **语义均质 → 应保留**：即使在 object-centric 任务里也不全对——K 值的最优比例因监督范式而异（新发现 #11：text-supervised 需要 50% 的 patches，label-supervised 仅需 14%），说明 CLS 聚合不一定只需要"最均质"的区域。
- **Top-K 硬丢弃**：未被选中的 patch 信息完全丢失。对需要背景语义的任务（场景理解、变化检测、land cover classification）是结构性缺陷。

**结论：** Patch Score + PiB 作为诊断工具仍然有价值。LaSt-ViT 的频域 Top-K 聚合不应直接用于需要背景信息的任务。如果需要保留背景，修正方向是 soft reweighting（而非硬 Top-K）、task-conditional gate、或仅用频域分数做 attention bias 而非特征选择。

### Code Review

**仓库:** https://github.com/ChengShiest/LAST-ViT (CVPR 2026)
- `cls_pretrain/` — label-supervised ViT 训练脚本
- `visualization/` — 可视化工具
- Pre-trained weights: DINO, CLIP (OpenAI), ViT-B/16 三个版本
- 训练依赖于 facebookresearch/dino 和 mlfoundations/open_clip
- 代码组织清晰，但 README 未包含安装和使用步骤细节
- 评估脚本仅提供 Patch-BBox Hit Ratio，完整的 benchmark eval 代码需要根据论文补充

**可用性：** 预训练权重可直接下载 → 可以加载到现有 RS ViT pipeline 中测试 lazy aggregation 现象。

### Score

| Dimension | Score | Note |
|-----------|-------|------|
| **Contribution (Novelty)** | **5/5** | 建立 ViT artifacts 统一理论框架，提出通用诊断指标和简洁解决方案。CVPR 2026 口头报告级别。 |
| **Soundness (Rigor)** | **5/5** | 12 benchmark × 3 范式 × 多 backbone 尺寸，masking probe + window attention ablation + temporal dynamics tracking + patch size 实验 |
| **Relevance (to RS)** | **1/5** | BioGFM 使用 8×8 (1 patch) 输入 → 无前景/背景区分 → lazy aggregation 假设完全不适用。仅有知识价值，无实用迁移路径。 |
| **Overall** | **5/5** | ★★★★★ 里程碑式工作。从第一性原理出发，统一解释了 ViT 的多种 artifacts，提供了简洁有效的解决方案。 |

### Relevance to Remote Sensing / BioGFM

**❌ 不适用于 BioGFM 当前架构。**

BioGFM 使用 **8×8 输入 → 1 patch**。这意味着：
- 不存在前景/背景的 patch 级区分——整个图像就是一个 token
- LaSt-ViT 的核心假设（多 patch 中选择哪些参与 CLS 聚合）在单 patch 场景下 trivial 化为恒等映射
- Patch Score = CLS-patch cosine similarity → 单 patch 情况下恒为 1.0
- PiB → 无意义（只有一个 patch，无处可"落入"）
- Top-K pooling → K=1 即全量，K<1 不存在

Lazy aggregation **不能解释** TemporalSoftmax → 0.2 现象——该现象发生在 multi-timestep fusion 层，而 lazy aggregation 是 encoder 层的 multi-patch 问题。两者的作用域完全不同。

**仅有的知识价值：**
- 理解 ViT 编码器的内在行为机制（CS 素养）
- 如果未来 BioGFM 升级为多 patch 输入（如 224×224 → 14×14 patches），Patch Score + PiB 可做诊断
- 频域特征稳定性概念可泛化到时序分析（但不是通过 LaSt-ViT 的 Top-K 聚合方式）

### Citation Mining (3 papers added to to-read.md)

| # | Paper | Venue | Why | Status |
|---|-------|-------|-----|--------|
|| 1 | Darcet et al. "Vision Transformers Need Registers" (2023) | arXiv | MIRAGE 直接前驱。理解 Register token 机制和 high-norm token 现象 | **New** |
|| 2 | Caron et al. "Emerging Properties in Self-Supervised Vision Transformers" (DINO) | ICCV 2021 | 自监督 ViT 经典工作，本论文多次对比。理解 emergent property 概念 | **New** |
|| 3 | Siméoni et al. "Localizing Objects with Self-Supervised Transformers and No Labels" (LOST) | arXiv 2021 | 本论文对比的 object discovery baseline。与 RS 无监督目标检测相关 | **New** |

## [2026-06-03] Daily paperweave batch-read re-review

**总体评价：** CVPR 2026 口头报告级别的里程碑工作。LaSt-ViT 从第一性原理出发，统一解释了 ViT 多种 artifacts（高范数 token、attention deficit、密集特征不对齐）的根因为 lazy aggregation，并提出优雅的频域选择性聚合方案。L2/L3 横贯阅读揭示了该工作与 RS 社区的深层连接。

### 跨层横贯洞察 (Cross-Wiki Connections)

**1. L2 定位（vit-lazy-aggregation.md）：**
该文被定位为 ViT 特征分析领域的"统一根因分析"——超越了 Register（Darcet et al., 2023）仅处理症状的局限，建立了覆盖 label/text/self-supervised 三种范式统一框架：
```
Register (2023) ← 症状处理：高范数 token → 添加 register token 作为"汇"
    ↓
LaSt-ViT (2026) ← 根因分析：lazy aggregation → 频域选择性聚合
```

**2. 与 model-efficiency.md 的连接：**
LaSt-ViT 的设计完全符合"效率优先"趋势：
- 零额外参数：不改网络结构，仅替换 CLS 聚合方式
- 推理加速：FFT+TopK (O(N log N)) 替代 eigenvector computation (O(N²))，Object discovery FPS 29.4→55.9（+90%）
- 与 RS 领域的 SoftCon（100 epoch=1000 epoch）、SeaMo（200 GPU-h SOTA）共享"更聪明而非更大"的哲学
- 关键对比：RingMoE（14.7B, 512×Ascend）vs LaSt-ViT（零参数更改, 单卡可跑）

**3. 与 open-source-reproducibility.md 的连接：**
该文代码（https://github.com/ChengShiest/LAST-ViT）开源了 DINO/CLIP/ViT-B/16 的预训练权重，可复现性强。与 RS 领域的 RingMoE（闭源）、SkySense（闭源）形成鲜明对比。其 Patch Score 和 PiB 诊断工具可直接应用于 RS ViT 编码器的分析。

**4. 对 RS ViT 编码器的重要启示：**
CROMA、SatMAE、RingMo、DOFA 等 RS 基础模型均使用 ViT 架构 + 全局注意力 + 粗粒度监督（image-level 分类或对比学习目标），这意味着它们很可能遭受同样的 lazy aggregation 问题：
- **CROMA**: MAE+对比学习预训练，Sentinel-2 编码器——lazy aggregation 可能导致 SAR-光学特征对齐偏差
- **SatMAE**: 时序 MAE，重建目标可能鼓励模型利用"时序上稳定的背景特征"而非"真正的前景物候特征"
- **DOFA**: 波长条件超网络，lazy aggregation 可能干扰波长-特征映射的物理一致性
- 遥感变化检测（change detection）任务尤其脆弱：变化发生在目标地物边界，如果 ViT 的密集特征偏向背景，变化定位精度会显著下降

### 新发现的局限与设计约束

**5. 频域稳定性假设的 RS 场景失效案例：**
```
低通滤波保留低频 → 捕获 channel 维度变化慢的信号
     → 语义均质区域被选中 → RS 中大面积均匀地物（水体、裸土、沙漠）被误判为"前景"
     → Top-K 硬丢弃：未被选中的背景 patch（包含场景上下文）完全丢失
```
具体案例：
- 农田时序分析中，均质的土壤背景被选中，但不同作物间的高频差异被丢弃
- 城市变化检测中，建筑（线条丰富/高频）被丢弃，停车场（平滑/低频）被选中
- 这一局限使得 LaSt-ViT 直接不适用于需要上下文感知的任务

**6. K 值选择的监督范式依赖性深入分析：**
Table 8/9 显示：
| 监督范式 | 最优 K 比例 | 语义分布特点 |
|----------|-----------|-------------|
| Label-supervised | 14% (7/49) | 前景集中，语义边界清晰 |
| Text-supervised | 50% (98/196) | 语义扩散范围更广 |
这反映了监督信号语义粒度对 lazy aggregation 程度的直接影响。对于 RS VLM（如 RemoteCLIP, SkyCLIP），由于使用 text-supervised 预训练，如果应用 LaSt-ViT，可能需要选择接近 50% 的 K 值，即保留更多 patch 参与 CLS 聚合。

**7. 与 PANGAEA 发现的呼应：**
PANGAEA 发现"GFM 在简单任务上不如 UNet + 充分标注"——这与 LaSt-ViT 的 masking probe 结果（移除50%高分区patch不影响分类精度）在认知上一致：ViT 学到的是"背景 shortcut"而非"前景理解"。

**8. CLIP ViT-L/14 零样本分割 +55.3 mIoU 的再解析：**
论文最震撼的结果——CLIP ViT-L/14 在 VOC20 上从 17.1% → 72.4% mIoU（+55.3pp）。这一提升的幅度意味着：
- CLIP 的文本语义（"dog", "car"）已经在 dense feature 中编码了——只是被 lazy aggregation 掩盖
- LaSt-ViT 解开的不是能力瓶颈，而是**表达瓶颈**（让模型已经学会的东西能够表达出来）
- 这对 RS VLM 有直接意义：RemoteCLIP/GeRSCLIP 的密集特征可能已经包含语义信息，只需要更好的聚合策略

### 引文网络扩展

| # | 论文 | 期刊/会议 | 与本文关系 | 状态 |
|---|------|----------|-----------|------|
| 1 | Vision Transformers Need Registers (Darcet et al., 2023) | arXiv | 直接前驱，本文证明 Register 只能治标不能治根 | **New** |
| 2 | DINO: Emerging Properties in Self-Supervised Vision Transformers (Caron et al.) | ICCV 2021 | emergent property 概念的源头 | **New** |
| 3 | LOST: Localizing Objects with Self-Supervised Transformers and No Labels (Siméoni et al.) | arXiv 2021 | 本文进行对比的 object discovery baseline | **New** |
| 4 | CLIPSelf: Vision Transformer Distills Itself for Open-Vocabulary Dense Prediction (2024) | CVPR 2024 | 文本监督 ViT 密集特征对齐的 prior art | **New** |
| 5 | PANGAEA: A Global and Inclusive Benchmark for Geospatial Foundation Models (2025) | arXiv 2025 | 发现 GFM vs UNet 的悖论，与 lazy aggregation 的 masking probe 结果一致 | **New** |

### 设计空间更新

LaSt-ViT 的频域稳定性诊断方法（Stability Score + Vote Count）可与现有的 RS ViT 编码器分析工具整合：
- 可用于诊断 CROMA/SatMAE/RingMo 是否存在 lazy aggregation
- 但**不应直接替换**这些模型的 CLS pooling（RS 场景需要背景上下文）
- 修正方向：soft reweighting（非硬 Top-K）+ task-conditional gate（分类任务多用前景，分割/变化检测保留背景）

### 原始 review 验证更新

- Score 5/5 仍然合理——该工作在 CVPR 2026 发表，已被社区验证
- Relevence to RS 的 1/5 评分是正确的：对 BioGFM 的 8×8 单patch 输入不适用
- 但 RS 社区（CROMA, SatMAE, DOFA 等多 patch ViT 编码器）可以从诊断工具中受益
- 代码仓库与论文中一致，权重可用
