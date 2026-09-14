import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import orderUpImage from "../assets/order-up-home.png";
import toadChefImage from "../assets/toad-chef.png";
import { orders } from "../data/orders";
import { createOrderDatabase } from "../data/orderDatabase";

const chefDialogue = [
    "We've got id, customer, item, table, status, and minutes_waiting in our orders database.",
    "Which table number has id 101?",
    "Any idea who's waited the longest?",
    "Well good! Grimble stole my favorite spoon. He can wait a little longer.",
];

function OrderUp() {
    const databaseRef = useRef(null);
    const [dialogueIndex, setDialogueIndex] = useState(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [hasRunQuery, setHasRunQuery] = useState(false);
    const [queryError, setQueryError] = useState(null);
    const [databaseStatus, setDatabaseStatus] = useState("loading");

    useEffect(() => {
        let cancelled = false;

        initSqlJs({ locateFile: () => sqlWasmUrl })
            .then((SQL) => {
                if (cancelled) return;
                databaseRef.current = createOrderDatabase(SQL);
                setDatabaseStatus("ready");
            })
            .catch((error) => {
                if (!cancelled) {
                    setDatabaseStatus("error");
                    setQueryError(`SQLite could not load: ${error.message}`);
                }
            });

        return () => {
            cancelled = true;
            databaseRef.current?.close();
            databaseRef.current = null;
        };
    }, []);

    function talkToChef() {
        setDialogueIndex((current) => current === null ? 0 : (current + 1) % chefDialogue.length);
    }

    function clearSpeechOnBackgroundClick(event) {
        if (!event.target.closest("button, a, .order-up-sql")) {
            setDialogueIndex(null);
        }
    }

    function runQuery() {
        if (!databaseRef.current) return;

        if (!query.trim()) {
            setQueryError("Enter a SQL query first.");
            setResults([]);
            setHasRunQuery(false);
            return;
        }

        try {
            setResults(databaseRef.current.exec(query));
            setQueryError(null);
            setHasRunQuery(true);
        } catch (error) {
            setResults([]);
            setHasRunQuery(false);
            setQueryError(error.message);
        }
    }

    return (
        <main className="order-up-page" aria-label="Order Up SQL minigame" onClick={clearSpeechOnBackgroundClick}>
            <img className="order-up-background" src={orderUpImage} alt="" />
            <div className="kitchen-board-eraser" aria-hidden="true" />
            <Link className="order-up-back" to="/">Back to the Tavern</Link>
            <button
                className="order-up-chef"
                type="button"
                onClick={talkToChef}
                aria-label={dialogueIndex === null ? "Talk to the toad chef" : "Hear more from the toad chef"}
                aria-expanded={dialogueIndex !== null}
            >
                <img src={toadChefImage} alt="" />
                {dialogueIndex !== null && (
                    <span className="dynamic-speech order-up-chef-speech" aria-live="polite" aria-atomic="true">
                        {chefDialogue[dialogueIndex]}
                    </span>
                )}
            </button>
            <section className="kitchen-orders" aria-labelledby="kitchen-orders-heading">
                <h2 id="kitchen-orders-heading">Kitchen Orders</h2>
                {orders.map((order) => (
                    <div className="kitchen-order" key={order.id}>
                        <span>#{order.id} {order.item}</span>
                        <span>{order.status}</span>
                    </div>
                ))}
            </section>
            <div className="order-up-sql">
                <p>Toad needs all orders that are still waiting.</p>

                <label htmlFor="order-up-query">SQL query</label>
                <textarea
                    id="order-up-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask Toad for help..."
                    rows="5"
                />

                <button type="button" onClick={runQuery} disabled={databaseStatus !== "ready"}>
                    {databaseStatus === "loading" ? "Loading SQLite…" : "Run Query"}
                </button>
                {queryError && <p className="order-up-error" role="alert">{queryError}</p>}
                {hasRunQuery && (
                    <section className="order-up-results" aria-live="polite">
                        <h3>Query Results</h3>
                        {results.length === 0 ? (
                            <p>No rows returned.</p>
                        ) : results.map((result, resultIndex) => (
                            <div className="order-up-result-table" key={resultIndex}>
                                <table>
                                    <thead>
                                        <tr>{result.columns.map((column, index) => <th key={`${column}-${index}`} scope="col">{column}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {result.values.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((value, columnIndex) => <td key={columnIndex}>{value === null ? "NULL" : String(value)}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}

export default OrderUp;
