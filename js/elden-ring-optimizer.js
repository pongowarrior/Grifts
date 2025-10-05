/*
File: js/elden-ring-optimizer.js
Description: Elden Ring Build Optimizer with accurate game formulas and soft caps
*/

// ============================================================================
// 1. GAME DATA - Starting Classes
// ============================================================================

const STARTING_CLASSES = {
    vagabond: { name: 'Vagabond', level: 9, vigor: 15, mind: 10, endurance: 11, strength: 14, dexterity: 13, intelligence: 9, faith: 9, arcane: 7 },
    warrior: { name: 'Warrior', level: 8, vigor: 11, mind: 12, endurance: 11, strength: 10, dexterity: 16, intelligence: 10, faith: 8, arcane: 9 },
    hero: { name: 'Hero', level: 7, vigor: 14, mind: 9, endurance: 12, strength: 16, dexterity: 9, intelligence: 7, faith: 8, arcane: 11 },
    bandit: { name: 'Bandit', level: 5, vigor: 10, mind: 11, endurance: 10, strength: 9, dexterity: 13, intelligence: 9, faith: 8, arcane: 14 },
    astrologer: { name: 'Astrologer', level: 6, vigor: 9, mind: 15, endurance: 9, strength: 8, dexterity: 12, intelligence: 16, faith: 7, arcane: 9 },
    prophet: { name: 'Prophet', level: 7, vigor: 10, mind: 14, endurance: 8, strength: 11, dexterity: 10, intelligence: 7, faith: 16, arcane: 10 },
    samurai: { name: 'Samurai', level: 9, vigor: 12, mind: 11, endurance: 13, strength: 12, dexterity: 15, intelligence: 9, faith: 8, arcane: 8 },
    prisoner: { name: 'Prisoner', level: 9, vigor: 11, mind: 12, endurance: 11, strength: 11, dexterity: 14, intelligence: 14, faith: 6, arcane: 9 },
    confessor: { name: 'Confessor', level: 10, vigor: 10, mind: 13, endurance: 10, strength: 12, dexterity: 12, intelligence: 9, faith: 14, arcane: 9 },
    wretch: { name: 'Wretch', level: 1, vigor: 10, mind: 10, endurance: 10, strength: 10, dexterity: 10, intelligence: 10, faith: 10, arcane: 10 }
};

// ============================================================================
// 2. SOFT CAPS (Accurate Elden Ring Data)
// ============================================================================

const SOFT_CAPS = {
    vigor: [40, 60],      // HP: 1450 at 40, 1900 at 60
    mind: [55],           // FP: 220 at 55
    endurance: [50],      // Stamina: 155 at 50
    strength: [20, 55, 80],
    dexterity: [20, 55, 80],
    intelligence: [20, 50, 80],
    faith: [20, 50, 80],
    arcane: [20, 50, 80]
};

// ============================================================================
// 3. STATE MANAGEMENT
// ============================================================================

let currentBuild = {
    class: 'wretch',
    level: 1,
    stats: {
        vigor: 10,
        mind: 10,
        endurance: 10,
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        faith: 10,
        arcane: 10
    }
};

// ============================================================================
// 4. INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeCalculator();
    loadFromURL();
    trackToolUsage('elden_ring_optimizer');
});

/**
 * Initialize all event listeners and UI
 */
function initializeCalculator() {
    // Stat sliders
    const stats = ['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane'];
    stats.forEach(stat => {
        const slider = document.getElementById(stat);
        if (slider) {
            slider.addEventListener('input', () => updateStatDisplay(stat, slider.value));
            slider.addEventListener('change', calculateBuild);
        }
    });
    
    // Target level input
    document.getElementById('target-level')?.addEventListener('input', debounce(calculateBuild, 300));
    
    // Class buttons
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => selectClass(btn.dataset.class));
    });
    
    // Action buttons
    document.getElementById('calculate-btn')?.addEventListener('click', calculateBuild);
    document.getElementById('reset-btn')?.addEventListener('click', resetBuild);
    document.getElementById('copy-build-btn')?.addEventListener('click', copyBuild);
    document.getElementById('share-build-btn')?.addEventListener('click', shareBuild);
    document.getElementById('calc-weapon-btn')?.addEventListener('click', calculateWeaponDamage);
    
    // Initial calculation
    selectClass('wretch');
}

