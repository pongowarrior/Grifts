/*
File: js/dps-calculator.js
Description: DPS Calculator logic with build comparison and optimization tips
*/

// ============================================================================
// 1. STATE MANAGEMENT
// ============================================================================

let currentBuild = null;
let savedBuilds = [];

// ============================================================================
// 2. INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeCalculator();
    loadSavedBuilds();
    trackToolUsage('dps_calculator');
});

/**
 * Initialize calculator event listeners
 */
function initializeCalculator() {
    // Get all input elements
    const inputs = [
        'base-damage',
        'attack-speed',
        'crit-chance',
        'crit-multiplier',
        'damage-bonus',
        'armor-reduction'
    ];
    
    // Add real-time calculation on input change
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(calculateDPS, 300));
        }
    });
    
    // Button event listeners
    document.getElementById('calculate-btn')?.addEventListener('click', calculateDPS);
    document.getElementById('reset-btn')?.addEventListener('click', resetCalculator);
    document.getElementById('copy-results-btn')?.addEventListener('click', copyResults);
    document.getElementById('share-build-btn')?.addEventListener('click', shareBuild);
    document.getElementById('save-build-btn')?.addEventListener('click', saveBuild);
    
    // Calculate on page load with default values
    calculateDPS();
}

// ============================================================================
// 3. CORE DPS CALCULATION
// ============================================================================

/**
 * Main DPS calculation function
 */
function calculateDPS() {
    // Get input values
    const baseDamage = parseFloat(document.getElementById('base-damage').value) || 0;
    const attackSpeed = parseFloat(document.getElementById('attack-speed').value) || 0;
    const critChance = parseFloat(document.getElementById('crit-chance').value) || 0;
    const critMultiplier = parseFloat(document.getElementById('crit-multiplier').value) || 1;
    const damageBonus = parseFloat(document.getElementById('damage-bonus').value) || 0;
    const armorReduction = parseFloat(document.getElementById('armor-reduction').value) || 0;
    
    // Validate inputs
    if (baseDamage <= 0 || attackSpeed <= 0) {
        showAlert('Please enter valid base damage and attack speed', 'warning');
        return;
    }
    
    // Clamp values to reasonable ranges
    const effectiveCritChance = Math.min(Math.max(critChance, 0), 100) / 100;
    const effectiveArmor = Math.min(Math.max(armorReduction, 0), 100) / 100;
    
    // Calculate damage with bonuses
    const bonusMultiplier = 1 + (damageBonus / 100);
    const modifiedBaseDamage = baseDamage * bonusMultiplier;
    
    // Calculate average damage per hit (accounting for crits)
    const nonCritDamage = modifiedBaseDamage * (1 - effectiveCritChance);
    const critDamage = modifiedBaseDamage * critMultiplier * effectiveCritChance;
    const avgDamagePerHit = nonCritDamage + critDamage;
    
    // Calculate base DPS (before crits)
    const baseDPS = modifiedBaseDamage * attackSpeed;
    
    // Calculate DPS with crits
    const dpsWithCrits = avgDamagePerHit * attackSpeed;
    
    // Calculate DPS contribution from crits alone
    const critDPSContribution = (modifiedBaseDamage * (critMultiplier - 1) * effectiveCritChance) * attackSpeed;
    
    // Apply armor reduction
    const finalDPS = dpsWithCrits * (1 - effectiveArmor);
    
    // Store current build
    currentBuild = {
        baseDamage,
        attackSpeed,
        critChance,
        critMultiplier,
        damageBonus,
        armorReduction,
        results: {
            totalDPS: finalDPS,
            avgDamagePerHit,
            baseDPS,
            critDPSContribution,
            dpsBeforeArmor: dpsWithCrits
        }
    };
    
    // Display results
    displayResults(currentBuild);
    
    // Track calculation
    trackEvent('dps_calculated', {
        total_dps: Math.round(finalDPS),
        has_crits: critChance > 0,
        has_armor: armorReduction > 0
    });
}

// ============================================================================
// 4. RESULTS DISPLAY
// ============================================================================

