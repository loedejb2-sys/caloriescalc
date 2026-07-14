// ==========================================================================
// Chart.js Setup
// ==========================================================================
const ctx = document.getElementById('calorieChart').getContext('2d');
const calorieChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Ideal Target', 'Prescribed Target', 'Actual Eaten', 'Difference'],
        datasets: [
            { label: 'Breakfast', data: [0, 0, 0, 0], backgroundColor: '#4d7c59' },
            { label: 'Lunch', data: [0, 0, 0, 0], backgroundColor: '#8bb381' },
            { label: 'Dinner', data: [0, 0, 0, 0], backgroundColor: '#b9ca9c' }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { 
                beginAtZero: true, 
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#a3b8ad' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#a3b8ad' }
            }
        },
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, color: '#f0f4f1' } }
        }
    }
});

// ==========================================================================
// Expansive Core Database (Calculated base per standard serving or 100g)
// ==========================================================================
const foodDatabase = {
    // Proteins
    "chicken": 165, "grilled chicken": 165, "chicken breast": 165, "chicken wings": 203,
    "steak": 250, "beef": 250, "ground beef": 250, "ribeye": 290, "pork": 240, "pork chop": 245,
    "salmon": 208, "baked salmon": 208, "tuna": 130, "cod": 82, "shrimp": 99,
    "egg": 70, "scrambled eggs": 140, "boiled egg": 70, "egg whites": 17,
    "whey powder": 120, "protein powder": 120, "protein bar": 200, "greek yogurt": 59, "yogurt": 61,
    "tofu": 76, "tempeh": 193, "turkey": 135, "turkey breast": 104, "bacon": 110,

    // Carbs / Grains
    "brown rice": 111, "white rice": 130, "rice": 130, "oatmeal": 150, "oats": 389,
    "bread": 75, "toast": 75, "whole wheat bread": 69, "bagel": 250, "croissant": 270,
    "pasta": 131, "spaghetti": 131, "macaroni": 131, "noodles": 138, "quinoa": 120,
    "sweet potato": 86, "potato": 87, "mashed potatoes": 110, "french fries": 312,
    "cereal": 379, "granola": 471, "pancakes": 227, "waffle": 291, "muffin": 377,

    // Fats / Nuts
    "avocado": 160, "olive oil": 119, "butter": 100, "peanut butter": 94, "almond butter": 98,
    "almonds": 164, "walnuts": 185, "cashews": 157, "peanuts": 161, "chia seeds": 138,
    "cheese": 402, "cheddar": 402, "mozzarella": 300, "cream cheese": 342,

    // Fruits & Veggies
    "apple": 52, "banana": 89, "orange": 47, "strawberries": 32, "blueberries": 57,
    "grapes": 69, "watermelon": 30, "peach": 39, "pineapple": 50,
    "broccoli": 34, "steamed broccoli": 35, "spinach": 23, "asparagus": 20, "cucumber": 15,
    "tomato": 18, "carrots": 41, "bell pepper": 20, "onion": 40, "garlic": 149,
    "salad": 15, "green salad": 15, "greek salad": 115, "caesar salad": 190,

    // Snacks, Fast Food & Cheat Meals
    "pizza": 266, "pizza slice": 285, "burger": 295, "cheeseburger": 303, "hot dog": 290,
    "taco": 226, "nachos": 306, "potato chips": 536, "chocolate": 546, "chocolate bar": 220,
    "cookie": 502, "donut": 452, "ice cream": 207, "gummy bears": 380, "popcorn": 375,
    "soda": 41, "soda can": 140, "orange juice": 45, "milk": 42
};

