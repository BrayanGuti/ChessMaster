import './HomePage.css'
import { Header } from '../../components/Header/Header'
import { Footer } from '../../components/Footer/Footer'
import { ChessBoard } from '../../components/Chess/ChessBoard/ChessBoard'

export function HomePage() {

  return (
    <>
      <Header/>
      <ChessBoard/>
      <Footer/>
    </>
  )
}

