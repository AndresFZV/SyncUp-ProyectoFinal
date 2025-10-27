import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <section className="home">
      <div className="content">
        <h1>Donde cada nota encuentra su conexión.</h1>
        <p>Explora, comparte y sincroniza tu mundo musical con personas que vibran como tú.</p>
        <button className="btn-main" onClick={() => navigate("/registro")}>
          Pruébalo gratis
        </button>
      </div>
      <div className="background-shape"></div>
    </section>
  );
}

export default Home;
