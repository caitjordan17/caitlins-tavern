import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import tavernYardImage from "../assets/tavern-yard.png";
import barleyImage from "../assets/barley-chasing.png";
import ballImage from "../assets/ball-tennis.png";

const FLIGHT_MS = 1250;
const START_X = 0.14;
const MIN_X = 0.12;
const MAX_X = 0.88;

function initialGame() {
  return {
    dogX: 0.18,
    direction: 1,
    score: 0,
    throws: 0,
    phase: "ready",
    ballStart: 0,
    resultAt: 0,
    targetX: 0.7,
    ballProgress: 0,
    lastFrame: 0,
    lastTurn: 0,
  };
}

function TavernYard() {
  const gameRef = useRef(initialGame());
  const [game, setGame] = useState(initialGame);
  const level = Math.min(6, Math.floor(game.score / 3) + 1);

  useEffect(() => {
    let frame;

    function tick(now) {
      const current = gameRef.current;
      const elapsed = current.lastFrame ? Math.min((now - current.lastFrame) / 1000, 0.05) : 0;
      current.lastFrame = now;

      const currentLevel = Math.min(6, Math.floor(current.score / 3) + 1);
      const baseSpeed = [0, 0.19, 0.26, 0.29, 0.32, 0.34, 0.38][currentLevel];
      const speed = currentLevel >= 5 && Math.floor(now / 1100) % 2 ? baseSpeed * 0.55 : baseSpeed;

      if (currentLevel >= 3 && now - current.lastTurn > 2600) {
        current.direction *= -1;
        current.lastTurn = now;
      }

      current.dogX += current.direction * speed * elapsed;
      if (current.dogX >= MAX_X || current.dogX <= MIN_X) {
        current.dogX = Math.max(MIN_X, Math.min(MAX_X, current.dogX));
        current.direction *= -1;
        current.lastTurn = now;
      }

      if (current.phase === "flying") {
        current.ballProgress = Math.min((now - current.ballStart) / FLIGHT_MS, 1);
        if (current.ballProgress === 1) {
          const catchWindow = currentLevel === 6 ? 0.055 : 0.085;
          const caught = Math.abs(current.dogX - current.targetX) <= catchWindow;
          current.phase = caught ? "caught" : "missed";
          current.resultAt = now;
          if (caught) current.score += 1;
        }
      } else if ((current.phase === "caught" || current.phase === "missed") && now - current.resultAt > 1300) {
        current.phase = "ready";
        current.ballProgress = 0;
        if (Math.min(6, Math.floor(current.score / 3) + 1) >= 4) {
          current.targetX = 0.58 + (current.throws % 3) * 0.1;
        }
      }

      setGame({ ...current });
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function throwBall() {
    const current = gameRef.current;
    if (current.phase !== "ready") return;
    current.phase = "flying";
    current.ballStart = performance.now();
    current.ballProgress = 0;
    current.throws += 1;
    setGame({ ...current });
  }

  const ballX = START_X + (game.targetX - START_X) * game.ballProgress;
  const ballBottom = 23 + Math.sin(Math.PI * game.ballProgress) * 34;
  const message = game.phase === "caught"
    ? "Caught it! Good girl, Barley!"
    : game.phase === "missed"
      ? "Missed! Barley trots back for another try."
      : game.phase === "flying"
        ? "Here it comes!"
        : "Watch Barley, then time your throw!";

  return (
    <main className="tavern-yard-page" aria-label="Ball? timing game">
      <img className="tavern-yard-background" src={tavernYardImage} alt="" />
      <Link className="order-up-back" to="/">Back to the Tavern</Link>

      <section className="yard-score" aria-label="Game score">
        <h1>Ball?</h1>
        <p>Catches: <strong>{game.score}</strong></p>
        <p>Level: <strong>{level}</strong> / 6</p>
      </section>

      <div className="yard-target" style={{ left: `${game.targetX * 100}%` }} aria-hidden="true" />
      <img
        className={`yard-dog${game.phase === "caught" ? " yard-dog-caught" : ""}`}
        src={barleyImage}
        alt="Barley running across the yard"
        style={{ left: `${game.dogX * 100}%`, transform: `translateX(-50%) scaleX(${game.direction})` }}
      />
      {game.phase === "flying" && (
        <img
          className="yard-ball"
          src={ballImage}
          alt="Tennis ball flying toward the target"
          style={{ left: `${ballX * 100}%`, bottom: `${ballBottom}%` }}
        />
      )}
      {game.phase === "missed" && (
        <img className="yard-ball yard-ball-landed" src={ballImage} alt="Tennis ball on the ground" style={{ left: `${game.targetX * 100}%` }} />
      )}

      <div className="yard-controls">
        <p className="yard-message" role="status">{message}</p>
        <button type="button" className="yard-throw" onClick={throwBall} disabled={game.phase !== "ready"}>Throw</button>
      </div>
    </main>
  );
}

export default TavernYard;
