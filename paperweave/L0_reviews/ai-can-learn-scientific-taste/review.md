---
slug: ai-can-learn-scientific-taste
title: "AI Can Learn Scientific Taste"
authors:
  - "Jingqi Tong"
  - "Mingzhe Li"
  - "Hangcheng Li"
  - "Yongzhuo Yang"
  - "Yurong Mou"
  - "Weijie Ma"
  - "Zhiheng Xi"
  - "Hongji Chen"
  - "Xiaoran Liu"
  - "Qinyuan Cheng"
  - "Ming Zhang"
  - "Qiguang Chen"
  - "Weifeng Ge"
  - "Qipeng Guo"
  - "Tianlei Ying"
  - "Tianxiang Sun"
  - "Yining Zheng"
  - "Xinchi Chen"
  - "Jun Zhao"
  - "Ning Ding"
  - "Xuanjing Huang"
  - "Yugang Jiang"
  - "Xipeng Qiu"
year: 2026
venue: arXiv (cs.CL)
arxiv_id: "2603.14473"
code_url: "https://github.com/tongjingqi/AI-Can-Learn-Scientific-Taste"
institutions:
  - "Fudan University"
  - "Shanghai Innovation Institute"
  - "OpenMOSS Team"
  - "Tsinghua University"
  - "Central South University"
tags: [RL, preference-modeling, scientific-taste, reward-model, LLM, GRPO, RLCF]
type: method
license: Apache 2.0
read_date: 2026-05-20
score:
  contribution: 4
  soundness: 4
  relevance: 3
  overall: 4
---

# AI Can Learn Scientific Taste

> **TL;DR:** 用社区反馈（引用）作为偏好信号，通过 GRPO 训练 Scientific Judge（判断论文影响力），再将其作为奖励模型用 Comparison-Based GRPO 训练 Scientific Thinker（提出高影响力研究想法）。RLCF 范式证明「科学品味」是可学习的。

## Abstract One-Liner

提出 **Reinforcement Learning from Community Feedback (RLCF)**，将科学品味形式化为偏好建模+偏好对齐问题：在 69.7 万对 arXiv 论文对上训练 Scientific Judge（超越 GPT-5.2/Gemini 3 Pro），再以它为奖励模型训练 Scientific Thinker（击败 54.2% 的 SOTA 模型）。

## Key Insights

1. **科学品味不是神秘的天赋，而是可学习的目标** — 核心洞察：将社区反馈（引用数）转化为同领域+同年份的配对偏好，可提取出可泛化的「品味」表征
2. **Scaling works here too** — Scientific Judge 的训练准确率随数据量和模型大小呈对数线性增长，32B 模型超越 671B 的 DeepSeek-V3.2/Kimi-K2.5
3. **泛化三重奏** — 同一个模型同时泛化到：未来年份（2025论文）、未见过学科（CS→Math/Physics/bioRxiv）、不同评价指标（引用→ICLR评审分），说明学到的不是模式匹配而是深层品味
4. **Comparison-Based GRPO 是开放任务的 RL 利器** — 用循环锦标赛计算组内胜率作为奖励，无需绝对评分标准，适用于任何难以标定的开放任务
5. **Judge 作为 Thinker 的奖励模型比直接用基座模型强** — SciJudge-Qwen3-4B 作为奖励比 Qwen3-4B-Instruct 的 Thinker 胜率高出 8-12 个百分点
6. **引用≠质量，但时间+领域匹配可消除偏差** — 论文用严格的场匹配和时间匹配来消除「老论文/热门领域引用多」的天然偏差
7. **RLCF 范式是通用的** — 不限于科学品味，任何有社区反馈信号（引用、下载量、GitHub star）的领域都可以套用

## Review

### Contribution (4/5)

这篇论文最大的贡献在于**概念框架的提出**：将有「不可言说」意味的科学品味分解为可操作的两个能力（judgement + ideation），并用社区反馈（引用）+ RL 训练来度量。这不是第一个用 GRPO 训练 reward model 的工作（GRM/RM-R1 等先行），也不是第一个用引用做论文评价的工作，但将两者系统性组合成 RLCF 范式、并展示三重泛化（时间×学科×评价指标），是**干净且有说服力的故事**。

