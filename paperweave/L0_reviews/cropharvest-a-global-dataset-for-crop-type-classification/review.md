# Review: CropHarvest - A Global Dataset for Crop Type Classification

## Summary
CropHarvest presents a harmonized global satellite dataset of over 90,000 geographically-diverse samples with agricultural class labels, assembled from 20 distinct datasets. The dataset pairs geo-referenced labels with satellite data inputs from four products: Sentinel-2 (multispectral optical), Sentinel-1 (SAR), ERA5 (meteorological), and SRTM (topographic). Three benchmark tasks (Kenya maize vs rest, Brazil coffee vs rest, Togo crop vs non-crop) evaluate model performance across diverse agroecologies. A Python package with torchvision-style API simplifies access.

## Key Contributions
- First large-scale harmonized crop classification dataset combining 20 sources across multiple continents
- Four complementary satellite data modalities provided per label point
- Three geographically and semantically diverse benchmark tasks
- ML-friendly Python package (cropharvest) with extensible design
- Multiple model baselines: Random Forest, Random-init LSTM, Pre-trained LSTM, MAML

## Strengths
- Addresses critical geographic and semantic label imbalance in remote sensing
- Enables fairness evaluation across geographies
- Open-source code and data with clear licensing
- Extensible design for community contributions
- Comprehensive satellite data processing pipeline documented

## Weaknesses
- Labels are not globally harmonized (original class labels preserved, which limits interoperability)
- Only 73% of collected labels have complete satellite coverage
- Limited to post-2016 labels due to Sentinel-2 availability
- Binary labels for many samples; only 34.2% have granular agricultural class labels
- Single-pixel extraction from polygons may lose spatial context

## Relevance
Highly relevant for ML researchers working on geospatial applications, domain adaptation, imbalanced learning, and meta-learning. Valuable for food security and climate change applications.

## [2026-05-02] Reviewed
