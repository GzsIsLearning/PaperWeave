---
slug: "any-optical-model-a-universal-foundation-model-for-optical-remote-sensing"
title: "Any-Optical-Model: A Universal Foundation Model for Optical Remote Sensing"
authors:
  - "Xuyang Li"
  - "Chenyu Li"
  - "Danfeng Hong"
year: 2025
venue: "arXiv preprint"
tags: [remote-sensing, foundation-model, optical, multi-resolution, multi-spectral, SiTok, MAPE]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: false
code_url: ""
compute: "ViT-Base, 220 epochs, batch 1024"
dataset_access: public
---

> **Abstract:** AOM introduces a Spectrum-independent Tokenizer (SiTok) that processes each spectral band independently with channel index encoding, combined with Multi-scale Adaptive Patch Embedding (MAPE) using pseudo-inverse resize for resolution adaptation. Pretrained on 1.56M multi-source images via channel-wise masking & reconstruction + multi-scale semantic alignment. Achieves SOTA on Geo-Bench (+4.53 mIoU overall) and cross-sensor tasks.

## [2026-05-02] Review

**Score:** 4/5
- Contribution: 4/5 — SiTok (channel-wise tokenization with spectral-aware encoding) and MAPE (multi-scale convolutional bank + PI-resize) are novel architectural contributions that address two fundamental limitations of existing RSFMs: fixed spectral bands and fixed resolution. The combination of masked reconstruction with multi-scale semantic alignment (InfoNCE) is also novel.
- Soundness: 4/5 — Comprehensive evaluation on Geo-Bench (6 tasks), cross-sensor (SPARCS, HLS Burn Scars), and linear probing (UCM, BigEarthNet). Strong ablation on band missing scenarios and resolution variation. Some baselines (Scale-MAE, GFM) only evaluated on subset of tasks. Training details well-specified.
- Relevance: 4/5 — Directly addresses band heterogeneity and scale diversity in optical RS — core challenges for general-purpose RSFMs.

**Key Insights:**
- SiTok treats each spectral band independently with a shared convolutional kernel and channel index encoding, enabling arbitrary channel configurations (including missing bands) without retraining
- MAPE uses a multi-scale convolutional bank (kernels of sizes 16, 32, 64) with PI-resize to adapt to resolutions from sub-meter to 100m, solving the fixed-patch-size limitation of standard ViT
- The channel-wise masking task teaches per-band spectral signatures, while multi-scale semantic alignment (InfoNCE) ensures cross-scale representation consistency
- Massive improvement on Sentinel-2 tasks: +12.7 mIoU on cashew-plantation, +10.9 on SPARCS (Landsat-8) — demonstrating cross-sensor transfer is the key strength
- Pretraining on 1.56M samples from SSL4EO-S12 (S2), Activefire (L8), and high-res RGB (GeoPile, fMoW, OpenEarthMap) — covers 0.1m to 100m resolution

**Notes:**
- Authors from Southeast University (Danfeng Hong's group) and CAS AIRC
- Code not yet open-sourced
- Uses ViT-Base encoder with 4 decoder layers, masking ratio 75%
- Trains with cycling patch sizes {16, 24, 32, 48, 64} across 220 epochs
- Multi-scale alignment uses temperature 0.5, loss weights λ1=0.2 (MSE), λ2=0.8 (InfoNCE)
- Related works compared: DOFA (Xiong et al. 2024), AnySat (Astruc et al. 2025), SpectralGPT (Hong et al. 2024), CROMA, SatMAE, SenPaMAE, GFM
- Key limitation: only handles optical/multispectral — no SAR, no temporal modeling
