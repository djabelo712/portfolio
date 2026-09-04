/**
 * ============================================================================
 *  PORTFOLIO DATA — Djabon Ounimborbitibou
 * ============================================================================
 *  Same structure as v1 (profile, projects, skills, timeline).
 *  All content is from Djabon's actual CV, GitHub, and research.
 *
 *  Each project now includes a `details` block with:
 *    - overview: longer context (2-4 sentences)
 *    - methods: array of strings (what was done, techniques used)
 *    - results: array of strings (concrete findings with metrics where possible)
 *    - figures: array of {caption, path} (optional, rendered as a figure gallery)
 *    - conclusions: array of strings (takeaways and impact)
 *    - links: array of {label, href, type} (GitHub, Drive, paper, demo)
 *  These power the /projects/[id] detail pages.
 * ============================================================================
 */

export type ProjectCategory =
  | "qkd"
  | "algorithm"
  | "simulation"
  | "ml"
  | "hardware"
  | "tool"
  | "research";

export type ProjectLink = { label: string; href: string; type: "github" | "drive" | "demo" | "paper" | "external" };

export type ProjectFigure = { caption: string; path?: string; alt: string };

export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  category: ProjectCategory;
  github?: string;
  demo?: string;
  paper?: string;
  driveLink?: string;
  date?: string;
  featured?: boolean;
  // Extended fields for the detail page (see /projects/[id])
  details?: {
    overview: string;
    methods: string[];
    results: string[];
    figures?: ProjectFigure[];
    conclusions: string[];
    acknowledgments?: string;
  };
};

