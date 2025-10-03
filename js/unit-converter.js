// --- Global Constants & Unit Definitions ---

// Base unit for calculation is always the unit with factor: 1.
// The factor is for converting FROM the unit TO the base unit.
const UNIT_DEFINITIONS = {
    length: [
        { name: 'Meters (m)', abbr: 'm', factor: 1 },                 // Base Unit (Meter)
        { name: 'Kilometers (km)', abbr: 'km', factor: 1000 },
        { name: 'Centimeters (cm)', abbr: 'cm', factor: 0.01 },
        { name: 'Inches (in)', abbr: 'in', factor: 0.0254 },        // 1 in = 0.0254 m
        { name: 'Feet (ft)', abbr: 'ft', factor: 0.3048 },          // 1 ft = 0.3048 m
        { name: 'Miles (mi)', abbr: 'mi', factor: 1609.34 },        // 1 mi = 1609.34 m
    ],
    mass: [
        { name: 'Grams (g)', abbr: 'g', factor: 1 },                // Base Unit (Gram)
        { name: 'Kilograms (kg)', abbr: 'kg', factor: 1000 },
        { name: 'Milligrams (mg)', abbr: 'mg', factor: 0.001 },
        { name: 'Pounds (lb)', abbr: 'lb', factor: 453.592 },       // 1 lb = 453.592 g
        { name: 'Ounces (oz)', abbr: 'oz', factor: 28.3495 },        // 1 oz = 28.3495 g
    ],
    // Temperature requires special handling (not simple multiplication)
    temp: [
        { name: 'Celsius (°C)', abbr: 'C', factor: 1 },             
        { name: 'Fahrenheit (°F)', abbr: 'F', factor: 1 },
        { name: 'Kelvin (K)', abbr: 'K', factor: 1 },
    ],
    area: [
        { name: 'Square Meters (m²)', abbr: 'm2', factor: 1 },       // Base Unit (m²)
        { name: 'Square Kilometers (km²)', abbr: 'km2', factor: 1000000 },
        { name: 'Square Feet (ft²)', abbr: 'ft2', factor: 0.092903 },
        { name: 'Acres', abbr: 'ac', factor: 4046.86 },
    ],
    volume: [
        { name: 'Liters (L)', abbr: 'L', factor: 1 },               // Base Unit (Liter)
        { name: 'Milliliters (mL)', abbr: 'mL', factor: 0.001 },
        { name: 'Cubic Meters (m³)', abbr: 'm3', factor: 1000 },
        { name: 'US Gallons (gal)', abbr: 'gal', factor: 3.78541 },
        { name: 'US Quarts (qt)', abbr: 'qt', factor: 0.946353 },
    ]
};

const MAX_RECENT_CONVERSIONS = 5;
const RECENT_CONVERSIONS_KEY = 'grifts_recent_conversions';


// --- DOM Elements ---
const typeSelect = document.getElementById('conversion-type-select');
const valueInput = document.getElementById('conversion-value-input');
const unitFromSelect = document.getElementById('unit-from-select');
const unitToSelect = document.getElementById('unit-to-select');
const swapButton = document.getElementById('swap-btn');
const convertButton = document.getElementById('convert-btn');
const resultOutput = document.getElementById('conversion-result-output');
const recentList = document.getElementById('recent-conversions-list');
const calculatorOutput = document.getElementById('calculator-output');
const calculatorButtons = document.querySelector('.calc-buttons');


// --- Unit Conversion Functions ---

function populateUnitDropdowns(type) {
    const units = UNIT_DEFINITIONS[type];
    if (!units) return;

    unitFromSelect.innerHTML = '';
    unitToSelect.innerHTML = '';

    units.forEach(unit => {
        const option = `<option value="${unit.abbr}">${unit.name}</option>`;
        unitFromSelect.insertAdjacentHTML('beforeend', option);
        unitToSelect.insertAdjacentHTML('beforeend', option);
    });

    // Set initial sensible defaults
    if (type === 'length') { unitFromSelect.value = 'm'; unitToSelect.value = 'ft'; } 
    else if (type === 'mass') { unitFromSelect.value = 'kg'; unitToSelect.value = 'lb'; } 
    else if (type === 'temp') { unitFromSelect.value = 'C'; unitToSelect.value = 'F'; }
}

