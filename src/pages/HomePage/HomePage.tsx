import './HomePage.css'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'
import { Main } from './Main/Main'


export function HomePage() {
  return (
    <div className="HomePage-container">
      <Header />
      <Main />
      <Footer />
    </div>
  )
}


