---
title: Model Evaluation and Selection
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: general
task: methodology
approach: model-evaluation
tags: [methodology, evaluation, model-selection, cross-validation, statistics]
sources:
  - L0_raw/model-evaluation-model-selection-and-algorithm-selection-in-machine-learning
zotero_keys: []
confidence: medium
---

# Model Evaluation and Selection

## Overview

模型评估、选择和算法比较的方法论综述。Raschka (2018) 系统梳理了从基础 holdout 到高级统计检验的全套技术。核心贡献在于清晰区分三个常被混淆的任务：泛化能力估计、模型选择（超参数调优）、算法比较。

## Papers

| Paper | Year | Score | Contribution | Notes |
|-------|------|-------|-------------|-------|
| Raschka | 2018 | 3 | Comprehensive survey of evaluation methodology | Review/tutorial, not original research |

## Key Concepts

### 三项任务的区分

```
泛化估计 ──→ "这个模型在新数据上表现如何？"
模型选择 ──→ "哪个超参数组合最好？"  (k-fold CV)
算法比较 ──→ "算法 A 是否优于算法 B？" (统计检验)
```

常见错误：用 k-fold CV 既做模型选择又做泛化估计 → 乐观偏差。

### 重采样方法

| 方法 | Bias | Variance | 适用场景 |
|------|------|----------|---------|
| Holdout | 高 (依赖划分) | 高 | 大数据集快速评估 |
| k-fold CV (k=10) | 中 | 低 | 最佳 bias-variance 平衡 |
| Leave-One-Out | 最低 | 最高 | 极小数据集 |
| Bootstrap .632 | 中 | 中 | 小数据集，修正悲观偏差 |
| Repeated k-fold | 低 | 低 | 需要置信区间时 |

### Bootstrap .632 Estimate

标准 bootstrap 的悲观偏差修正：
- 标准 bootstrap: 每个 bootstrap 样本约含 63.2% 原始数据，其余为 test
- .632 estimate = 0.368 × train_acc + 0.632 × test_acc
- 修正后的估计更接近真实泛化误差

## Best Practices

### 模型选择 (Hyperparameter Tuning)

1. **k-fold CV with k=10**: 经验上的最佳 bias-variance 平衡点
2. **Stratified sampling**: 类别不平衡时保持每折的类别分布
3. **Nested CV**: 外层评估泛化、内层选择超参数 —— 小数据集下推荐
4. **避免双重使用测试集**: 测试集只能用于最终评估

### 算法比较

| 检验 | 适用场景 | 特点 |
|------|---------|------|
| McNemar's test | 二分类两个算法比较 | 简单，基于 paired 错误计数 |
| 5×2cv paired t-test | 两个算法比较 | 5 次重复 2-fold CV |
| Combined 5×2cv F-test (Alpaydin) | 两个算法比较 | 推荐，控制 Type I error |
| Friedman test + Nemenyi post-hoc | 多算法比较 | 非参数 rank-based |

### Nested Cross-Validation

```
Outer loop (k folds): 评估泛化性能
    └─ Inner loop (k folds): 选择最优超参数
        └─ Train with best params on full inner data
            └─ Evaluate on outer test fold
```

关键优势：inner CV 和 outer CV 的数据完全隔离，避免乐观偏差。

## Common Pitfalls

1. **用同一 CV 同时选择模型和估计性能**: 导致严重的乐观偏差
2. **在测试集上做模型选择后报告测试集性能**: 测试集变成了验证集
3. **不报告方差/置信区间**: 仅报告均值无法判断差异的统计显著性
4. **数据泄露**: 预处理（标准化、特征选择）在划分前应用到整个数据集
5. **不充分的统计检验**: 多次成对 t-test 不校正 → inflated Type I error

## Relevance

这是一篇综述/教程，不是原创研究。但对于 ML 实践者，它是方法论工具箱的重要参考。在评估遥感模型和比较算法时，文中的 nested CV、统计检验方法直接适用。
