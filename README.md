# Battleship
Game "Battleship"

## Rules

Reference: [Wikipedia Battleship](https://en.wikipedia.org/wiki/Battleship_(game))

### 1. Objective

The objective is to locate and destroy the opposing fleet before they destroy yours. The first commander to sink all 10 enemy vessels wins the match.

### 2. Fleet Configuration

Each party commands a fleet of **10 vessels** occupying a specific number of linear grid squares:

-   **1x Battleship** (Size: 4 squares)
-   **2x Cruisers** (Size: 3 squares)
-   **3x Destroyers** (Size: 2 squares)
-   **4x Submarines** (Size: 1 square)

### 3. Deployment Protocols

Ships are deployed on a 10x10 grid according to the following strict isolation rules:

-   **Linear Alignment:** All vessels must be placed in a straight line, oriented either **vertically** or **horizontally**. Diagonal placement of the ship hull itself is prohibited.
-   **Spatial Isolation:** No two vessels may occupy adjacent coordinates. This prohibition applies to both **orthogonal** (side-by-side) and **diagonal** adjacency.
-   **Minimum Buffer:** There must be at least one empty water grid cell separating any part of one ship from another.

### 4. Engagement Rules

The game proceeds in turns, starting with the Player.

-   **Firing:** On your turn, select a coordinate on the opponent's grid to fire.
-   **The "Rapid Fire" Mechanic:**
    -   **Hit:** If a shot successfully strikes an enemy vessel, the active player retains the initiative and **must fire again**. This continuation applies even if the shot sinks the vessel (unless it is the final ship).
    -   **Miss:** If a shot lands on empty water, the turn concludes immediately, and control passes to the opponent.
-   **Sinking & Area Denial:** When a vessel sustains hits to all its coordinates, it is considered **Sunk**. Upon sinking, all grid cells immediately surrounding the sunken vessel (orthogonally and diagonally) are automatically revealed and marked as **"Miss"** (Gray Cross).

### 5. Victory Conditions

The match concludes immediately when a player successfully sinks the final remaining ship of the opposing fleet.



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

