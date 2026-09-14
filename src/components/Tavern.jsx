import { useState } from "react";
import { Link } from "react-router-dom";
import Patron from "./Patron";
import MenuBoard from "./MenuBoard";
import Cait from "./Cait";
import tavernImage from "../assets/tavern-home-empty.png";
import travelerImage from "../assets/patron-1.png";
import scholarImage from "../assets/patron-2.png";
import regularImage from "../assets/patron-3.png";
import paperImage from "../assets/paper.png";

function Tavern() {
    const [activeSpeaker, setActiveSpeaker] = useState(null);

    const patrons = [
        {
            name: "The Traveler",
            image: travelerImage,
            dialogue: [
                "She has triaged complex enterprise bugs using AWS, SSH, and raw client data.",
                "Lore is she investigates 1M+ line flat files to find customer data issues.",
                "She works directly with engineering to reproduce and resolve technical problems.",
                "She loves to chat about common client data issues, not sure what she's doing running a pub!",
            ],
        },
        {
            name: "The Scholar",
            image: scholarImage,
            dialogue: [
                "She uses SQL and Python to investigate data discrepancies.",
                "I hear she's led complex enterprise implementations and translated client requirements into technical solutions.",
                "She's authored ID mapping guides and crosswalk frameworks adopted across Engineering and Customer Support teams.",
                "She usually has her dog, Barley, running around here... I wonder where she is..."
            ],
        },
        {
            name: "The Regular",
            image: regularImage,
            dialogue: [
                "She serves mostly pilsners and pale ales, as they're her favorite.",
                "She likes good food, good books, and a good old fashioned mystery.",
                "Ask her about her top favorite pizzas in SF.",
                "Legend has it that fire over there is fueled by her passion for helping others. Witchcraft if you ask me!",
            ],
        },
    ];

    function clearSpeechOnBackgroundClick(event) {
        if (!event.target.closest("button, a")) {
            setActiveSpeaker(null);
        }
    }

    return (
        <main className="tavern-page" onClick={clearSpeechOnBackgroundClick}>

            <img
                className="tavern-background"
                src={tavernImage}
                alt=""
            />
            <MenuBoard />
            <Cait
                isSpeaking={activeSpeaker === "cait"}
                onSpeak={() => setActiveSpeaker("cait")}
                onClose={() => setActiveSpeaker(null)}
            />
            <div className="tavern-bar-front" aria-hidden="true" />
            <Link className="case-file-paper" to="/case-files" aria-label="Open Case Files">
                <img src={paperImage} alt="" />
            </Link>

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
                    isSpeaking={activeSpeaker === "traveler"}
                    onSpeak={() => setActiveSpeaker("traveler")}
                />
            </div>

            <div className="patron-overlay scholar-position">
                <Patron
                    {...patrons[1]}
                    isSpeaking={activeSpeaker === "scholar"}
                    onSpeak={() => setActiveSpeaker("scholar")}
                />
            </div>

            <div className="patron-overlay regular-position">
                <Patron
                    {...patrons[2]}
                    isSpeaking={activeSpeaker === "regular"}
                    onSpeak={() => setActiveSpeaker("regular")}
                />
            </div>

        </main>
    );
}

export default Tavern;
