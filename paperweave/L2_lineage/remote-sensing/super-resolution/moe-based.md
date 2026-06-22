---
title: MoE-based Super-Resolution for Remote Sensing
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: remote-sensing
task: super-resolution
approach: moe-based
tags: [remote-sensing, super-resolution, moe]
sources:
  - L0_raw/heterogeneous-mixture-of-experts-for-remote-sensing-image-super-resolution
zotero_keys: []
confidence: low
---

# MoE-based Super-Resolution for Remote Sensing

## Overview

遥感图像超分辨率任务中，利用异构 MoE 处理不同类型的地物退化模式。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| Heterogeneous MoE SR (Chen) | 2025 | 3 | 异构 MoE 遥感超分 | — | — | ✓ | https://github.com/Mr-Bamboo/MFG-HMoE | 不同地物需要不同的超分策略 |

## 2026-06-12 更新（Daily Reading Agent 重读）

### 新增跨引用连接
- 与 [[../../L3_module/multi-scale-feature-extraction]] 关联：MFA 模块是多尺度特征聚合的变体，但仅聚合 RHAG 层级特征
- 与 [[../../L3_module/model-efficiency]] 关联：离散 top-1 路由的稀疏性可带来计算节省，但原论文未量化效率收益
- 与 [[../../L0_raw/heterogeneous-mixture-of-experts-for-remote-sensing-image-super-resolution/review.md]] 关联：代码已验证（基于 BasicSR 框架），DualRouting 实现为两阶段离散选择（Group Router → Expert Router），HMoE 包含 8×1×1 Conv + 8×3×3 Conv 异构专家

### 新增待补充论文（来自 to-read.md）
- MLoRE: Multi-task dense prediction via mixture of low-rank experts (Yang et al., 2024, CVPR) — 多任务密集预测的 LoRA 风格 MoE
- TaskDiffusion: Multi-task dense predictions via unleashing the power of diffusion (Yang et al., 2025, ICLR) — 扩散解码器的多任务学习

### 关键发现
- 论文实际发表于 IEEE GRSL（快报期刊，5 页限制），非 TGRS——这解释了实验深度不足
- 16 专家 vs 1 专家：SSIM 提升 0.004（UCMerced ×4），绝对增益有限但统计显著
- 异构设计（1×1+3×3）贡献 +0.002 SSIM，双路由贡献 +0.001 SSIM——增量式改进
|