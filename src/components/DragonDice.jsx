import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import dragonDiceImage from "../assets/dragon-dice.png";
import { createGame, endTurn, finishRoll, prepareRoll, selectedPoints, toggleDie } from "../data/dragonDiceGame";

const scoring = [
    ["1", "Copper", "100"],
    ["5", "Tankard", "50"],
    ["10", "Silver", "100"],
    ["15", "Crown", "150"],
    ["20", "Dragon Egg", "200"],
    ["Three 1s", "Three Coppers", "1,000"],
    ["Three of any other number", "Three of a Kind", "Face value × 100"],
    ["Four of a kind", "Four of a Kind", "1,000"],
    ["Five of a kind", "Five of a Kind", "2,000"],
    ["Six of a kind", "Six of a Kind", "3,000"],
    ["Three pairs", "Full Tavern", "1,500"],
    ["1, 5, 10, 15 & 20", "Adventurer’s Run", "1,500"],
];

function turnHint(game, rolling, pickedPoints) {
    if (rolling) return "The dice are rolling…";
    if (game.phase === "finished") return game.message;
    if (game.phase === "ready") {
        return game.dice.length === 0 ? game.message : `${game.message} Roll the dice to begin.`;
    }
    if (game.selected.some(Boolean)) {
        return pickedPoints === null
            ? "One or more selected dice do not score. Change your selection."
            : `Keep those dice! Roll Again to build your score, or End Turn to bank ${(game.turnScore + pickedPoints).toLocaleString()} points.`;
    }
    return game.turnScore > 0
        ? `Select scoring dice to keep, or End Turn to bank ${game.turnScore.toLocaleString()} points.`
        : "Select at least one scoring die or combination to keep.";
}

