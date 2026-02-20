function getColumn(board, j) {
    let col = []
    for (let i = 0; i < board.length; i++) {
        if (board[i][j] == ".") continue
        col.push(board[i][j])
    }
    return col
}
function getRow(board, i) {
    let row = []
    for (let j = 0; j < board.length; j++) {
        if (board[i][j] == ".") continue
        row.push(board[i][j])
    }
    return row
}

function getBoxOfCell(i, j) {
    let bi = -1
    let bj = -1

    if (i >= 0 && i < 3) {
        bi = 0
    } else if (i >= 3 && i < 6) {
        bi = 1
    } else if (i >= 6 && i < 9) {
        bi = 2
    }
    if (j >= 0 && j < 3) {
        bj = 0
    } else if (j >= 3 && j < 6) {
        bj = 1
    } else if (j >= 6 && j < 9) {
        bj = 2
    }

    return { bi, bj }
}

function getBox(board, bi, bj) {
    let startR = bi * 3
    let endR = startR + 3

    let startC = bj * 3
    let endC = startC + 3

    let box = []

    for (let i = startR; i < endR; i++) {
        for (let j = startC; j < endC; j++) {
            if (board[i][j] == ".") continue
            box.push(board[i][j])
        }
    }
    return box
}

function getCandidatesForCell(board, i, j) {
    if (board[i][j] != ".")
        return []
    let { bi, bj } = getBoxOfCell(i, j);
    let box = getBox(board, bi, bj);
    let row = getRow(board, i)
    let col = getColumn(board, j)

    let all = allCandidates()

    let possible = []

    for (let i = 0; i < all.length; i++) {
        if (box.includes(all[i]) || row.includes(all[i]) || col.includes(all[i]))
            continue
        possible.push(all[i])
    }

    return possible
}

function computeDomain(board) {
    let domain = {}

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const candidates = getCandidatesForCell(board, i, j)
            domain[i + "," + j] = candidates
        }
    }

    return domain;
}

function findBestCell(domain) {
    let key = undefined
    let candidates = Infinity
    for (const cell in domain) {
        if (!Object.hasOwn(domain, cell)) continue;

        if (domain[cell].length == 0) continue

        if (candidates > domain[cell].length) {
            candidates = domain[cell].length
            key = cell
        }

    }

    return key
}

function forwardChecking(board) {
    let domain = computeDomain(board)

    for (const cell in domain) {
        if (!Object.hasOwn(domain, cell)) continue;

        let [r, c] = cell.split(",").map(Number)

        if (board[r][c] == "." && domain[cell].length == 0) {
            return false
        }

    }

    return true
}

function count(array, value) {
    let ans = 0
    array.forEach(element => {
        if(element == value) ans++
    });
    return ans
}

function areDuplicatesInArray(array) {

    if (array.length == 0) return false

    let count = {}

    for (let i = 0; i < array.length; i++) {
        if (!count[array[i]]) {
            count[array[i]] = 0;
        }
        count[array[i]] = count[array[i]] + 1
    }

    return Math.max(...Object.values(count)) != 1
}

function isValidSudoku(board) {
    for (let i = 0; i < 9; i++) {
        let row = getRow(board, i)
        let col = getColumn(board, i)
        if (areDuplicatesInArray(row) || areDuplicatesInArray(col)) {
            return false
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++){
            let box = getBox(board, i, j)
            if (areDuplicatesInArray(box)) {
                return false
            }
        }
    }

    return true
}


function allCandidates() {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
}
function getDomainOfBox(board, bi, bj) {
    let box = getBox(board, bi, bj)

    let all = allCandidates()

    let domain = all.filter(x => !(box.includes(x)))

    return domain


}



function solveSodoku(board, queue) {


    if (!isValidSudoku(board)) {
        return false
    }

    if (!forwardChecking(board)) {
        return false;
    }

    let domain = computeDomain(board)
    let bestCell = findBestCell(domain)

    let positions = []

    while (bestCell && domain[bestCell].length == 1) {
        let [r, c] = bestCell.split(",").map(Number);

        positions.push([r, c])

        board[r][c] = domain[bestCell][0]
        queue.push({
            r, c,
            "value": board[r][c],
        })

        domain = computeDomain(board)
        bestCell = findBestCell(domain)
    }

    for (let bi = 0; bi < 3; bi++) {

        for (let bj = 0; bj < 3; bj++) {

            let boxDomain = getDomainOfBox(board, bi, bj)

            let valToCells = {}

            for (let i = bi * 3; i < (bi + 1) * 3; i++) {

                for (let j = bj * 3; j < (bj + 1) * 3; j++) {

                    if (board[i][j] != ".") continue
                    const candidates = getCandidatesForCell(board, i, j)
                    for (const val of boxDomain) {
                        if (candidates.includes(val)) {
                            if (!valToCells[val]) {
                                valToCells[val] = []
                            }
                            valToCells[val].push([i, j])

                        }
                    }
                }
            }
            for (const val in valToCells) {
                if (valToCells[val].length == 1) {
                    let [r, c] = valToCells[val][0]

                    board[r][c] = val
                    positions.push([r, c])
                    queue.push({
                        r, c,
                        "value": val
                    })
                }
            }
        }
    }

    if (!forwardChecking(board)) {
        for (let i = 0; i < positions.length; i++) {
            let [r, c] = positions[i]
            board[r][c] = "."
            queue.push({
                r, c,
                "value": board[r][c],
            })

        }
        return false
    }

    if (bestCell == undefined) {
        return true;
    }

    let bestCellCandidates = domain[bestCell]
    let [r, c] = bestCell.split(",").map(Number)

    for (let i = 0; i < bestCellCandidates.length; i++) {
        board[r][c] = bestCellCandidates[i]
        queue.push({
            r, c,
            "value": board[r][c],
        })
        if (solveSodoku(board, queue)) {
            return true
        }
        board[r][c] = "."
        queue.push({
            r, c,
            "value": board[r][c],
        })

    }

    for (let i = 0; i < positions.length; i++) {
        let [r, c] = positions[i]
        board[r][c] = "."
        queue.push({
            r, c,
            "value": board[r][c],
        })

    }
    return false
}