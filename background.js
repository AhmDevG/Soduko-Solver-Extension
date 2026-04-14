chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: async () => {

            console.log("🚀 solver started");

            /**
             * Builds a board from the internal model (z2).
             * returns {Array} board
             */
            function buildBoard() {
                const model = window.z2;

                if (!model || !model.v) {
                    console.log("❌ z2 not available");
                    return null;
                }

                const board = Array.from({ length: 9 }, () =>
                    Array(9).fill(".")
                );

                for (let y = 0; y < 9; y++) {
                    for (let x = 0; x < 9; x++) {
                        const val = model.v[y * 9 + x];
                        board[y][x] = val === 0 ? "." : String(val);
                    }
                }

                return board;
            }

            /**
             * @param {Array} board
             * @param {number} row
             * @param {number} col
             * @param {number|string} k
             */
            function isValid(board, row, col, k) {
                for (let i = 0; i < 9; i++) {
                    const br = 3 * Math.floor(row / 3) + Math.floor(i / 3);
                    const bc = 3 * Math.floor(col / 3) + (i % 3);

                    if (
                        board[row][i] == k ||
                        board[i][col] == k ||
                        board[br][bc] == k
                    ) {
                        return false;
                    }
                }
                return true;
            }

            /**
             * @param {Array} board
             */
            function sodokoSolver(board) {
                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        if (board[r][c] === ".") {
                            for (let k = 1; k <= 9; k++) {
                                if (isValid(board, r, c, k)) {
                                    board[r][c] = String(k);

                                    if (sodokoSolver(board)) {
                                        return true;
                                    }

                                    board[r][c] = ".";
                                }
                            }
                            return false;
                        }
                    }
                }
                return true;
            }

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            /**
             * @param {Array} board
             */
            async function putOnBoard(board) {
                const model = window.z2;

                if (!model || !model.vq) {
                    console.log("❌ model API not available");
                    return;
                }

                let filled = 0;

                for (let y = 0; y < 9; y++) {
                    for (let x = 0; x < 9; x++) {
                        const idx = y * 9 + x;

                        if (model.v[idx] === 0) {
                            const val = Number(board[y][x]);

                            model.vq(model.xj, 1, x, y, val);
                            model.vr();

                            filled++;
                            await sleep(50);
                        }
                    }
                }

                console.log("✅ filled cells:", filled);
            }

            if (window.location.href === "https://www.soduko-online.com/") {

                const board = buildBoard();

                if (!board) return;

                const ok = sodokoSolver(board);

                if (!ok) {
                    console.log("❌ no solution found");
                    return;
                }

                console.table(board);

                await putOnBoard(board);

                alert("This extension works");
            } else {
                alert("This extension only works on 'https://www.soduko-online.com/'");
            }
        }
    });
});
