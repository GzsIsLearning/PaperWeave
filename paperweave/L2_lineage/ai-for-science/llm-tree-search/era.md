# ERA: Empirical Research Assistance

**Slug:** an-ai-system-to-help-scientists-write-expert-level-empirical-software
**Type:** Method
**Domain:** AI-for-Science
**Sub-topic:** LLM + Tree Search for Code Generation
**Tags:** LLM, tree-search, code-generation, scientific-discovery

## One-Liner
ERA combines a Large Language Model with a Flat UCB Tree Search (FUTS) to automatically discover expert-level scientific software across diverse domains.

## Summary
ERA uses an LLM to rewrite code solutions, guided by tree search (PUCT algorithm) to decide which code candidates to explore further. The system achieves expert-level results across bioinformatics, epidemiology, time-series forecasting, geospatial segmentation, neuroscience, and numerical analysis — discovering 40 novel single-cell methods, 14 COVID forecasting models beating the CDC ensemble, and achieving SOTA on multiple benchmarks.

## Key Results
| Benchmark | Metric | ERA | Previous SOTA | Improvement |
|-----------|--------|-----|---------------|-------------|
| OpenProblems scRNA-seq (batch integration) | Overall Score | BBKNN(TS): 14% better | ComBat | 14% |
| CDC CovidHub (COVID forecasting) | WIS | 26 (best) | 29 (CovidHub Ens) | 10% |
| GIFT-Eval (time series) | MASE | 0.671 (per-dataset) | All SOTA methods | 1st place |
| DLRSD (geospatial segmentation) | mIoU | >0.80 | 0.762 | >5% |

## Connections
- Builds on: FunSearch (Nature 2024) — LLM + evolutionary search pioneer
- Compared with: AIDE (arXiv 2025) — iterative LLM refinement without tree search
- Compareable to: AlphaEvolve (arXiv 2025) — LLM evolutionary coding agent
- Extended by: ERA applications in theoretical physics (arXiv:2603.04735)

## References
- [arXiv:2509.06503](https://arxiv.org/abs/2509.06503)
- [Code: google-research/era](https://github.com/google-research/era)