// ==========================================================================
// Smart Natural Language Processing (NLP) Parser Engine
// ==========================================================================
function parseNaturalInput(inputStr) {
    const text = inputStr.toLowerCase().trim();
    if (!text) return 0;

    let multiplier = 1.0;
    let baseCalories = 0;
    let matchedFood = "";

    // 1. Check for explicit gram metrics (e.g. "150g", "150 grams", "150 gram")
    const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)/);
    if (gramMatch) {
        const grams = parseFloat(gramMatch[1]);
        multiplier = grams / 100; // Database values are normalized per 100g where applicable
    } 
    // 2. Check for numeric digit quantities (e.g. "2 eggs", "1.5 pizzas")
    else {
        const qtyMatch = text.match(/^(\d+(?:\.\d+)?)\s+/);
        if (qtyMatch) {
            multiplier = parseFloat(qtyMatch[1]);
        }
    }

    // 3. Vague estimation terms translation matrix
    const vaguePhrases = [
        { phrase: "handful of", scale: 1.2 },
        { phrase: "handful", scale: 1.2 },
        { phrase: "bunch of", scale: 1.5 },
        { phrase: "slice of", scale: 1.0 },
        { phrase: "slices of", scale: 2.0 },
        { phrase: "plate of", scale: 2.5 },
        { phrase: "bowl of", scale: 2.0 },
        { phrase: "half a", scale: 0.5 },
        { phrase: "half", scale: 0.5 },
        { phrase: "quarter of a", scale: 0.25 },
        { phrase: "tiny bit of", scale: 0.3 },
        { phrase: "little bit of", scale: 0.5 },
        { phrase: "some", scale: 1.0 },
        { phrase: "a lot of", scale: 2.0 },
        { phrase: "mountain of", scale: 3.0 },
        { phrase: "couple of", scale: 2.0 },
        { phrase: "few", scale: 2.0 },
        { phrase: "bite of", scale: 0.2 }
    ];

    for (const item of vaguePhrases) {
        if (text.includes(item.phrase)) {
            // Only use vague scale multiplier if we didn't find a precise number first
            if (!gramMatch && !text.match(/^(\d+(?:\.\d+)?)\s+/)) {
                multiplier = item.scale;
            }
            break;
        }
    }

    // Size Adjectives modifier overrides
    if (text.includes("extra large") || text.includes("huge") || text.includes("xl")) {
        multiplier *= 1.3;
    } else if (text.includes("large") || text.includes("big")) {
        multiplier *= 1.15;
    } else if (text.includes("medium")) {
        multiplier *= 1.0;
    } else if (text.includes("small") || text.includes("tiny")) {
        multiplier *= 0.7;
    }

    // Descriptor overrides
    let densityModifier = 1.0;
    if (text.includes("low fat") || text.includes("diet") || text.includes("light") || text.includes("skim")) {
        densityModifier = 0.75;
    } else if (text.includes("creamy") || text.includes("cheesy") || text.includes("loaded") || text.includes("double")) {
        densityModifier = 1.35;
    }

    // 4. Smart Food matching loop
    // Search for longest database key matching first to handle compound words safely
    const keysSortedByLength = Object.keys(foodDatabase).sort((a, b) => b.length - a.length);
    for (const key of keysSortedByLength) {
        if (text.includes(key)) {
            matchedFood = key;
            baseCalories = foodDatabase[key];
            break;
        }
    }

    // Fallback: If no direct food match is found, check if we can match root parts
    if (!matchedFood) {
        for (const key of keysSortedByLength) {
            const words = key.split(' ');
            for (const word of words) {
                if (word.length > 3 && text.includes(word)) {
                    matchedFood = key;
                    baseCalories = foodDatabase[key];
                    break;
                }
            }
            if (matchedFood) break;
        }
    }

    // Final calculations pipeline
    const finalCalories = Math.round(baseCalories * multiplier * densityModifier);
    return finalCalories;
}

// ==========================================================================
// Core State Management (Saves directly to LocalStorage)
// ==========================================================================
let appState = {
    profile: { age: 17, weight: 70, height: 175, activity: 1.55 },
    meals: {
        breakfast: [{ text: "2 organic boiled eggs" }, { text: "150g of greek yogurt" }],
        lunch: [{ text: "a large plate of grilled chicken breast" }, { text: "100g brown rice" }],
        dinner: [{ text: "a slice of cheese pizza" }, { text: "some steamed broccoli" }]
    },
    prescribed: { breakfast: 700, lunch: 770, dinner: 870 }
};