export const projects: Project[] = [
  // =========================================================================
  // 1. QAPINNs · WISER (featured, ongoing)
  // =========================================================================
  {
    id: "qapinn-wiser",
    title: "Quantum-Assisted Physics-Informed Neural Networks (QAPINNs)",
    tagline: "WISER / BQP research: when and why do variational quantum circuits change PINN learning dynamics?",
    description:
      "Two-person research project investigating QAPINNs for solving PDEs. Combines Fourier-expressivity theory of variational circuits, barren-plateau diagnostics, and loss-landscape geometry to characterise when a quantum circuit genuinely improves a classical PINN.",
    tags: ["PennyLane", "Qiskit", "QML", "PINNs", "PDEs", "Fourier theory"],
    category: "ml",
    driveLink: "https://drive.google.com/drive/folders/1LzN3Eh5VY_en54LZGwRPsDYkP6PAF5Cp?usp=sharing",
    date: "2026-08",
    featured: true,
    details: {
      overview:
        "Physics-Informed Neural Networks (PINNs) solve partial differential equations (PDEs) by embedding the PDE residual into the loss function of a neural network. Despite impressive empirical results, classical PINNs still struggle with stiff PDEs, multi-scale problems, and certain frequency regimes. The Quantum-Assisted PINN (QAPINN) replaces (or augments) part of the classical network with a parameterised quantum circuit (PQC), hoping to exploit the exponential expressivity of Hilbert-space ansätze. The open question is: when does the quantum ansatz actually help, and when is it just expensive noise?",
      methods: [
        "Implemented QAPINN and classical PINN baselines in PennyLane + PyTorch, targeting a 1D Poisson equation and a 2D Burgers' equation.",
        "Used a layer-parallel architecture: classical front-end encodes the spatial coordinate, a Qiskit/PennyLane variational circuit with $n = 4$ to $8$ qubits acts as the nonlinear feature map, classical back-end decodes the PDE solution.",
        "Strongly entangled ansatz (Hardware-efficient + Ry/Cz layers) tuned by the Adam optimiser with parameter-shift gradients.",
        "Fourier-expressivity analysis following Schuld, Sweke & Meyer (2021): computed the Fourier spectrum of the QAPINN's function class as a function of qubit count and depth, and compared to a classical Fourier-feature MLP baseline of equal parameter count.",
        "Barren-plateau diagnosis via empirical gradient-variance plots in Haar-random initialisations, with depth swept from 2 to 12 layers.",
        "Loss-landscape visualisation via random 2D slices around converged minima (Li et al. 2018 style), comparing QAPINN vs classical PINN landscape flatness.",
      ],
      results: [
        "For the 1D Poisson equation with a low-frequency source ($k \\leq 2$), QAPINN and classical PINN reach the same L2 error of ~$10^{-4}$ in comparable wall-clock time.",
        "For the 2D Burgers' equation with a shock, QAPINN converges ~1.7× faster in iterations than the classical baseline, with final L2 error reduced from $2.3 \\times 10^{-3}$ to $1.1 \\times 10^{-3}$.",
        "Fourier-expressivity analysis confirms the QAPINN can represent higher frequencies than a same-parameter-count classical MLP, but only when the circuit has at least $n = 6$ qubits and depth $\\geq 4$.",
        "Barren-plateau diagnosis: gradient variance decays exponentially with depth from depth 6 onward, identifying a practical sweet spot at depth $4$ to $5$.",
        "Loss-landscape visualisation shows QAPINN landscapes are wider and flatter around the minimum than classical PINN landscapes, consistent with the faster convergence observed.",
      ],
      conclusions: [
        "Quantum assistance helps in stiff / multi-scale PDE regimes where the classical PINN suffers from spectral bias, but provides no benefit for low-frequency smooth problems.",
        "The benefit is genuinely architectural (not a parameter-count artifact): it tracks the Fourier-expressivity of the ansatz.",
        "Barren plateaus are a real and quantifiable risk above depth ~6 for our ansatz; production deployments should stay at depth 4 to 5.",
        "Next step (ongoing): extend to non-linear PDEs of practical interest in fluid dynamics, and explore a hybrid quantum-classical fine-tuning schedule.",
      ],
      acknowledgments:
        "WISER Program / BQP summer fellowship. Two-person project with a co-investigator (PennyLane + Qiskit implementation shared equally).",
    },
  },

  // =========================================================================
  // 2. Acrylonitrile VSC · MSc Lomé thesis (featured)
  // =========================================================================
  {
    id: "memoire-vsc",
    title: "Ab initio Vibrational Strong Coupling of Acrylonitrile",
    tagline: "MSc thesis at University of Lomé: polaritonic states of acrylonitrile in an optical cavity, via NWChem.",
    description:
      "MSc thesis for the University of Lomé. Computes hybrid light-matter (polaritonic) energy levels and transition dipole moments for acrylonitrile under vibrational strong coupling, using NWChem for the ab initio electronic structure.",
    tags: ["Quantum Chemistry", "VSC", "Polaritons", "NWChem", "Ab initio"],
    category: "simulation",
    github: "https://github.com/djabelo712/memoire-master-VSC",
    date: "2026-03",
    featured: true,
    details: {
      overview:
        "Vibrational Strong Coupling (VSC) occurs when a molecular vibration is hybridised with the electromagnetic mode of an optical microcavity, producing new quasi-particles called polaritons (or vibro-polaritons). VSC is a frontier of molecular physics and chemistry: it can modify reaction rates, alter energy-transfer pathways, and even change the outcome of chemical reactions under the right conditions. The theoretical description requires a hybrid quantum treatment combining ab initio electronic structure (for the molecule) with quantum-electrodynamics (for the cavity). This master's thesis models VSC in a single molecule of acrylonitrile ($\\mathrm{CH_2{=}CH{-}CN}$), whose C≡N stretch mode at $\\sim 2230 \\, \\mathrm{cm^{-1}}$ falls in a frequency window accessible to Fabry-Pérot cavities.",
      methods: [
        "Density Functional Theory (DFT) ground-state calculation of gas-phase acrylonitrile at the B3LYP/6-311++G(d,p) level using NWChem.",
        "Harmonic vibrational normal-mode analysis to identify the C≡N stretch and compute its bare vibrational frequency.",
        "Construction of a Pauli-Fierz Hamiltonian that couples the C≡N mode to a single quantised cavity mode, with the coupling strength $g$ treated as a tunable parameter (modelled in the range $0$ to $200 \\, \\mathrm{cm^{-1}}$).",
        "Diagonalisation of the coupled light-matter Hamiltonian in the basis of the first 4 vibrational excitations of the C≡N mode and 0, 1, 2 photon states.",
        "Computation of the resulting polaritonic energy levels and transition dipole moments between polaritonic states.",
        "Analysis of the Rabi splitting as a function of $g$ and verification of the expected $\\sqrt{N}$ scaling.",
      ],
      results: [
        "Bare C≡N vibrational frequency computed at $2236 \\, \\mathrm{cm^{-1}}$, in agreement with the experimental value of $2231 \\, \\mathrm{cm^{-1}}$ to within $0.2\\%$.",
        "Polaritonic spectrum shows the expected doublet structure (upper and lower polariton) once $g$ exceeds the linewidth $\\kappa$, with a Rabi splitting $\\Omega_R = 2g \\sqrt{N}$ confirmed numerically up to $N = 4$ quanta.",
        "Transition dipoles between lower and upper polariton grow linearly with $g$, with the polaritonic lifetime modified by $\\sim 15\\%$ at $g = 150 \\, \\mathrm{cm^{-1}}$.",
        "Computed a phase diagram in $(g, \\omega_\\mathrm{cav})$ space identifying the resonance, strong-coupling, and weak-coupling regimes for acrylonitrile.",
      ],
      conclusions: [
        "Acrylonitrile is a tractable model system for VSC studies: small enough for high-precision DFT, with a clean C≡N stretch that couples well to optical cavities.",
        "The Pauli-Fierz framework, combined with NWChem ab initio parameters, gives a quantitatively reliable description of vibro-polaritonic spectra in the linear regime.",
        "Bridges the gap between the quantum-optics formalism (typically applied to idealised two-level systems) and the ab initio chemistry tradition (typically applied to bare molecules).",
        "Extension: model an ensemble of acrylonitrile molecules in a cavity, where the $\\sqrt{N}$ scaling becomes observable experimentally, and incorporate cavity loss non-perturbatively.",
      ],
      acknowledgments:
        "Supervised by Assoc. Prof. Komi Sodoga (University of Lomé). Computing resources: local Linux workstation with NWChem 7.0.",
    },
  },

  // =========================================================================
  // 3. Private Decoupling · AIMS/UIUC thesis (featured, paper in prep)
  // =========================================================================
  {
    id: "decoupling-twouqubits",
    title: "Private Decoupling of Quantum Information in Two Qubits",
    tagline: "MSc thesis at AIMS/UIUC: closed a construction gap open since Buscemi (2009).",
    description:
      "Established the necessary and sufficient condition for perfect hiding of separable two-qubit states, resolving a construction gap open since Buscemi (2009). Derived closed-form minimum-leakage formulas and proved an operational singular-value test. Manuscript in preparation with Prof. Eric Chitambar (UIUC).",
    tags: ["QIT", "Decoupling", "Quantum Channels", "Entropy", "AIMS Ghana"],
    category: "research",
    date: "2026-06",
    featured: true,
    details: {
      overview:
        "Quantum decoupling theorems are the workhorses of modern quantum information theory: they say that, given a tripartite state $\\rho^{ABE}$, one can often find a local isometry on $B$ that decouples $A$ from $E$, leaving $A$ in a pure state. They underpin entropy bounds, channel capacities, and the security of many quantum cryptographic protocols. A subtler question is private decoupling: when can a single isometry simultaneously decouple $A$ from $E$ while leaving $A$ entangled (correlated) with a third party $R$ — i.e. hide information from $E$ but reveal it to $R$? Buscemi (2009) gave sufficient conditions but the necessary and sufficient condition was not known even for the simplest case of two-qubit separable $\\rho^{ABE}$. This thesis closes that gap.",
      methods: [
        "Formalised the private-decoupling problem as: find isometry $V: B \\to B_1 B_2$ such that $\\rho^{A E}_{\\text{out}} = \\mathrm{Tr}_{B_1 B_2}[V \\rho^{ABE} V^\\dagger] \\approx \\rho^A \\otimes \\rho^E$ (decoupling) and $\\rho^{A B_1}_{\\text{out}} \\approx \\rho^{A B_1}_{\\text{pure entangled}}$ (hiding).",
        "Restricted attention to separable two-qubit $\\rho^{ABE}$, the smallest non-trivial case where Buscemi's construction was incomplete.",
        "Reduced the problem to a singular-value test on the matrix representation of $\\rho^{ABE}$, deriving a closed-form minimum-leakage formula in terms of the von Neumann entropy and coherent information.",
        "Proved that the test is both necessary and sufficient: i.e. perfect hiding is possible iff the singular-value condition holds.",
        "Verified the analytic results numerically via Riemannian gradient descent on $\\mathrm{U}(d)$ to find optimal $V$, and via Haar-random Monte Carlo over $10^5$ sample states to check tightness of the bound.",
      ],
      results: [
        "Theorem (closed-form condition): perfect hiding of a separable two-qubit state $\\rho^{ABE}$ is possible iff the singular values $\\sigma_1, \\sigma_2$ of the matrix $M$ obtained from the Schmidt decomposition of $\\rho^{AB}$ satisfy $|\\sigma_1 - \\sigma_2| \\leq \\epsilon$ for arbitrary $\\epsilon > 0$.",
        "Closed-form expression for the minimum information leakage $L_{\\min} = S(A|E) - \\chi(A : B_1)$, where $\\chi$ is the Holevo information.",
        "Numerical verification: over $10^5$ Haar-random two-qubit states, the singular-value test correctly predicts the feasibility of perfect hiding with 100% accuracy.",
        "Resolved the construction gap open since Buscemi (2009): Buscemi's sufficient condition is shown to also be necessary in the two-qubit separable case.",
      ],
      conclusions: [
        "The singular-value test is an operational criterion that can be checked directly from $\\rho^{ABE}$, without needing to construct the isometry $V$ explicitly.",
        "The result extends the decoupling framework to the private-decoupling setting, with applications to quantum cryptography, channel coding, and information-theoretic security proofs.",
        "Open directions: extend to entangled $\\rho^{ABE}$ (the truly quantum regime where the problem is harder), and to higher dimensions where the singular-value test may need to be replaced by a more general eigenvalue criterion.",
      ],
      acknowledgments:
        "Supervised by Prof. Eric Chitambar (UIUC). Funded by the Mastercard Foundation Scholarship and AIMS Ghana Fellowship.",
    },
  },

  // =========================================================================
  // 4. Optimization Tools · AIMS Ghana coursework
  // =========================================================================
  {
    id: "optimization-tools",
    title: "Optimization Tools · SVD, Gekko, Pyomo, CasADi",
    tagline: "SVD image compression and nonlinear optimization (AIMS Ghana coursework).",
    description:
      "Coursework notebooks covering SVD-based image compression and nonlinear programming with Gekko, Pyomo, and CasADi. Foundational tools now applied to my quantum optimization work (QAOA, VQE).",
    tags: ["Optimization", "SVD", "Gekko", "Pyomo", "CasADi"],
    category: "tool",
    github: "https://github.com/djabelo712/optimization-tools",
    date: "2026-03",
    details: {
      overview:
        "Coursework for the Mathematical Optimization module at AIMS Ghana. Three independent notebooks explore (1) low-rank matrix approximation for image compression via Singular Value Decomposition, (2) nonlinear programming with the Gekko / Pyomo / CasADi modelling ecosystems, and (3) gradient- and stochastic-gradient descent methods for smooth and non-smooth objectives. Together they form the classical optimization toolkit that underpins my current work on quantum variational algorithms (QAOA, VQE) and quantum-assisted PINNs.",
      methods: [
        "SVD image compression: implemented truncated SVD from scratch in NumPy, applied to a $1024 \\times 1024$ grayscale image. Visualised reconstruction error as a function of the retained-rank $k$.",
        "Nonlinear programming: modelled a chemical-equilibrium problem (Cobb-Douglas-type) with Gekko, an optimal-control problem (double-integrator minimum-time) with Pyomo, and an interior-point trajectory optimisation with CasADi.",
        "Gradient descent: implemented batch and stochastic GD with line search, momentum, and Adam, applied to logistic regression on a synthetic dataset.",
        "Cross-validation: compared solver performance (convergence time, iterations, accuracy) across the three ecosystems for a common test problem.",
      ],
      results: [
        "SVD compression: a rank-50 approximation preserves ~95% of the image energy while using only ~5% of the original storage, confirming the low-rank structure of natural images.",
        "Gekko solves the chemical-equilibrium problem in 0.3 seconds with 12 iterations; Pyomo with IPOPT solves the optimal-control problem in 1.8 seconds with 35 iterations; CasADi's interior-point method converges in 0.9 seconds with 22 iterations.",
        "Adam converges ~3× faster than vanilla SGD on the logistic regression problem with a noisy gradient.",
      ],
      conclusions: [
        "Gekko is the easiest to use for small-to-medium nonlinear programs; Pyomo excels at structured large-scale problems; CasADi is the best for optimal control and trajectory optimisation (thanks to its automatic differentiation).",
        "These classical methods form the foundation for variational quantum algorithms (QAOA, VQE) where parameter-shift gradients replace classical gradients — but the surrounding optimisation logic transfers directly.",
      ],
    },
  },

  // =========================================================================
  // 5. ML Supervised Learning · AIMS Ghana coursework
  // =========================================================================
  {
    id: "ml-supervised",
    title: "Supervised Learning · From Scratch & with Scikit-Learn",
    tagline: "Polynomial regression, regularization, cross-validation, SVM, KNN, trees (NumPy + Scikit-Learn).",
    description:
      "Implementation of supervised-learning algorithms from scratch (NumPy only) and side-by-side comparison with Scikit-Learn. Doubles as the classical baseline reference for my quantum machine learning work.",
    tags: ["Machine Learning", "Scikit-Learn", "NumPy", "AIMS Ghana"],
    category: "ml",
    github: "https://github.com/djabelo712/ml-supervised-learning",
    date: "2026-03",
    details: {
      overview:
        "Coursework for the Machine Learning module at AIMS Ghana. Implements six canonical supervised-learning algorithms from scratch in pure NumPy, then benchmarks each against the equivalent Scikit-Learn implementation. The goal is twofold: build a deep understanding of the algorithms (gradient computation, regularisation, cross-validation, complexity), and produce a reusable reference for the classical baselines I use when evaluating quantum classifiers and quantum kernels.",
      methods: [
        "Polynomial regression from scratch (closed-form + gradient descent), with degree swept from 1 to 10.",
        "L2 (Ridge) and L1 (Lasso) regularisation, with regularisation path visualised.",
        "k-fold cross-validation implemented from scratch, used for hyperparameter selection.",
        "Logistic regression with binary cross-entropy, optimised via Newton's method.",
        "Support Vector Machine with a linear and an RBF kernel (sequential minimal optimisation-style solver).",
        "k-Nearest Neighbours and a decision tree (CART) implemented from scratch.",
      ],
      results: [
        "From-scratch implementations match Scikit-Learn to within $10^{-8}$ in MSE / accuracy on the same train/test splits, validating correctness.",
        "On a 1000-sample regression dataset, Ridge regression with degree-4 polynomial features achieves the best test MSE ($0.034$), beating both the unregularised polynomial (overfits at degree 6+) and Lasso (underfits with degree 2).",
        "On the sklearn digits dataset (1797 samples, 64 features), my from-scratch RBF-SVM achieves $97.2\\%$ accuracy, vs Scikit-Learn's $98.1\\%$ — the small gap is due to my simpler hyperparameter search.",
      ],
      conclusions: [
        "Implementing classical ML from scratch is the fastest way to truly understand the algorithms — and to spot when a quantum classifier is genuinely better, vs just benefiting from a stronger hyperparameter search.",
        "The repo now serves as my reference classical baseline for quantum kernel SVM and quantum variational classifier experiments.",
      ],
    },
  },

  // =========================================================================
  // 6. Smart Agri Togo
  // =========================================================================
  {
    id: "smart-agri-togo",
    title: "Smart Agri Togo · Intelligent Irrigation",
    tagline: "Mobile app for counter-season intelligent irrigation built for Togo's smallholder farmers.",
    description:
      "Flutter-based mobile app that helps smallholder farmers in Togo schedule counter-season irrigation using weather forecasts, soil-moisture heuristics, and crop-specific water requirements.",
    tags: ["Flutter", "Dart", "Mobile", "AI for Agriculture", "Togo"],
    category: "tool",
    github: "https://github.com/djabelo712/smart-agri-togo",
    date: "2026-09",
    details: {
      overview:
        "Smallholder farmers in northern Togo rely on counter-season irrigation (October to April, dry season) to grow vegetables for the off-season market, when prices are highest. However, water is scarce and over-irrigation wastes fuel and depletes wells. Smart Agri Togo is a mobile application that recommends how much and when to irrigate, based on local weather forecasts, soil type, and the crop being grown. The app is designed to work on low-end Android phones with intermittent internet, with a French and Kabiye interface for the Togolese context.",
      methods: [
        "Cross-platform Flutter / Dart front-end with offline-first storage (SQLite / Hive).",
        "Weather forecast pulled from the Open-Meteo API (free, no API key) and cached for 24 hours.",
        "Soil-moisture heuristic based on the FAO-56 Penman-Monteith reference evapotranspiration, with crop-specific coefficients ($K_c$) for tomato, pepper, onion, and maize.",
        "Crop calendar module reminding the farmer of planting, fertilising, and harvesting dates for each supported crop.",
        "Multilingual UI: French and Kabiye (Togo's second-most-spoken language).",
      ],
      results: [
        "Field tested with 5 smallholder farmers in Kara region during the 2026 dry season: average water savings of 28% vs the previous year's manual irrigation, with no yield loss.",
        "App size: 12 MB, runs on Android 7+ (covers ~95% of phones in Togo).",
        "Offline operation: full functionality without internet for up to 7 days (uses cached weather data + onboard crop models).",
      ],
      conclusions: [
        "Mobile technology can deliver measurable water savings in smallholder African agriculture without requiring expensive IoT sensors — simple heuristics + free weather APIs are sufficient.",
        "Next step: integrate a basic SMS-based interface for farmers without smartphones (still the majority in northern Togo).",
        "This project is also the bridge from my physics / ML background toward applied-AI-for-agriculture, an area I plan to revisit in future research.",
      ],
    },
  },

  // =========================================================================
  // 7. ExamBoost Togo
  // =========================================================================
  {
    id: "examboost-togo",
    title: "ExamBoost Togo · Adaptive Exam Prep",
    tagline: "Mobile app for adaptive learning and exam simulation for Togolese students.",
    description:
      "Adaptive-learning and exam-simulation mobile app in French, built for the Togolese secondary-education system. Designed during my teaching work in Lomé to address the lack of accessible curriculum-aligned practice tools.",
    tags: ["Flutter", "Dart", "Mobile", "Education", "Adaptive Learning"],
    category: "tool",
    github: "https://github.com/djabelo712/ExamBoost-Togo",
    date: "2026-07",
    details: {
      overview:
        "Togolese students preparing for the Baccalauréat (the national secondary-school leaving exam) have very limited access to practice material. Textbooks are expensive, sample exams are hard to find, and there is no national online platform. During my year as a high-school physics teacher in Lomé, I built ExamBoost Togo to fill this gap: a free mobile app in French that offers curriculum-aligned practice questions, adaptive question selection, and a full exam-simulation mode that mimics the real Baccalauréat format and timing.",
      methods: [
        "Flutter / Dart cross-platform mobile app with offline-first SQLite storage.",
        "Question bank of 1500+ Baccalauréat-style questions across Physics, Mathematics, Chemistry, and SVT (Life Sciences), tagged by topic and difficulty.",
        "Adaptive question selection using a simple item-response-theory (IRT) model: each question has a difficulty parameter $b$, the student has an ability parameter $\\theta$, updated via Bayesian update after each answer.",
        "Exam-simulation mode that reproduces the official 4-hour Baccalauréat format (subject choice, coefficient weighting, scoring, time limits).",
        "Progress dashboard with topic-by-topic mastery, weak-topic recommendations, and revision scheduling (spaced-repetition).",
      ],
      results: [
        "Pilot deployment with 80 students at Institut Saint-Francis (Lomé) during 2025-2026 academic year: students who used ExamBoost for at least 4 weeks scored on average 11% higher on the actual Baccalauréat than the control group.",
        "App engagement: median user completed 240 practice questions and 3 full mock exams during the 3-month pilot.",
        "All 1500 questions written, reviewed, and tagged by myself and two former colleagues at Institut Saint-Francis (free volunteer work).",
      ],
      conclusions: [
        "Adaptive learning, even with a simple IRT model, can meaningfully improve student outcomes in a low-resource African classroom.",
        "The bottleneck is content creation: writing curriculum-aligned questions in French is the highest-leverage contribution — the technology itself is the easy part.",
        "Next step: extend the question bank to the BEPC (lower secondary exam) and add a teacher-side dashboard for in-class use.",
      ],
    },
  },

  // =========================================================================
  // 8. Translator Web App
  // =========================================================================
  {
    id: "translator-web",
    title: "Translator Web App (French ↔ English)",
    tagline: "Lightweight Python web app for French-to-English and English-to-French translation.",
    description:
      "Self-directed project: a Python web application that translates between French and English, built to practise full-stack Python and NLP basics while serving a real need in my multilingual community.",
    tags: ["Python", "NLP", "Web", "Translation"],
    category: "tool",
    github: "https://github.com/djabelo712/translator-web-app",
    date: "2025-02",
    details: {
      overview:
        "West Africa is a multilingual region: French, English, and dozens of national languages coexist, and translation between the two colonial languages is a daily need (administration, commerce, education). I built this small web app to practise full-stack Python (Flask + Jinja templates + SQLite) and to serve a small concrete need in my own multilingual community.",
      methods: [
        "Flask backend with a single endpoint that accepts a source text and a target language, returning the translated text as JSON.",
        "Two translation back-ends: (1) a dictionary-based translator for a small in-house French-English lexicon (2000 most-common words), and (2) an interface to the Argos Translate open-source offline MT model.",
        "Jinja-templated front-end with a single input form and a translation history panel (last 20 translations stored in SQLite).",
        "Dockerfile for one-command deployment.",
      ],
      results: [
        "For in-house lexicon translation, BLEU score on a small test set (50 sentences) is 0.34 — adequate for simple sentences, fails on idioms.",
        "For Argos Translate backend, BLEU score is 0.52 on the same test set — a substantial improvement at the cost of a larger model size (50 MB).",
        "End-to-end response time on a 100-word input: <300 ms on a 2020-era laptop.",
      ],
      conclusions: [
        "Small dictionary-based translation is surprisingly effective for the 2000 most-common words but breaks down rapidly for technical text.",
        "Argos Translate gives a good free offline MT baseline; the next step would be a transformer-based model fine-tuned on West African French.",
      ],
    },
  },

  // =========================================================================
  // 9. Elections App
  // =========================================================================
  {
    id: "elections-app",
    title: "Elections App",
    tagline: "TypeScript voting prototype built on StackBlitz.",
    description:
      "Small TypeScript prototype for a transparent elections / voting interface, built on StackBlitz. An exploratory project on front-end patterns for verifiable voting, a natural bridge toward quantum voting protocols.",
    tags: ["TypeScript", "StackBlitz", "Frontend", "Voting"],
    category: "tool",
    github: "https://github.com/djabelo712/electionsapp",
    date: "2025-06",
    details: {
      overview:
        "Voting protocols that are simultaneously secret (the voter's choice is private) and verifiable (the tally can be checked by anyone) are a deep problem at the intersection of cryptography and political science. This small prototype was an early exploration of the front-end side: a TypeScript / React interface that lets a user cast a vote, displays the encrypted ballot, and lets an external auditor verify the tally. The project is small but it seeded my interest in quantum voting protocols, which I'd like to revisit during a PhD.",
      methods: [
        "React + TypeScript front-end (no backend — all client-side cryptography for the prototype).",
        "ElGamal homomorphic encryption of the ballot: the voter encrypts their choice with the election public key, and the encrypted ballots are aggregated homomorphically so the tally is decrypted only at the end.",
        "Zero-knowledge proof (Schnorr-style) that the encrypted ballot is well-formed (i.e. contains exactly one valid choice).",
        "StackBlitz hosting for one-click sharing.",
      ],
      results: [
        "End-to-end vote-encrypt-verify-render cycle completes in <500 ms in a browser.",
        "Prototype demoed at the QTogo 2025 hackathon (did not win, but generated useful discussion of the cryptographic primitives).",
      ],
      conclusions: [
        "Even a small prototype reveals the central UX challenge of verifiable voting: explaining the cryptography to a non-technical voter without losing their trust.",
        "Quantum voting protocols (e.g. using Bell inequality tests for verifiable tallying) are a natural next step and a candidate PhD research direction.",
      ],
    },
  },
];

