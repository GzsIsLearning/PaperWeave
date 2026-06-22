---
title: Representation Autoencoders for Generative Modeling (CV)
created: 2026-06-01
updated: 2026-06-01
type: lineage
domain: computer-vision
task: generation
approach: representation-autoencoder
tags: [cv, rae, diffusion, representation, generative]
sources:
  - L0_raw/diffusion-transformers-with-representation-autoencoders
zotero_keys: []
confidence: medium
---

# Representation Autoencoders (RAE) for Diffusion Transformers

## Overview

RAE (Zheng, Ma, Tong, Xie et al. 2025) 提出一个简洁而深刻的观察：DiT 长期使用 VAE 做 latent 编码，但 VAE 的低维、纯重建训练得到的 latent 空间是次优的。RAE 用预训练的表示模型（DINOv2, SigLIP, MAE）作为 frozen encoder + 一个轻量级 decoder，形成高维语义丰富的 latent 空间用于扩散训练。核心挑战是：高维 latent 空间对扩散 transformer 不稳定，需要维度依赖的 noise schedule + 适当的 decoder noise augmentation + 宽 head 架构。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| RAE-DiT (Zheng) | 2025 | 4 | 5 | — | ImageNet | true | rae-dit.github.io | 高维语义 latent > 低维重建 latent |

## Design Taxonomy

### Core Components
- **Frozen Representation Encoder**: DINOv2, SigLIP, MAE 等预训练模型（语义丰富）
- **轻量 Decoder**: 纯重建训练，无辅助 loss
- **DiTDH (Diffusion Transformer with DDT Head)**: 宽 head 适配高维 latent
- **维度依赖 Noise Schedule**: λ ∝ latent_dim，高维需要更高 noise
- **Decoder Noise Augmentation**: 训练 decoder 时加噪声，使其能处理扩散输出

### Key Design Choices
- 不需要 auxiliary representation alignment losses（对比 RAE 消融）
- DDT (Distributed Diffusion Transformer) head 是宽头而非深头
- 高维 latent 空间用 token-wise/patch-wise 扩散而非 monolithic latent

## Cross-Paper Synthesis

| Dimension | RAE | VAE (SD) | VQ-VAE |
|-----------|-----|----------|--------|
| Encoder | Frozen pre-trained | Trained from scratch | Trained from scratch |
| Latent dim | High (768-1024+) | Low (4-16) | Discrete codes |
| Semantics | Rich (pre-trained features) | Limited (reconstruction) | Medium |
| Decoder cost | Higher (high-dim→pixel) | Low (4→pixel) | Medium |
| Diffusion quality | Better (1.13 FID) | Baseline (2-3 FID) | Variable |
