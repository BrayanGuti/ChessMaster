export function calculateAvailableMoves(
    selectedPiece: ChessBoardCell['piece'], 
    selectedCoordinates: ChessBoardCell['coordinates']
  ): ChessBoardCell['coordinates'][] {
    const {row, col} = selectedCoordinates
    const posiblesMoves = []

    return (`${row}, ${col}, waza`)

  //   if (pieceCell[0][1] === 'R') {
  //     posiblesMoves = rookMove(chessBoard, row, col)
  //   } else if (pieceCell[0][1] === 'B') {
  //     posiblesMoves = bishopMove(chessBoard, row, col)
  //   } else if (pieceCell[0][1] === 'N') {
  //     posiblesMoves = knightMove(chessBoard, row, col)
  //   } else if (pieceCell[0][1] === 'Q') {
  //     posiblesMoves = bishopMove(chessBoard, row, col).concat(rookMove(chessBoard, row, col))
  //   } else if (pieceCell[0][1] === 'K') {
  //     posiblesMoves = kingMove(chessBoard, row, col, castle)
  //   } else if (pieceCell[0][1] === 'P') {
  //     posiblesMoves = pawnMove(pieceCell, chessBoard, row, col, CheckingPawnAttacks)
  //   }
  // return posiblesMoves
}
  
// export function calculateMoves (chessBoard, coordsPieceToMove) {
//   const [row, col] = coordsPieceToMove
//   const pieceColor = chessBoard[row][col][0][0]
//   const futurePosiblesMoves = calulateFutureMoves(chessBoard, coordsPieceToMove, false, true)

//   const posiblesMoves = futurePosiblesMoves.filter(([row, col]) => {
//     return chessBoard[row][col][0][0] !== pieceColor
//   })

//   return posiblesMoves
// }

// export function calulateFutureMoves (chessBoard, coordsPieceToMove, CheckingPawnAttacks = true, castle = false) {
//   const [row, col] = coordsPieceToMove
//   const pieceCell = chessBoard[row][col]
//   let posiblesMoves = []

//   if (pieceCell[0][1] === 'R') {
//     posiblesMoves = rookMove(chessBoard, row, col)
//   } else if (pieceCell[0][1] === 'B') {
//     posiblesMoves = bishopMove(chessBoard, row, col)
//   } else if (pieceCell[0][1] === 'N') {
//     posiblesMoves = knightMove(chessBoard, row, col)
//   } else if (pieceCell[0][1] === 'Q') {
//     posiblesMoves = bishopMove(chessBoard, row, col).concat(rookMove(chessBoard, row, col))
//   } else if (pieceCell[0][1] === 'K') {
//     posiblesMoves = kingMove(chessBoard, row, col, castle)
//   } else if (pieceCell[0][1] === 'P') {
//     posiblesMoves = pawnMove(pieceCell, chessBoard, row, col, CheckingPawnAttacks)
//   }

//   return posiblesMoves
// }

// function isOnBoard (row, col, boardSize = 8) {
//   return row >= 0 && row < boardSize && col >= 0 && col < boardSize
// }

// function pawnMove (pieceCell, chessBoard, row, col, CheckingPawnAttacks) {
//   const posiblesMoves = []
//   const firstMove = pieceCell[3]
//   const pieceColor = pieceCell[0][0]
//   const direction = pieceColor === 'W' ? -1 : 1

//   if (!CheckingPawnAttacks && isOnBoard(row + direction, col) && chessBoard[row + direction][col][0] === '') {
//     posiblesMoves.push([row + direction, col])
//     if (!firstMove && chessBoard[row + 2 * direction][col][0] === '') {
//       posiblesMoves.push([row + 2 * direction, col])
//     }
//   }

//   const possibleColumns = [col + 1, col - 1]
//   possibleColumns.forEach(column => {
//     const targetRow = row + direction
//     if (isOnBoard(targetRow, column) && (CheckingPawnAttacks || chessBoard[targetRow][column][0] !== '')) {
//       posiblesMoves.push([targetRow, column])
//     }
//   })

//   return posiblesMoves
// }

// function rookMove (chessBoard, row, col) {
//   const posiblesMoves = []

//   const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
//   directions.forEach(([rowDirection, colDirection]) => {
//     let newRow = row + rowDirection
//     let newCol = col + colDirection

//     while (isOnBoard(newRow, newCol)) {
//       posiblesMoves.push([newRow, newCol])
//       if (chessBoard[newRow][newCol][0] !== '') break
//       newRow += rowDirection
//       newCol += colDirection
//     }
//   })

//   return posiblesMoves
// }

// function bishopMove (chessBoard, row, col) {
//   const posiblesMoves = []

//   const directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
//   directions.forEach(([rowDirection, colDirection]) => {
//     let newRow = row + rowDirection
//     let newCol = col + colDirection

//     while (isOnBoard(newRow, newCol)) {
//       posiblesMoves.push([newRow, newCol])
//       if (chessBoard[newRow][newCol][0] !== '') break
//       newRow += rowDirection
//       newCol += colDirection
//     }
//   })

//   return posiblesMoves
// }

// function knightMove (chessBoard, row, col) {
//   const posiblesMoves = []

//   const directions = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]]
//   directions.forEach(([rowDirection, colDirection]) => {
//     const newRow = row + rowDirection
//     const newCol = col + colDirection

//     if (isOnBoard(newRow, newCol)) {
//       posiblesMoves.push([newRow, newCol])
//     }
//   })

//   return posiblesMoves
// }

// function kingMove (chessBoard, row, col, castle) {
//   const posiblesMoves = []
//   const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]

//   directions.forEach(([rowDirection, colDirection]) => {
//     const newRow = row + rowDirection
//     const newCol = col + colDirection

//     if (whatColorIsAttackingThatCell(chessBoard, row, col, newRow, newCol)) {
//       posiblesMoves.push([newRow, newCol])
//     }
//   })

//   if (!chessBoard[row][col][3] && castle) {
//     const castlingMoves = castling(chessBoard, row, col)
//     posiblesMoves.push(...castlingMoves)
//   }

//   return posiblesMoves
// }

// function castling (chessBoard, row, col) {
//   const rookFeatures = [[0, -1], [7, 1]]
//   const castlingMoves = []

//   rookFeatures.forEach(rook => {
//     const rookCol = rook[0]
//     const direction = rook[1]

//     if (chessBoard[row][rookCol][3] === false) {
//       let newCol = col + direction

//       while (chessBoard[row][newCol][0] === '' && whatColorIsAttackingThatCell(chessBoard, row, col, row, newCol)) {
//         newCol += direction
//       }

//       if (newCol === rookCol) {
//         castlingMoves.push([row, col + 2 * direction])
//       }
//     }
//   })
//   return castlingMoves
// }

// function whatColorIsAttackingThatCell (chessBoard, row, col, cellRow, cellCol) {
//   const pieceColor = chessBoard[row][col][0][0]

//   if (!isOnBoard(cellRow, cellCol)) {
//     return false
//   }

//   for (const piece of chessBoard[cellRow][cellCol][2]) {
//     if (piece[0] !== pieceColor) {
//       return false
//     }
//   }
//   return true
// }