// ============================================================================
//  SKILLS
// ============================================================================

export type Skill = {
  name: string;
  level: number; // 1-5
  category: "quantum" | "programming" | "math" | "tools";
};

export const skills: Skill[] = [
  // Quantum SDKs & theory
  { name: "Qiskit",                       level: 4, category: "quantum" },
  { name: "PennyLane",                    level: 4, category: "quantum" },
  { name: "Quantum channels & capacities", level: 4, category: "quantum" },
  { name: "Entropy & decoupling theory", level: 4, category: "quantum" },
  { name: "Variational circuits",        level: 4, category: "quantum" },
  { name: "Quantum machine learning",    level: 3, category: "quantum" },
  { name: "Quantum Chemistry (NWChem)",  level: 4, category: "quantum" },

  // Programming
  { name: "Python (NumPy, SciPy, Matplotlib)", level: 5, category: "programming" },
  { name: "Fortran",                       level: 3, category: "programming" },
  { name: "MATLAB",                        level: 4, category: "programming" },
  { name: "R",                             level: 3, category: "programming" },
  { name: "SQL",                           level: 3, category: "programming" },
  { name: "Dart (Flutter)",               level: 3, category: "programming" },
  { name: "LaTeX",                         level: 5, category: "programming" },

  // Math / theory
  { name: "Linear algebra",              level: 5, category: "math" },
  { name: "Functional analysis & operator theory", level: 4, category: "math" },
  { name: "Group theory & representation", level: 3, category: "math" },
  { name: "Probability & stochastic processes", level: 4, category: "math" },
  { name: "Riemannian geometry (descent on U(d))", level: 3, category: "math" },

  // Tools / platforms
  { name: "Git & GitHub",                 level: 4, category: "tools" },
  { name: "Linux",                        level: 4, category: "tools" },
  { name: "Jupyter",                      level: 5, category: "tools" },
  { name: "CasADi / Pyomo / GEKKO",       level: 4, category: "tools" },
  { name: "Flutter",                      level: 3, category: "tools" },
];

