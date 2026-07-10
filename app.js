// Initialize Chart frame architecture
const ctx = document.getElementById('calorieChart').getContext('2d');
const calorieChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Ideal', 'Prescribed', 'Actual', 'Difference'],
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
            y: { beginAtZero: false, suggestedMin: -100, suggestedMax: 1600 }
        },
        plugins: {
            legend: { position: 'right', labels: { boxWidth: 12 } }
        }
    }
});

// Flat database where sized variations will be compiled
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

// Fully Universal Dynamic Calculation Engine
function calculateDynamicTargets() {
    // Reads whatever parameters are typed live inside the input elements
    const age = parseFloat(document.getElementById('profile-age')?.value) || 18;
    const weight = parseFloat(document.getElementById('profile-weight')?.value) || 75;
    const height = parseFloat(document.getElementById('profile-height')?.value) || 180;
    const activity = parseFloat(document.getElementById('profile-activity')?.value) || 1.55;

    // Universal Mifflin-St Jeor Equation Matrix
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const totalDailyTDEE = Math.round(bmr * activity);

    // Splits allocations dynamically based on calculated totals
    return {
        breakfast: Math.round(totalDailyTDEE * 0.25), 
        lunch: Math.round(totalDailyTDEE * 0.40),     
        dinner: Math.round(totalDailyTDEE * 0.35)     
    };
}

// Central processing engine handling math changes smoothly
function updateCalculations() {
    const dynamicIdeals = calculateDynamicTargets();
    const meals = ['breakfast', 'lunch', 'dinner'];
    const actuals = { breakfast: 0, lunch: 0, dinner: 0 };

    meals.forEach(meal => {
        const rows = document.querySelectorAll(`tbody[data-meal="${meal}"] tr:not(.total-row)`);
        
        rows.forEach(row => {
            const foodName = row.querySelector('.food-input').value.trim().toLowerCase();
            const amount = parseFloat(row.querySelector('.amount-input').value) || 0;
            const calOutput = row.querySelector('.cal-output-field');
            
            let baseCalories = 0;
            if (foodDatabase.hasOwnProperty(foodName)) {
                baseCalories = foodDatabase[foodName];
            } else {
                for (const key in foodDatabase) {
                    if (foodName.includes(key) && key.length > 3) {
                        baseCalories = foodDatabase[key];
                        break;
                    }
                }
            }

            const finalRowCalories = Math.round(baseCalories * amount);
            calOutput.value = finalRowCalories;
            actuals[meal] += finalRowCalories;
        });

        const totalElement = document.getElementById(`total-${meal}`);
        if (totalElement) totalElement.innerText = actuals[meal];
    });

    const idealB = dynamicIdeals.breakfast;
    const idealL = dynamicIdeals.lunch;
    const idealD = dynamicIdeals.dinner;

    // Reflect freshly calculated values down into tracking panels
    const idealInputB = document.querySelector('.mockup-input[data-type="ideal"][data-meal="0"]');
    if (idealInputB) idealInputB.value = idealB;
    const idealInputL = document.querySelector('.mockup-input[data-type="ideal"][data-meal="1"]');
    if (idealInputL) idealInputL.value = idealL;
    const idealInputD = document.querySelector('.mockup-input[data-type="ideal"][data-meal="2"]');
    if (idealInputD) idealInputD.value = idealD;

    let prescribedB = Number(document.querySelector('.mockup-input[data-type="prescribed"][data-meal="0"]')?.value) || 0;
    let prescribedL = Number(document.querySelector('.mockup-input[data-type="prescribed"][data-meal="1"]')?.value) || 0;
    let prescribedD = Number(document.querySelector('.mockup-input[data-type="prescribed"][data-meal="2"]')?.value) || 0;

    let diffB = idealB - actuals.breakfast;
    let diffL = idealL - actuals.lunch;
    let diffD = idealD - actuals.dinner;

    if (document.getElementById('mockup-actual-b')) document.getElementById('mockup-actual-b').innerText = actuals.breakfast;
    if (document.getElementById('mockup-actual-l')) document.getElementById('mockup-actual-l').innerText = actuals.lunch;
    if (document.getElementById('mockup-actual-d')) document.getElementById('mockup-actual-d').innerText = actuals.dinner;
    if (document.getElementById('mockup-diff-b')) document.getElementById('mockup-diff-b').innerText = diffB;
    if (document.getElementById('mockup-diff-l')) document.getElementById('mockup-diff-l').innerText = diffL;
    if (document.getElementById('mockup-diff-d')) document.getElementById('mockup-diff-d').innerText = diffD;

    // Stream dynamic values straight to chart configuration
    calorieChart.data.datasets[0].data = [idealB, prescribedB, actuals.breakfast, diffB];
    calorieChart.data.datasets[1].data = [idealL, prescribedL, actuals.lunch, diffL];
    calorieChart.data.datasets[2].data = [idealD, prescribedD, actuals.dinner, diffD];
    
    calorieChart.update();
}

// Global broad input capture handler
document.body.addEventListener('input', function(e) {
    if (e.target.classList.contains('food-input') || 
        e.target.classList.contains('amount-input') || 
        e.target.classList.contains('mockup-input') ||
        ['profile-age', 'profile-weight', 'profile-height', 'profile-activity'].includes(e.target.id)) {
        updateCalculations();
    }
});

// Run calculation pipelines immediately on load execution
updateCalculations();

// Tab Switch Functionality Helper
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event) window.event.currentTarget.classList.add('active');

    const mealBlock = document.querySelector('.meal-section');
    const chartBlock = document.querySelector('.chart-section');
    const matrixBlock = document.querySelector('.matrix-section');

    if (tabId === 'all') {
        mealBlock?.classList.remove('hidden-tab');
        chartBlock?.classList.remove('hidden-tab');
        matrixBlock?.classList.remove('hidden-tab');
    } else {
        mealBlock?.classList.toggle('hidden-tab', tabId !== 'meals');
        chartBlock?.classList.toggle('hidden-tab', tabId !== 'analytics');
        matrixBlock?.classList.toggle('hidden-tab', tabId !== 'matrix');
    }
}
