// ==========================================================================
// Chart.js Configuration Engine
// ==========================================================================
const ctx = document.getElementById('calorieChart').getContext('2d');
const calorieChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Ideal Target', 'Prescribed Target', 'Actual Eaten', 'Difference (Ideal - Actual)'],
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
            legend: { 
                position: 'bottom', 
                labels: { boxWidth: 12, color: '#f0f4f1' } 
            }
        }
    }
});

// ==========================================================================
// Local Core Procedural Database (1,500 Items x 3 Sizes = 4,500 combinations)
// ==========================================================================
const foodDatabase = {};

const bases = [
    { name: "toast", cal: 100 }, { name: "egg", cal: 70 }, { name: "scrambled eggs", cal: 70 },
    { name: "bacon", cal: 60 }, { name: "orange juice", cal: 110 }, { name: "grilled chicken", cal: 60 },
    { name: "brown rice", cal: 215 }, { name: "steamed broccoli", cal: 55 }, { name: "greek salad", cal: 150 },
    { name: "baked salmon", cal: 50 }, { name: "mashed potatoes", cal: 210 }, { name: "steamed asparagus", cal: 40 },
    { name: "dinner roll", cal: 110 }, { name: "apple", cal: 95 }, { name: "banana", cal: 105 },
    { name: "whey powder", cal: 120 }, { name: "steak", cal: 250 }, { name: "oatmeal", cal: 150 },
    { name: "milk", cal: 120 }, { name: "yogurt", cal: 130 }, { name: "almonds", cal: 160 },
    { name: "turkey breast", cal: 90 }, { name: "sweet potato", cal: 110 }, { name: "avocado", cal: 240 },
    { name: "protein bar", cal: 200 }
];

const descriptors = [
    "organic", "fresh", "diet", "premium", "low fat", "high protein", "roasted", "baked", 
    "salted", "unsalted", "sweetened", "unsweetened", "spicy", "garlic", "honey", "maple", 
    "smoked", "grilled", "steamed", "boiled", "crispy", "homemade", "gourmet", "classic", 
    "light", "dark", "whole wheat", "gluten free", "natural", "extra", "raw", "cooked", 
    "seasoned", "marinated", "shredded", "sliced", "diced", "mashed", "pureed", "creamy"
];

const sizes = [
    { prefix: "medium ", multiplier: 0.85 },
    { prefix: "large ", multiplier: 1.00 },
    { prefix: "extra large ", multiplier: 1.15 }
];

function injectWithVariants(name, baseCalories) {
    sizes.forEach(sz => {
        const variantName = `${sz.prefix}${name}`;
        foodDatabase[variantName] = Math.max(10, Math.round(baseCalories * sz.multiplier));
    });
    foodDatabase[name] = Math.round(baseCalories);
}

let baseCount = 0;
while (baseCount < 1000) {
    const base = bases[baseCount % bases.length];
    const d1 = descriptors[Math.floor(baseCount / bases.length) % descriptors.length];
    const d2 = descriptors[(Math.floor(baseCount / bases.length) + 1) % descriptors.length];
    
    let uniqueName = `${d1} ${base.name}`;
    if (baseCount >= bases.length * descriptors.length) {
        uniqueName = `${d1} ${d2} ${base.name}`;
    }

    if (!foodDatabase[`large ${uniqueName}`]) {
        const variance = d1.includes("low fat") || d1.includes("diet") || d1.includes("light") ? -25 : 15;
        const calculatedBaseCal = Math.max(20, base.cal + (baseCount % variance));
        injectWithVariants(uniqueName, calculatedBaseCal);
        baseCount++;
    } else {
        baseCount++; 
    }
}

const randomBases = [
    { name: "pizza slice", cal: 285 }, { name: "burger", cal: 540 }, { name: "french fries", cal: 365 },
    { name: "potato chips", cal: 150 }, { name: "chocolate bar", cal: 220 }, { name: "soda can", cal: 140 },
    { name: "donut", cal: 250 }, { name: "cookie", cal: 130 }, { name: "ice cream scoop", cal: 145 },
    { name: "gummy bears", cal: 120 }, { name: "popcorn packet", cal: 300 }, { name: "pretzel", cal: 110 },
    { name: "hot dog", cal: 290 }, { name: "taco", cal: 210 }, { name: "nachos", cal: 350 },
    { name: "pancakes", cal: 280 }, { name: "waffle", cal: 220 }, { name: "muffin", cal: 340 }
];

const randomBrands = [
    "generic", "store brand", "vending machine", "fast food", "movie theater", "party style", 
    "gas station", "bakery", "classic", "super", "mega", "double", "triple", "mini", "jumbo", 
    "loaded", "cheesy", "bbq", "sour cream", "buffalo", "ranch", "caramel", "vanilla", "strawberry"
];

