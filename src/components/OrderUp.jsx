import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import orderUpImage from "../assets/order-up-home.png";
import toadChefImage from "../assets/toad-chef.png";
import { orders } from "../data/orders";
import { createOrderDatabase } from "../data/orderDatabase";

const startingQuery = `SELECT
    orders.order_id,
    orders.table_number,
    orders.item,
    servers.username AS server
FROM orders
INNER JOIN servers
    ON orders.table_number = servers.table_number;`;

const openingDialogue = [
    "Thank goodness you're here. Something's wrong with the kitchen orders.",
    "The servers swear they're putting everything in, but every night at least one order vanishes before it reaches my list.",
    "We don't catch it until some poor soul starts hollering that their supper never came.",
    "Our servers tonight are Roland Groff, Parlance Hark, and Nealith Ull.",
    "We have orders from tables 1, 2, 4, and 6.",
    "We need the data to show order id, table number, item, and the server's username in order to make it to the cooks.",
    "This is the query I've been using. I can't see what's wrong with it.",
    "Four orders were placed tonight. Why am I only seeing three?",
];

const successDialogue = [
    "Wait! Four! You've got four!",
    "There's the missing roast hen!",
    "And look at that... there's no server attached to it.",
    "Now we know where to start. Thank you!",
];

const requiredOrderIds = new Set([101, 102, 103, 104]);

function foundAllOrdersWithLeftJoin(query, results) {
    if (!/\bLEFT\s+(?:OUTER\s+)?JOIN\b/i.test(query)) return false;

    return results.some((result) => {
        const foundIds = new Set(
            result.values.flatMap((row) => row.filter((value) =>
                (typeof value === "number" || typeof value === "string") &&
                requiredOrderIds.has(Number(value))
            ).map(Number))
        );
        return [...requiredOrderIds].every((id) => foundIds.has(id));
    });
}

function OrderUp() {
    const databaseRef = useRef(null);
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [solved, setSolved] = useState(false);
    const [query, setQuery] = useState(startingQuery);
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
                setResults(databaseRef.current.exec(startingQuery));
                setHasRunQuery(true);
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

    const dialogue = solved ? successDialogue : openingDialogue;

    function talkToChef() {
        setDialogueIndex((current) => current === null ? 0 : (current + 1) % dialogue.length);
    }

    function clearSpeechOnBackgroundClick(event) {
        if (!event.target.closest(".order-up-sql, button, a")) {
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

        if (/^\s*SELECT\s+\*\s+FROM\s+orders\s*;?\s*$/i.test(query)) {
            setQueryError("Expected result exceeds row limit. Select the columns you need instead.");
            setResults([]);
            setHasRunQuery(false);
            return;
        }

        try {
            const nextResults = databaseRef.current.exec(query);
            setResults(nextResults);
            setQueryError(null);
            setHasRunQuery(true);
            if (!solved && foundAllOrdersWithLeftJoin(query, nextResults)) {
                setSolved(true);
                setDialogueIndex(0);
            }
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
            <div className="order-up-chef">
                <button
                    className="order-up-chef-button"
                    type="button"
                    onClick={talkToChef}
                    aria-label={dialogueIndex === null ? "Talk to Toad" : "Hear more from Toad"}
                    aria-expanded={dialogueIndex !== null}
                >
                    <img src={toadChefImage} alt="" />
                </button>
                {dialogueIndex !== null && (
                    <div className="dynamic-speech order-up-chef-speech" aria-live="polite" aria-atomic="true">
                        <p>{dialogue[dialogueIndex]}</p>
                        <button className="order-up-dialogue-next" type="button" aria-label="Next dialogue" onClick={() => setDialogueIndex((dialogueIndex + 1) % dialogue.length)}>&gt;</button>
                    </div>
                )}
            </div>
            <section className="kitchen-orders" aria-labelledby="kitchen-orders-heading">
                <h2 id="kitchen-orders-heading">Kitchen Orders</h2>
                {orders.map((order) => (
                    <div className="kitchen-order" key={order.orderId}>
                        <span>#{order.orderId} {order.item}</span>
                        <span>Table {order.tableNumber}</span>
                    </div>
                ))}
            </section>
            <div className="order-up-sql">
                <p>Toad's kitchen query shows three orders. Can you find the missing one?</p>
                <label htmlFor="order-up-query">SQL query</label>
                <textarea
                    id="order-up-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows="8"
                    spellCheck="false"
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
                                                {row.map((value, columnIndex) => <td key={columnIndex}>{value === null ? "—" : String(value)}</td>)}
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
