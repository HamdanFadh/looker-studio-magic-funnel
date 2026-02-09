/**
 * Magic Metrics Funnel Visualization for Looker Studio
 * Interactive funnel chart with conversion analytics
 */

// Global state
let currentData = null;
let currentStyle = null;

/**
 * Main draw function called by Looker Studio
 * @param {Object} data - Data from Looker Studio
 */
function drawViz(data) {
  console.log('📊 Received data from Looker Studio:', data);
  
  currentData = data;
  currentStyle = data.style;
  
  // Clear previous visualization
  const container = document.getElementById('container');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'container';
    document.body.appendChild(newContainer);
  }
  
  document.getElementById('container').innerHTML = `
    <div id="funnel-container"></div>
    <div id="tooltip"></div>
  `;
  
  try {
    // Transform Looker data to funnel format
    const funnelData = transformData(data);
    
    // Render funnel
    renderFunnel(funnelData, data.style);
    
  } catch (error) {
    console.error('❌ Error:', error);
    document.getElementById('funnel-container').innerHTML = `
      <div class="error">
        ❌ Error rendering visualization<br>
        ${error.message}<br>
        Check console for details
      </div>
    `;
  }
}

/**
 * Transform Looker Studio data to funnel format
 * @param {Object} data - Raw data from Looker
 * @returns {Array} - Array of funnel steps with metrics
 */
function transformData(data) {
  console.log('🔄 Transforming data...');
  
  const tables = data.tables.DEFAULT;
  
  // Extract and sort data
  const steps = tables.map(row => {
    const stepName = row.step[0];
    const users = row.users[0];
    const order = row.stepOrder ? row.stepOrder[0] : extractOrder(stepName);
    
    return {
      name: stepName,
      value: users,
      order: parseInt(order) || 0
    };
  });
  
  // Sort by order
  steps.sort((a, b) => a.order - b.order);
  
  // Calculate conversion rates and drop-offs
  const totalUsers = steps.length > 0 ? steps[0].value : 0;
  
  steps.forEach((step, i) => {
    // Conversion from first step
    step.conversionFromStart = totalUsers > 0 ? (step.value / totalUsers * 100) : 0;
    
    // Conversion from previous step
    if (i > 0) {
      const previousValue = steps[i - 1].value;
      step.conversionFromPrevious = previousValue > 0 ? (step.value / previousValue * 100) : 0;
      step.dropoff = previousValue - step.value;
      step.dropoffPercent = previousValue > 0 ? ((previousValue - step.value) / previousValue * 100) : 0;
    } else {
      step.conversionFromPrevious = 100;
      step.dropoff = 0;
      step.dropoffPercent = 0;
    }
  });
  
  console.log('📋 Steps:', steps.length);
  console.log('📊 Funnel data:', steps);
  
  return steps;
}

/**
 * Extract order from step name (e.g., "Step 1: Name" -> 1)
 */
function extractOrder(stepName) {
  const match = stepName.match(/Step\s+(\d+)/i);
  return match ? match[1] : '99';
}

/**
 * Render funnel visualization
 * @param {Array} data - Funnel steps data
 * @param {Object} style - Style configuration
 */
