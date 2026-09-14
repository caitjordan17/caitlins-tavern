import { Link } from "react-router-dom";

function MenuBoard() {
    return (
        <section className="menu-board" aria-label="Menu board">
            <Link to="/order-up">
                <span className="menu-board-title">Order-Up</span>
                <span className="menu-board-subtitle">a SQL mini game</span>
            </Link>
        </section>
    );
}

export default MenuBoard;
