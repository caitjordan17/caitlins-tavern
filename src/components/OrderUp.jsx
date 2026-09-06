import { Link } from "react-router-dom";

function OrderUp() {
    return (
        <main className="game-page">
            <h1>Order Up!</h1>
            <p>A SQL Minigame</p>

            <Link to="/">Back to the Tavern</Link>
        </main>
    );
}

export default OrderUp;
