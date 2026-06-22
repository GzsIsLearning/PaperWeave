---
slug: "change-aware-sampling-and-contrastive-learning-for-satellite-images"
title: "Change-Aware Sampling and Contrastive Learning for Satellite Images (CACo)"
authors:
  - "Utkarsh Mall"
  - "Bharath Hariharan"
  - "Kavita Bala"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "Implied open-source"
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** Change-Aware Contrastive (CACo) loss for self-supervised learning on satellite images. Uses temporal structure: invariant to seasonal (short-term) changes but sensitive to permanent (long-term) changes. Improved geographical sampling (focus on urban areas, exclude oceans). 6.5% relative improvement on segmentation, 8.5% on change detection.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/4 — Novel CACo loss leveraging temporal structure of satellite imagery; change-aware sampling strategy
- Soundness: 4/4 — Comprehensive evaluation on classification, segmentation, change detection
- Relevance: 4/4 — Relevant to RS self-supervised learning, contrastive learning

**Key Insights:**
1. CACo loss: compares long-term and short-term feature differences to robustly estimate change; encourages invariance to no-change locations but sensitivity to permanent changes.
2. Improved geographical sampling: focus on land areas near cities, exclude oceans for more informative pre-training data.
3. Leverages unique spatio-temporal structure of satellite imagery (multiple revisits over time).
4. 6.5% relative improvement on semantic segmentation, 8.5% on change detection over best baselines.
5. Addresses false negative issue in contrastive learning: two images of same location with permanent change should be pushed apart.

**Notes:**
- CVPR 2023, Cornell University.
- Used as baseline/reference by SkySense paper.
- Open-source code implied.
- Foundational work for temporal contrastive learning in RS.

## [2026-05-02] Re-review — Deep Analysis

**Score confirmed: 4/5** | Contribution: 4, Soundness: 4, Relevance: 4

**Critical findings not in previous review:**

1. **Bootstrapping is the key innovation.** The chicken-and-egg problem (need features to detect change, need change labels to train features) is solved via iterative bootstrapping: start with random weights, estimate change via ratio (Eq. 3), train with conditional loss, repeat. Ratio normalization (long-term diff / short-term diff) is critical — raw absolute distances don't work across different location types (urban vs forest seasonal variation scales differ).
2. **GMM for change/no-change separation.** A Gaussian Mixture Model on the EMA-smoothed ratio r_{l_i}^k separates locations into change vs no-change clusters. This is elegant: no threshold tuning needed, adapts automatically as training progresses.
3. **Ablation reveals importance of each component.** Improved sampling (+1.37% EuroSat), long-term contrast (+1.14%), change-awareness (+0.52%). Long-term contrast has huge impact on DynamicEarthNet segmentation (+2.44 mIoU vs SeCo) — pixel-level tasks benefit most.
4. **10× data efficiency.** CACo with 100k images matches or exceeds SeCo with 1M images on EuroSat (93.08 vs 93.99). This is a practical win — less data collection, less training time.
5. **Limited to RGB from Sentinel-2.** Only uses 3 RGB bands despite Sentinel-2 having 13 bands. Spectral bands (NIR, SWIR, red-edge) are known to improve vegetation/change analysis — CACo doesn't leverage this.
6. **ResNet backbone only. No ViT/Transformer experiments.** Unlike concurrent works (SatMAE, Scale-MAE) that use ViT, CACo only evaluates on ResNet-18/50. Unknown if the temporal contrastive insights transfer to ViT-based architectures.
7. **OSCD change detection dataset limitations.** Only 24 image pairs (14 train, 10 test) — very small dataset. Results may not generalize. F1 scores are modest (ResNet-50: 52.11) — room for improvement.
8. **Ratio estimate sensitive to seasonal alignment.** Ablation (Table 8) shows "Align" (seasonally aligned long-term pairs) gives 92.92 vs CACo's 93.08 — very close. The EMA smoothing only adds ~1 point over raw R_{l_i}^k (91.98 → 93.08). The true gain is from the ratio formulation itself vs raw distance (91.17 → 93.08).

**Cross-wiki connections:**
- Foundational work in [[L2_lineage/remote-sensing/pre-training/contrastive-based]] — CACo extends SeCo's seasonal invariance paradigm with long-term change sensitivity. Key design axis: temporal span of contrastive sampling.
- Connects to [[L3_module/data-scarcity]] — demonstrates that carefully designed self-supervision can achieve 10× data efficiency.
- Change detection approach relevant to [[L2_lineage/remote-sensing/change-detection/foundation-model-based]] — CACo's frozen features + learned decoder is a common CD pipeline.