function getUnitByAbbr(type, abbr) {
    const units = UNIT_DEFINITIONS[type];
    return units ? units.find(u => u.abbr === abbr) : null;
}

function convertUnit() {
    const type = typeSelect.value;
    const value = parseFloat(valueInput.value);
    const fromAbbr = unitFromSelect.value;
    const toAbbr = unitToSelect.value;

    if (isNaN(value) || value <= 0) {
        resultOutput.textContent = 'Invalid Value';
        return;
    }

    if (fromAbbr === toAbbr) {
        resultOutput.textContent = value;
        return;
    }

    let result = 0;
    
    // --- SPECIAL HANDLING: TEMPERATURE ---
    if (type === 'temp') {
        let tempInC = 0; 

        // 1. Convert FROM unit to Celsius (C)
        if (fromAbbr === 'F') {
            tempInC = (value - 32) * (5/9);
        } else if (fromAbbr === 'K') {
            tempInC = value - 273.15;
        } else { tempInC = value; } // Already C

        // 2. Convert FROM Celsius (C) to TO unit
        if (toAbbr === 'F') {
            result = (tempInC * (9/5)) + 32;
        } else if (toAbbr === 'K') {
            result = tempInC + 273.15;
        } else { result = tempInC; } // To C
    } 
    // --- STANDARD CONVERSION (Length, Mass, Area, Volume) ---
    else {
        const fromUnit = getUnitByAbbr(type, fromAbbr);
        const toUnit = getUnitByAbbr(type, toAbbr);
        
        // 1. Convert FROM value TO Base Unit (Value * From_Factor)
        const valueInBase = value * fromUnit.factor;

        // 2. Convert Base Unit value TO TO unit (Base / To_Factor)
        result = valueInBase / toUnit.factor;
    }

    // Format the result: Max 6 decimal places, trim trailing zeros
    const formattedResult = result.toFixed(6).replace(/\.?0+$/, ''); 
    resultOutput.textContent = formattedResult;
    
    // Save to recents
    const fromName = getUnitByAbbr(type, fromAbbr).name;
    const toName = getUnitByAbbr(type, toAbbr).name;
    const conversionString = `${value} ${fromName} = ${formattedResult} ${toName}`;
    saveRecentConversion(conversionString);
}

function swapUnits() {
    const tempValue = unitFromSelect.value;
    unitFromSelect.value = unitToSelect.value;
    unitToSelect.value = tempValue;
    convertUnit(); 
}

// --- Local Storage / Recent Conversion Management ---

function saveRecentConversion(conversionString) {
    if (!window.localStorage) return;

    try {
        let recents = JSON.parse(localStorage.getItem(RECENT_CONVERSIONS_KEY)) || [];
        
        // Add new conversion to the front, filter duplicates, and limit size
        recents.unshift(conversionString);
        recents = [...new Set(recents)].slice(0, MAX_RECENT_CONVERSIONS);

        localStorage.setItem(RECENT_CONVERSIONS_KEY, JSON.stringify(recents));
        renderRecentConversions(recents);
    } catch (e) {
        console.error("Could not save to localStorage:", e);
    }
}

function loadRecentConversions() {
    if (!window.localStorage) return;

    try {
        const recents = JSON.parse(localStorage.getItem(RECENT_CONVERSIONS_KEY)) || [];
        renderRecentConversions(recents);
    } catch (e) {
        recentList.innerHTML = '<li>Error loading recents.</li>';
    }
}

