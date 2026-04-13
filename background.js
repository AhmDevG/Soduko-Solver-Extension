chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {

            /**
             * Builds a board on the given DOM element.
             * returns {Array} An array of the board's cells.
             */
            function buildBoard(){
                const board = [
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                    [".",".",".",".",".",".",".",".","."],
                ];

                for(let i = 0 ; i < 9 ; i++) {
                    const current_quarter = document.querySelector(`.sz${i}`);
                    const childrens = Array.from(current_quarter.children);
                    childrens.forEach(element => {
                        if(element.textContent.trim() != ""){
                            const [_ , col , row] = element.id.split("_");
                            board[row][col] = element.textContent;
                        }
                    });
                }

                return board;

            }

            /**
             * @param {Array} board 
             * @param {number} row  
             * @param {number} k  
             * returns {number} col 
             */
            function isValid(board, row, col, k) {
                for (let i = 0; i < 9; i++) {
                    const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
                    const n = 3 * Math.floor(col / 3) + i % 3;
                    if (board[row][i] == k || board[i][col] == k || board[m][n] == k) {
                        return false;
                    }
                }
                return true;
            }


            /**
             * @param {Array} board 
             */
            function sodokoSolver(board) {
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (board[i][j] == '.') {
                            for (let k = 1; k <= 9; k++) {
                                if (isValid(board, i, j, k)) {
                                    board[i][j] = `${k}`;
                                    if (sodokoSolver(board)) {
                                        return true;
                                    } else {
                                        board[i][j] = '.';
                                    }
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

            /*
             * @param {Array} board 
             */
            async function putOnBoard(board){
                const number_buttons_parent = document.querySelector(".r5");
                const childrens_buttons = Array.from(number_buttons_parent.children);

                for(let i = 0 ; i < 9 ; i++){
                    for(let j = 0 ; j < 9 ; j++){
                        const current_block = document.getElementById(`c_${j}_${i}`);

                        if(current_block.textContent.trim() == ""){
                            const solution_value = Number(board[i][j]);

                            childrens_buttons[solution_value-1].click();

                            await sleep(1000);

                            current_block.click();

                            await sleep(1500);
                    }
                    else{
                        continue;
                    }

                }
            }
}

        if (window.location.href === 'https://www.soduko-online.com/') {
            const board = buildBoard();
            sodokoSolver(board);
            console.log(board);
            await putOnBoard(board);
            alert("This extension works");
        }
        else{
            alert("This extension only works on 'https://www.soduko-online.com/'");
        }
    }
  });
});
