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
    temperature: [
        // Base unit for temperature is always Kelvin for conversion consistency
        { name: 'Celsius (°C)', abbr: 'C', toBase: (c) => c + 273.15, fromBase: (k) => k - 273.15 },
        { name: 'Fahrenheit (°F)', abbr: 'F', toBase: (f) => (f - 32) * 5/9 + 273.15, fromBase: (k) => (k - 273.15) * 9/5 + 32 },
        { name: 'Kelvin (K)', abbr: 'K', toBase: (k) => k, fromBase: (k) => k }, // Base Unit (Kelvin)
    ]
};

// --- DOM Elements ---
const typeSelect = document.getElementById('unit-type');
const valueInput = document.getElementById('value-input');
const unitFromSelect = document.getElementById('unit-from');
const unitToSelect = document.getElementById('unit-to');
const resultOutput = document.getElementById('result-output');
const convertButton = document.getElementById('convert-btn');
const swapButton = document.getElementById('swap-btn');
const recentConversionsList = document.getElementById('recent-conversions-list');

// Calculator DOM Elements
const calculatorDisplay = document.getElementById('calculator-display');
const calculatorButtons = document.getElementById('calculator-buttons');

// Calculator State
let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;


// ----------------------------------------------------------------------
// --- FIX #1: Security & Data Handling (sessionStorage for Conversions) ---
// ----------------------------------------------------------------------

const RECENT_CONVERSIONS_KEY = 'grifts-recent-conversions';
const MAX_RECENT_CONVERSIONS = 5;

/**
 * Custom utility to safely save data to session storage.
 */
function saveToSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to sessionStorage:', e);
    }
}

/**
 * Custom utility to safely load data from session storage.
 */
function loadFromSession(key, defaultValue = []) {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading from sessionStorage:', e);
        return defaultValue;
    }
}

/**
 * Renders the recent conversion list in the UI.
 */
function renderRecentConversions(conversions) {
    recentConversionsList.innerHTML = ''; // Clear existing list
    
    if (conversions.length === 0) {
        recentConversionsList.innerHTML = '<li>No recent conversions saved.</li>';
        return;
    }
    
    conversions.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        
        // Allow clicking a recent conversion to load the value into the main input
        li.addEventListener('click', () => {
            const match = text.match(/^([\d.]+)/);
            if (match) {
                valueInput.value = match[1];
                convertUnit();
            }
        });
        
        recentConversionsList.appendChild(li);
    });
}

/**
 * Saves a new conversion string to sessionStorage and updates the UI.
 * (Uses sessionStorage instead of memoryStore)
 */
function saveRecentConversion(conversionString) {
    let recents = loadFromMemory(RECENT_CONVERSIONS_KEY) || [];
    
    // Add new conversion to the front, filter duplicates, and limit size
    recents.unshift(conversionString);
    recents = [...new Set(recents)].slice(0, MAX_RECENT_CONVERSIONS);

    saveToMemory(RECENT_CONVERSIONS_KEY, recents);
    renderRecentConversions(recents);
}

function loadRecentConversions() {
    const recents = loadFromMemory(RECENT_CONVERSIONS_KEY) || [];
    renderRecentConversions(recents);
}

// ----------------------------------------------------------------------
// --- Unit Converter Core Logic ---
// ----------------------------------------------------------------------

/**
 * Finds a unit definition by its abbreviation for the given type.
 */
function getUnitByAbbr(type, abbr) {
    return UNIT_DEFINITIONS[type].find(unit => unit.abbr === abbr);
}

/**
 * Populates the 'From' and 'To' dropdowns based on the selected unit type.
 */
function populateUnitDropdowns(type) {
    const units = UNIT_DEFINITIONS[type];
    
    // Clear old options
    unitFromSelect.innerHTML = '';
    unitToSelect.innerHTML = '';
    
    units.forEach(unit => {
        const optionFrom = new Option(unit.name, unit.abbr);
        const optionTo = new Option(unit.name, unit.abbr);
        
        unitFromSelect.add(optionFrom);
        unitToSelect.add(optionTo);
    });
    
    // Set defaults (e.g., first unit is usually the base or most common)
    unitFromSelect.value = units[0].abbr;
    unitToSelect.value = units[1] ? units[1].abbr : units[0].abbr;
}

