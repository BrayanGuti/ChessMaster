import { ChessBoardCell, ChessBoardPositions, ChessBoardState } from "../store/types";

type PossibleMoves = ChessBoardCell['coordinates'][]

/**
 * Moves a piece could make (not yet filtered for king safety).
 * `enPassant` is the square a pawn may capture on en passant (see getEnPassantTarget), if any.
 */
export function calculateAvailableMoves(
  selectedCell: ChessBoardCell,
  chessBoard: ChessBoardState['chessBoardpositions'],
  enPassant: ChessBoardCell['coordinates'] | null = null
): ChessBoardCell['coordinates'][] {
  const { col, row } = selectedCell.coordinates;
  const pieceColor = chessBoard[row][col].piece[0];

  const futurePossibleMoves = calculateFuturesMoves(selectedCell, chessBoard, true, false, enPassant);
  const possibleMoves = futurePossibleMoves.filter(({ row: r, col: c }) => {
    return chessBoard[r][c].piece[0] !== pieceColor;
  })

  return possibleMoves;
}

export function calculateFuturesMoves(
    selectedCell: ChessBoardCell, 
    chessBoard: ChessBoardState['chessBoardpositions'],
    castle = false,
    checkingAttacks = true,
    enPassant: ChessBoardCell['coordinates'] | null = null
  ): PossibleMoves {
    let possibleMoves: PossibleMoves = []

    const selectedCoordinates = selectedCell.coordinates
    const pieceType = selectedCell.piece[1]

    if (pieceType === 'R') {
      possibleMoves = rookMove(chessBoard, selectedCoordinates, checkingAttacks)
    } else if (pieceType === 'B') {
      possibleMoves = bishopMove(chessBoard, selectedCoordinates, checkingAttacks)
    } else if (pieceType === 'N') {
      possibleMoves = knightMove(selectedCoordinates)
    } else if (pieceType === 'Q') {
      possibleMoves = bishopMove(chessBoard, selectedCoordinates, checkingAttacks).concat(rookMove(chessBoard, selectedCoordinates, checkingAttacks))
    } else if (pieceType === 'K') {
      possibleMoves = kingMove(chessBoard, selectedCoordinates, castle)
    } 
    else if (pieceType === 'P') {
      possibleMoves = pawnMove(selectedCell, chessBoard, selectedCoordinates, checkingAttacks, enPassant)
    }
  return possibleMoves
}

function pawnMove (pieceCell: ChessBoardCell, chessBoard: ChessBoardState['chessBoardpositions'], selectedCoordinates: ChessBoardCell['coordinates'], checkingAttacks: boolean, enPassant: ChessBoardCell['coordinates'] | null = null): ChessBoardCell['coordinates'][] {
  const { col, row } = selectedCoordinates 
  const possibleMoves: PossibleMoves = []
  const firstMove = pieceCell.hasMoved
  const pieceColor = pieceCell.piece[0]
  const direction = pieceColor === 'W' ? -1 : 1

  if (!checkingAttacks && isOnBoard(row + direction, col) && chessBoard[row + direction][col].piece === '') {
    possibleMoves.push({ row: row + direction, col: col })

    if (!firstMove && ((chessBoard[row][col].piece[0] === 'W' && row === 6) || (chessBoard[row][col].piece[0] === 'B' && row === 1))  && chessBoard[row + 2 * direction][col].piece === '') {
      possibleMoves.push({ row: row + 2 * direction, col: col })
    }
  }

  const possibleColumns = [col + 1, col - 1]
  possibleColumns.forEach(column => {
    const targetRow = row + direction
    const isEnPassant = enPassant !== null && enPassant.row === targetRow && enPassant.col === column
    if (isOnBoard(targetRow, column) && (checkingAttacks || chessBoard[targetRow][column].piece !== '' || isEnPassant)) {
      possibleMoves.push({ row: targetRow, col: column})
    }
  })

  return possibleMoves
}

function bishopMove (chessBoard: ChessBoardState['chessBoardpositions'], selectedCoordinates: ChessBoardCell['coordinates'], checkingAttacks: boolean): ChessBoardCell['coordinates'][] {
  const possibleMoves: PossibleMoves = []
  const { col, row } = selectedCoordinates 

  const directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
  directions.forEach(([rowDirection, colDirection]) => {
    let newRow = row + rowDirection
    let newCol = col + colDirection

    while (isOnBoard(newRow, newCol)) {
      possibleMoves.push({ row: newRow, col: newCol })
      if(checkingAttacks && chessBoard[newRow][newCol].piece[1] === 'K' && chessBoard[newRow][newCol].piece[0] !== chessBoard[row][col].piece[0]){
        if(isOnBoard(newRow + rowDirection, newCol + colDirection)){
          possibleMoves.push({ row: newRow + rowDirection, col: newCol + colDirection })
        }
      }

      if (chessBoard[newRow][newCol].piece !== '') break
      newRow += rowDirection
      newCol += colDirection
    }
  })

  return possibleMoves
}

