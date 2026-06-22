# Review: Dimension-Decomposed Learning for Quadrotor Geometric Attitude Control (Sliced Learning)

## Summary
Introduces Sliced Learning, a dimension-decomposed geometric learning framework for online disturbance identification in quadrotor SO(3) attitude control. Uses a learning-from-error strategy with Lie-algebraic error representation as input, enabling axis-wise space decomposition ("slicing") while preserving SO(3) structure. Develops a lightweight Sliced Adaptive-Neuro Mapping (SANM) module where high-dimensional mapping is decomposed into low-dimensional submappings implemented by shallow neural networks and adaptive laws, updated online via Lyapunov-based adaptation. Demonstrates operation at 400Hz on STM32 microcontrollers with real-world experiments.

## Key Contributions
- Learning-from-error paradigm instead of conventional learning-from-states
- Lie-algebraic error representation preserving SO(3) geometric structure
- Axis-wise dimension decomposition for lightweight online adaptation
- Lyapunov-based convergence guarantees despite time-varying disturbances
- Demonstration on resource-constrained MCU hardware at 400Hz

## Strengths
- Theoretically grounded with exponential convergence proofs
- Structurally interpretable design aligned with neuroscientific cognitive control
- Practical deployment on real embedded hardware (STM32)
- Real-world experimental validation
- Lightweight architecture suitable for resource-constrained aerial robots

## Weaknesses
- Specialized to quadrotor attitude control; limited generalizability
- Requires domain expertise in geometric control and Lie groups
- Relatively niche application domain
- Comparison to other learning-based control approaches could be more extensive

## Relevance
Significant for learning-based control and robotics. Demonstrates practical neural adaptation on embedded hardware. Bridges geometric control theory with online learning, relevant for safety-critical aerial systems.

## [2026-05-02] Reviewed

## [2026-05-25] Re-Review

**深度重读洞察：**
- **Learning-from-error 的几何基础被形式化证明**：本文的核心突破不仅在于"轴分解"，而在于证明了 Lie-algebraic error (so(3)→R³) 是维度分解的充分条件——这使得轴向独立子空间的假设不再是启发式，而是有严格几何保证的结构。so(3)≅R³ 的同构映射使得"切片"在切空间上自然对齐，这是之前几何控制+NN 方法（如 Bisheban & Lee 2021）所缺乏的理论精度。
- **神经科学启发是可被量化验证的**：作者引用了 MacDowell et al. (Nature Commun., 2025, 本文发表同年) 的小鼠皮层记录，其中的"multiplexed subspace routing" 与 SANM 的 "shared subspace" 设计高度吻合。这不仅是比喻：如果接受"神经系统通过结构化子空间组织适应性表征"，那么 SANM 的轴分解就是这种生物机制在控制系统中的工程实现。这一视角极大增强了论文的跨学科价值。
- **RBF 覆盖密度的 "sweet spot"** 是实验中的关键发现：Fig. 5 的 ablation 显示，过稀的 RBF（3 神经元）导致大增益和振荡，过密的 RBF（9 神经元）则全局化难以捕捉局部扰动特征。这揭示了轴分解 NN 中的结构-性能 trade-off，对轻量级遥感边缘模型的网络设计有直接指导意义。
- **与 π₀ 的路线对比极其鲜明**：π₀ (Physical Intelligence, 2024) 代表 "大数据+大模型" 的端到端路线（VLA Flow Model, 1B 参数，高端 GPU）；DDL/SANM 代表 "小数据+可证明" 的几何控制路线（浅层 RBF, 15 个 expf() 评估，STM32 MCU）。两者不是替代关系，而是互补：π₀ 适合通用技能学习，SANM 适合安全关键的姿态保持。这一对比应在 L2 robotics/control 中明确标注。
- **离散化实现的理论保证被忽视**：本文在 Proposition 3 中证明了离散时实现下的 ISpS（Input-to-State Practical Stability），这是实际 MCU 部署的关键理论保障，但很多读者可能只关注连续时间的 Lyapunov 证明。离散化分析在神经网络控制文献中罕见而宝贵。

**对遥感/时序的迁移价值（新增）：**
- 轴分解思想可直接迁移至遥感时序预测：多变量时序常被视为高维问题，但若变量具有物理可解释的轴向结构（如光谱波段、空间坐标），则可用 SANM 式的轴分解减少参数。例如，多光谱分类中每个波段独立处理，可用极轻量网络替代单一大型分类器。
- 在资源受限的遥感边缘设备（无人机、星载节点）上，Lyapunov 保证的在线适应比离线预训练更可靠。这与当前遥感领域对大模型的过度投资形成对照。

**Citation Mining：**
- `[NEW]` MacDowell et al., "Multiplexed subspaces route neural activity across brain-wide networks", Nature Commun., 2025 — SANM 的神经科学基础
- `[NEW]` Gao et al., "Robustness enhancement for multi-quadrotor centralized transportation via online tuning and learning", ACC 2025 — SANM 向多机协同的扩展
- `[NEW]` Gao et al., "Online identification using adaptive laws and neural networks for multi-quadrotor centralized transportation system", Eng. Sci., 2026 — 全状态 SANM 的实践
- `[NEW]` Reis & Silvestre, "Kinematics-informed neural network control on SO(3)", Automatica 2025 — 与本文最直接可比的 contemporaneous 工作
- `[NEW]` Wu et al., "$ℒ_1$ Quad", IEEE TCST 2025 — 本文主要对比基准，但无指数收敛保证
- `[NEW]` O'Connell et al., "Neural-Fly", Sci. Robot. 2022 — 强风下的神经自适应飞行，与本文风扰动实验对照

**跨 wiki 连接：**
- 关联 [[L2_lineage/robotics/control/cnn-based]] — 该 L2 已包含本文，建议新增"与 π₀ 的路线对比"小节，明确定位 DDL 为"小型可证明神经控制"范式
- 关联 [[L3_module/model-efficiency]] — SANM 是极端边缘部署效率的标杆案例（15个 expf 评估/400Hz/STM32/255KB RAM），可作为遥感边缘模型设计的对照基准
- 关联 [[L3_module/pretraining-paradigm]] — 本文的 "无需离线预训练" 范式与遥感 FM 的 "大规模离线预训练" 构成张力；在安全关键任务中，在线适应可能比离线预训练更实际