/**
 * Display calculation results
 */
function displayResults(build) {
    const resultsCard = document.getElementById('results-card');
    if (!resultsCard) return;
    
    // Show results card
    resultsCard.style.display = 'block';
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    const { results } = build;
    
    // Update main DPS display
    document.getElementById('total-dps').textContent = formatNumber(results.totalDPS, 1);
    
    // Update breakdown
    document.getElementById('avg-hit').textContent = formatNumber(results.avgDamagePerHit, 1);
    document.getElementById('base-dps').textContent = formatNumber(results.baseDPS, 1);
    document.getElementById('crit-dps').textContent = `+${formatNumber(results.critDPSContribution, 1)}`;
    document.getElementById('effective-crit').textContent = `${build.critChance.toFixed(1)}%`;
    document.getElementById('post-armor-dps').textContent = formatNumber(results.totalDPS, 1);
    
    // Generate optimization tips
    displayOptimizationTips(build);
}

/**
 * Generate and display optimization tips
 */
function displayOptimizationTips(build) {
    const tipsContainer = document.getElementById('tips-container');
    if (!tipsContainer) return;
    
    const tips = [];
    
    // Analyze crit stats
    if (build.critChance === 0) {
        tips.push('💡 <strong>Add critical hit chance</strong> - Even 10-20% crit can significantly boost DPS');
    } else if (build.critChance < 30 && build.critMultiplier > 2.5) {
        tips.push('⚖️ <strong>Balance your crits</strong> - High crit multiplier with low crit chance is inefficient. Increase crit chance for better returns.');
    } else if (build.critChance > 60 && build.critMultiplier < 2) {
        tips.push('⚖️ <strong>Increase crit multiplier</strong> - With high crit chance, boosting crit damage will give better returns than more crit chance.');
    } else if (build.critChance >= 30 && build.critMultiplier >= 2) {
        tips.push('✅ <strong>Well-balanced crits</strong> - Your critical hit stats are optimized. Focus on base damage or attack speed.');
    }
    
    // Analyze attack speed
    if (build.attackSpeed < 1) {
        tips.push('⚡ <strong>Consider attack speed</strong> - Slow weapons benefit more from +% damage. Fast weapons benefit more from flat damage bonuses.');
    } else if (build.attackSpeed > 2.5) {
        tips.push('⚡ <strong>Fast attacker</strong> - With high attack speed, flat damage bonuses (+X damage per hit) are extremely valuable.');
    }
    
    // Analyze armor
    if (build.armorReduction > 50) {
        tips.push('🛡️ <strong>High enemy armor detected</strong> - Armor penetration or % armor reduction becomes exponentially valuable. Prioritize these stats!');
    } else if (build.armorReduction > 30) {
        tips.push('🛡️ <strong>Moderate armor</strong> - Consider armor penetration to boost effective DPS by ' + 
                  Math.round((build.armorReduction / (100 - build.armorReduction)) * 100) + '%');
    }
    
    // Damage bonus analysis
    if (build.damageBonus > 100) {
        tips.push('📊 <strong>High % bonuses</strong> - With ' + build.damageBonus + '% bonus, flat damage additions become more valuable than additional % increases.');
    }
    
    // DPS breakpoints
    const dps = build.results.totalDPS;
    if (dps < 500) {
        tips.push('🎯 <strong>Early game build</strong> - Focus on upgrading weapon base damage first for biggest impact.');
    } else if (dps >= 1000 && dps < 5000) {
        tips.push('🎯 <strong>Mid-game build</strong> - Balance all stats. Small improvements to any stat will help.');
    } else if (dps >= 5000) {
        tips.push('🎯 <strong>End-game build</strong> - Min-maxing is critical. Use the comparison tool to test gear upgrades.');
    }
    
    // Display tips
    if (tips.length === 0) {
        tipsContainer.innerHTML = '<p style="margin: 0;">Your build looks solid! Save it and compare with alternatives.</p>';
    } else {
        tipsContainer.innerHTML = tips.map(tip => `<p style="margin: 0.5rem 0;">${tip}</p>`).join('');
    }
}

