---
slug: "contrastive-learning-for-unpaired-image-to-image-translation"
title: "Contrastive Learning for Unpaired Image-to-Image Translation"
authors:
  - "Taesung Park"
  - "Alexei A. Efros"
  - "Richard Zhang"
  - "Jun-Yan Zhu"
year: 2020
venue: "ECCV 2020"
tags: [contrastive-learning, image-translation, generative-models, self-supervised]
score: 5
contribution: 5
soundness: 5
relevance: 3
open_source: true
code_url: "https://github.com/taesungp/contrastive-unpaired-translation"
compute: "1×GTX 1080Ti (train), ~3.3GB memory"
dataset_access: public
---

> **Abstract:** 提出CUT (Contrastive Unpaired Translation)，用多层patchwise对比学习（PatchNCE loss）替代cycle-consistency实现无配对图像翻译的内容保持。通过最大化输入输出对应patch的互信息，在horse→zebra、Cityscapes等任务上全面超越CycleGAN等baseline，同时速度更快、内存更省。可扩展至单图翻译场景（SinCUT）。

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 5/5 — 首次将对比学习（InfoNCE/NCE）引入条件图像合成领域，提出patchwise、多层、内部负样本三个关键设计。用PatchNCE替代cycle-consistency是范式级创新，启发了后续大量工作（SimCLR风格+生成）。
- Soundness: 5/5 — 消融实验严密：internal vs external negatives、多层vs单层、identity loss的影响、温度参数、weight sharing等。FID+mAP+pixAcc+classAcc多指标评估，3个数据集+单图场景全覆盖。速度/内存对比量化清晰。
- Relevance: 3/5 — 非遥感直接相关，但其对比学习范式（尤其是patchwise内部负样本）对遥感图像翻译、domain adaptation、变化检测的特征保持有方法论参考价值。

**Key Insights:**
- 内部负样本（同一图像内的其他patch）优于外部负样本（数据集中其他图像），原因是内部统计量无需建模类内变化（如白马vs棕马→斑马纹）。
- 多层patchwise loss是图像合成中对比学习的关键——仅用最后一层特征（类似unsupervised representation learning的做法）会导致严重性能下降。
- Identity regularization（对目标域图像也施加PatchNCE）显著稳定训练，防止模式坍塌。
- 方法天然支持单图像训练（SinCUT），暗示I2I translation与neural style transfer之间的深层联系。
- 权重共享（encoder + MLP projection）和decoder gradient propagation对PatchNCE都至关重要。

**Notes:** ECCV 2020, 引用量极高(1000+)。作者阵容强大：Taesung Park (Samsung Scholar + Adobe Fellow), Alexei Efros (Berkeley), Jun-Yan Zhu (Adobe/CMU)。代码完全开源。用于Cityscapes的pretrained DRN分割网络评估语义一致性。GPU需求低（1080Ti即可训练），适合复现。

**Citation Mining:**
- CycleGAN [89] (Zhu et al., ICCV 2017) — 本工作的直接前驱和对比baseline
- SimCLR [9] (Chen et al., ICML 2020) — MLP projection head设计的来源
- MoCo [24] (He et al., CVPR 2020) — 外部负样本的momentum encoder方案
- CPC [57] (Oord et al., 2018) — InfoNCE loss的原始工作
- SinGAN [64] (Shaham et al., ICCV 2019) — 单图生成模型的先行工作

## [2026-05-02] Verified