// ============================================================================
// 5. CLASS SELECTION
// ============================================================================

/**
 * Select starting class and load base stats
 */
function selectClass(className) {
    const classData = STARTING_CLASSES[className];
    if (!classData) return;
    
    currentBuild.class = className;
    currentBuild.level = classData.level;
    
    // Update stat sliders with class base stats
    Object.keys(currentBuild.stats).forEach(stat => {
        const value = classData[stat];
        currentBuild.stats[stat] = value;
        const slider = document.getElementById(stat);
        if (slider) {
            slider.value = value;
            updateStatDisplay(stat, value);
        }
    });
    
    // Visual feedback for selected class
    document.querySelectorAll('.class-btn').forEach(btn => {
        if (btn.dataset.class === className) {
            btn.style.background = 'var(--gradient-primary)';
            btn.style.color = 'var(--bg-dark)';
        } else {
            btn.style.background = '';
            btn.style.color = '';
        }
    });
    
    calculateBuild();
    showAlert(`${classData.name} selected (Level ${classData.level})`, 'success');
    trackEvent('class_selected', { class: className });
}

// ============================================================================
// 6. STAT CALCULATIONS
// ============================================================================

/**
 * Update stat display value and soft cap indicator
 */
function updateStatDisplay(stat, value) {
    const valueSpan = document.getElementById(`${stat}-value`);
    const capIndicator = document.getElementById(`${stat}-cap`);
    
    if (valueSpan) valueSpan.textContent = value;
    
    // Show soft cap indicator
    if (capIndicator) {
        const caps = SOFT_CAPS[stat] || [];
        let capText = '';
        
        if (caps.length > 0) {
            if (value >= caps[caps.length - 1]) {
                capText = '🔴 Hard Cap';
            } else if (caps.length > 1 && value >= caps[1]) {
                capText = '🟡 2nd Soft Cap';
            } else if (value >= caps[0]) {
                capText = '🟠 1st Soft Cap';
            }
        }
        
        capIndicator.textContent = capText;
        capIndicator.style.marginLeft = capText ? '0.5rem' : '0';
        capIndicator.style.fontSize = '0.75rem';
    }
    
    // Update specific stat displays
    if (stat === 'vigor') {
        const hp = calculateHP(parseInt(value));
        document.getElementById('vigor-hp').textContent = `HP: ${hp}`;
    } else if (stat === 'mind') {
        const fp = calculateFP(parseInt(value));
        document.getElementById('mind-fp').textContent = `FP: ${fp}`;
    } else if (stat === 'endurance') {
        const stamina = calculateStamina(parseInt(value));
        const equipLoad = calculateEquipLoad(parseInt(value));
        document.getElementById('endurance-stam').textContent = `Stamina: ${stamina} | Equip Load: ${equipLoad.toFixed(1)}`;
    }
}

/**
 * Calculate HP from Vigor (accurate Elden Ring formula)
 */
function calculateHP(vigor) {
    if (vigor <= 25) {
        return Math.floor(300 + (vigor - 1) * 500 / 24);
    } else if (vigor <= 40) {
        return Math.floor(800 + (vigor - 25) * 650 / 15);
    } else if (vigor <= 60) {
        return Math.floor(1450 + (vigor - 40) * 450 / 20);
    } else {
        return Math.floor(1900 + (vigor - 60) * 200 / 39);
    }
}

/**
 * Calculate FP from Mind (accurate formula)
 */
function calculateFP(mind) {
    if (mind <= 35) {
        return Math.floor(50 + (mind - 1) * 45 / 14);
    } else if (mind <= 55) {
        return Math.floor(160 + (mind - 35) * 60 / 20);
    } else {
        return Math.floor(220 + (mind - 55) * 30 / 44);
    }
}

/**
 * Calculate Stamina from Endurance
 */
