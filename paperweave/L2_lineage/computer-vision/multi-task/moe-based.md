---
title: MoE-based Multi-Task Learning (CV)
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: computer-vision
task: multi-task
approach: moe-based
tags: [cv, multi-task, moe, mamba, dense-prediction]
sources:
  - L0_raw/m3vit-mixture-of-experts-vision-transformer-for-efficient-multi-task-learning-wi
  - L0_raw/mtmamba-enhancing-multi-task-dense-scene-understanding-via-mamba-based-decoders
  - L0_raw/m3vit-mixture-of-experts-vision-transformer-for-efficient-multi-task-learning-wi
  - L0_raw/mod-squad-designing-mixtures-of-experts-as-modular-multi-task-learners
zotero_keys: []
confidence: high
---

# MoE-based Multi-Task Learning

## Overview

多任务密集预测的两条技术路线：M3ViT (2022) 用任务条件 MoE 层替代 ViT FFN，实现稀疏推理（仅激活任务相关专家），解决梯度冲突和推理效率问题。MTMamba++ (2024) 首次将 Mamba/SSM 引入多任务解码器，通过自任务 Mamba (STM) 和跨任务 Mamba (CTM) 实现线性复杂度的跨任务交互。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| M3ViT (Liang) | 2022 | 3 | 任务条件 MoE ViT + FPGA 加速器协同设计 | — | NYUD-v2, PASCAL-Context | true | https://github.com/VITA-Group/M3ViT | 稀疏激活仅用任务相关专家，节省推理能耗 |
| MTMamba++ (Lin) | 2024 | 4 | Mamba 解码器多任务密集预测 | 4×A100 | NYUDv2, PASCAL, Cityscapes | true | github.com/EnVision-Research/MTMamba | SSM 线性复杂度替代注意力，Cross SSM 建模跨任务关系 |

## Impact

Mamba-based 架构正在遥感中兴起（Vision Mamba for EO），跨任务 Mamba 设计可启发射频多任务框架（联合分割+变化检测+分类）。MoE 的稀疏激活思路对遥感大模型推理效率有重要参考价值。
