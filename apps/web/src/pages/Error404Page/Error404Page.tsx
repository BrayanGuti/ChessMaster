import './Error404Page.css'

export function Error404Page() {
  return (
    <div className="chess-error404">
      <div className="chessboard404">
        <div className="row404">
          <div className="square404 white404"></div>
          <div className="square404 black404"></div>
          <div className="square404 white404"></div>
          <div className="square404 black404 king404"></div>
        </div>
        <div className="row404">
          <div className="square404 black404"></div>
          <div className="square404 white404"></div>
          <div className="square404 black404"></div>
          <div className="square404 white404"></div>
        </div>
        <div className="row404">
          <div className="square404 white404"></div>
          <div className="square404 black404 knight404"></div>
          <div className="square404 white404"></div>
          <div className="square404 black404"></div>
        </div>
        <div className="row404">
          <div className="square404 black404"></div>
          <div className="square404 white404"></div>
          <div className="square404 black404 pawn404"></div>
          <div className="square404 white404"></div>
        </div>
      </div>
      <div className="error-message404">
        <h1>Error 404</h1>
        <p>¡Jaque mate! La página que buscas ha sido capturada.</p>
        <a href="/" className="home-link404">Volver al inicio</a>
      </div>
    </div>
  )
}
