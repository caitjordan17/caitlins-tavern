import { useState } from "react";

function Patron({ name, image, dialogue, isSpeaking, onSpeak }) {
    const [dialogueIndex, setDialogueIndex] = useState(0);

    function handleClick() {
        if (isSpeaking) {
            setDialogueIndex((current) => (current + 1) % dialogue.length);
        } else {
            setDialogueIndex(0);
            onSpeak();
        }
    }

    return (
        <button
            className="patron-click-area"
            onClick={handleClick}
            type="button"
            aria-label={isSpeaking ? `Hear more from ${name}` : `Talk to ${name}`}
            aria-expanded={isSpeaking}
        >
            <img src={image} alt="" />
            {isSpeaking && <span className="dynamic-speech" aria-live="polite" aria-atomic="true">
                {dialogue[dialogueIndex]}
            </span>}
        </button>
    );
}

export default Patron;
