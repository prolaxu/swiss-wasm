# SwissEph Examples

This directory contains practical examples demonstrating how to use the SwissEph WebAssembly library for various astronomical and astrological calculations.

## Examples Overview

### 1. `basic-usage.js`
Fundamental operations and core functionality:
- Basic planetary position calculations
- Multiple planet calculations
- Time zone handling
- Sidereal vs tropical comparisons
- Date conversion functions
- Degree utilities
- Library information

**Run with:**
```bash
node examples/basic-usage.js
```

### 2. `birth-chart.js`
Complete birth chart calculation system:
- Full birth chart calculator class
- Planetary positions with zodiac signs
- House calculations
- Additional astrological points (nodes, Lilith, Chiron)
- Aspect calculations
- Professional-grade chart interpretation

**Run with:**
```bash
node examples/birth-chart.js
```

### 3. `advanced-features.js` *(Coming Soon)*
Advanced astronomical calculations:
- Eclipse predictions
- Rise/set/transit times
- Fixed star positions
- Topocentric calculations
- Atmospheric refraction
- Coordinate transformations

### 4. `web-integration.js` *(Coming Soon)*
Browser integration examples:
- HTML/JavaScript integration
- Real-time calculations
- Interactive charts
- Performance optimization
- Error handling in web environments

## Quick Start

### Basic Planetary Position
```javascript
import SwissEph from '../src/swisseph.js';

const swe = new SwissEph();
await swe.initSwissEph();

const jd = swe.julday(2023, 6, 15, 12.0);
const sunPos = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);

console.log(`Sun longitude: ${sunPos[0]}°`);
swe.close();
```

### Birth Chart Calculation
```javascript
import { BirthChartCalculator } from './examples/birth-chart.js';

const calculator = new BirthChartCalculator();

const chart = await calculator.calculateBirthChart({
  year: 1990, month: 5, day: 15,
  hour: 14, minute: 30, timezone: -5,
  latitude: 40.7128, longitude: -74.0060
});

console.log(chart.planets);
calculator.destroy();
```

## Example Output

### Basic Planetary Positions
```
=== Basic Planetary Position ===
Julian Day: 2460110.0
Sun Position:
  Longitude: 84.123456°
  Latitude: 0.000123°
  Distance: 1.015678 AU
  Speed: 0.958765°/day
  Zodiac: 24.12° Gemini
```

### Birth Chart
```
PLANETARY POSITIONS:
===================
☉ Sun       : 24.12° Taurus (54.12°)
☽ Moon      : 15.67° Scorpio (225.67°)
☿ Mercury   : 8.45° Gemini (68.45°)
♀ Venus     : 2.89° Cancer (92.89°)
♂ Mars      : 18.34° Virgo (168.34°)
♃ Jupiter   : 12.78° Pisces (342.78°)
♄ Saturn    : 25.91° Capricorn (295.91°)
♅ Uranus    : 7.23° Capricorn (277.23°)
♆ Neptune   : 11.45° Capricorn (281.45°)
♇ Pluto     : 16.78° Scorpio (226.78°)

MAJOR ASPECTS:
==============
Sun ☌ Mercury: Conjunction (orb: 2.34°)
Moon ☍ Venus: Opposition (orb: 3.21°)
Mars △ Jupiter: Trine (orb: 1.87°)
```

## Common Patterns

### Error Handling
```javascript
async function safeCalculation() {
  let swe = null;
  try {
    swe = new SwissEph();
    await swe.initSwissEph();
    // calculations here
    return result;
  } catch (error) {
    console.error('Calculation failed:', error);
    return null;
  } finally {
    if (swe) swe.close();
  }
}
```

### Batch Processing
```javascript
async function calculateMultipleDates(dates) {
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  const results = [];
  for (const date of dates) {
    const jd = swe.julday(date.year, date.month, date.day, date.hour);
    const pos = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
    results.push({ date, position: pos[0] });
  }
  
  swe.close();
  return results;
}
```

### Reusable Calculator Class
```javascript
class AstrologyCalculator {
  constructor() {
    this.swe = null;
    this.initialized = false;
  }
  
  async init() {
    if (!this.initialized) {
      this.swe = new SwissEph();
      await this.swe.initSwissEph();
      this.initialized = true;
    }
  }
  
  async calculate(params) {
    await this.init();
    // calculations here
  }
  
  destroy() {
    if (this.swe) {
      this.swe.close();
      this.swe = null;
      this.initialized = false;
    }
  }
}
```

## Running Examples

### Prerequisites
- Node.js 14+ or modern browser
- ES6 modules support

### Command Line
```bash
# Run basic usage examples
node examples/basic-usage.js

# Run birth chart example
node examples/birth-chart.js

# Run specific function
node -e "import('./examples/basic-usage.js').then(m => m.basicPlanetaryPosition())"
```

### Browser
```html
<script type="module">
  import { runAllExamples } from './examples/basic-usage.js';
  runAllExamples();
</script>
```

## Tips for Development

1. **Always initialize**: Call `await swe.initSwissEph()` before calculations
2. **Clean up**: Always call `swe.close()` when done
3. **Handle time zones**: Convert to UTC before calculations
4. **Validate inputs**: Check date ranges and parameter validity
5. **Use constants**: Use library constants instead of magic numbers
6. **Batch operations**: Reuse SwissEph instance for multiple calculations
7. **Error handling**: Wrap calculations in try-catch blocks

## Performance Considerations

- Initialize once, calculate many times
- Use appropriate calculation flags
- Clean up resources properly
- Consider WebWorkers for heavy calculations
- Cache results when appropriate

## Further Reading

- [Main Documentation](../DOCUMENTATION.md)
- [Quick Reference](../QUICK_REFERENCE.md)
- [Test Suite](../tests/README.md)
- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/swephprg.htm)