function knightMove (selectedCoordinates: ChessBoardCell['coordinates']): ChessBoardCell['coordinates'][] {
  const possibleMoves: PossibleMoves = []
  const { col, row } = selectedCoordinates 

  const directions = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]]
  directions.forEach(([rowDirection, colDirection]) => {
    const newRow = row + rowDirection
    const newCol = col + colDirection

    if (isOnBoard(newRow, newCol)) {
      possibleMoves.push({ row: newRow, col: newCol })
    }
  })

  return possibleMoves
}

function kingMove (
    chessBoard: ChessBoardState['chessBoardpositions'], 
    selectedCoordinates: ChessBoardCell['coordinates'],
    castle: boolean): ChessBoardCell['coordinates'][] {
  
  const possibleMoves: PossibleMoves = []
  const { col, row } = selectedCoordinates 
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  directions.forEach(([rowDirection, colDirection]) => {
    const newRow = row + rowDirection
    const newCol = col + colDirection

    if (!isCellUnderAttackByOppositeColor(chessBoard, row, col, newRow, newCol)) {
      possibleMoves.push({ row: newRow, col: newCol })      
    }
  })

  if (!chessBoard[row][col].hasMoved && castle) {
    const castlingMoves = castling(chessBoard, row, col)
    possibleMoves.push(...castlingMoves)
  }

  return possibleMoves
}

function castling (chessBoard: ChessBoardPositions, row: number, col: number) {
  const castlingMoves: ChessBoardCell['coordinates'][] = []
  const turn = chessBoard[row][col].piece[0]

  if(col === 4 && (row === 0 || row === 7)){
    const rookFeatures = [[0, -1], [7, 1]]

    rookFeatures.forEach(rook => {
      const rookCol = rook[0]
      const direction = rook[1]
      const rookCell = chessBoard[row][rookCol]

      if (rookCell.piece[0] === turn && rookCell.piece[1] === 'R' && rookCell.hasMoved === false) {
        let newCol = col + direction

        while (isOnBoard(row, newCol) && chessBoard[row][newCol].piece === '' && !isCellUnderAttackByOppositeColor(chessBoard, row, col, row, newCol)) {
          newCol += direction
        }

        if (newCol === rookCol) {
          castlingMoves.push({row: row, col: col + 2 * direction})
        }
      }
    })
  }

  return castlingMoves
}

function isCellUnderAttackByOppositeColor (chessBoard: ChessBoardState['chessBoardpositions'], row: number, col: number, cellRow: number, cellCol: number) {
  const pieceColor = chessBoard[row][col].piece[0]

  if (!isOnBoard(cellRow, cellCol)) {
    return true
  }

  for (const chessCell of chessBoard[cellRow][cellCol].isUnderAttackBy) {
    if (chessCell.piece[0] !== pieceColor) {
      return true
    }
  }
  return false
}

function isOnBoard (row: number, col: number, boardSize = 8) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize
}

function rookMove(chessBoard: ChessBoardState['chessBoardpositions'], selectedCoordinates: ChessBoardCell['coordinates'], checkingAttacks:boolean): ChessBoardCell['coordinates'][] {
  const { col, row } = selectedCoordinates 
  const possibleMoves: PossibleMoves = []

  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  directions.forEach(([rowDirection, colDirection]) => {
    let newRow = row + rowDirection
    let newCol = col + colDirection

    while (isOnBoard(newRow, newCol)) {
      possibleMoves.push({ row: newRow, col: newCol })
      if(checkingAttacks && chessBoard[newRow][newCol].piece[1] === 'K' && chessBoard[newRow][newCol].piece[0] !== chessBoard[row][col].piece[0]){
        if(isOnBoard(newRow + rowDirection, newCol + colDirection)){
          possibleMoves.push({ row: newRow + rowDirection, col: newCol + colDirection })
        }
      }
      if (chessBoard[newRow][newCol].piece !== '') break
      newRow += rowDirection
      newCol += colDirection
    }
  })

  return possibleMoves
}