// ============================================================================
// 5. BUILD MANAGEMENT
// ============================================================================

/**
 * Save current build for comparison
 */
function saveBuild() {
    if (!currentBuild) {
        showAlert('Calculate DPS first before saving', 'warning');
        return;
    }
    
    // Prompt for build name
    const buildName = prompt('Enter a name for this build:', `Build ${savedBuilds.length + 1}`);
    if (!buildName) return;
    
    // Create build object
    const build = {
        id: generateId(),
        name: buildName,
        timestamp: Date.now(),
        ...currentBuild
    };
    
    // Save to memory
    savedBuilds.push(build);
    saveToMemory('dps_saved_builds', savedBuilds);
    
    // Update UI
    displaySavedBuilds();
    showAlert(`Build "${buildName}" saved!`, 'success');
    
    trackEvent('dps_build_saved', { build_name: buildName });
}

/**
 * Load saved builds from memory
 */
function loadSavedBuilds() {
    savedBuilds = loadFromMemory('dps_saved_builds', []);
    displaySavedBuilds();
}

/**
 * Display saved builds
 */
function displaySavedBuilds() {
    const container = document.getElementById('saved-builds');
    if (!container) return;
    
    if (savedBuilds.length === 0) {
        container.innerHTML = '<p style="opacity: 0.6; text-align: center; padding: 1rem 0;">No saved builds yet</p>';
        return;
    }
    
    container.innerHTML = savedBuilds.map(build => `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem; background: rgba(0, 245, 160, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                <div>
                    <h4 style="margin: 0 0 0.25rem; font-size: 1rem;">${sanitizeHTML(build.name)}</h4>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.7;">${formatDate(build.timestamp, 'datetime')}</p>
                </div>
                <span style="font-size: 1.25rem; font-weight: 900; color: var(--accent-green);">
                    ${formatNumber(build.results.totalDPS, 0)}
                </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.75rem;">
                <div>💥 Dmg: ${build.baseDamage}</div>
                <div>⚡ APS: ${build.attackSpeed}</div>
                <div>🎯 Crit: ${build.critChance}%</div>
                <div>✨ Mult: ${build.critMultiplier}x</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                <button class="btn btn-sm btn-secondary" onclick="loadBuild('${build.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.75rem;">
                    📥 Load
                </button>
                <button class="btn btn-sm btn-secondary" onclick="compareBuild('${build.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.75rem;">
                    ⚖️ Compare
                </button>
                <button class="btn btn-sm btn-secondary" onclick="deleteBuild('${build.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.75rem;">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Load a saved build into the calculator
 */
function loadBuild(buildId) {
    const build = savedBuilds.find(b => b.id === buildId);
    if (!build) return;
    
    // Load values into inputs
    document.getElementById('base-damage').value = build.baseDamage;
    document.getElementById('attack-speed').value = build.attackSpeed;
    document.getElementById('crit-chance').value = build.critChance;
    document.getElementById('crit-multiplier').value = build.critMultiplier;
    document.getElementById('damage-bonus').value = build.damageBonus;
    document.getElementById('armor-reduction').value = build.armorReduction;
    
    // Recalculate
    calculateDPS();
    showAlert(`Loaded build: ${build.name}`, 'success');
    
    // Scroll to calculator
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Compare current build with saved build
 */
function compareBuild(buildId) {
    const savedBuild = savedBuilds.find(b => b.id === buildId);
    if (!savedBuild || !currentBuild) {
        showAlert('Calculate current DPS first', 'warning');
        return;
    }
    
    const currentDPS = currentBuild.results.totalDPS;
    const savedDPS = savedBuild.results.totalDPS;
    const difference = currentDPS - savedDPS;
    const percentChange = ((difference / savedDPS) * 100).toFixed(1);
    
    let message = `<strong>Comparison:</strong><br>`;
    message += `Current: ${formatNumber(currentDPS, 0)} DPS<br>`;
    message += `${savedBuild.name}: ${formatNumber(savedDPS, 0)} DPS<br>`;
    message += `<strong>Difference: ${difference > 0 ? '+' : ''}${formatNumber(difference, 0)} DPS (${percentChange}%)</strong>`;
    
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        border: 2px solid var(--accent-green);
        padding: 2rem;
        border-radius: var(--radius-md);
        z-index: 10001;
        max-width: 400px;
        box-shadow: var(--shadow-lg);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-primary btn-block';
    closeBtn.style.marginTop = '1rem';
    closeBtn.onclick = () => messageDiv.remove();
    
    messageDiv.appendChild(closeBtn);
    document.body.appendChild(messageDiv);
    
    trackEvent('dps_build_compared', { percent_change: percentChange });
}

/**
 * Delete a saved build
 */
function deleteBuild(buildId) {
    if (!confirm('Delete this build?')) return;
    
    savedBuilds = savedBuilds.filter(b => b.id !== buildId);
    saveToMemory('dps_saved_builds', savedBuilds);
    displaySavedBuilds();
    showAlert('Build deleted', 'success');
}

// Make functions globally accessible for inline onclick handlers
window.loadBuild = loadBuild;
window.compareBuild = compareBuild;
window.deleteBuild = deleteBuild;

// ============================================================================
// 6. UTILITY FUNCTIONS
// ============================================================================

/**
 * Copy results to clipboard
 */
function copyResults() {
    if (!currentBuild) {
        showAlert('Calculate DPS first', 'warning');
        return;
    }
    
    const { results } = currentBuild;
    const text = `
🎮 DPS Calculator Results

Total DPS: ${formatNumber(results.totalDPS, 1)}
Average Damage Per Hit: ${formatNumber(results.avgDamagePerHit, 1)}
Base DPS (no crits): ${formatNumber(results.baseDPS, 1)}
Crit Contribution: +${formatNumber(results.critDPSContribution, 1)}

Build Stats:
- Base Damage: ${currentBuild.baseDamage}
- Attack Speed: ${currentBuild.attackSpeed} APS
- Crit Chance: ${currentBuild.critChance}%
- Crit Multiplier: ${currentBuild.critMultiplier}x
- Damage Bonus: ${currentBuild.damageBonus}%
- Armor Reduction: ${currentBuild.armorReduction}%

Generated by GRIFTS DPS Calculator
https://grifts.co.uk/gaming/dps-calculator.html
    `.trim();
    
    copyToClipboard(text, document.getElementById('copy-results-btn'));
}

/**
 * Generate shareable build URL
 */
function shareBuild() {
    if (!currentBuild) {
        showAlert('Calculate DPS first', 'warning');
        return;
    }
    
    // Create URL with build parameters
    const params = new URLSearchParams({
        bd: currentBuild.baseDamage,
        as: currentBuild.attackSpeed,
        cc: currentBuild.critChance,
        cm: currentBuild.critMultiplier,
        db: currentBuild.damageBonus,
        ar: currentBuild.armorReduction
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    copyToClipboard(url, document.getElementById('share-build-btn'));
    showAlert('Build URL copied! Share it with others.', 'success');
    
    trackEvent('dps_build_shared');
}

/**
 * Reset calculator to default values
 */
function resetCalculator() {
    document.getElementById('base-damage').value = 100;
    document.getElementById('attack-speed').value = 1.5;
    document.getElementById('crit-chance').value = 25;
    document.getElementById('crit-multiplier').value = 2;
    document.getElementById('damage-bonus').value = 0;
    document.getElementById('armor-reduction').value = 0;
    
    calculateDPS();
    showAlert('Reset to default values', 'info');
}

/**
 * Format number with commas and decimals
 */
function formatNumber(num, decimals = 0) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Load build from URL parameters on page load
 */
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('bd')) {
        document.getElementById('base-damage').value = params.get('bd');
        document.getElementById('attack-speed').value = params.get('as');
        document.getElementById('crit-chance').value = params.get('cc');
        document.getElementById('crit-multiplier').value = params.get('cm');
        document.getElementById('damage-bonus').value = params.get('db');
        document.getElementById('armor-reduction').value = params.get('ar');
        
        showAlert('Build loaded from shared link!', 'success');
    }
});