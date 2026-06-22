---
slug: "ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-"
title: "RingMoE: Mixture-of-Modality-Experts Multi-Modal Foundation Models for Universal Remote Sensing Image Interpretation"
authors:
  - "Hanbo Bi"
  - "Yingchao Feng"
  - "Boyuan Tong"
  - "Mengyu Wang"
  - "Haichen Yu"
  - "Yongqiang Mao"
  - "Hao Chang"
  - "Wenhui Diao"
  - "Peijin Wang"
  - "Yue Yu"
  - "Hanyang Peng"
  - "Yehong Zhang"
  - "Kun Fu"
  - "Xian Sun"
year: 2025
venue: "arXiv (Tech Report, likely submitting to TPAMI/TGRS)"
tags: [remote-sensing, foundation-model, mixture-of-experts, multi-modal, self-supervised, sar, optical, multi-spectral]
score: 5
contribution: 5
soundness: 4
relevance: 5
open_source: partial
code_url: "https://github.com/HanboBizl/RingMoEDatasets (dataset subset only)"
compute: "512×Ascend 910 AI processors (MindSpore)"
dataset_access: private
---

> **Abstract:** Largest RS foundation model to date — 14.7B parameters. Pre-trained on 400M multi-modal RS images (Opt, MS, SAR-L1 complex-valued, SAR-L2 amplitude) from 9 satellites. Proposes hierarchical MoE with modal-specialized, collaborative, and shared experts. Physics-informed SSL for SAR-L1 (power conservation loss). Dynamic expert pruning from 14.7B to 1B. Evaluated on 25 benchmarks across 6 tasks, achieving 23 SOTAs.

## [2026-05-02] Review — Full-Text Reading

**Score:** 5/5
- Contribution: 5/5 — Several major innovations: (1) First application of MoE to RS foundation models with a clever three-tier expert design (modal-specialized + collaborative + shared) that directly addresses modality conflict; (2) Physics-informed SSL for complex-valued SAR data is genuinely novel — reconstructing power (not pixels) based on polarimetric conservation principle; (3) Dynamic expert pruning enabling 14.7B→1B compression with minimal loss; (4) First RSFM to handle all four major RS modalities (Opt, MS, SAR-L1, SAR-L2) in a unified framework. Largest RS model (14.7B) and dataset (400M) to date.
- Soundness: 4/5 — Extremely thorough evaluation (25 benchmarks, 6 tasks with extensive ablations). Expert ablation, scaling study, multi-modal pre-training benefit analysis are all well-designed. However: (1) Pre-training uses unpaired multi-modal data, limiting cross-modal SSL; (2) Dataset is predominantly from a few countries (US, China, Japan); (3) Full model only trained on MindSpore (Huawei framework) with Ascend 910 — difficult to reproduce; (4) Multi-modal fusion only validated on 2 benchmarks due to scarcity of geo-aligned data.
- Relevance: 5/5 — Essential reading for anyone working on RS foundation models. Sets new SoTA across nearly every RS benchmark. The MoE design pattern for multi-modal is directly applicable to future work.

**Key Insights:**
1. **Three-tier RMoE for modality conflict:** Standard MoE shares all experts across modalities, causing knowledge entanglement. RingMoE's innovation: Modal-specialized experts (per-modality, capture fine-grained intra-modal features), Collaborative experts (shared across modalities, model cross-modal correlations), Shared expert (common knowledge, reduces redundancy). Ablation shows each component contributes meaningfully.
2. **Physics-informed SAR-L1 reconstruction:** Instead of naive pixel reconstruction, RingMoE reconstructs total power (sum of squared amplitudes across HH/HV/VH/VV polarizations), grounded in polarimetric power conservation principle. This physically meaningful target improves SAR understanding, with ablation showing -5.67% mIoU without it on SAR-L1 segmentation.
3. **Expert pruning insights:** After pre-training, collaborative experts show modality-specific routing preferences — Opt/MS activate similar experts, SAR-L1/L2 activate similar (but different from Opt), revealing modality hierarchy. Pruning bottom 75% of inactive collaborative experts (4.3B) causes only 0.47% accuracy drop. Further compression to 1B via SVD-based knowledge compression maintains competitive performance.
4. **Scale matters in RS:** Swin-1B→14.7B scaling brings consistent gains across tasks. Even 1B dense variant (RingMoE-KC) outperforms pure 1B Swin baseline by large margins, validating MoE's parameter efficiency.
5. **Frozen backbone generalization:** RingMoE with frozen backbone + head-only fine-tuning achieves 95.82% on AID, 74.90% on DIOR, 67.39% on iSAID — far exceeding other RSFMs (which drop 20-30% under same setting). This demonstrates genuinely superior representation quality.

**Notes:**
- Pre-training: MindSpore on 512 Ascend 910 processors. Dataset 400M images (70% Opt, 20% MS, 10% SAR). Not reproducible with standard PyTorch infrastructure.
- Dataset RingMOSS: Public subset released at GitHub, but full dataset (including private sources) is not available. Regional bias toward US/China/Japan.
- Model compression: 14.7B → 6.5B (modality-specific sub-model) → 4.3B (expert pruning) → 1B (dense integration via SVD compression). All variants evaluated.
- PEFT with Convpass achieves near full-fine-tuning performance with only 7.5% trainable parameters.
- Outperforms MLLMs (MiniGPTv2, LLaVA-1.5, GeoChat, EarthGPT) by large margins on perception tasks, confirming that MLLM text-generation capabilities don't help RS visual understanding.
- Major limitation acknowledged: benefits of multi-modal fusion only verified on 2 benchmarks. Community needs more geo-aligned multi-modal datasets.
- RingMoE paper has ~1300 lines of full text with extensive appendices — very comprehensive.

