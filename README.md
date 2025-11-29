# Battleship
Game "Battleship"

## Rules

Refer to `index.html`.



## Computer opponent's algorithm

The Computer Opponent utilizes a **searching and hunting algorithm** that alternates between two distinct tactical phases: *Stochastic Hunting* and *Stack-Based Targeting*.

### **1. Phase I: Stochastic Hunt (Search Mode)**

In the absence of confirmed enemy coordinates, the AI operates in **Hunt Mode**.

-   **Algorithm:** The system generates a list of all valid coordinates on the board that have not yet been targeted (excluding known "Hit" or "Miss" cells).
-   **Selection:** From this pool of available coordinates, the AI selects a target using a uniform random distribution. This ensures the firing pattern is non-deterministic and unpredictable to the human player.

### **2. Phase II: Stack-Based Targeting (Destroy Mode)**

Upon registering a successful **"Hit"**, the AI immediately transitions to **Target Mode** to localize and eliminate the remainder of the vessel.

-   **Adjacency Analysis:** The algorithm identifies the four orthogonal neighbors (North, South, East, West) of the successful hit.
-   **Neighbor Shuffling:** These neighbors are randomized (shuffled) to prevent a predictable directional bias (e.g., always checking North first).
-   **The Target Stack (LIFO):** Valid neighbors (those within bounds and not previously targeted) are pushed onto a **Last-In-First-Out (LIFO) Stack**.
-   **Execution:** On subsequent turns, the AI pops coordinates from the top of this stack. This data structure naturally encourages the AI to "follow a line" of hits. If a subsequent shot from the stack results in another hit, the new neighbors of *that* specific hit are pushed to the top of the stack, causing the AI to aggressively pursue the axis of the ship until it is sunk.