function DragonDice() {
    const [showRules, setShowRules] = useState(true);
    const [game, setGame] = useState(createGame);
    const [displayDice, setDisplayDice] = useState([]);
    const [rolling, setRolling] = useState(false);
    const [bannerQueue, setBannerQueue] = useState([]);
    const closeButtonRef = useRef(null);
    const rulesButtonRef = useRef(null);
    const rollTimerRef = useRef(null);
    const bannerButtonRef = useRef(null);
    const banner = bannerQueue[0] ?? null;

    const dismissBanner = useCallback(() => {
        setBannerQueue((current) => current.slice(1));
    }, []);

    useEffect(() => () => {
        if (rollTimerRef.current !== null) window.clearInterval(rollTimerRef.current);
    }, []);

    useEffect(() => {
        if (!showRules) return;
        closeButtonRef.current?.focus();
        function onKeyDown(event) {
            if (event.key === "Escape") {
                setShowRules(false);
                rulesButtonRef.current?.focus();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showRules]);

    useEffect(() => {
        if (!banner) return;
        bannerButtonRef.current?.focus();
        function onKeyDown(event) {
            if (event.key === "Escape" && banner.type !== "winner") dismissBanner();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [banner, dismissBanner]);

    function closeRules() {
        setShowRules(false);
        rulesButtonRef.current?.focus();
    }

    function applyGameResult(nextGame) {
        setGame(nextGame);
        if (nextGame.notices.length > 0) {
            setBannerQueue((current) => [...current, ...nextGame.notices]);
        }
    }

    function startNewGame() {
        if (rollTimerRef.current !== null) window.clearInterval(rollTimerRef.current);
        rollTimerRef.current = null;
        setGame(createGame());
        setDisplayDice([]);
        setRolling(false);
        setBannerQueue([]);
        setShowRules(false);
    }

    function bankTurn() {
        applyGameResult(endTurn(game));
    }

    function rollDice() {
        if (rolling || game.phase === "finished") return;
        const prepared = prepareRoll(game);
        if (prepared.error) {
            setGame({ ...game, message: prepared.error });
            return;
        }

        const { rollingIndices } = prepared;
        const finalDice = prepared.game.dice.length === 6 ? [...prepared.game.dice] : Array(6).fill(null);
        for (const index of rollingIndices) finalDice[index] = Math.floor(Math.random() * 20) + 1;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDisplayDice(finalDice);
            applyGameResult(finishRoll(prepared.game, finalDice, rollingIndices));
            return;
        }
        let tick = 0;
        const lastTick = 7 + (rollingIndices.length - 1) * 2;

        setGame(prepared.game);
        setRolling(true);
        setDisplayDice(finalDice.map((value, index) =>
            rollingIndices.includes(index) ? Math.floor(Math.random() * 20) + 1 : value
        ));
        rollTimerRef.current = window.setInterval(() => {
            tick += 1;
            setDisplayDice(finalDice.map((finalValue, index) =>
                !rollingIndices.includes(index) || tick >= 7 + rollingIndices.indexOf(index) * 2
                    ? finalValue
                    : Math.floor(Math.random() * 20) + 1
            ));
            if (tick >= lastTick) {
                window.clearInterval(rollTimerRef.current);
                rollTimerRef.current = null;
                applyGameResult(finishRoll(prepared.game, finalDice, rollingIndices));
                setRolling(false);
            }
        }, 70);
    }

    const pickedPoints = selectedPoints(game);

    return (
        <main className="dragon-dice-page" aria-label="Dragon's Dice">
            <img className="dragon-dice-background" src={dragonDiceImage} alt="" />
            <Link className="order-up-back" to="/">Back to the Tavern</Link>

            <div className="dragon-dice-score-area">
                <aside className="dragon-dice-scoreboard" aria-label="Score tally">
                    <h2>Score Tally</h2>
                    <p className={game.currentPlayer === 0 && game.phase !== "finished" ? "dragon-dice-active-player" : ""}>Player 1: {game.scores[0].toLocaleString()}</p>
                    <p className={game.currentPlayer === 1 && game.phase !== "finished" ? "dragon-dice-active-player" : ""}>Player 2: {game.scores[1].toLocaleString()}</p>
                    <p>Turn: {game.turnScore.toLocaleString()}</p>
                    {game.selected.some(Boolean) && <p>Selected: {pickedPoints === null ? "Invalid" : pickedPoints.toLocaleString()}</p>}
                </aside>
            </div>

            {displayDice.length > 0 && (
                <div className="dragon-dice-roll" role="group" aria-label={rolling ? "Dice rolling" : "Rolled dice"}>
                    {displayDice.map((value, index) => (
                        <button
                            className={`dragon-dice-face${rolling && !game.locked[index] ? " dragon-dice-face-rolling" : ""}${game.selected[index] ? " dragon-dice-face-selected" : ""}${game.locked[index] ? " dragon-dice-face-locked" : ""}`}
                            id={`dragon-die-${index + 1}`}
                            key={index}
                            type="button"
                            aria-label={`Die ${index + 1}: ${value}${game.locked[index] ? ", frozen" : ""}`}
                            aria-pressed={game.selected[index]}
                            disabled={rolling || game.phase !== "choose" || game.locked[index]}
                            onClick={() => setGame((current) => toggleDie(current, index))}
                        >{value}</button>
                    ))}
                </div>
            )}
            <p className="dragon-dice-hint" aria-live="polite">{turnHint(game, rolling, pickedPoints)}</p>
            <button className="dragon-dice-button dragon-dice-rules-button" type="button" ref={rulesButtonRef} onClick={() => setShowRules(true)}>Rules</button>
            <div className="dragon-dice-action-buttons">
                <button className="dragon-dice-button dragon-dice-roll-button" type="button" onClick={rollDice} disabled={rolling || game.phase === "finished"}>{rolling ? "Rolling…" : game.phase === "choose" ? "Roll Again" : "Roll Dice"}</button>
                <button className="dragon-dice-button dragon-dice-end-button" type="button" onClick={bankTurn} disabled={rolling || game.phase !== "choose"}>End Turn</button>
            </div>

            {showRules && (
                <div className="dragon-dice-rules-overlay" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeRules();
                }}>
                    <section className="dragon-dice-parchment" role="dialog" aria-modal="true" aria-labelledby="dragon-dice-rules-title">
                        <button className="dragon-dice-close" type="button" aria-label="Close rules" ref={closeButtonRef} onClick={closeRules}>×</button>
                        <h2 id="dragon-dice-rules-title">Dragon’s Dice</h2>
                        <p>A push-your-luck tavern dice game played with six twenty-sided dice.</p>

                        <h3>How to Play</h3>
                        <p>Roll all six dice.</p>
                        <p>After each roll, set aside at least one scoring die or scoring combination.</p>
                        <p>You may then choose to:</p>
                        <ul>
                            <li><strong>Roll Again</strong> with the remaining dice and keep building your turn score</li>
                            <li><strong>Bank</strong> your points and end your turn</li>
                        </ul>
                        <p>If you roll and none of the dice score, you <strong>Dragon</strong>. Your turn ends and you lose all unbanked points from that turn.</p>
                        <p>Banked points are always safe.</p>
                        <p>If all six dice score, you have <strong>Hot Dice</strong>. Pick up all six dice and roll again while keeping your current turn score.</p>

                        <h3>Scoring</h3>
                        <div className="dragon-dice-scoring-scroll">
                            <table>
                                <thead><tr><th scope="col">Roll</th><th scope="col">Tavern Name</th><th scope="col">Points</th></tr></thead>
                                <tbody>{scoring.map(([roll, name, points]) => (
                                    <tr key={roll}><td>{roll}</td><td><strong>{name}</strong></td><td>{points}</td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                        <p>For example:</p>
                        <ul>
                            <li>Three 7s = 700 points</li>
                            <li>Three 12s = 1,200 points</li>
                            <li>Three 20s = 2,000 points</li>
                        </ul>

                        <h3>Important</h3>
                        <p>Scoring combinations must be made from dice rolled at the same time.</p>
                        <p>You cannot save dice from separate rolls and combine them later to make a pair, triple, or other combination.</p>

                        <h3>Winning</h3>
                        <p>The first player to reach <strong>5,000 points</strong> triggers the final round.</p>
                        <p>The other player gets one last turn to beat the leader’s score.</p>
                        <p>The player with the highest banked score wins.</p>
                    </section>
                </div>
            )}

            {banner && (
                <div className="dragon-dice-banner-overlay" onMouseDown={(event) => {
                    if (banner.type === "dragon" && event.target === event.currentTarget) dismissBanner();
                }}>
                    <section className="dragon-dice-banner" role="dialog" aria-modal="true" aria-labelledby="dragon-dice-banner-title">
                        {banner.type === "dragon" && (
                            <button className="dragon-dice-banner-close" type="button" ref={bannerButtonRef} aria-label="Close Dragon banner" onClick={dismissBanner}>X</button>
                        )}
                        <h2 id="dragon-dice-banner-title">
                            {banner.type === "dragon" ? "Dragon!" : banner.type === "final-round" ? "5,000 Points!" : banner.winner === "tie" ? "A Tie!" : `Player ${banner.winner + 1} Wins!`}
                        </h2>
                        {banner.type === "dragon" && <p>Player {banner.player + 1} rolled no scoring dice and lost {banner.lostPoints.toLocaleString()} unbanked points.</p>}
                        {banner.type === "final-round" && <p>Player {banner.player + 1} reached {banner.score.toLocaleString()} banked points. Player {banner.nextPlayer + 1} gets one final turn to beat that score.</p>}
                        {banner.type === "winner" && <p>Final score: Player 1 has {banner.scores[0].toLocaleString()} points; Player 2 has {banner.scores[1].toLocaleString()} points.</p>}
                        {banner.type !== "dragon" && (
                            <div className="dragon-dice-banner-actions">
                                {banner.type === "final-round" && <button type="button" ref={bannerButtonRef} onClick={dismissBanner}>Continue Final Round</button>}
                                <button type="button" ref={banner.type === "winner" ? bannerButtonRef : null} onClick={startNewGame}>New Game</button>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}

export default DragonDice;
