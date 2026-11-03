import { SampleNotePreset } from '../types';

export const SAMPLE_PRESETS: SampleNotePreset[] = [
  {
    id: 'system-design',
    title: 'Distributed Systems & Scalability',
    category: 'Software Engineering',
    depth: 'interview',
    description: 'CAP theorem, consistent hashing, Raft consensus, and caching invalidation strategies.',
    notes: `# Distributed Systems & Architecture Study Notes

## 1. CAP Theorem & PACELC
- **CAP Theorem Formulation:** In any asynchronous network subject to partitions ($P$), a distributed data store can guarantee at most two of:
  - **Consistency ($C$):** Every read receives the most recent write or an error (linearizability).
  - **Availability ($A$):** Every non-failing node returns a non-error response without guarantee of recent write.
  - **Partition Tolerance ($P$):** The system continues to operate despite arbitrary dropped/delayed network messages.
- **PACELC Extension:** In normal operation (no partition $P$), the trade-off is between Latency ($L$) and Consistency ($C$). If partition occurs ($P$), choose between Availability ($A$) and Consistency ($C$).

## 2. Consistent Hashing
- Standard modulo hashing ($hash(key) \\pmod N$) requires remapping $\\approx \\frac{N-1}{N}$ keys when a server is added or removed.
- **Consistent Hashing Mechanism:** Keys and servers are mapped to a circular ring ($0$ to $2^{32}-1$). A key belongs to the first node encountered moving clockwise.
- Adding or removing a node only migrates $K/N$ keys on average, where $K$ is total keys and $N$ is node count.
- **Virtual Nodes:** To prevent hotspot clustering and uneven distribution, each physical node is assigned $V$ virtual positions (typically 100-250) on the ring.

## 3. Raft Consensus Algorithm
- Raft decomposes consensus into three independent subproblems:
  - **Leader Election:** Heartbeat timeout triggers election; node requests votes; majority ($N/2 + 1$) quorum required.
  - **Log Replication:** Leader accepts client writes, appends entry, replicates to followers, and commits once stored on quorum.
  - **Safety Invariant:** If a leader commits a log entry, no subsequent leader will ever overwrite or omit that entry (Election Restriction requires candidate to have up-to-date log).

## 4. Cache Invalidation Patterns
- **Cache-Aside (Lazy Loading):** App queries cache first. On miss, reads database and populates cache. Potential stale reads on concurrent updates.
- **Write-Through:** App writes to cache, cache writes synchronously to DB. Strong consistency but high write latency.
- **Write-Back (Write-Behind):** App writes only to cache; cache batches writes to DB asynchronously. High write throughput, risk of data loss on crash.`
  },
  {
    id: 'algorithms-math',
    title: 'Algorithms & Computational Complexity',
    category: 'Computer Science',
    depth: 'formulas',
    description: 'Master theorem formulas, Dijkstra vs A*, QuickSelect, and asymptotic bounds.',
    notes: `# Algorithms & Asymptotic Complexity Drill Notes

## 1. The Master Theorem
For recurrence relations of the form:
$$T(n) = a \\cdot T\\left(\\frac{n}{b}\\right) + f(n)$$
where $a \\ge 1$, $b > 1$, and $c_{crit} = \\log_b a$:

- **Case 1 (Leaf Dominated):** If $f(n) = \\mathcal{O}(n^c)$ where $c < \\log_b a$, then $T(n) = \\Theta(n^{\\log_b a})$.
- **Case 2 (Evenly Balanced):** If $f(n) = \\Theta(n^{\\log_b a} \\cdot \\log^k n)$ for $k \\ge 0$, then $T(n) = \\Theta(n^{\\log_b a} \\cdot \\log^{k+1} n)$.
- **Case 3 (Root Dominated):** If $f(n) = \\Omega(n^c)$ where $c > \\log_b a$ and regularity condition $a \\cdot f(n/b) \\le d \\cdot f(n)$ holds for $d < 1$, then $T(n) = \\Theta(f(n))$.

## 2. Shortest Path Graph Algorithms
- **Dijkstra's Algorithm:** Finds single-source shortest path in non-negative weighted graphs using min-heap. Time complexity: $\\mathcal{O}((V + E) \\log V)$.
- **A* Search:** Guided heuristic shortest path. Evaluates nodes by $f(n) = g(n) + h(n)$, where $g(n)$ is exact cost from start, and $h(n)$ is heuristic estimate to goal.
- **Admissibility Condition:** $A^*$ is guaranteed optimal if $h(n)$ is admissible ($h(n) \\le h^*(n)$, never overestimates true cost).

## 3. QuickSelect & Order Statistics
- Finds the $k$-th smallest element in an unordered array without full sorting.
- Partitioning around pivot like QuickSort: average time complexity is $\\mathcal{O}(n)$, worst-case is $\\mathcal{O}(n^2)$ with poor pivot selection.
- Median-of-Medians pivot selection guarantees worst-case $\\mathcal{O}(n)$ time.`
  },
  {
    id: 'react-frontend',
    title: 'Modern React 19 & Web Architecture',
    category: 'Frontend Engineering',
    depth: 'concepts',
    description: 'React Server Components, Actions, useOptimistic, concurrent hydration, and rendering models.',
    notes: `# Modern React 19 & Frontend Architecture

## 1. React Server Components (RSC) vs Client Components
- **RSC Execution:** Server Components execute exclusively on the server during build or request time. Their code never gets bundled into the client JavaScript bundle.
- **Zero-Bundle Impact:** Heavy dependencies (markdown parsers, syntax highlighters, DB query clients) can stay on the server without inflating client download size.
- **Client Components ('use client'):** Required only for user interactivity, browser event listeners (onClick, onChange), React state (useState, useReducer), and browser APIs (localStorage, window).

## 2. Server Actions & Form Mutations
- Functions defined with 'use server' directive can be called directly as form actions or async functions from client components.
- Automatically serialize arguments, invoke secure backend RPC endpoints, and can trigger page revalidation via revalidatePath or revalidateTag without explicit fetch boilerplates.

## 3. useOptimistic Hook
- Enables immediate UI updates before server confirmation arrives, preventing sluggish perceived latency on user gestures.
- Takes initial state and an update reducer:
  \`const [optimisticItems, setOptimisticItems] = useOptimistic(items, (state, newItem) => [...state, newItem]);\`
- Reverts automatically if the server action rejects or throws an error.

## 4. Concurrent Hydration & Streaming SSR
- React 18 & 19 support selective hydration with React.Suspense.
- Server streams initial HTML chunks progressively using HTTP Transfer-Encoding: chunked. Client hydrates interactive boundaries as scripts load, without blocking the entire page.`
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning & Neural Architectures',
    category: 'AI & Data Science',
    depth: 'formulas',
    description: 'Transformer Self-Attention, loss functions, Bias-Variance tradeoff, and regularization.',
    notes: `# Machine Learning Core Fundamentals

## 1. Transformer Scaled Dot-Product Attention
- Given Query matrix $Q$, Key matrix $K$, and Value matrix $V$ with dimension $d_k$:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$
- **Scaling Factor $\\frac{1}{\\sqrt{d_k}}$:** Prevents the dot product from growing excessively large in high dimensions, which would push softmax into regions with vanishing gradients.
- Computational complexity: $\\mathcal{O}(N^2 \\cdot d)$ with respect to sequence length $N$, leading to quadratic context scaling.

## 2. The Bias-Variance Tradeoff
- Expected Mean Squared Error on unseen test data decomposes into:
$$\\mathbb{E}[(y - \\hat{f}(x))^2] = \\text{Bias}[\\hat{f}(x)]^2 + \\text{Var}[\\hat{f}(x)] + \\sigma^2$$
- **High Bias (Underfitting):** Model is too simplistic to capture true function; training error and test error are both high.
- **High Variance (Overfitting):** Model memorizes training noise; training error is near zero but generalization gap to test error is large.
- $\\sigma^2$ is the irreducible error inherent in the noisy data distribution.

## 3. L1 (Lasso) vs L2 (Ridge) Regularization
- **L1 Regularization:** Penalty term $\\lambda \\sum |w_i|$. Induces sparse feature weights by driving non-critical coefficients strictly to zero (automatic feature selection).
- **L2 Regularization (Weight Decay):** Penalty term $\\frac{\\lambda}{2} \\sum w_i^2$. Shrinks weights smoothly toward zero, penalizing large magnitudes without forcing strict zero sparsity.`
  }
];
