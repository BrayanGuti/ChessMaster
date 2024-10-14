interface ChessBoardCell {
    piece: string
    YouCanMoveHere: boolean
    isUnderAttackBy: string[]
    hasMoved: boolean
    cellName: 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' |
              'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
              'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
              'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
              'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
              'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
              'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
              'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'
  
    coordinates: { col: number, row: number }       
}
  
interface ChessBoardState {
    chessBoardpositions: ChessBoardPositions;
    cellOfPieceSelected: ChessBoardCell | null;
    coronation: {
        status: boolean;
        coordinates: { col: number; row: number };
    }
    turn: 'W' | 'B';
    
    selectPieceToMove: (cellInformation: ChessBoardCell) => void;
    
    clickCell: (cellInformation: ChessBoardCell) => void;
    
    movePiece: (selectedCoordinates: { col: number; row: number }) => void;
    
    showAvailableMoves: (coordsOfAvailableMoves: { col: number; row: number }[]) => void;
    
    removeAvailableMoves: () => void;
    
    updateCellsUnderAttack: () => void;

    isCoronation: (destinyCoords: { col: number; row: number }) => void;

    // isCheckMate: boolean 

    // historialMoves: string[] --> implementar a futuro
}

type ChessBoardPositions = Array<Array<ChessBoardCell>>
