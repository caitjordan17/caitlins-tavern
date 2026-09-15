const singlePoints = new Map([[1, 100], [5, 50], [10, 100], [15, 150], [20, 200]]);
const runValues = [1, 5, 10, 15, 20];

// Returns null when any selected die cannot be used in a scoring set.
export function scoreDice(values) {
    if (values.length === 0 || values.length > 6 || values.some((value) => !Number.isInteger(value) || value < 1 || value > 20)) {
        return null;
    }

    const counts = new Map();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

    let score = 0;
    let allDiceScore = true;
    for (const [value, count] of counts) {
        if (count >= 4) score += { 4: 1000, 5: 2000, 6: 3000 }[count];
        else if (count === 3) score += value === 1 ? 1000 : value * 100;
        else if (singlePoints.has(value)) score += singlePoints.get(value) * count;
        else allDiceScore = false;
    }

    const scores = [];
    if (allDiceScore) scores.push(score);
    if (values.length === 6 && counts.size === 3 && [...counts.values()].every((count) => count === 2)) {
        scores.push(1500);
    }
    if (runValues.every((value) => counts.has(value))) {
        const remaining = [...counts.entries()].flatMap(([value, count]) => Array(Math.max(0, count - (runValues.includes(value) ? 1 : 0))).fill(value));
        if (remaining.every((value) => singlePoints.has(value))) {
            scores.push(1500 + remaining.reduce((total, value) => total + singlePoints.get(value), 0));
        }
    }
    return scores.length ? Math.max(...scores) : null;
}

export function hasScoringDice(values) {
    if (values.some((value) => singlePoints.has(value))) return true;
    const counts = new Map();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts.values()].some((count) => count >= 3) ||
        (values.length === 6 && counts.size === 3 && [...counts.values()].every((count) => count === 2));
}

export function createGame() {
    return {
        scores: [0, 0],
        currentPlayer: 0,
        turnScore: 0,
        dice: [],
        locked: Array(6).fill(false),
        selected: Array(6).fill(false),
        phase: "ready",
        finalTurnPlayer: null,
        winner: null,
        notices: [],
        message: "Player 1: roll all six dice to begin.",
    };
}

export function selectedPoints(game) {
    return scoreDice(game.dice.filter((_, index) => game.selected[index]));
}

export function toggleDie(game, index) {
    if (game.phase !== "choose" || game.locked[index] || index < 0 || index >= 6) return game;
    const selected = [...game.selected];
    selected[index] = !selected[index];
    return { ...game, selected, notices: [], message: "Select scoring dice, then roll again or end your turn." };
}

export function prepareRoll(game) {
    if (game.phase === "finished") return { error: "The game is over." };
    if (game.phase === "ready") return { game: { ...game, notices: [] }, rollingIndices: [0, 1, 2, 3, 4, 5] };

    const picked = game.selected.filter(Boolean).length;
    if (picked === 0) return { error: "Set aside at least one scoring die before rolling again." };
    const points = selectedPoints(game);
    if (points === null) return { error: "Every selected die must be part of a scoring roll." };

    const locked = game.locked.map((wasLocked, index) => wasLocked || game.selected[index]);
    const hotDice = locked.every(Boolean);
    const nextLocked = hotDice ? Array(6).fill(false) : locked;
    return {
        game: {
            ...game,
            turnScore: game.turnScore + points,
            locked: nextLocked,
            selected: Array(6).fill(false),
            notices: [],
            message: hotDice ? "Hot Dice! All six dice roll again." : "Rolling the remaining dice…",
        },
        rollingIndices: nextLocked.flatMap((isLocked, index) => isLocked ? [] : [index]),
    };
}

function finishTurn(game, banked, dragon, rolledDice = game.dice) {
    const scores = [...game.scores];
    if (!dragon) scores[game.currentPlayer] += banked;
    const player = game.currentPlayer;
    const nextPlayer = 1 - player;
    const lastTurn = game.finalTurnPlayer === player;
    const finalTurnPlayer = !lastTurn && game.finalTurnPlayer === null && scores[player] >= 5000
        ? nextPlayer
        : game.finalTurnPlayer;
    const winner = lastTurn
        ? scores[0] === scores[1] ? "tie" : scores[0] > scores[1] ? 0 : 1
        : null;
    const outcome = dragon
        ? `Player ${player + 1} rolled a Dragon and lost their unbanked points.`
        : `Player ${player + 1} banked ${banked.toLocaleString()} points.`;
    const message = winner !== null
        ? `${outcome} ${winner === "tie" ? "The game is a tie!" : `Player ${winner + 1} wins!`}`
        : `${outcome} ${finalTurnPlayer === nextPlayer ? `Player ${nextPlayer + 1} has the final turn.` : `Player ${nextPlayer + 1}'s turn.`}`;
    const notices = [];
    if (dragon) notices.push({ type: "dragon", player, lostPoints: game.turnScore });
    if (game.finalTurnPlayer === null && finalTurnPlayer === nextPlayer) {
        notices.push({ type: "final-round", player, score: scores[player], nextPlayer });
    }
    if (winner !== null) notices.push({ type: "winner", winner, scores });

    return {
        ...game,
        scores,
        currentPlayer: winner === null ? nextPlayer : player,
        turnScore: 0,
        dice: rolledDice,
        locked: Array(6).fill(false),
        selected: Array(6).fill(false),
        phase: winner === null ? "ready" : "finished",
        finalTurnPlayer,
        winner,
        notices,
        message,
    };
}

export function finishRoll(game, rolledDice, rollingIndices) {
    const newValues = rollingIndices.map((index) => rolledDice[index]);
    if (!hasScoringDice(newValues)) return finishTurn(game, 0, true, rolledDice);
    return {
        ...game,
        dice: rolledDice,
        phase: "choose",
        notices: [],
        message: "Select at least one scoring die or combination.",
    };
}

export function endTurn(game) {
    if (game.phase !== "choose") return game;
    const hasSelection = game.selected.some(Boolean);
    const points = hasSelection ? selectedPoints(game) : 0;
    if (points === null) return { ...game, notices: [], message: "Every selected die must be part of a scoring roll." };
    return finishTurn(game, game.turnScore + points, false);
}
