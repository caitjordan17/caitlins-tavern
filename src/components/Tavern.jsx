import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Patron from "./Patron";
import MenuBoard from "./MenuBoard";
import Cait from "./Cait";
import tavernImage from "../assets/tavern-home-empty.png";
import travelerImage from "../assets/patron-1.png";
import scholarImage from "../assets/patron-2.png";
import regularImage from "../assets/patron-3.png";
import paperImage from "../assets/paper.png";
import diceImage from "../assets/dice.png";
import barleyImage from "../assets/barley-sleeping.png";
import RecipeBook from "./RecipeBook";

function Tavern() {
    const navigate = useNavigate();
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [barleyClicks, setBarleyClicks] = useState(0);
    const [barleyEyeOpen, setBarleyEyeOpen] = useState(false);
    const [showRecipeBook, setShowRecipeBook] = useState(false);
    const recipeBookTriggerRef = useRef(null);

    const closeRecipeBook = useCallback(() => {
        setShowRecipeBook(false);
        requestAnimationFrame(() => recipeBookTriggerRef.current?.focus());
    }, []);

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
                "Ask her about her top favorite pizzas in SF.",
                "Do you want to play a dice game?",
                "Just click the purple dice on the barrel to your right.",
            ],
        },
    ];

    function clearSpeechOnBackgroundClick(event) {
        if (!event.target.closest("button, a")) {
            setActiveSpeaker(null);
            setBarleyClicks(0);
        }
    }

    function checkOnBarley() {
        if (barleyEyeOpen) {
            navigate("/tavern-yard");
            return;
        }
        const nextClick = activeSpeaker === "traveler" ? Math.min(barleyClicks + 1, 3) : 1;
        setBarleyClicks(nextClick);
        if (nextClick === 3) setBarleyEyeOpen(true);
        setActiveSpeaker("traveler");
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
            <Link className="dragon-dice-link" to="/dragon-dice" aria-label="Play Dragon's Dice">
                <span className="dragon-dice-art"><img src={diceImage} alt="" /></span>
            </Link>

            <nav className="on-tap-overlay" aria-label="On Tap">
                <a
                    href="https://www.linkedin.com/in/cait-jordan17"
                    target="_blank"
                    rel="noreferrer"
                >
                    Ye Old LinkedIn <span>›</span>
                </a>
                <button type="button" ref={recipeBookTriggerRef} onClick={() => { setActiveSpeaker(null); setShowRecipeBook(true); }} aria-haspopup="dialog" aria-expanded={showRecipeBook}>
                    The Recipe Book <span>›</span>
                </button>
                <a href="https://open.spotify.com/playlist/2Y73njm5d4enXmGuuZokdl" target="_blank" rel="noreferrer">
                    Tavern Tunes <span>›</span>
                </a>
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
                    isSpeaking={activeSpeaker === "traveler" && barleyClicks === 0}
                    onSpeak={() => { setBarleyClicks(0); setActiveSpeaker("traveler"); }}
                />
                {activeSpeaker === "traveler" && barleyClicks > 0 && barleyClicks < 3 && (
                    <span className="dynamic-speech barley-warning" aria-live="polite" aria-atomic="true">
                        {barleyClicks === 1 ? "I wouldn't wake her if I were you." : "I'm warning ya."}
                    </span>
                )}
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

            <button className="barley-button" type="button" onClick={checkOnBarley} aria-label={barleyEyeOpen ? "Follow Barley to the tavern yard" : "Check on sleeping Barley"}>
                <img src={barleyImage} alt="" />
                {barleyEyeOpen && <span className="barley-open-eye" aria-hidden="true" />}
                {barleyEyeOpen && barleyClicks === 3 && activeSpeaker === "traveler" && (
                    <span className="dynamic-speech barley-speech" aria-live="polite">Ball?</span>
                )}
            </button>

            {showRecipeBook && <RecipeBook onClose={closeRecipeBook} />}

        </main>
    );
}

export default Tavern;