function renderRecentConversions(recents) {
    if (recents.length === 0) {
        recentList.innerHTML = '<li>No recent conversions saved.</li>';
        return;
    }

    const html = recents.map(conv => `<li>${conv}</li>`).join('');
    recentList.innerHTML = html;
}

// --- Basic Calculator Logic (Simple State Machine) ---

let currentInput = '0';
let currentOperator = null;
let firstOperand = null;
let waitingForSecondOperand = false;

function updateCalculatorDisplay() {
    // Show a scientific notation for very long results
    calculatorOutput.value = currentInput.length > 15 ? 
        parseFloat(currentInput).toExponential(5) : currentInput;
}

function handleNumber(number) {
    if (waitingForSecondOperand === true) {
        currentInput = number === '.' ? '0.' : number;
        waitingForSecondOperand = false;
    } else {
        if (number === '.') {
            if (!currentInput.includes('.')) {
                currentInput += number;
            }
        } else {
            // Prevent multiple leading zeros, unless it's a decimal
            currentInput = (currentInput === '0' && number !== '.') ? number : currentInput + number;
        }
    }
    updateCalculatorDisplay();
}

function handleAction(action) {
    const currentValue = parseFloat(currentInput);

    if (action === 'clear') {
        currentInput = '0';
        firstOperand = null;
        currentOperator = null;
        waitingForSecondOperand = false;
    } else if (action === 'negate') {
        currentInput = (currentValue * -1).toString();
    } else if (action === 'percent') {
        currentInput = (currentValue / 100).toString();
    }
    updateCalculatorDisplay();
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (firstOperand === null && !isNaN(inputValue)) {
        firstOperand = inputValue;
    } else if (currentOperator) {
        const result = performCalculation(firstOperand, inputValue, currentOperator);
        currentInput = parseFloat(result.toFixed(10)).toString(); 
        firstOperand = parseFloat(currentInput);
    }

    waitingForSecondOperand = true;
    currentOperator = nextOperator;
    updateCalculatorDisplay();
}

function performCalculation(op1, op2, operator) {
    switch (operator) {
        case '+': return op1 + op2;
        case '-': return op1 - op2;
        case '*': return op1 * op2;
        case '/': 
            if (op2 === 0) {
                showAlert('Cannot divide by zero!', 'error');
                return op1; 
            }
            return op1 / op2;
        default: return op2;
    }
}

function handleEquals() {
    if (currentOperator === null) { return; } // Nothing to calculate
    
    const secondOperand = waitingForSecondOperand ? firstOperand : parseFloat(currentInput);
    const result = performCalculation(firstOperand, secondOperand, currentOperator);
    
    currentInput = parseFloat(result.toFixed(10)).toString(); 
    firstOperand = parseFloat(currentInput);
    waitingForSecondOperand = true; 
    
    updateCalculatorDisplay();
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Unit Converter
    
    populateUnitDropdowns(typeSelect.value); 
    loadRecentConversions();

    // Event listeners for Conversion
    typeSelect.addEventListener('change', (e) => {
        populateUnitDropdowns(e.target.value);
        convertUnit();
    });
    
    // Uses debounce utility from common.js to prevent rapid firing on input
    valueInput.addEventListener('input', typeof debounce === 'function' ? debounce(convertUnit, 200) : convertUnit);
    unitFromSelect.addEventListener('change', convertUnit);
    unitToSelect.addEventListener('change', convertUnit);
    convertButton.addEventListener('click', convertUnit);
    swapButton.addEventListener('click', swapUnits);

    convertUnit();
    
    
    // 2. Initialize Basic Calculator
    updateCalculatorDisplay();
    
    calculatorButtons.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('button')) return;

        const value = target.dataset.value;
        const action = target.dataset.action;

        if (target.classList.contains('number') || value === '.') {
            handleNumber(value);
        } else if (action === 'operator') {
            handleOperator(value);
        } else if (action === 'equals') {
            handleEquals();
        } else if (action) {
            handleAction(action);
        }
    });
});
