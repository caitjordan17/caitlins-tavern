import { useState } from "react";
import caitImage from "../assets/cait.png";

const greetings = [
    "Hi! Make yourself at home!",
    "Click on the patrons to learn more.",
    "Kitchen orders are really coming in!",
    "Sports are really hard to stream between realms, but we're working on it.",
    "Let me know if I can get you anything!",
    "I better get these tracking sheets over to Basil, he's trying to find a missing order.",
];

function Cait({ isSpeaking, onSpeak, onClose }) {
    const [greetingIndex, setGreetingIndex] = useState(0);

    function greet() {
        if (!isSpeaking) {
            setGreetingIndex(0);
            onSpeak();
        } else if (greetingIndex === greetings.length - 1) {
            onClose();
        } else {
            setGreetingIndex((current) => current + 1);
        }
    }

    return (
        <button
            className="cait-button"
            type="button"
            onClick={greet}
            aria-label={isSpeaking ? "Hear more from Cait" : "Talk to Cait"}
            aria-expanded={isSpeaking}
        >
            <img src={caitImage} alt="" />
            {isSpeaking && (
                <span className="dynamic-speech cait-speech" aria-live="polite" aria-atomic="true">
                    {greetings[greetingIndex]}
                </span>
            )}
        </button>
    );
}

export default Cait;
