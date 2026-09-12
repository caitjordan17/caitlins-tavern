import { useState } from "react";
import { Link } from "react-router-dom";
import orderUpImage from "../assets/order-up-home.png";
import toadChefImage from "../assets/toad-chef.png";

const chefDialogue = [
    "We're still getting set up in here. Mind the broom, lass!",
    "Too eager, lass. The kitchen's not quite ready for orders yet.",
    "Give me a moment to sweep up. Then we'll see what you're made of!",
    "A good query's like a good stew. You've got to mind what goes in.",
];

function OrderUp() {
    const [dialogueIndex, setDialogueIndex] = useState(null);

    function talkToChef() {
        setDialogueIndex((current) => current === null ? 0 : (current + 1) % chefDialogue.length);
    }

    return (
        <main className="order-up-page" aria-label="Order Up SQL minigame">
            <img className="order-up-background" src={orderUpImage} alt="" />
            <Link className="order-up-back" to="/">Back to the Tavern</Link>
            <button
                className="order-up-chef"
                type="button"
                onClick={talkToChef}
                aria-label={dialogueIndex === null ? "Talk to the toad chef" : "Hear more from the toad chef"}
                aria-expanded={dialogueIndex !== null}
            >
                <img src={toadChefImage} alt="" />
                {dialogueIndex !== null && (
                    <span className="dynamic-speech order-up-chef-speech" aria-live="polite" aria-atomic="true">
                        {chefDialogue[dialogueIndex]}
                    </span>
                )}
            </button>
        </main>
    );
}

export default OrderUp;
