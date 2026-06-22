---
title: CNN-based Image Classification Benchmarks (CV)
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: computer-vision
task: image-classification
approach: cnn-based
tags: [cv, cnn, classification, architecture, vit, moe]
sources:
  - L0_raw/imagenet-classification-with-deep-convolutional-neural-networks
  - L0_raw/deep-residual-learning-for-image-recognition
  - L0_raw/an-image-is-worth-16x16-words-transformers-for-image-recognition-at-scale
  - L0_raw/scaling-vision-with-sparse-mixture-of-experts
  - L0_raw/imagenet-classification-with-deep-convolutional-neural-networks
zotero_keys: []
confidence: high
---

# CNN-based Image Classification

## Overview

ImageNet 时代的里程碑。AlexNet (2012) 引爆深度学习，ResNet (2016) 用残差连接突破深度瓶颈。ViT (2021) 证明纯 Transformer 在大规模数据上可以超越 CNN，V-MoE (2021) 将稀疏 MoE 引入视觉，参数规模提升至 15B。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| AlexNet (Krizhevsky) | 2012 | 5 | 深度学习引爆 ImageNet | 2×GPU | ImageNet | true | — | GPU + ReLU + dropout |
| ResNet (He) | 2016 | 5 | 残差连接，152 层无退化 | 8×GPU | ImageNet | true | github.com/KaimingHe/deep-residual-networks | 恒等映射是深度网络的关键 |
| ViT (Dosovitskiy) | 2021 | 5 | 纯 Transformer 图像分类，16×16 patch | TPUv3 | JFT-300M, ImageNet | true | github.com/google-research/vision_transformer | 大规模预训练超越 CNN 归纳偏置 |
| V-MoE (Riquelme) | 2021 | 5 | 稀疏 MoE ViT，15B 参数 | TPU | JFT-300M | false | — | BPR 路由实现推理时动态计算量 |