function calculateStamina(endurance) {
    if (endurance <= 15) {
        return Math.floor(80 + (endurance - 1) * 25 / 14);
    } else if (endurance <= 30) {
        return Math.floor(105 + (endurance - 15) * 25 / 15);
    } else if (endurance <= 50) {
        return Math.floor(130 + (endurance - 30) * 25 / 20);
    } else {
        return Math.floor(155 + (endurance - 50) * 15 / 49);
    }
}

/**
 * Calculate Equip Load from Endurance
 */
function calculateEquipLoad(endurance) {
    if (endurance <= 25) {
        return 45 + (endurance - 8) * 27 / 17;
    } else if (endurance <= 60) {
        return 72 + (endurance - 25) * 48 / 35;
    } else {
        return 120 + (endurance - 60) * 40 / 39;
    }
}

/**
 * Calculate current level from stat distribution
 */
function calculateCurrentLevel() {
    const baseClass = STARTING_CLASSES[currentBuild.class];
    let totalStats = 0;
    let baseStats = 0;
    
    Object.keys(currentBuild.stats).forEach(stat => {
        totalStats += parseInt(currentBuild.stats[stat]);
        baseStats += baseClass[stat];
    });
    
    const pointsSpent = totalStats - baseStats;
    return baseClass.level + pointsSpent;
}

// ============================================================================
// 7. BUILD OPTIMIZATION
// ============================================================================

/**
 * Main build calculation and optimization
 */
function calculateBuild() {
    // Get all current stat values
    const stats = ['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane'];
    stats.forEach(stat => {
        const slider = document.getElementById(stat);
        if (slider) {
            currentBuild.stats[stat] = parseInt(slider.value);
        }
    });
    
    // Calculate current level
    const currentLevel = calculateCurrentLevel();
    const targetLevel = parseInt(document.getElementById('target-level')?.value || 150);
    const pointsRemaining = targetLevel - currentLevel;
    
    // Update displays
    document.getElementById('current-level-display').textContent = currentLevel;
    document.getElementById('result-level').textContent = currentLevel;
    document.getElementById('points-remaining').textContent = 
        `Points Remaining: ${pointsRemaining} (Target: ${targetLevel})`;
    
    if (pointsRemaining < 0) {
        document.getElementById('points-remaining').style.color = '#ff6b6b';
        showAlert('You are over your target level!', 'warning');
    } else {
        document.getElementById('points-remaining').style.color = 'var(--text-secondary)';
    }
    
    // Calculate derived stats
    const hp = calculateHP(currentBuild.stats.vigor);
    const fp = calculateFP(currentBuild.stats.mind);
    const stamina = calculateStamina(currentBuild.stats.endurance);
    const equipLoad = calculateEquipLoad(currentBuild.stats.endurance);
    
    // Update result displays
    document.getElementById('result-hp').textContent = hp;
    document.getElementById('result-fp').textContent = fp;
    document.getElementById('result-stamina').textContent = stamina;
    document.getElementById('result-equip').textContent = equipLoad.toFixed(1);
    
    // Generate soft cap warnings
    generateSoftCapWarnings();
    
    // Generate optimization tips
    generateOptimizationTips(pointsRemaining);
    
    trackEvent('build_calculated', { 
        level: currentLevel, 
        class: currentBuild.class 
    });
}

/**
 * Generate soft cap warnings
 */
function generateSoftCapWarnings() {
    const warnings = [];
    
    Object.keys(currentBuild.stats).forEach(stat => {
        const value = currentBuild.stats[stat];
        const caps = SOFT_CAPS[stat] || [];
        
        caps.forEach((cap, index) => {
            if (value === cap) {
                const capName = caps.length > 1 && index === 0 ? '1st soft cap' : 
                               caps.length > 1 && index === 1 ? '2nd soft cap' : 'soft cap';
                warnings.push(`<strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}</strong> is at ${capName} (${cap}). Returns diminish beyond this point.`);
            } else if (value > cap && value < cap + 5) {
                warnings.push(`<strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}</strong> is past ${index > 0 ? '2nd' : ''} soft cap (${cap}). Consider reallocating points.`);
            }
        });
    });
    
    const container = document.getElementById('soft-cap-warnings');
    if (container) {
        if (warnings.length === 0) {
            container.innerHTML = '<p style="margin: 0; opacity: 0.8;">✅ No soft cap issues detected. Your stat allocation is efficient!</p>';
        } else {
            container.innerHTML = warnings.map(w => `<p style="margin: 0.5rem 0;">⚠️ ${w}</p>`).join('');
        }
    }
}

