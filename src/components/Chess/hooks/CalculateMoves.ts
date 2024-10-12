type posiblesMoves = ChessBoardCell['coordinates'][]

export function calculateAvailableMoves(
  selectedCell: ChessBoardCell, 
  chessBoard: ChessBoardState['chessBoardpositions']
): ChessBoardCell['coordinates'][] {
  const { col, row } = selectedCell.coordinates;
  const pieceColor = chessBoard[row][col].piece[0];

  const futurePossibleMoves = calculateFuturesMoves(selectedCell, chessBoard, false, true);
  console.log(futurePossibleMoves)
  const possibleMoves = futurePossibleMoves.filter(({ row: r, col: c }) => {
    return chessBoard[r][c].piece[0] !== pieceColor;
  })

  return possibleMoves;
}

export function calculateFuturesMoves(
    selectedCell: ChessBoardCell, 
    chessBoard: ChessBoardState['chessBoardpositions'],
    CheckingPawnAttacks = true,
    castle = false
  ): posiblesMoves {
    let posiblesMoves: posiblesMoves = []

    const selectedCoordinates = selectedCell.coordinates
    const pieceType = selectedCell.piece[1]

    if (pieceType === 'R') {
      posiblesMoves = rookMove(chessBoard, selectedCoordinates)
    } else if (pieceType === 'B') {
      posiblesMoves = bishopMove(chessBoard, selectedCoordinates)
    } else if (pieceType === 'N') {
      posiblesMoves = knightMove(selectedCoordinates)
    } else if (pieceType === 'Q') {
      posiblesMoves = bishopMove(chessBoard, selectedCoordinates).concat(rookMove(chessBoard, selectedCoordinates))
    } else if (pieceType === 'K') {
      posiblesMoves = kingMove(chessBoard, selectedCoordinates, castle)
    } 
    else if (pieceType === 'P') {
      posiblesMoves = pawnMove(selectedCell, chessBoard, selectedCoordinates, CheckingPawnAttacks)
    }
  return posiblesMoves
}

function isOnBoard (row: number, col: number, boardSize = 8) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize
}

function rookMove(chessBoard: ChessBoardState['chessBoardpositions'], selectedCoordinates: ChessBoardCell['coordinates']): ChessBoardCell['coordinates'][] {
  const { col, row } = selectedCoordinates 
  const posiblesMoves: posiblesMoves = []

  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  directions.forEach(([rowDirection, colDirection]) => {
    let newRow = row + rowDirection
    let newCol = col + colDirection

    while (isOnBoard(newRow, newCol)) {
      posiblesMoves.push({ row: newRow, col: newCol })
      if (chessBoard[newRow][newCol].piece !== '') break
      newRow += rowDirection
      newCol += colDirection
    }
  })

  return posiblesMoves
}

function pawnMove (pieceCell: ChessBoardCell, chessBoard: ChessBoardState['chessBoardpositions'], selectedCoordinates: ChessBoardCell['coordinates'],CheckingPawnAttacks: boolean,): ChessBoardCell['coordinates'][] {
  const { col, row } = selectedCoordinates 
  const posiblesMoves: posiblesMoves = []
  const firstMove = pieceCell.hasMoved
  const pieceColor = pieceCell.piece[0]
  const direction = pieceColor === 'W' ? -1 : 1

  if (!CheckingPawnAttacks && isOnBoard(row + direction, col) && chessBoard[row + direction][col].piece === '') {
    posiblesMoves.push({ row: row + direction, col: col })

    if (!firstMove && chessBoard[row + 2 * direction][col].piece === '') {
      posiblesMoves.push({ row: row + 2 * direction, col: col })
    }
  }

  const possibleColumns = [col + 1, col - 1]
  possibleColumns.forEach(column => {
    const targetRow = row + direction
    if (isOnBoard(targetRow, column) && (CheckingPawnAttacks || chessBoard[targetRow][column].piece !== '')) {
      posiblesMoves.push({ row: targetRow, col: column})
    }
  })

  return posiblesMoves
}

function bishopMove (chessBoard: ChessBoardState['chessBoardpositions'], selectedCoordinates: ChessBoardCell['coordinates']): ChessBoardCell['coordinates'][] {
  const posiblesMoves: posiblesMoves = []
  const { col, row } = selectedCoordinates 

  const directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
  directions.forEach(([rowDirection, colDirection]) => {
    let newRow = row + rowDirection
    let newCol = col + colDirection

    while (isOnBoard(newRow, newCol)) {
      posiblesMoves.push({ row: newRow, col: newCol })
      if (chessBoard[newRow][newCol].piece !== '') break
      newRow += rowDirection
      newCol += colDirection
    }
  })

  return posiblesMoves
}

function knightMove (selectedCoordinates: ChessBoardCell['coordinates']): ChessBoardCell['coordinates'][] {
  const posiblesMoves: posiblesMoves = []
  const { col, row } = selectedCoordinates 

  const directions = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]]
  directions.forEach(([rowDirection, colDirection]) => {
    const newRow = row + rowDirection
    const newCol = col + colDirection

    if (isOnBoard(newRow, newCol)) {
      posiblesMoves.push({ row: newRow, col: newCol })
    }
  })

  return posiblesMoves
}

function kingMove (
    chessBoard: ChessBoardState['chessBoardpositions'], 
    selectedCoordinates: ChessBoardCell['coordinates'],
    castle: boolean): ChessBoardCell['coordinates'][] {
  
  console.log(castle)
  const posiblesMoves: posiblesMoves = []
  const { col, row } = selectedCoordinates 
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  directions.forEach(([rowDirection, colDirection]) => {
    const newRow = row + rowDirection
    const newCol = col + colDirection

    if (!isCellUnderAttackByOppositeColor(chessBoard, row, col, newRow, newCol)) {
      posiblesMoves.push({ row: newRow, col: newCol })      
    }
  })

  if (!chessBoard[row][col].hasMoved && castle) {
    const castlingMoves = castling(chessBoard, row, col)
    posiblesMoves.push(...castlingMoves)
  }

  return posiblesMoves
}

function castling (chessBoard: ChessBoardPositions, row: number, col: number) {
  const rookFeatures = [[0, -1], [7, 1]]
  const castlingMoves: ChessBoardCell['coordinates'][] = []

  rookFeatures.forEach(rook => {
    const rookCol = rook[0]
    const direction = rook[1]

    if (chessBoard[row][rookCol].hasMoved === false) {
      let newCol = col + direction

      while (chessBoard[row][newCol].piece === '' && !isCellUnderAttackByOppositeColor(chessBoard, row, col, row, newCol)) {
        newCol += direction
      }

      if (newCol === rookCol) {
        castlingMoves.push({row: row, col: col + 2 * direction})
      }
    }
  })
  return castlingMoves
}

function isCellUnderAttackByOppositeColor (chessBoard: ChessBoardState['chessBoardpositions'], row: number, col: number, cellRow: number, cellCol: number) {
  const pieceColor = chessBoard[row][col].piece[0]

  if (!isOnBoard(cellRow, cellCol)) {
    return true
  }

  for (const piece of chessBoard[cellRow][cellCol].isUnderAttackBy) {
    if (piece[0] !== pieceColor) {
      return true
    }
  }
  return false
}