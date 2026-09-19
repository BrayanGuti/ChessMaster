import './HomePage.css'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'
import { HeroSection } from './HeroSection/HeroSection'
import { GameSection } from './GameSection/GameSection'
import { GetStartedSection } from './GetStartedSection/GetStartedSection'
import { CreatorSection } from './CreatorSection/CreatorSection'
import { CreditsSection } from './CreditsSection/CreditsSection'


export function HomePage() {
  return (
    <div className="HomePage-container">
      <Header />
      <HeroSection />
      <GameSection />
      <GetStartedSection />
      <CreatorSection />
      <CreditsSection />
      <Footer />
    </div>
  )
}