**Citation Mining — Worth Reading:**
- SkySense (2024) — Multi-modal RS FM with 2B params. Direct competitor compared in experiments.
- Scale-MAE (2023) — Multi-scale MIM for RS. Key baseline.
- SpectralGPT (2024) — 3D spatial-spectral mask for spectral RS images.
- Billion-scale MAE (2023) — Parameter scaling study for RS MAE.
- CROMA (2024) — Cross-modal RS SSL combining contrastive + mask reconstruction.
- SARATR-X (2024) — SAR-specific foundation model.
- OFA-Net — MIM-based multi-modal learning without paired data.
- Mod-Squad (CVPR 2023) — MoE for multi-task learning, inspiring RingMoE's design.

## [2026-05-24] Re-review — Full-Text Deep Reading (1314 lines)

**New Findings from Full-Text:**

1. **RMoE层数学形式**：三个专家分支的加权组合（Eq.3）：$y_m = y_m^S + y_m^C + E^{Shared}(x_m)$。模态专家路由网络 $G_m^S$ 是模态独立的，协作专家路由 $G^C$ 是模态共享的。这种设计使路由器可以有效区分"模态特有知识"和"跨模态共有知识"。

2. **SAR-L1功率重建的物理意义**：全极化 SAR-L1 数据包含 HH/HV/VH/VV 四种极化模式的复数信号。RingMoE 不是重建像素值，而是重建总功率（$|I^{HH}|^2 + |I^{HV}|^2 + |I^{VH}|^2 + |I^{VV}|^2$），基于极化分解前后的功率守恒原理。消融实验显示：没有这个物理信息损失函数，SAR-L1分割mIoU下降5.67%。

3. **专家剪枝的具体机制**：协作专家的激活频率分析显示，Opt/MS 激活相似的协作专家，SAR-L1/L2 激活另一组相似的协作专家，揭示了一个模态层次结构。剪枝策略保留每个 RMoE 层中最活跃的前25%协作专家，其余75%被剪掉，从14.7B→4.3B仅损失0.47%精度。

4. **SVD知识压缩的秩选择**：对模态专家取 $K = d_2/N_S$，对协作专家取 $K = d_2/N_C$。这确保了压缩后的权重矩阵维度与原始FFN层一致（$d_1 \times d_2$），使RingMoE-KC可以无缝替代标准Swin Transformer的FFN层。

5. **冻结backbone的惊人泛化能力**：在仅冻结backbone + 仅训练分类头的设置下，RingMoE (6.5B) 在AID上达95.82%，DIOR上74.90%，iSAID上67.39%，远超其他RSFM（同设置下降20-30%）。这证明了其表示质量的真实优越性。

6. **多模态融合的真实收益**：在WHU-OPT-SAR（54.7 mIoU）和DFC23（73.4 mIoU）上取得SOTA。但论文自己承认：多模态融合的优势仅在这2个基准上验证，因为缺乏地理配准的多模态标注数据。这是领域当前的真实瓶颈。

7. **与MLLM的对比**：RingMoE在感知任务上大幅超越MiniGPTv2、LLaVA-1.5、GeoChat、EarthGPT等MLLM，证实了"MLLM的文本生成能力不帮助RS视觉理解"这一重要结论。

**Citation Mining — 新增推荐：**
- OFA-Net (2023) — 无配对多模态MIM学习，RingMoE的非配对预训练思路来源
- Mod-Squad (CVPR 2023) — MoE多任务学习中任务特定专家的设计直接启发了RingMoE的专家三元组
- DeepSeekMoE (2024) — 细粒度专家分割+共享专家隔离，RingMoE在相关工作中引用
- V-MoE (2022) — 首个CV MoE，15B参数，RingMoE的MoE架构参考

**Cross-wiki Connections:**
- [[L3_module/modality-fusion.md]] — RingMoE是MoE路由融合范式的核心代表（第5范式）
- [[L3_module/pretraining-paradigm.md]] — RingMoE的MoE MIM在五阶段演进中位于"高效范式"阶段
- [[L3_module/model-efficiency.md]] — 动态专家剪枝(14.7B→1B)是模型效率的典型案例
- [[L3_module/open-source-reproducibility.md]] — 仅数据集子集开源，训练框架MindSpore+昇腾不可复现
- [[L2_lineage/remote-sensing/representation-learning/mae-based.md]] — RingMoE在RS MAE演进的当前SOTA位置
- [[L2_lineage/remote-sensing/representation-learning/multi-modal-fm.md]] — RingMoE在动态路由范式的核心位置
- [[L0_raw/seamo-a-season-aware-multimodal-foundation-model-for-remote-sensing]] — 同时期RS多模态FM，可对比效率
- [[L0_raw/ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling]] — RingMo系列前身，MIM原版
- [[L0_raw/skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr]] — 直接竞争模型

**Score Assessment:** Score 5/5 确认。全文阅读验证了所有claims，尤其是SAR-L1功率重建的物理意义和专家剪枝的具体机制。作为当前RS FM的最大模型(14.7B)和23/25 SOTA的持有者，其工程价值和研究价值均极高。
