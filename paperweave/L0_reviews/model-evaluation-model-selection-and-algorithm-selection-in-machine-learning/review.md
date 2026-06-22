---
slug: "model-evaluation-model-selection-and-algorithm-selection-in-machine-learning"
title: "Model Evaluation, Model Selection, and Algorithm Selection in Machine Learning"
authors:
  - "Sebastian Raschka"
score: 3
contribution: 3
soundness: 4
relevance: 3
---

> **Abstract:** Comprehensive review of model evaluation, model selection, and algorithm selection techniques. Covers holdout, bootstrap, k-fold CV, statistical tests (McNemar, 5x2cv F-test), nested CV. Recommendations for best practices.

## [2026-05-02] Wiki rebuild review

**Score:** 3/5
- Contribution: 3/5 — well-organized tutorial/survey of established techniques; limited novel contributions
- Soundness: 4/5 — thorough coverage with mathematical definitions and empirical illustrations
- Relevance: 3/5 — useful reference for ML practitioners, but a review/tutorial rather than research

**Key Insights:**
- Distinguishes three subtasks: generalization estimation, model selection (hyperparameter tuning), algorithm comparison
- Stratified sampling recommended for class imbalance
- Bootstrap .632 estimate addresses pessimistic bias of standard bootstrap
- k-fold CV with k=10 is empirically well-balanced for bias-variance tradeoff
- Nested cross-validation recommended for algorithm comparison with small datasets
- Combined 5x2cv F-test (Alpaydin) for comparing two algorithms

**Notes:** 2018. University of Wisconsin-Madison (Statistics). This is a review/tutorial article, not original research. Useful as reference material.
