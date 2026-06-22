---
slug: "mod-squad-designing-mixtures-of-experts-as-modular-multi-task-learners"
title: "Mod-Squad: Designing Mixtures of Experts As Modular Multi-Task Learners"
authors:
  - "Zitian Chen"
  - "Yikang Shen"
  - "Mingyu Ding"
  - "Zhenfang Chen"
  - "Hengshuang Zhao"
  - "Erik Learned-Miller"
  - "Chuang Gan"
year: 2023
venue: "CVPR"
tags: [cv, moe, multi-task-learning, vit, model-pruning]
score: 4
contribution: 4
soundness: 4
relevance: 3
open_source: true
code_url: "https://vis-ww.cs.umass.edu/mod-squad"
compute: "240×V100 80h"
dataset_access: public
---

> **Abstract:** Mod-Squad proposes a modular MoE-based Vision Transformer for multi-task learning where experts are matched to tasks via mutual information maximization, enabling both cooperation (shared experts) and specialization (task-specific experts). A key side benefit: sub-networks can be extracted for single-task inference with zero performance drop.

## [2026-05-02] Review

**Score:** 4/5
- Contribution: 4/5 — Novel coupling of MoE with mutual information maximization for task-expert assignment. The "train once, extract all" property is elegant and practical.
- Soundness: 4/5 — Extensive experiments on Taskonomy (13 tasks) and PASCAL-Context (5 tasks). Strong ablations (MI loss vs load-balancing loss, pruning thresholds, router fine-tuning). 240 V100 GPUs is heavy but yields solid results.
- Relevance: 3/5 — Multi-task learning architecture with MoE is tangentially relevant to RS foundation models. The expert specialization concept and sub-network extraction are transferable ideas but not directly applicable to EO without adaptation.

**Key Insights:**
- Mutual information maximization between tasks and experts drives sparse, strong dependence — experts specialize rather than being forced to share across conflicting tasks.
- After training, rare/unused experts can be pruned with zero performance drop (threshold θ=0 gives same accuracy at 116.9M vs 201.3M params).
- Router fine-tuning enables quick adaptation to new tasks by only tuning the lightweight routing network + task head (few-shot efficient).
- Task relationship visualization emerges naturally from expert sharing patterns.

**Citation Mining:**
- ViT [Dosovitskiy et al., 2021] — base architecture
- MoE [Shazeer et al., 2017] — sparse MoE foundation
- M3ViT [Zhao et al., 2022] — multi-task ViT baseline
- Taskonomy [Zamir et al., 2018] — multi-task learning benchmark

**L1 Ecology Observations:**
- MI-based task-expert matching enables transparent task-relation analysis — useful for RS multi-task models
- Sub-network extraction (train once, extract all) is practical for RS deployment on edge devices
- Router fine-tuning for new tasks enables efficient few-shot adaptation in RS domains
- Expert specialization patterns provide insight into which tasks conflict in RS (e.g., segmentation vs classification)
