---
slug: "systematic-review-explainable-ai-spectroscopic-agricultural-quality"
title: "A Systematic Review of Explainable Artificial Intelligence for Spectroscopic Agricultural Quality Assessment"
authors:
  - "Md Toukir Ahmed"
  - "Md Wadud Ahmed"
  - "Mohammed Kamruzzaman"
year: 2025
venue: "Computers and Electronics in Agriculture, Volume 235, Article 110354"
doi: "10.1016/j.compag.2025.110354"
tags: [survey, xai, spectroscopy, agriculture, remote-sensing]
score: 4
contribution: 3
soundness: 4
relevance: 4
open_source: false
code_url: ""
---

> This review systematically examines recent advancements in XAI techniques and highlights their substantial effects on enhancing spectroscopic models for assessing the quality of agricultural and food products.

## Review

### What problem does it address?
Complex machine learning models have greatly improved the accuracy of spectroscopic analyses in agriculture, but users often struggle to understand how these models operate internally or how specific features contribute to predictions. This lack of clarity hinders innovation in agricultural spectroscopy, especially in:
- Selecting appropriate spectral wavelengths for domain-specific applications
- Designing portable and low-cost devices (need to know which wavelengths matter)
- Building trust for practical agricultural deployment

### Core contribution
A systematic review that comprehensively surveys XAI techniques (SHAP, LIME, feature importance methods, saliency maps, etc.) as applied to spectroscopic modeling for agricultural quality assessment. Published in Computers and Electronics in Agriculture (Elsevier, IF ~7.7), from the Kamruzzaman lab at UIUC — a well-established group in hyperspectral imaging for agricultural quality.

### Key Insights

1. **XAI as wavelength selector**: XAI techniques (especially SHAP) can identify which spectral bands are most informative for specific quality traits — enabling portable spectrometer design by eliminating redundant wavelengths.

2. **Spectroscopic interpretability gap**: While deep learning achieves high accuracy on spectral data (NIR, hyperspectral), the lack of interpretability has been a major barrier to real-world agricultural adoption — farmers and food inspectors need to trust the predictions.

3. **Domain-specific XAI needs**: Agricultural spectroscopy has unique requirements compared to computer vision XAI — spectral features have physical meaning (chemical bonds, water content), and explanations must align with domain knowledge.

4. **Model-agnostic methods dominate**: SHAP and LIME are the most commonly applied XAI methods in agricultural spectroscopy due to their model-agnostic nature and compatibility with diverse ML pipelines (CNN, PLS, SVM, Random Forest).

5. **Integration with variable selection**: XAI goes beyond post-hoc explanation — it can actively guide variable selection and dimensionality reduction, directly improving model efficiency and deployability.

6. **Current challenges**: (a) Computational cost of XAI for large spectral datasets, (b) lack of standardized metrics for evaluating explanation quality, (c) need for domain-expert validation of explanations.

7. **Relevance to RS work**: The user's BioGFM project uses SAR + Optical fusion for crop trait prediction — the same XAI techniques could reveal which temporal steps and which spectral/spatial features drive predictions for each task (yield vs VWC vs height), potentially reducing encoder homogeneity issues.

### Code Review
No code repository. This is a survey paper — no implementation or benchmark code. The paper synthesizes findings from multiple studies.

### Citation Mining

**直接谱系 (Direct lineage):**
- Ahmed, Monjur, Khaliduzzaman, Kamruzzaman. "A comprehensive review of deep learning-based hyperspectral image reconstruction for agri-food quality appraisal." Artificial Intelligence Review, 2025 (54 cites)

**范式基础 (Foundational):**
- Ullah, Khan, De Falco, Sannino. "Explainable Artificial Intelligence: Importance, Use Domains, Stages, Output Shapes, and Challenges." ACM Computing Surveys, 2024 (48 cites)

**关键对手 (Key competitors):**
- Chuquimarca Jimenez, Vintimilla, Velastin. "A review of external quality inspection for fruit grading using CNN models." Artificial Intelligence in Agriculture, 2024 (41 cites)

**设计空间对比 (Design space):**
- Contreras et al. "Explainable artificial intelligence for spectroscopy data: a review." PubMed, 2025 (71 cites)
