import test from "node:test";
import assert from "node:assert/strict";
import {
    createGame, endTurn, finishRoll, hasScoringDice, prepareRoll, scoreDice, selectedPoints, toggleDie,
} from "./dragonDiceGame.js";

const allDice = [0, 1, 2, 3, 4, 5];

function firstRoll(values) {
    const prepared = prepareRoll(createGame());
    return finishRoll(prepared.game, values, prepared.rollingIndices);
}

test("scores singles, sets, and special combinations", () => {
    assert.equal(scoreDice([1, 5, 10, 15, 20]), 1500);
    assert.equal(scoreDice([1, 5, 10, 15, 20, 20]), 1700);
    assert.equal(scoreDice([1, 1, 1]), 1000);
    assert.equal(scoreDice([7, 7, 7]), 700);
    assert.equal(scoreDice([12, 12, 12]), 1200);
    assert.equal(scoreDice([20, 20, 20]), 2000);
    assert.equal(scoreDice([7, 7, 7, 7]), 1000);
    assert.equal(scoreDice([7, 7, 7, 7, 7]), 2000);
    assert.equal(scoreDice([7, 7, 7, 7, 7, 7]), 3000);
    assert.equal(scoreDice([2, 2, 7, 7, 12, 12]), 1500);
    assert.equal(scoreDice([1, 5, 7]), null);
    assert.equal(scoreDice([2, 2]), null);
});

test("four, five, and six matching dice can be selected and banked", () => {
    for (const [count, expected] of [[4, 1000], [5, 2000], [6, 3000]]) {
        const values = [...Array(count).fill(7), ...Array(6 - count).fill(2)];
        let game = firstRoll(values);
        for (let index = 0; index < count; index += 1) game = toggleDie(game, index);
        assert.equal(selectedPoints(game), expected);
        assert.equal(endTurn(game).scores[0], expected);
    }
});

test("requires a valid selection from the current roll before rerolling", () => {
    let game = firstRoll([1, 2, 3, 4, 6, 7]);
    assert.equal(prepareRoll(game).error, "Set aside at least one scoring die before rolling again.");
    game = toggleDie(game, 0);
    game = toggleDie(game, 1);
    assert.equal(prepareRoll(game).error, "Every selected die must be part of a scoring roll.");
    game = toggleDie(game, 1);
    assert.equal(selectedPoints(game), 100);
    const prepared = prepareRoll(game);
    assert.deepEqual(prepared.rollingIndices, [1, 2, 3, 4, 5]);
    assert.equal(prepared.game.turnScore, 100);
    assert.equal(prepared.game.locked[0], true);
    const next = finishRoll(prepared.game, [1, 5, 8, 9, 11, 13], prepared.rollingIndices);
    assert.equal(toggleDie(next, 0), next);
    assert.equal(scoreDice([1, 5]), 150);
    assert.equal(selectedPoints(next), null);
});

test("hot dice rerolls all six while preserving the turn score", () => {
    let game = firstRoll([1, 5, 10, 15, 20, 1]);
    for (const index of allDice) game = toggleDie(game, index);
    const prepared = prepareRoll(game);
    assert.equal(prepared.game.turnScore, 1600);
    assert.deepEqual(prepared.rollingIndices, allDice);
    assert.deepEqual(prepared.game.locked, Array(6).fill(false));
});

test("banking is safe and a Dragon loses only unbanked points", () => {
    let game = firstRoll([1, 2, 3, 4, 6, 7]);
    game = toggleDie(game, 0);
    game = endTurn(game);
    assert.deepEqual(game.scores, [100, 0]);
    assert.equal(game.currentPlayer, 1);

    game = finishRoll(prepareRoll(game).game, [1, 2, 3, 4, 6, 7], allDice);
    game = toggleDie(game, 0);
    const prepared = prepareRoll(game);
    assert.equal(prepared.game.turnScore, 100);
    assert.equal(hasScoringDice([2, 3, 4, 6, 7]), false);
    game = finishRoll(prepared.game, [1, 2, 3, 4, 6, 7], prepared.rollingIndices);
    assert.deepEqual(game.scores, [100, 0]);
    assert.equal(game.currentPlayer, 0);
    assert.equal(game.turnScore, 0);
    assert.deepEqual(game.notices, [{ type: "dragon", player: 1, lostPoints: 100 }]);
});

test("reaching 5,000 gives the opponent one final turn", () => {
    let game = firstRoll([7, 7, 7, 7, 7, 7]);
    for (const index of allDice) game = toggleDie(game, index);
    game = endTurn(game);
    assert.deepEqual(game.scores, [3000, 0]);
    game = { ...game, currentPlayer: 0, scores: [4900, 4700] };
    game = finishRoll(prepareRoll(game).game, [1, 2, 3, 4, 6, 7], allDice);
    game = endTurn(toggleDie(game, 0));
    assert.deepEqual(game.scores, [5000, 4700]);
    assert.equal(game.finalTurnPlayer, 1);
    assert.equal(game.phase, "ready");
    assert.deepEqual(game.notices, [{ type: "final-round", player: 0, score: 5000, nextPlayer: 1 }]);
    game = finishRoll(prepareRoll(game).game, [1, 2, 3, 4, 6, 7], allDice);
    game = endTurn(toggleDie(game, 0));
    assert.equal(game.winner, 0);
    assert.equal(game.phase, "finished");
    assert.deepEqual(game.notices, [{ type: "winner", winner: 0, scores: [5000, 4800] }]);
});

test("a Dragon on the final turn shows the Dragon and winner notices in order", () => {
    const game = { ...createGame(), scores: [5000, 4700], currentPlayer: 1, finalTurnPlayer: 1 };
    const finished = finishRoll(game, [2, 3, 4, 6, 7, 8], allDice);
    assert.deepEqual(finished.notices, [
        { type: "dragon", player: 1, lostPoints: 0 },
        { type: "winner", winner: 0, scores: [5000, 4700] },
    ]);
});