function renderFunnel(data, style) {
  console.log('🎨 Rendering funnel...');
  
  if (data.length === 0) {
    document.getElementById('funnel-container').innerHTML = `
      <div class="empty-state">No data to display</div>
    `;
    return;
  }
  
  // Get style values
  const startColor = style.startColor.value.color;
  const endColor = style.endColor.value.color;
  const dropoffColor = style.dropoffColor.value.color;
  const textColor = style.textColor.value.color;
  const orientation = style.orientation.value;
  const funnelWidth = style.funnelWidth.value || 80;
  const stepSpacing = style.stepSpacing.value || 10;
  const showConversionRate = style.showConversionRate.value;
  const showDropoff = style.showDropoff.value;
  const showPercentages = style.showPercentages.value;
  const showValues = style.showValues.value;
  const animateOnLoad = style.animateOnLoad.value;
  const fontSize = style.fontSize.value || 14;
  const fontFamily = getFontFamily(style.fontFamily.value);
  
  const container = document.getElementById('funnel-container');
  container.style.fontFamily = fontFamily;
  
  // Calculate dimensions
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Create header with summary stats
  const totalConversion = data.length > 1 
    ? (data[data.length - 1].value / data[0].value * 100).toFixed(1)
    : 100;
  const totalDropoff = data.length > 1
    ? data[0].value - data[data.length - 1].value
    : 0;
  
  let html = `
    <div class="funnel-header">
      <div class="funnel-title">Funnel Analysis</div>
      <div class="funnel-stats">
        <div class="stat-box">
          <div class="stat-label">Total Entries</div>
          <div class="stat-value">${formatNumber(data[0].value)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Completions</div>
          <div class="stat-value">${formatNumber(data[data.length - 1].value)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Overall Conversion</div>
          <div class="stat-value">${totalConversion}%</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total Drop-off</div>
          <div class="stat-value" style="color: ${dropoffColor}">${formatNumber(totalDropoff)}</div>
        </div>
      </div>
    </div>
    <div class="funnel-chart ${orientation}">
  `;
  
  // Render each step
  data.forEach((step, i) => {
    // Calculate width based on value (percentage of max)
    const widthPercent = (step.value / maxValue) * funnelWidth;
    
    // Calculate color gradient
    const color = interpolateColor(startColor, endColor, i / (data.length - 1));
    
    // Build step HTML
    html += `
      <div class="funnel-step-container" style="margin-bottom: ${stepSpacing}px;">
        <div class="funnel-step ${animateOnLoad ? 'animate' : ''}" 
             style="width: ${widthPercent}%; background: ${color}; animation-delay: ${i * 0.1}s;"
             data-step="${i}">
          <div class="step-content" style="color: ${textColor}; font-size: ${fontSize}px;">
            <div class="step-name">${step.name}</div>
            <div class="step-metrics">
    `;
    
    if (showValues) {
      html += `<span class="metric-value">${formatNumber(step.value)}</span>`;
    }
    
    if (showPercentages && i > 0) {
      html += `<span class="metric-percent">${step.conversionFromStart.toFixed(1)}% of total</span>`;
    }
    
    html += `
            </div>
          </div>
        </div>
    `;
    
    // Show conversion rate from previous step
    if (i > 0 && showConversionRate) {
      const conversionClass = step.conversionFromPrevious >= 70 ? 'good' : 
                             step.conversionFromPrevious >= 50 ? 'medium' : 'poor';
      html += `
        <div class="conversion-rate ${conversionClass}">
          <span class="rate-label">↓ Conversion:</span>
          <span class="rate-value">${step.conversionFromPrevious.toFixed(1)}%</span>
        </div>
      `;
    }
    
    // Show drop-off
    if (i > 0 && showDropoff && step.dropoff > 0) {
      html += `
        <div class="dropoff-info" style="color: ${dropoffColor};">
          <span class="dropoff-icon">⚠</span>
          <span class="dropoff-label">Drop-off:</span>
          <span class="dropoff-value">${formatNumber(step.dropoff)} (${step.dropoffPercent.toFixed(1)}%)</span>
        </div>
      `;
    }
    
    html += `</div>`;
  });
  
  html += `</div>`;
  
  container.innerHTML = html;
  
  // Add click handlers for interactivity
  const steps = container.querySelectorAll('.funnel-step');
  steps.forEach((stepEl, i) => {
    stepEl.addEventListener('mouseenter', (e) => {
      showTooltip(e, data[i]);
      stepEl.style.filter = 'brightness(1.1)';
      stepEl.style.transform = 'scale(1.02)';
    });
    
    stepEl.addEventListener('mouseleave', () => {
      hideTooltip();
      stepEl.style.filter = 'brightness(1)';
      stepEl.style.transform = 'scale(1)';
    });
    
    stepEl.addEventListener('click', () => {
      // Trigger Looker Studio filter action
      if (typeof dscc !== 'undefined') {
        dscc.sendInteraction('filter', {
          concepts: ['step'],
          values: [[data[i].name]]
        });
      }
    });
  });
  
  console.log('✅ Funnel rendered successfully!');
}

/**
 * Interpolate between two colors
 */
function interpolateColor(color1, color2, factor) {
  if (!color1 || !color2) return color1 || '#1a73e8';
  
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {r: 26, g: 115, b: 232}; // Default to blue
}

/**
 * Get font family string
 */
function getFontFamily(value) {
  const fonts = {
    'roboto': "'Roboto', sans-serif",
    'arial': "Arial, sans-serif",
    'google-sans': "'Google Sans', 'Roboto', sans-serif"
  };
  return fonts[value] || fonts.roboto;
}

/**
 * Show tooltip with step details
 */
function showTooltip(event, step) {
  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = `
    <div class="tooltip-content">
      <strong>${step.name}</strong><br/>
      <br/>
      <div class="tooltip-metric">
        <span>Users:</span>
        <strong>${formatNumber(step.value)}</strong>
      </div>
      <div class="tooltip-metric">
        <span>% of Total:</span>
        <strong>${step.conversionFromStart.toFixed(1)}%</strong>
      </div>
      ${step.conversionFromPrevious < 100 ? `
        <div class="tooltip-metric">
          <span>Conversion from Previous:</span>
          <strong>${step.conversionFromPrevious.toFixed(1)}%</strong>
        </div>
        <div class="tooltip-metric">
          <span>Drop-off:</span>
          <strong style="color: #ea4335">${formatNumber(step.dropoff)} (${step.dropoffPercent.toFixed(1)}%)</strong>
        </div>
      ` : ''}
    </div>
  `;
  tooltip.style.opacity = 1;
  tooltip.style.left = (event.pageX + 15) + 'px';
  tooltip.style.top = (event.pageY - 10) + 'px';
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) {
    tooltip.style.opacity = 0;
  }
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Initialize
console.log('🚀 Magic Metrics Funnel initialized');