/**
 * Generate optimization tips
 */
function generateOptimizationTips(pointsRemaining) {
    const tips = [];
    const stats = currentBuild.stats;
    
    // Vigor recommendations
    if (stats.vigor < 40) {
        tips.push('💪 <strong>Increase Vigor to 40</strong> for comfortable survivability in PvP and PvE (1450 HP).');
    } else if (stats.vigor >= 40 && stats.vigor < 60) {
        tips.push('❤️ <strong>Vigor is solid</strong> (40-60 is the sweet spot). Consider 60 for maximum survivability.');
    } else if (stats.vigor > 60) {
        tips.push('⚠️ <strong>Vigor above 60</strong> has very poor returns. Consider reallocating to damage stats.');
    }
    
    // Mind recommendations
    if (stats.mind < 20 && (stats.intelligence > 30 || stats.faith > 30)) {
        tips.push('💠 <strong>Increase Mind</strong> - Caster builds need FP! Aim for 25-35 minimum.');
    }
    
    // Endurance recommendations
    if (stats.endurance < 20) {
        tips.push('⚡ <strong>Low Endurance</strong> - Consider 20-30 for adequate stamina and equip load.');
    } else if (stats.endurance > 50) {
        tips.push('🎒 <strong>Endurance past 50</strong> only increases equip load, not stamina.');
    }
    
    // Build type detection
    const isStr = stats.strength >= stats.dexterity + 10;
    const isDex = stats.dexterity >= stats.strength + 10;
    const isInt = stats.intelligence > 40;
    const isFth = stats.faith > 40;
    const isQuality = Math.abs(stats.strength - stats.dexterity) <= 5 && stats.strength > 30;
    
    if (isStr) {
        tips.push('⚔️ <strong>Strength Build</strong> - Two-handing weapons gives 1.5x STR! Aim for 54 STR (81 when two-handing).');
    } else if (isDex) {
        tips.push('🗡️ <strong>Dexterity Build</strong> - Aim for 80 DEX for maximum scaling. Pairs well with bleed weapons.');
    } else if (isInt) {
        tips.push('✨ <strong>Intelligence Build</strong> - 80 INT is the goal for pure casters. 60 INT is sufficient for hybrid builds.');
    } else if (isFth) {
        tips.push('🔥 <strong>Faith Build</strong> - 80 FTH maximizes incantation damage. 60 is good for buffs.');
    } else if (isQuality) {
        tips.push('⚖️ <strong>Quality Build</strong> (STR+DEX) - Aim for 40/40 or 55/55 for balanced scaling.');
    }
    
    // Points remaining advice
    if (pointsRemaining > 20) {
        tips.push(`📊 <strong>${pointsRemaining} points remaining</strong> - You have room to optimize! Consider boosting your main damage stats to soft caps.`);
    } else if (pointsRemaining < 0) {
        tips.push(`🔴 <strong>Over-leveled!</strong> Reduce stats or increase target level to ${Math.abs(pointsRemaining)} to match your build.`);
    }
    
    const container = document.getElementById('tips-container');
    if (container) {
        container.innerHTML = tips.map(t => `<p style="margin: 0.5rem 0;">${t}</p>`).join('');
    }
}

// ============================================================================
// 8. WEAPON DAMAGE CALCULATOR
// ============================================================================

/**
 * Calculate weapon damage with scaling
 */