function loadState() {
    const saved = localStorage.getItem('sagetraker_state_v3');
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            console.error("Failed parsing state: ", e);
        }
    }
    syncProfileUI();
    renderAllMeals();
}

function saveState() {
    localStorage.setItem('sagetraker_state_v3', JSON.stringify(appState));
}

function syncProfileUI() {
    document.getElementById('profile-age').value = appState.profile.age;
    document.getElementById('profile-weight').value = appState.profile.weight;
    document.getElementById('profile-height').value = appState.profile.height;
    document.getElementById('profile-activity').value = appState.profile.activity;

    document.querySelector('.mockup-input[data-type="prescribed"][data-meal="0"]').value = appState.prescribed.breakfast;
    document.querySelector('.mockup-input[data-type="prescribed"][data-meal="1"]').value = appState.prescribed.lunch;
    document.querySelector('.mockup-input[data-type="prescribed"][data-meal="2"]').value = appState.prescribed.dinner;
}

// ==========================================================================
// UI Rendering Logic
// ==========================================================================
function renderAllMeals() {
    const meals = ['breakfast', 'lunch', 'dinner'];
    meals.forEach(meal => {
        const tbody = document.getElementById(`list-${meal}`);
        tbody.innerHTML = '';
        
        appState.meals[meal].forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <input type="text" class="food-input" value="${item.text}" placeholder="Type naturally, e.g. a handful of almonds..." oninput="updateItem('${meal}', ${index}, this.value)">
                </td>
                <td>
                    <input type="text" class="cal-output-field" readonly value="0">
                </td>
                <td style="text-align: center;">
                    <button class="delete-btn" onclick="deleteFoodRow('${meal}', ${index})">×</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
    updateCalculations();
}

function addFoodRow(meal) {
    appState.meals[meal].push({ text: '' });
    saveState();
    renderAllMeals();
}

function deleteFoodRow(meal, index) {
    appState.meals[meal].splice(index, 1);
    saveState();
    renderAllMeals();
}

function updateItem(meal, index, val) {
    appState.meals[meal][index].text = val;
    saveState();
    updateCalculations();
}

// ==========================================================================
// Central Live Calculations Loop
// ==========================================================================
function calculateDynamicTargets() {
    const age = parseFloat(document.getElementById('profile-age').value) || 17;
    const weight = parseFloat(document.getElementById('profile-weight').value) || 70;
    const height = parseFloat(document.getElementById('profile-height').value) || 175;
    const activity = parseFloat(document.getElementById('profile-activity').value) || 1.55;

    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const totalDailyTDEE = Math.round(bmr * activity);

    return {
        breakfast: Math.round(totalDailyTDEE * 0.25), 
        lunch: Math.round(totalDailyTDEE * 0.40),     
        dinner: Math.round(totalDailyTDEE * 0.35)     
    };
}

function updateCalculations() {
    const dynamicIdeals = calculateDynamicTargets();
    const meals = ['breakfast', 'lunch', 'dinner'];
    const actuals = { breakfast: 0, lunch: 0, dinner: 0 };

    meals.forEach(meal => {
        const rows = document.querySelectorAll(`tbody[data-meal="${meal}"] tr`);
        
        rows.forEach((row, index) => {
            const textInput = row.querySelector('.food-input').value;
            const calOutput = row.querySelector('.cal-output-field');
            
            // Send the raw natural string directly to our smart parser
            const calculatedCal = parseNaturalInput(textInput);
            
            if (calOutput) calOutput.value = `${calculatedCal} kcal`;
            actuals[meal] += calculatedCal;
        });
    });

    const idealB = dynamicIdeals.breakfast;
    const idealL = dynamicIdeals.lunch;
    const idealD = dynamicIdeals.dinner;

    document.getElementById('target-val-b').innerText = `${idealB} kcal`;
    document.getElementById('target-val-l').innerText = `${idealL} kcal`;
    document.getElementById('target-val-d').innerText = `${idealD} kcal`;

    const prescribedB = parseFloat(document.querySelector('.mockup-input[data-type="prescribed"][data-meal="0"]').value) || 0;
    const prescribedL = parseFloat(document.querySelector('.mockup-input[data-type="prescribed"][data-meal="1"]').value) || 0;
    const prescribedD = parseFloat(document.querySelector('.mockup-input[data-type="prescribed"][data-meal="2"]').value) || 0;

    appState.prescribed = { breakfast: prescribedB, lunch: prescribedL, dinner: prescribedD };

    const diffB = idealB - actuals.breakfast;
    const diffL = idealL - actuals.lunch;
    const diffD = idealD - actuals.dinner;

    document.getElementById('mockup-actual-b').innerText = `${actuals.breakfast} kcal`;
    document.getElementById('mockup-actual-l').innerText = `${actuals.lunch} kcal`;
    document.getElementById('mockup-actual-d').innerText = `${actuals.dinner} kcal`;

    document.getElementById('mockup-diff-b').innerText = `${diffB} kcal`;
    document.getElementById('mockup-diff-l').innerText = `${diffL} kcal`;
    document.getElementById('mockup-diff-d').innerText = `${diffD} kcal`;

    // Push calculated metrics directly down to Chart.js API datasets
    calorieChart.data.datasets[0].data = [idealB, prescribedB, actuals.breakfast, diffB];
    calorieChart.data.datasets[1].data = [idealL, prescribedL, actuals.lunch, diffL];
    calorieChart.data.datasets[2].data = [idealD, prescribedD, actuals.dinner, diffD];
    
    calorieChart.update();
}

// ==========================================================================
// Dashboard General Event Handlers
// ==========================================================================
document.body.addEventListener('input', function(e) {
    if (['profile-age', 'profile-weight', 'profile-height', 'profile-activity'].includes(e.target.id)) {
        appState.profile.age = parseFloat(document.getElementById('profile-age').value) || 17;
        appState.profile.weight = parseFloat(document.getElementById('profile-weight').value) || 70;
        appState.profile.height = parseFloat(document.getElementById('profile-height').value) || 175;
        appState.profile.activity = parseFloat(document.getElementById('profile-activity').value) || 1.55;
        saveState();
        updateCalculations();
    }
    if (e.target.classList.contains('mockup-input')) {
        saveState();
        updateCalculations();
    }
});

function clearAllData() {
    if (confirm("This will clear your local logs and reset profile metrics. Continue?")) {
        localStorage.removeItem('sagetraker_state_v3');
        appState = {
            profile: { age: 17, weight: 70, height: 175, activity: 1.55 },
            meals: { breakfast: [], lunch: [], dinner: [] },
            prescribed: { breakfast: 700, lunch: 770, dinner: 870 }
        };
        saveState();
        syncProfileUI();
        renderAllMeals();
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event) window.event.currentTarget.classList.add('active');

    const profileSec = document.getElementById('section-profile');
    const mealSec = document.getElementById('section-meals');
    const chartSec = document.getElementById('section-analytics');
    const matrixSec = document.getElementById('section-matrix');

    if (tabId === 'all') {
        profileSec.classList.remove('hidden-tab');
        mealSec.classList.remove('hidden-tab');
        chartSec.classList.remove('hidden-tab');
        matrixSec.classList.remove('hidden-tab');
    } else {
        profileSec.classList.toggle('hidden-tab', tabId !== 'profile');
        mealSec.classList.toggle('hidden-tab', tabId !== 'meals');
        chartSec.classList.toggle('hidden-tab', tabId !== 'analytics');
        matrixSec.classList.toggle('hidden-tab', tabId !== 'matrix');
    }
}

window.onload = function() {
    loadState();
};