SciJudgeBench（69.7万对）本身也是一个有价值的资源，虽然只覆盖 arXiv（偏 CS/理论），但构建方法论可迁移。

### Soundness (4/5)

实验设计扎实：
- 多 backbone（Qwen2.5/Qwen3/Llama3.1）+ 多规模（1.5B-32B），3个 OOD 设置（时间、学科、评价指标）
- 位置交换一致性评估消除位置偏差
- 通用能力评估（MMLU-Pro/GPQA/MATH/GSM8K）确认训练后通用能力未降
- Scaling 曲线明确展示 log-linear 关系

不足：
- 引用作为社区反馈存在滞后性（高潜力论文早期引用低）—— 论文自己也指出了
- 领域分类粒度有限（arXiv 子学科），更细粒度可能提升配对质量
- 理想能力评估依赖 LLM judge 而非实验验证—— 论文也承认了
- SciJudgeBench 的构建没有进行外部验证（如与专家判断的一致性）

### Relevance (3/5)

对遥感研究不是直接相关，但方法论有迁移价值：
- RLCF 可迁移到遥感领域：用遥感论文的引用构建配对的 SciJudge-RS 数据集 → 训练遥感领域的 Scientific Judge
- SciJudgeBench 的配对方法论可用于构建遥感论文的偏好数据集
- Comparison-Based GRPO 对生成式遥感任务（captioning、变化描述）有参考价值

### Overall (4/5)

近年来最干净的「AI for Science」方法论论文之一。不追求炫技，而是抓住一个本质问题（科学品味能不能学？）并用简洁的 RL 框架回答。实验结果有说服力，泛化维度全面。对想做论文筛选自动化或文献评价系统的研究组是必读。

## Code Review

GitHub 仓库仅包含 README、LICENSE、PDF、资产图片。**无训练脚本、无推理代码、无数据处理代码**。实际模型和数据集发布在 HuggingFace（[OpenMOSS-Team 合集](https://huggingface.co/collections/OpenMOSS-Team/ai-can-learn-scientific-taste)）。

- **开源认证**: ⚠️ 部分开源（模型权重 + 数据集可用，训练代码不可用）
- **可复现性**: 论文详细描述了 GRPO 超参数（附录 B），理论上可复现
- **计算资源**: 32B 模型训练需要 8×H100，32B judge 训练约 150 H100-hours
- **在线 Demo**: [PaperRank](https://paperank.open-moss.com/) 可体验论文打分；[AI-Innovator](https://yatao-zhuozhuo.github.io/AI-Innovator/) 可体验理念生成

## Citation Mining

### 直接谱系 (Direct Lineage)
- [12] Can LLMs Generate Novel Research Ideas? (Si et al., 2024) — The ideation gap
- [13] The Ideation-Execution Gap (Si et al., 2025) — Follow-up on idea execution
- [50] OpenNovelty (Zhang et al., 2026) — LLM-based novelty assessment
- [47] AI Co-Scientist (Gottweis et al., 2025) — Google's AI scientist system

### 范式基础 (Foundational)
- [30] DeepSeekMath: GRPO (Shao et al., 2024) — The RL algorithm used
- [52] DeepSeek-R1 (DeepSeek-AI, 2025) — RLVR reasoning baseline
- [19] Training language models to follow instructions with human feedback (Ouyang et al., 2022) — RLHF foundation
- [51] Training a Helpful and Harmless Assistant (Bai et al., 2022) — RLHF scaling

### 关键对手 (Key Competitors)
- [24] Generative Reward Models (Mahan et al., 2024) — GRM paradigm
- [27] RM-R1: Reward Modeling as Reasoning (Chen et al., 2025) — GRPO for reward models
- [23] Reward Reasoning Model (Guo et al., 2025) — Similar judge-GRPO approach
- [22] RMB: Benchmarking Reward Models (Zhou et al., 2025) — Reward model benchmarks

### 设计空间对比 (Design Space Comparison)
- [37] The AI Scientist (Lu et al., 2024) — Automated scientific discovery
- [11] The AI Scientist-V2 (Yamada et al., 2025) — Agentic tree search for science
- [21] RewardBench (Lambert et al., 2024) — Reward model evaluation
