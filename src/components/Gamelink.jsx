import { Link } from "react-router-dom";

function GameLink({ title, subtitle, path }) {
    return (
        <Link className="game-link" to={path}>
            <strong>{title}</strong>
            <span>{subtitle}</span>
        </Link>
    );
}

export default GameLink;