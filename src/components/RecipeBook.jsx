import { useEffect, useRef, useState } from "react";
import recipeBookImage from "../assets/recipe-book.png";

const recipes = [
    "Tortellini Soup with Italian Sausage and Kale",
    "Peanut Pork Noodles",
    "Cheesy Baked Pasta with Sausage and Ricotta",
    "Creamy, Spicy Tomato Beans and Greens",
    "Parmesan Kale and White Bean Bake",
    "Pasta Gemma",
    "Pork Tacos with Seared Pineapple Chunks",
    "Hot Tofu Tacos with Creamy Slaw and Pickled Shallots",
    "Spicy Tomato Soup",
    "Lemon Chicken with Cilantro Rice Soup",
    "Gochujang Tofu with Cucumber and Rice",
    "Panko Chicken with Lemon Broccolini and Yogurt Mint Sauce",
    "Tomato Goat Cheese and Spicy Olive Pasta",
    "Fresh Corn & Blistered Tomato Pasta",
    "Sloppy Joes with Spicy Fries",
    "Vegetarian Spicy Chili",
    "Classic Burger",
    "Ratatouille on Creamy Polenta",
    "Roasted Veggies with Green Goddess Dressing",
    "Salmon Patties with Yogurt Mint Sauce",
    "Chicken Marbella",
    "Chicken Adobo",
    "Classic Ceasar Salad with Homemade Croutons",
    "Kale Seasonal Salad with French Shallot Vinaigrette",
    "Pasta Primavera",
    "Eggplant Lasagna",
    "Salmon and Coconut Tomato Curry",
    "Pork Bahn Mi",
    "Hot Honey Chicken Breast",
    "Saffron Risotto",
    "Seasonal Risotto",
];

function RecipeBook({ onClose }) {
    const [special, setSpecial] = useState("");
    const closeRef = useRef(null);
    const bookRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();
        function handleKeyDown(event) {
            if (event.key === "Escape") onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    function chooseRandomDish() {
        const alternatives = recipes.filter((recipe) => recipe !== special);
        setSpecial(alternatives[Math.floor(Math.random() * alternatives.length)]);
    }

    return (
        <div className="recipe-book-overlay" onMouseDown={(event) => {
            const bounds = bookRef.current?.getBoundingClientRect();
            if (!bounds ||
                event.clientX < bounds.left + bounds.width * 0.02 ||
                event.clientX > bounds.right - bounds.width * 0.02 ||
                event.clientY < bounds.top + bounds.height * 0.12 ||
                event.clientY > bounds.bottom - bounds.height * 0.11) {
                onClose();
            }
        }}>
            <section className="recipe-book-window" role="dialog" aria-modal="true" aria-label="The Recipe Book" ref={bookRef}>
                <img className="recipe-book-image" src={recipeBookImage} alt="" />
                <button className="recipe-book-close" type="button" aria-label="Close recipe book" ref={closeRef} onClick={onClose}>X</button>
                <div className="recipe-book-page recipe-book-left-page">
                    <h2>Tonight's Special</h2>
                    <p className="recipe-book-question">What should we cook tonight?</p>
                    <p className="recipe-book-special" aria-live="polite">{special || "No dish chosen yet."}</p>
                </div>
                <div className="recipe-book-page recipe-book-right-page">
                    <h2>What to cook for the special tonight?</h2>
                    <button className="recipe-book-random" type="button" onClick={chooseRandomDish}>Random Dish</button>
                </div>
            </section>
        </div>
    );
}

export default RecipeBook;
