import { Link } from "react-router-dom";

function UnderConstruction({ title }) {
    return (
        <main className="construction-page">
            <div className="construction-sign">
                <p className="construction-small">Caitlin's Tavern</p>
                <h1>{title}</h1>

                <div className="construction-icon">⚒</div>

                <h2>Tavern room under construction</h2>

                <p>
                    The door is here, but the room isn't quite ready for guests yet.
                </p>

                <Link to="/" className="back-to-tavern">
                    Return to the Tavern
                </Link>
            </div>
        </main>
    );
}

export default UnderConstruction;