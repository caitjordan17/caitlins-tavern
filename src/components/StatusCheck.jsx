import { Link } from "react-router-dom";

function StatusCheck() {
    return (
        <main className="game-page">
            <h1>Status Check!</h1>
            <p>An API minigame</p>

            <Link to="/">Back to the Tavern</Link>
        </main>
    );
}

export default StatusCheck;