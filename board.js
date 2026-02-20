const boardElement = document.querySelector(".board");
let cancelled = true
function createBoard() {
    let x = 0;
    let y = 0;
    for (let n = 0; n < 81; n++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.contentEditable = true;
        boardElement.appendChild(cell)

        cell.dataset.x = x;
        cell.dataset.y = y;


        if ((x + 1) % 3 == 0 && x != 8) {
            cell.style.borderRightWidth = "2px"
        }
        if ((y + 1) % 3 == 0) {
            cell.style.borderBottomWidth = "2px"
        }

        cell.addEventListener('input', function (e) {
            cell.textContent = cell.textContent.replace(/[^1-9]/g, '').slice(0, 1);
        });


        x = x + 1;
        if (x == 9) {
            x = 0;
            y++;
        }
    }
}

function solveButton() {
    cancelled = false
    let input_board = Array.from({ length: 9 }, () => Array(9).fill(null));
    let input_board_cells = Array.from({ length: 9 }, () => Array(9).fill(null));

    const cells = boardElement.querySelectorAll(".cell");

    for (let n = 0; n < cells.length; n++) {
        let i = parseInt(cells[n].dataset.x);
        let j = parseInt(cells[n].dataset.y);
        if (cells[n].textContent == "" || cells[n].textContent == null) {
            input_board[j][i] = ".";
        } else {
            input_board[j][i] = cells[n].textContent;
        }
        input_board_cells[j][i] = cells[n];
    }


    let queue = []

    const solved = solveSudoku(input_board, queue);

    if (!solved) {
        alert("The Sudoku doesn't have any solution")
    } else {
        assignValues(input_board_cells, queue)
    }
        
}

function assignValues(cellElements, queue, interval = 25) {

    if (cancelled) {
        return
    }

    if (queue.length == 0) {
        return;
    }

    let task = queue.pop()

    if (task.value == ".") {
        cellElements[task.r][task.c].textContent = ""
    } else {
        cellElements[task.r][task.c].textContent = task.value
    }

    setTimeout(() => {
        assignValues(cellElements, queue)
    }, interval);
}

function clearButton() {
    cancelled = true
    const cells = boardElement.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.textContent = ""
    })
}

createBoard()