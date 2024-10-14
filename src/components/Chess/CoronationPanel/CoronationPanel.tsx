import './CoronationPanel.css'
import { useChessManager } from '../store/useChessManager'

export function CoronationPanel({ cords }: { cords: { col: number, row: number } }) {
    const turn = useChessManager((state) => state.turn)
    const makeCoronation = useChessManager((state) => state.makeCoronation)

    const handleCoronationSelection = ({ src }: { src: string, alt: string }) => {
        const piece = src.slice(-6, -4)
        console.log(piece)
        makeCoronation(piece)
    }
    
    

    const pieces = [
        { src: `/Pieces/${turn}Q.svg`, alt: 'White Queen' },
        { src: `/Pieces/${turn}R.svg`, alt: 'White Rook' },
        { src: `/Pieces/${turn}B.svg`, alt: 'White Bishop' },
        { src: `/Pieces/${turn}N.svg`, alt: 'White Knight' }
    ]

    const top = cords.row === 0 ? '0%' : '50%'
    const left = `${cords.col * 12.5}%`

    return (
        <div className="coronation-panel" style={{ top, left }}>
            {pieces.map((piece, index) => (
                <div onClick={() => handleCoronationSelection(piece)} key={index}>
                    <img src={piece.src} alt={piece.alt} />
                </div>
            ))}
        </div>
    )
}