/**
 * Core conversion logic.
 */
function convertUnit() {
    const type = typeSelect.value;
    const value = parseFloat(valueInput.value);
    const abbrFrom = unitFromSelect.value;
    const abbrTo = unitToSelect.value;

    if (isNaN(value)) {
    resultOutput.textContent = 'Invalid Value';
    return;
}

    const unitFrom = getUnitByAbbr(type, abbrFrom);
    const unitTo = getUnitByAbbr(type, abbrTo);

    if (!unitFrom || !unitTo) {
        resultOutput.textContent = 'Error: Invalid units.';
        return;
    }

    let baseValue;
    let finalResult;
    let formattedResult;

    // Handle Temperature (Non-linear conversion)
    if (type === 'temperature') {
        // 1. Convert FROM value to Kelvin (base unit)
        baseValue = unitFrom.toBase(value);
        // 2. Convert from Kelvin to the final unit
        finalResult = unitTo.fromBase(baseValue);
    } 
    // Handle Linear Units (Length, Mass)
    else {
        // 1. Convert FROM value to Base Unit (factor is always conversion TO base)
        baseValue = value * unitFrom.factor;
        // 2. Convert from Base Unit to the final unit
        finalResult = baseValue / unitTo.factor;
    }
    
    // Format the result to 4 decimal places, avoiding scientific notation
    formattedResult = parseFloat(finalResult.toFixed(4));
    
    const resultText = `${value} ${unitFrom.abbr} = ${formattedResult} ${unitTo.abbr}`;
    resultOutput.textContent = formattedResult;

    // Save the conversion for the recent list
    saveRecentConversion(resultText);
}

/**
 * Swaps the 'from' and 'to' units in the dropdowns.
 */
function swapUnits() {
    const temp = unitFromSelect.value;
    unitFromSelect.value = unitToSelect.value;
    unitToSelect.value = temp;
    convertUnit();
}


// ----------------------------------------------------------------------
// --- Calculator Core Logic ---
// ----------------------------------------------------------------------

function updateCalculatorDisplay() {
    calculatorDisplay.value = displayValue;
}

function handleNumber(number) {
    if (waitingForSecondOperand === true) {
        displayValue = number;
        waitingForSecondOperand = false;
    } else {
        // Prevent multiple decimal points
        if (number === '.' && displayValue.includes('.')) {
            return;
        }
        displayValue = displayValue === '0' ? number : displayValue + number;
    }
    updateCalculatorDisplay();
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = calculateResult(firstOperand, inputValue, operator);
        
        displayValue = String(parseFloat(result.toFixed(8)));
        firstOperand = result;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
    updateCalculatorDisplay();
}

function handleEquals() {
    const inputValue = parseFloat(displayValue);
    
    if (firstOperand === null || operator === null) {
        // No pending operation, do nothing
        return;
    }

    const result = calculateResult(firstOperand, inputValue, operator);

    displayValue = String(parseFloat(result.toFixed(8)));
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateCalculatorDisplay();
}

function handleAction(action) {
    switch (action) {
        case 'clear':
            displayValue = '0';
            firstOperand = null;
            operator = null;
            waitingForSecondOperand = false;
            break;
        case 'backspace':
            displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
            break;
        case 'percent':
            const value = parseFloat(displayValue);
            displayValue = String(value / 100);
            break;
    }
    updateCalculatorDisplay();
}

function calculateResult(first, second, op) {
    switch (op) {
        case '+': return first + second;
        case '-': return first - second;
        case '*': return first * second;
        case '/': 
            if (second === 0) {
                showAlert('Error: Cannot divide by zero!', 'error');
                // Reset calculator state
                displayValue = '0';
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
                updateCalculatorDisplay();
                return 0;
            }
            return first / second;
        default: return second;
    }
}


// --- Initialization ---\ndocument.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Unit Converter
    
    populateUnitDropdowns(typeSelect.value); 
    loadRecentConversions(); // *** NOW USES SESSIONSTORAGE ***

    // Event listeners for Conversion
    typeSelect.addEventListener('change', (e) => {
        populateUnitDropdowns(e.target.value);
        convertUnit();
    });
    
    // Uses debounce utility from common.js (assumes debounce exists)
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