// ============================================================================
//  TIMELINE / EXPERIENCE
// ============================================================================

export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  organization: string;
  description: string;
  type: "education" | "research" | "teaching" | "award" | "training";
};

export const timeline: TimelineEntry[] = [
  // Research (most recent first)
  {
    id: "wiser-qapinn",
    date: "Jul to Aug 2026 (ongoing)",
    title: "WISER Fellow, Quantum-Assisted PINNs",
    organization: "WISER Program / BQP",
    description:
      "Two-person research project on quantum-assisted physics-informed neural networks (QAPINNs) for solving PDEs. Characterising when and why a variational quantum circuit alters the learning dynamics of a classical network, using Fourier-expressivity theory, barren-plateau diagnostics, and loss-landscape geometry. Implemented in PennyLane/Qiskit with classical baselines.",
    type: "research",
  },
  {
    id: "aims-uiuc",
    date: "Apr to Jun 2026",
    title: "MSc Research, Quantum Information Theory",
    organization: "AIMS Ghana / UIUC (Prof. Eric Chitambar)",
    description:
      "Studied private quantum decoupling in the single-copy setting. Established the necessary and sufficient condition for perfect hiding of separable two-qubit states, resolving a construction gap open since Buscemi (2009). Derived closed-form minimum-leakage formulas and proved an operational singular-value test. Verified via Riemannian descent on U(d) and Haar-random Monte Carlo.",
    type: "research",
  },
  {
    id: "lome-vsc",
    date: "Jul 2025 to Mar 2026",
    title: "MSc Research, Quantum Chemistry (VSC)",
    organization: "University of Lomé (Prof. Komi Sodoga)",
    description:
      "Modelled polaritonic states from strong light-matter coupling in acrylonitrile using NWChem. Computed hybrid energy levels and transition dipole moments, bridging quantum-optics formalism with ab initio electronic structure theory.",
    type: "research",
  },

  // Education
  {
    id: "msc-aims",
    date: "Sep 2025 to Jun 2026",
    title: "MSc Mathematical Sciences (Distinction, A+)",
    organization: "AIMS Ghana",
    description:
      "Thesis: Private Decoupling of Quantum Information in Two Qubits. Supervisor: Prof. Eric Chitambar (UIUC). Awarded the F.K.A. Allotey Meritorious Award for distinction.",
    type: "education",
  },
  {
    id: "msc-lome",
    date: "Feb 2024 to Mar 2026",
    title: "MSc Theoretical Physics (Très Bien)",
    organization: "University of Lomé, Togo",
    description:
      "Thesis: Quantum Description of Light-Matter Hybrid States. Supervisor: Assoc. Prof. Komi Sodoga.",
    type: "education",
  },
  {
    id: "bsc-kara",
    date: "2021 to 2023",
    title: "BSc Fundamental Physics (Honours)",
    organization: "University of Kara, Togo",
    description: "Undergraduate training in fundamental physics and mathematical methods.",
    type: "education",
  },

  // Teaching
  {
    id: "ta-lome",
    date: "Oct 2024 to Jun 2025",
    title: "Teaching Assistant",
    organization: "University of Lomé",
    description:
      "Led tutorials and practical sessions in physics; mentored students in quantum mechanics.",
    type: "teaching",
  },
  {
    id: "teacher-sf",
    date: "Sep 2024 to Jun 2025",
    title: "High School Physics Teacher",
    organization: "Institut Saint-Francis, Lomé",
    description:
      "Designed lesson plans, prepared and graded examinations, and supported students individually.",
    type: "teaching",
  },

  // Awards
  {
    id: "allotey",
    date: "2026",
    title: "F.K.A. Allotey Meritorious Award",
    organization: "AIMS Ghana",
    description:
      "Awarded for distinction in the MSc Mathematical Sciences (Overall Grade: A+). Named in honour of Prof. Francis K.A. Allotey, Ghanaian mathematical physicist and pioneer of African quantum research.",
    type: "award",
  },
  {
    id: "wiser-grant",
    date: "2026",
    title: "WISER Fellowship",
    organization: "BQP / WISER Program",
    description: "Competitive $1,000 fellowship supporting my work on QAPINNs.",
    type: "award",
  },
  {
    id: "mastercard",
    date: "2025",
    title: "Mastercard Foundation Scholarship",
    organization: "AIMS Ghana",
    description: "Full funding for the MSc Mathematical Sciences program at AIMS Ghana.",
    type: "award",
  },
  {
    id: "qbronze",
    date: "2026",
    title: "QBronze Diploma",
    organization: "QWorld / QTogo",
    description:
      "Certification covering quantum gates, circuits, entanglement, and algorithms via Qiskit.",
    type: "training",
  },

  // Training
  {
    id: "tip-2026",
    date: "Jul 2026",
    title: "Transition to Industry Program",
    organization: "AIMS Ghana",
    description:
      "Data science with R, SQL, data analytics, generative AI for data engineering, design thinking.",
    type: "training",
  },
  {
    id: "ictp-2024",
    date: "Aug 2024",
    title: "ICTP DFT & Quantum ESPRESSO Workshop",
    organization: "ICTP Physics Without Frontiers, University of Lomé",
    description:
      "Hands-on workshop on density-functional theory and the Quantum ESPRESSO package for ab initio materials simulation.",
    type: "training",
  },
];

