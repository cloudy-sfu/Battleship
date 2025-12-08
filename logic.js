/**
 * Logic for Sea Battle Chess
 */

const BOARD_SIZE = 10;
const SHIPS_CONFIG = [
    { size: 4, count: 1 },
    { size: 3, count: 2 },
    { size: 2, count: 3 },
    { size: 1, count: 4 }
];

const STATUS = { EMPTY: 0, SHIP: 1, MISS: 2, HIT: 3 };
const PARTY = { PLAYER: 1, COMPUTER: 2 };

class BattleshipLogic {
    constructor() {
        this.playerBoard = this.createEmptyBoard();
        this.computerBoard = this.createEmptyBoard();
        this.playerShips = []; 
        this.computerShips = [];
        this.aiHitStack = [];
    }

    createEmptyBoard() {
        return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(STATUS.EMPTY));
    }

    initGame() {
        this.playerBoard = this.createEmptyBoard();
        this.computerBoard = this.createEmptyBoard();
        this.playerShips = [];
        this.computerShips = [];
        this.aiHitStack = [];
        
        this.placeShipsRandomly(this.playerBoard, this.playerShips);
        this.placeShipsRandomly(this.computerBoard, this.computerShips);
    }

    placeShipsRandomly(board, shipTracker) {
        const allShips = [];
        SHIPS_CONFIG.forEach(conf => {
            for (let i = 0; i < conf.count; i++) allShips.push(conf.size);
        });

        for (let size of allShips) {
            let placed = false, attempts = 0;
            while (!placed && attempts < 1000) {
                const r = Math.floor(Math.random() * BOARD_SIZE);
                const c = Math.floor(Math.random() * BOARD_SIZE);
                const horizontal = Math.random() > 0.5;
                if (this.canPlaceShip(board, r, c, size, horizontal)) {
                    this.placeShip(board, shipTracker, r, c, size, horizontal);
                    placed = true;
                }
                attempts++;
            }
        }
    }

    canPlaceShip(board, r, c, size, horizontal) {
        if (horizontal && c + size > BOARD_SIZE) return false;
        if (!horizontal && r + size > BOARD_SIZE) return false;
        const rStart = Math.max(0, r - 1), rEnd = Math.min(BOARD_SIZE - 1, horizontal ? r + 1 : r + size);
        const cStart = Math.max(0, c - 1), cEnd = Math.min(BOARD_SIZE - 1, horizontal ? c + size : c + 1);
        for (let i = rStart; i <= rEnd; i++) {
            for (let j = cStart; j <= cEnd; j++) {
                if (board[i][j] !== STATUS.EMPTY) return false;
            }
        }
        return true;
    }

    placeShip(board, shipTracker, r, c, size, horizontal) {
        const shipObj = { coords: [], hits: 0, size: size };
        for (let i = 0; i < size; i++) {
            const curR = horizontal ? r : r + i;
            const curC = horizontal ? c + i : c;
            board[curR][curC] = STATUS.SHIP;
            shipObj.coords.push([curR, curC]);
        }
        shipTracker.push(shipObj);
    }

    checkSunkAndDisableNeighbors(board, shipTracker, r, c) {
        const ship = shipTracker.find(s => s.coords.some(coord => coord[0] === r && coord[1] === c));
        if (ship) {
            ship.hits++;
            if (ship.hits === ship.size) {
                this.disableNeighbors(board, ship);
                return true;
            }
        }
        return false;
    }

    disableNeighbors(board, ship) {
        ship.coords.forEach(([r, c]) => {
            for (let i = r - 1; i <= r + 1; i++) {
                for (let j = c - 1; j <= c + 1; j++) {
                    if (i >= 0 && i < BOARD_SIZE && j >= 0 && j < BOARD_SIZE) {
                        if (board[i][j] === STATUS.EMPTY) board[i][j] = STATUS.MISS;
                    }
                }
            }
        });
    }

    isGameOver(shipTracker) {
        return shipTracker.every(s => s.hits === s.size);
    }

    getBoard(party) {
        const sourceBoard = (party === PARTY.PLAYER) ? this.playerBoard : this.computerBoard;
        return sourceBoard.map(row => row.map(cell => {
            if (cell === STATUS.EMPTY || cell === STATUS.SHIP) return 0; 
            if (cell === STATUS.HIT) return 1; 
            if (cell === STATUS.MISS) return 2; 
            return 0;
        }));
    }

    hit(party, squareID) {
        const [r, c] = squareID;
        const targetBoard = (party === PARTY.PLAYER) ? this.computerBoard : this.playerBoard;
        const targetShips = (party === PARTY.PLAYER) ? this.computerShips : this.playerShips;

        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return { status: 'invalid' };
        const currentStatus = targetBoard[r][c];
        if (currentStatus === STATUS.MISS || currentStatus === STATUS.HIT) return { status: 'invalid' };

        if (currentStatus === STATUS.SHIP) {
            targetBoard[r][c] = STATUS.HIT;
            const sunk = this.checkSunkAndDisableNeighbors(targetBoard, targetShips, r, c);
            return { status: sunk ? 'sunk' : 'hit', gameOver: this.isGameOver(targetShips) };
        } else {
            targetBoard[r][c] = STATUS.MISS;
            return { status: 'miss', gameOver: false };
        }
    }

    predict(party) {
        const targetBoard = this.playerBoard; 
        while(this.aiHitStack.length > 0) {
            const [r, c] = this.aiHitStack[this.aiHitStack.length - 1];
            if (targetBoard[r][c] === STATUS.MISS || targetBoard[r][c] === STATUS.HIT) {
                this.aiHitStack.pop();
            } else {
                break;
            }
        }
        if (this.aiHitStack.length > 0) return this.aiHitStack.pop();

        let available = [];
        for(let r=0; r<BOARD_SIZE; r++) {
            for(let c=0; c<BOARD_SIZE; c++) {
                if (targetBoard[r][c] === STATUS.EMPTY || targetBoard[r][c] === STATUS.SHIP) {
                    available.push([r, c]);
                }
            }
        }
        if (available.length === 0) return [0,0];
        return available[Math.floor(Math.random() * available.length)];
    }

    updateAIPredictionAfterHit(r, c, resultStatus) {
        if (resultStatus === 'hit') {
            // Check adjacent cells to determine if we have established an orientation
            const isHorizontal = (c > 0 && this.playerBoard[r][c - 1] === STATUS.HIT) || 
                                 (c < BOARD_SIZE - 1 && this.playerBoard[r][c + 1] === STATUS.HIT);
            const isVertical = (r > 0 && this.playerBoard[r - 1][c] === STATUS.HIT) || 
                               (r < BOARD_SIZE - 1 && this.playerBoard[r + 1][c] === STATUS.HIT);

            let neighbors = [];
            
            // If direction is known, only hunt along that axis. Otherwise, hunt all directions.
            if (isHorizontal) {
                neighbors = [[r, c - 1], [r, c + 1]];
            } else if (isVertical) {
                neighbors = [[r - 1, c], [r + 1, c]];
            } else {
                neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
            }

            for (let i = neighbors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
            }
            neighbors.forEach(([nr, nc]) => {
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    const cell = this.playerBoard[nr][nc];
                    if (cell !== STATUS.HIT && cell !== STATUS.MISS) this.aiHitStack.push([nr, nc]);
                }
            });
        }
    }

}
