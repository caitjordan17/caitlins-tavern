import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import officeImage from "../assets/tavern-office.png";
import caseFileImage from "../assets/case-file.png";
import basilImage from "../assets/basil.png";

const basilDialogue = [
    "Hi, I'm Basil!",
    "I'm working hard to compile all the data.",
    "Come back soon to help me out.",
    "Now where did I leave that delivery log?",
];

function CaseFiles() {
    const caseDialogRef = useRef(null);
    const [basilDialogueIndex, setBasilDialogueIndex] = useState(null);

    function talkToBasil() {
        setBasilDialogueIndex((current) => {
            if (current === null) return 0;
            return current === basilDialogue.length - 1 ? null : current + 1;
        });
    }

    function clearBasilSpeechOnBackgroundClick(event) {
        if (!event.target.closest("button, a, dialog")) {
            setBasilDialogueIndex(null);
        }
    }

    return (
        <main className="case-files-page" onClick={clearBasilSpeechOnBackgroundClick}>
            <img className="case-files-background" src={officeImage} alt="" />
            <Link className="order-up-back" to="/">Back to the Tavern</Link>
            <button
                className="case-file-title"
                type="button"
                onClick={() => {
                    setBasilDialogueIndex(null);
                    caseDialogRef.current?.showModal();
                }}
                aria-label="Open the Case Files mystery"
            >
                <img src={caseFileImage} alt="" />
                <span>Case Files</span>
            </button>
            <button
                className="basil-button"
                type="button"
                onClick={talkToBasil}
                aria-label={basilDialogueIndex === null ? "Talk to Basil" : "Hear more from Basil"}
                aria-expanded={basilDialogueIndex !== null}
            >
                <img src={basilImage} alt="" />
                {basilDialogueIndex !== null && (
                    <span className="dynamic-speech basil-speech" aria-live="polite" aria-atomic="true">
                        {basilDialogue[basilDialogueIndex]}
                    </span>
                )}
            </button>
            <dialog className="case-file-dialog" ref={caseDialogRef} aria-labelledby="case-file-dialog-title">
                <button
                    className="case-file-close"
                    type="button"
                    onClick={() => caseDialogRef.current?.close()}
                    aria-label="Close Case Files"
                >
                    ×
                </button>
                <h1 id="case-file-dialog-title"></h1>
                <p>Basil's working hard to compile all the data. Come back soon to help him out.</p>
            </dialog>
        </main>
    );
}

export default CaseFiles;
