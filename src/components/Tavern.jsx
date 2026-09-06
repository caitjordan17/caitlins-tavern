import { useState } from "react";
import { Link } from "react-router-dom";
import Patron from "./Patron";
import tavernImage from "../assets/tavern-home.png";

function Tavern() {
    const [activePatron, setActivePatron] = useState(0);

    const patrons = [
        {
            name: "The Traveler",
            dialogue: [
                "She has triaged complex enterprise bugs using AWS, SSH, and raw client data.",
                "Lore is she investigates 1M+ line flat files to find customer data issues.",
                "She works directly with engineering to reproduce and resolve technical problems.",
                "She loves to chat about common client data issues, not sure what she's doing running a pub!",
            ],
        },
        {
            name: "The Scholar",
            dialogue: [
                "She uses SQL and Python to investigate data discrepancies.",
                "I hear she's led complex enterprise implementations and translated client requirements into technical solutions.",
                "She's authored ID mapping guides and crosswalk frameworks adopted across Engineering and Customer Support teams.",
                "She usually has her dog, Barley, running around here... I wonder where she is..."
            ],
        },
        {
            name: "The Regular",
            dialogue: [
                "She serves mostly pilsners and pale ales, as they're her favorite.",
                "She likes good food, good books, and a good old fashioned mystery.",
                "Ask her about her top favorite pizzas in SF.",
                "Legend has it that fire over there is fueled by her passion for helping others. Witchcraft if you ask me!",
            ],
        },
    ];

    return (
        <main className="tavern-page">

            <img
                className="tavern-background"
                src={tavernImage}
                alt=""
            />
            <div className="quote-overlay">
                "And that's why you always leave a note."
            </div>

            <nav className="on-tap-overlay" aria-label="On Tap">
                <a
                    href="https://www.linkedin.com/in/cait-jordan17"
                    target="_blank"
                    rel="noreferrer"
                >
                    Ye Old LinkedIn <span>›</span>
                </a>
                <Link to="/recipe-book">
                    The Recipe Book <span>›</span>
                </Link>
                <Link to="/sf-food-finds">
                    SF Food Finds <span>›</span>
                </Link>
                <a
                    href="https://github.com/caitjordan17"
                    target="_blank"
                    rel="noreferrer"
                >
                    Ye Old Github <span>›</span>
                </a>
            </nav>

            <div className="patron-overlay traveler-position">
                <Patron
                    {...patrons[0]}
                    isSpeaking={activePatron === 0}
                    onSpeak={() => setActivePatron(0)}
                />
            </div>

            <div className="patron-overlay scholar-position">
                <Patron
                    {...patrons[1]}
                    isSpeaking={activePatron === 1}
                    onSpeak={() => setActivePatron(1)}
                />
            </div>

            <div className="patron-overlay regular-position">
                <Patron
                    {...patrons[2]}
                    isSpeaking={activePatron === 2}
                    onSpeak={() => setActivePatron(2)}
                />
            </div>

            <Link
                className="game-overlay order-position"
                to="/order-up"
                aria-label="Order Up SQL minigame"
            />

            <Link
                className="game-overlay case-position"
                to="/case-files"
                aria-label="Case Files data mystery"
            />

            <Link
                className="game-overlay status-position"
                to="/status-check"
                aria-label="Status Check API minigame"
            />

        </main>
    );
}

export default Tavern;
