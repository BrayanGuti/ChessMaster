interface ChessBoardCell {
    piece: 'BRa8' | 'BNb8' | 'BBc8' | 'BQd8' | 'BKe8' | 'BBf8' | 'BNg8' | 'BRh8' |
           'BPa7' | 'BPb7' | 'BPc7' | 'BPd7' | 'BPe7' | 'BPf7' | 'BPg7' | 'BPh7' |
           'WPa2' | 'WPb2' | 'WPc2' | 'WPd2' | 'WPe2' | 'WPf2' | 'WPg2' | 'WPh2' |
           'WRa1' | 'WNb1' | 'WBc1' | 'WQd1' | 'WKe1' | 'WBf1' | 'WNg1' | 'WRh1' | ''
    YouCanMoveHere: boolean
    isUnderAttack: string[]
    hasMoved: boolean
    cellName: 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' |
              'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
              'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
              'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
              'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
              'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
              'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
              'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'
  }
  
  type ChessBoardPositions = Array<Array<ChessBoardCell>>
  