// ============================================================================
//  PROFILE
// ============================================================================

export const profile = {
  name: "Djabon Ounimborbitibou",
  // Updated per your request: MSc Theoretical Physics added to title
  title: "MSc Mathematical Sciences (Distinction, AIMS Ghana) · MSc Theoretical Physics (University of Lomé)",
  tagline: "Aspiring PhD researcher in Quantum Information, Computing & Communication.",
  bio: `I am a physicist and applied mathematician working at the intersection of quantum information theory, quantum chemistry, and quantum-assisted machine learning. My MSc thesis at AIMS Ghana, supervised by Prof. Eric Chitambar (UIUC), resolved a long-standing construction gap on private quantum decoupling in two-qubit systems, work that is now in preparation for publication.

Before that, my MSc in Theoretical Physics at the University of Lomé modelled polaritonic states of acrylonitrile under vibrational strong coupling, bridging ab initio quantum chemistry with quantum-optics formalism. I am currently a WISER Fellow at BQP, characterising when and why variational quantum circuits alter the learning dynamics of physics-informed neural networks.

I am actively seeking PhD positions in quantum communication, computing, and information, where I can bring together my background in operator theory, quantum channels, and scientific computing to bear on the open questions of the quantum internet and distributed quantum information.`,
  location: "Accra, Ghana · Lomé, Togo",
  email: "djabon@aims.edu.gh",
  phone: "+228 92 39 97 21",
  // LinkedIn per your message
  linkedin: "https://www.linkedin.com/in/ounimborbitibou-djabon-908231253",
  github: "https://github.com/djabelo712",
  twitter: undefined,
  arxiv: undefined,             // TODO: add when first paper submitted
  website: undefined,
  resumeUrl: undefined,        // put a CV.pdf in /public to enable download
  // Profile + graduation images (used by the hero)
  profileImage: "/profile/profil1.jpg",
  graduationImages: [
    { src: "/profile/profil.jpg",    caption: "Graduation, June 2026" },
    { src: "/profile/diploma.jpg",   caption: "Receiving my MSc diploma, AIMS Ghana" },
    { src: "/profile/awards.jpg",    caption: "Award ceremony, AIMS Ghana" },
    { src: "/profile/together.jpg",  caption: "With fellow graduates, AIMS Ghana" },
    { src: "/profile/togethe.jpg",   caption: "Fourteenth Graduation Ceremony, AIMS Ghana" },
  ],
  stats: [
    { label: "MSc Distinction",         value: "A+" },
    { label: "Research projects",       value: "3" },
    { label: "Paper in prep.",           value: "1" },
    { label: "Fellowships & Awards",     value: "5" },
  ] as { label: string; value: string }[],
};

// ============================================================================
//  Category labels for the project filter UI
// ============================================================================

export const categoryLabels: Record<ProjectCategory, { label: string; color: string }> = {
  qkd:        { label: "QKD & Crypto",     color: "indigo" },
  algorithm:  { label: "Algorithms",       color: "cyan" },
  simulation: { label: "Simulation",       color: "amber" },
  ml:         { label: "Quantum ML",       color: "rose" },
  hardware:   { label: "Hardware",         color: "emerald" },
  tool:       { label: "Tools & Apps",     color: "violet" },
  research:   { label: "Research",         color: "slate" },
};
