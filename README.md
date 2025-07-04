# SwissEph WebAssembly Library

A high-precision JavaScript wrapper for the Swiss Ephemeris WebAssembly module, providing professional-grade astronomical calculations for astrology, astronomy, and related applications.

## 🌟 Features

- **High Precision**: Based on the renowned Swiss Ephemeris
- **WebAssembly Performance**: Fast calculations in the browser and Node.js
- **Comprehensive API**: Full access to Swiss Ephemeris functions
- **Modern JavaScript**: ES6+ with async/await support
- **Well Tested**: 106 tests with 86% coverage
- **Complete Documentation**: Extensive guides and examples
- **Professional Grade**: Suitable for commercial applications

## 📦 Installation

### npm
```bash
npm install swisseph-wasm
```

### yarn
```bash
yarn add swisseph-wasm
```

### pnpm
```bash
pnpm add swisseph-wasm
```

## 📦 What's Included

- **Core Library** (`src/swisseph.js`) - Main JavaScript wrapper
- **WebAssembly Module** (`wsam/`) - Compiled Swiss Ephemeris
- **Comprehensive Tests** (`tests/`) - 106 tests covering all functionality
- **Documentation** - Complete API reference and guides
- **Examples** - Practical usage examples and patterns
- **Quick Reference** - Handy developer reference
- **TypeScript Definitions** - Full type support

## 🚀 Quick Start

### Basic Usage

```javascript
import SwissEph from 'swisseph-wasm';

// Create and initialize
const swe = new SwissEph();
await swe.initSwissEph();

// Calculate planetary position
const jd = swe.julday(2023, 6, 15, 12.0); // June 15, 2023, 12:00 UTC
const sunPos = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);

console.log(`Sun longitude: ${sunPos[0]}°`);

// Clean up
swe.close();
```

### Birth Chart Example

```javascript
import SwissEph from 'swisseph-wasm';

// You can also import the example calculator
// import { BirthChartCalculator } from 'swisseph-wasm/examples/birth-chart.js';

const calculator = new BirthChartCalculator();

const chart = await calculator.calculateBirthChart({
  year: 1990, month: 5, day: 15,
  hour: 14, minute: 30, timezone: -5,
  latitude: 40.7128, longitude: -74.0060
});

console.log('Planetary Positions:');
Object.entries(chart.planets).forEach(([name, planet]) => {
  console.log(`${planet.symbol} ${name}: ${planet.zodiacSign.formatted}`);
});

calculator.destroy();
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**DOCUMENTATION.md**](DOCUMENTATION.md) | Complete API reference and usage guide |
| [**QUICK_REFERENCE.md**](QUICK_REFERENCE.md) | Quick developer reference |
| [**examples/README.md**](examples/README.md) | Example usage patterns |
| [**tests/README.md**](tests/README.md) | Test suite documentation |

## 🎯 Core Capabilities

### Planetary Calculations
- All major planets (Sun through Pluto)
- Lunar nodes and apogee
- Major asteroids (Chiron, Ceres, Pallas, etc.)
- Uranian planets
- Fixed stars

### Coordinate Systems
- Tropical and sidereal positions
- Geocentric, heliocentric, topocentric
- Ecliptic and equatorial coordinates
- Multiple ayanamsa systems

### Time Functions
- Julian Day calculations
- Time zone conversions
- Sidereal time
- Delta T calculations
- Calendar conversions

### Advanced Features
- Eclipse calculations
- Rise/set/transit times
- House systems
- Aspect calculations
- Atmospheric refraction
- Coordinate transformations

## 🧪 Testing

The library includes a comprehensive test suite with 106 tests:

```bash
npm install
npm test                 # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Watch mode
```

**Test Coverage:**
- ✅ 106 tests passing
- ✅ 86.1% statement coverage
- ✅ 66.66% function coverage
- ✅ All major functionality covered

## 📁 Project Structure

```
swiss-wasm/
├── src/
│   └── swisseph.js              # Main library file
├── wsam/
│   ├── swisseph.js              # WebAssembly module
│   └── swisseph.wasm            # WebAssembly binary
├── tests/
│   ├── swisseph.test.js         # Core functionality tests
│   ├── swisseph-advanced.test.js # Advanced features tests
│   ├── swisseph-integration.test.js # Integration tests
│   ├── swisseph-constants.test.js # Constants validation
│   ├── __mocks__/               # Mock implementations
│   └── README.md                # Test documentation
├── examples/
│   ├── basic-usage.js           # Basic usage examples
│   ├── birth-chart.js           # Birth chart calculator
│   └── README.md                # Examples documentation
├── DOCUMENTATION.md             # Complete API reference
├── QUICK_REFERENCE.md           # Quick developer guide
└── README.md                    # This file
```

## 🌐 Browser Support

**Modern Browsers:**
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

**Requirements:**
- WebAssembly support
- ES6 modules support
- Async/await support

## 💡 Examples

### Current Planetary Positions
```javascript
async function getCurrentPositions() {
  const swe = new SwissEph();
  await swe.initSwissEph();

  const now = new Date();
  const jd = swe.julday(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60
  );

  const planets = [swe.SE_SUN, swe.SE_MOON, swe.SE_MERCURY];
  const positions = {};

  for (const planet of planets) {
    const pos = swe.calc_ut(jd, planet, swe.SEFLG_SWIEPH);
    positions[swe.get_planet_name(planet)] = pos[0];
  }

  swe.close();
  return positions;
}
```

### Sidereal vs Tropical
```javascript
async function compareSystems(year, month, day) {
  const swe = new SwissEph();
  await swe.initSwissEph();

  const jd = swe.julday(year, month, day, 12);

  // Tropical
  const tropical = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);

  // Sidereal (Lahiri)
  swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
  const sidereal = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL);

  swe.close();

  return {
    tropical: tropical[0],
    sidereal: sidereal[0],
    difference: tropical[0] - sidereal[0]
  };
}
```

## 🔧 Development

### Running Examples
```bash
# Basic usage examples
node examples/basic-usage.js

# Birth chart calculation
node examples/birth-chart.js
```

### Performance Tips
1. **Reuse instances** for multiple calculations
2. **Batch operations** in single sessions
3. **Always clean up** with `swe.close()`
4. **Validate inputs** before calculations
5. **Use appropriate flags** for your needs

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

## 📄 License

This library is a wrapper around the Swiss Ephemeris, which is licensed under the GNU General Public License (GPL) for non-commercial use. For commercial use, a license from Astrodienst is required.

**Swiss Ephemeris License:**
- Non-commercial use: Free under GPL
- Commercial use: Requires license from [Astrodienst](https://www.astro.com/swisseph/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit a pull request

## 📞 Support

- **Documentation**: Check the comprehensive docs in this repository
- **Examples**: Review the examples directory for usage patterns
- **Tests**: Look at test files for detailed usage examples
- **Issues**: File issues on the project repository

## 🏆 Credits

- **Swiss Ephemeris**: Created by Astrodienst AG
- **WebAssembly Port**: Compiled for web use
- **JavaScript Wrapper**: Modern ES6+ interface
- **Test Suite**: Comprehensive validation
- **Documentation**: Complete developer guides

---

**Ready to calculate the cosmos? Start with the [Quick Reference](QUICK_REFERENCE.md) or dive into the [Complete Documentation](DOCUMENTATION.md)!** 🌟
