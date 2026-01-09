# Battleship
Game "Battleship"

## Rules

Refer to `index.html`.



## Computer opponent's algorithm

The Computer Opponent utilizes a **Probabilistic Density Function (Heatmap)** method to determine the optimal firing solution.

It treats the board not as a guessing game, but as a constantly updating probability heatmap.

### **Algorithm Overview**

1.  **Simulation & Superposition:** The computer looks at the current state of the board (hits, misses, sunk ships). It calculates every single possible legal placement for the *remaining* enemy ships.
2.  **Frequency Count:** For every square on the board, the computer counts how many of those valid ship arrangements overlap that specific square.
3.  **Heatmap Generation:** Squares with the highest count (the most overlaps) have the highest mathematical probability of containing a ship.
4.  **Adaptation (Target Mode):**
    -   If there are **"Active Hits"** (hits on ships not yet sunk), the algorithm massively weighs valid placements that pass through these hits.
    -   This causes the probability density to spike in the adjacent squares, naturally guiding the computer to finish the ship without needing a separate "state."
5.  **Selection:** The algorithm fires at the square with the highest probability score.

