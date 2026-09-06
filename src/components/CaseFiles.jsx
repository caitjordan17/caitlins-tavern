import { Link } from "react-router-dom";

function CaseFiles() {
    return (
        <main className="game-page">
            <h1>Case Files</h1>
            <p>A data mystery</p>

            <Link to="/">Back to the Tavern</Link>
        </main>
    );
}

export default CaseFiles;
