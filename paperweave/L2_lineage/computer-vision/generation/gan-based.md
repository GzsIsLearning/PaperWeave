---
title: Generative Adversarial Networks
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: computer-vision
task: generation
approach: gan-based
tags: [cv, gan, generative, contrastive, image-translation]
sources:
  - L0_raw/contrastive-learning-for-unpaired-image-to-image-translation
zotero_keys: []
confidence: high
---

# Generative Adversarial Networks

## Overview

GAN (Goodfellow et al. 2014) 开创生成对抗范式：生成器与判别器博弈训练。CUT (Park et al. 2020) 将对比学习引入无配对图像翻译，用 PatchNCE loss 替代 cycle-consistency。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| GAN (Goodfellow) | 2014 | 5 | 生成对抗网络原始框架 | — | MNIST, CIFAR | true | — | 极小极大博弈驱动生成 |
| CUT (Park) | 2020 | 5 | 对比学习替代 cycle-consistency | 1×1080Ti | Cityscapes, horse→zebra | true | github.com/taesungp/contrastive-unpaired-translation | 内部负样本 + 多层 patchwise loss |