let randomCount = 0;
while (randomCount < 500) {
    const rBase = randomBases[randomCount % randomBases.length];
    const brand = randomBrands[Math.floor(randomCount / randomBases.length) % randomBrands.length];
    
    const randomName = `${brand} ${rBase.name}`;
    if (!foodDatabase[`large ${randomName}`]) {
        const calculatedBaseCal = Math.max(50, rBase.cal + (randomCount % 40));
        injectWithVariants(randomName, calculatedBaseCal);
        randomCount++;
    } else {
        randomCount++;
    }
}

bases.forEach(b => injectWithVariants(b.name, b.cal));
randomBases.forEach(rb => injectWithVariants(rb.name, rb.cal));

// ==========================================================================
// Core State & LocalStorage Management
// ==========================================================================
let appState = {
    profile: { age: 17, weight: 70, height: 175, activity: 1.55 },
    meals: {
        breakfast: [{ food: "medium egg", amount: 2 }, { food: "organic toast", amount: 2 }],
        lunch: [{ food: "large chicken", amount: 1.5 }, { food: "brown rice", amount: 1 }],
        dinner: [{ food: "fresh grilled chicken", amount: 1 }, { food: "steamed broccoli", amount: 2 }]
    },
    prescribed: { breakfast: 700, lunch: 770, dinner: 870 }
};

// Loads saved profile data or meal templates from storage
function loadState() {
    const saved = localStorage.getItem('sagetraker_state_v2');
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
    localStorage.setItem('sagetraker_state_v2', JSON.stringify(appState));
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
// UI Rendering Engine
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
                    <input type="text" class="food-input" value="${item.food}" placeholder="Type ingredient name..." oninput="updateItem('${meal}', ${index}, 'food', this.value)">
                </td>
                <td>
                    <input type="number" class="amount-input" value="${item.amount}" step="0.1" min="0" oninput="updateItem('${meal}', ${index}, 'amount', this.value)">
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
    appState.meals[meal].push({ food: '', amount: 1 });
    saveState();
    renderAllMeals();
}

function deleteFoodRow(meal, index) {
    appState.meals[meal].splice(index, 1);
    saveState();
    renderAllMeals();
}

function updateItem(meal, index, field, value) {
    if (field === 'amount') {
        appState.meals[meal][index].amount = parseFloat(value) || 0;
    } else {
        appState.meals[meal][index].food = value;
    }
    saveState();
    updateCalculations();
}

// ==========================================================================
// Dynamic Calculations Pipeline
// ==========================================================================
function calculateDynamicTargets() {
    const age = parseFloat(document.getElementById('profile-age').value) || 17;
    const weight = parseFloat(document.getElementById('profile-weight').value) || 70;
    const height = parseFloat(document.getElementById('profile-height').value) || 175;
    const activity = parseFloat(document.getElementById('profile-activity').value) || 1.55;

    // Scientific TDEE (Thermodynamic daily energy expenditure formula)
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
            const foodName = row.querySelector('.food-input').value.trim().toLowerCase();
            const amount = parseFloat(row.querySelector('.amount-input').value) || 0;
            const calOutput = row.querySelector('.cal-output-field');
            
            let baseCalories = 0;
            if (foodDatabase.hasOwnProperty(foodName)) {
                baseCalories = foodDatabase[foodName];
            } else {
                // Perform smart matching search on keywords
                for (const key in foodDatabase) {
                    if (foodName.includes(key) && key.length > 3) {
                        baseCalories = foodDatabase[key];
                        break;
                    }
                }
            }

            const finalRowCalories = Math.round(baseCalories * amount);
            if (calOutput) calOutput.value = finalRowCalories;
            actuals[meal] += finalRowCalories;
        });
    });

    // Extract updated target balances
    const idealB = dynamicIdeals.breakfast;
    const idealL = dynamicIdeals.lunch;
    const idealD = dynamicIdeals.dinner;

    // Output target variables safely into metric panels
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

    // Direct interface data upload stream to Chart datasets
    calorieChart.data.datasets[0].data = [idealB, prescribedB, actuals.breakfast, diffB];
    calorieChart.data.datasets[1].data = [idealL, prescribedL, actuals.lunch, diffL];
    calorieChart.data.datasets[2].data = [idealD, prescribedD, actuals.dinner, diffD];
    
    calorieChart.update();
}

// ==========================================================================
// Dashboard General Event Listeners
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
        localStorage.removeItem('sagetraker_state_v2');
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

// ==========================================================================
// Tab Switching Architecture
// ==========================================================================
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

// Startup Initialization Execution
window.onload = function() {
    loadState();
};
