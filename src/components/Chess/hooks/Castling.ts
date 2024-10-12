export function isCastling (KingCoords: ChessBoardCell["coordinates"], destinyCoords: ChessBoardCell["coordinates"], chessBoard: ChessBoardPositions) {
    let chessBoardCopy = null

    if (chessBoard[KingCoords.row][KingCoords.col].piece[1] === 'K' && (KingCoords.row === 0 || KingCoords.row === 7) && KingCoords.col === 4) {
      if (destinyCoords.row === KingCoords.row) {
        if (destinyCoords.col === 2) {
          chessBoardCopy = moveCastleRook(0, destinyCoords, chessBoard)
        } else if (destinyCoords.col === 6) {
          chessBoardCopy = moveCastleRook(7, destinyCoords, chessBoard)
        }
      }
    }

    return chessBoardCopy
  }
  
  function moveCastleRook (rookColumn: number, destinyCoords: ChessBoardCell["coordinates"], chessBoard: ChessBoardPositions, turn = 'W') {
    const row = destinyCoords.row
    const column = rookColumn
  
    const direction = destinyCoords.col === 2 ? 1 : -1
  
    console.log('direction', direction)
    const newColumn = destinyCoords.col + direction
  
    chessBoard[row][column].piece = ''
    chessBoard[row][column].hasMoved = true
    chessBoard[row][newColumn].piece = `${turn}R`

    return chessBoard
  }