function calculateWeaponDamage() {
    const baseDamage = parseFloat(document.getElementById('weapon-base-damage')?.value || 0);
    const strScaling = parseFloat(document.getElementById('str-scaling')?.value || 0);
    const dexScaling = parseFloat(document.getElementById('dex-scaling')?.value || 0);
    const intScaling = parseFloat(document.getElementById('int-scaling')?.value || 0);
    const fthScaling = parseFloat(document.getElementById('fth-scaling')?.value || 0);
    const arcScaling = parseFloat(document.getElementById('arc-scaling')?.value || 0);
    
    if (baseDamage === 0) {
        showAlert('Enter weapon base damage first', 'warning');
        return;
    }
    
    // Calculate scaling bonus (simplified formula)
    const strBonus = (currentBuild.stats.strength * strScaling * 0.01) * baseDamage;
    const dexBonus = (currentBuild.stats.dexterity * dexScaling * 0.01) * baseDamage;
    const intBonus = (currentBuild.stats.intelligence * intScaling * 0.01) * baseDamage;
    const fthBonus = (currentBuild.stats.faith * fthScaling * 0.01) * baseDamage;
    const arcBonus = (currentBuild.stats.arcane * arcScaling * 0.01) * baseDamage;
    
    const totalScaling = strBonus + dexBonus + intBonus + fthBonus + arcBonus;
    const totalDamage = baseDamage + totalScaling;
    
    // Display results
    const resultDiv = document.getElementById('weapon-result');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        document.getElementById('weapon-total-damage').textContent = Math.round(totalDamage);
        document.getElementById('weapon-base-display').textContent = Math.round(baseDamage);
        document.getElementById('weapon-scaling-display').textContent = Math.round(totalScaling);
        
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    trackEvent('weapon_damage_calculated', { total_damage: Math.round(totalDamage) });
}

// ============================================================================
// 9. BUILD MANAGEMENT
// ============================================================================

/**
 * Copy build to clipboard
 */
function copyBuild() {
    const level = calculateCurrentLevel();
    const stats = currentBuild.stats;
    
    const text = `
🗡️ Elden Ring Build - ${STARTING_CLASSES[currentBuild.class].name}

Level: ${level}
─────────────
Vigor: ${stats.vigor} (HP: ${calculateHP(stats.vigor)})
Mind: ${stats.mind} (FP: ${calculateFP(stats.mind)})
Endurance: ${stats.endurance} (Stamina: ${calculateStamina(stats.endurance)})
─────────────
Strength: ${stats.strength}
Dexterity: ${stats.dexterity}
Intelligence: ${stats.intelligence}
Faith: ${stats.faith}
Arcane: ${stats.arcane}

Generated by GRIFTS Elden Ring Optimizer
https://grifts.co.uk/gaming/elden-ring-optimizer.html
    `.trim();
    
    copyToClipboard(text, document.getElementById('copy-build-btn'));
}

/**
 * Generate shareable URL with build data
 */
function shareBuild() {
    const stats = currentBuild.stats;
    const params = new URLSearchParams({
        c: currentBuild.class,
        v: stats.vigor,
        m: stats.mind,
        e: stats.endurance,
        s: stats.strength,
        d: stats.dexterity,
        i: stats.intelligence,
        f: stats.faith,
        a: stats.arcane
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    copyToClipboard(url, document.getElementById('share-build-btn'));
    showAlert('Build URL copied! Share it with your friends.', 'success');
    
    trackEvent('build_shared', { class: currentBuild.class });
}

/**
 * Load build from URL parameters
 */
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('c')) {
        const className = params.get('c');
        selectClass(className);
        
        // Override with URL stats
        if (params.has('v')) document.getElementById('vigor').value = params.get('v');
        if (params.has('m')) document.getElementById('mind').value = params.get('m');
        if (params.has('e')) document.getElementById('endurance').value = params.get('e');
        if (params.has('s')) document.getElementById('strength').value = params.get('s');
        if (params.has('d')) document.getElementById('dexterity').value = params.get('d');
        if (params.has('i')) document.getElementById('intelligence').value = params.get('i');
        if (params.has('f')) document.getElementById('faith').value = params.get('f');
        if (params.has('a')) document.getElementById('arcane').value = params.get('a');
        
        // Update displays
        ['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane'].forEach(stat => {
            const slider = document.getElementById(stat);
            if (slider) updateStatDisplay(stat, slider.value);
        });
        
        calculateBuild();
        showAlert('Build loaded from shared link!', 'success');
    }
}

/**
 * Reset build to class defaults
 */
function resetBuild() {
    if (!confirm('Reset to starting class stats?')) return;
    
    selectClass(currentBuild.class);
    showAlert('Build reset to class defaults', 'info');
}