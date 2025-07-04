# SwissEph Test Suite

This directory contains comprehensive tests for the SwissEph JavaScript wrapper for the Swiss Ephemeris WebAssembly module.

## Test Structure

### Test Files

1. **`swisseph.test.js`** - Core functionality tests
   - Constants validation
   - Initialization and setup
   - Julian day calculations
   - Planet position calculations
   - Time functions
   - Utility functions
   - Date conversion functions
   - Error handling
   - Memory management

2. **`swisseph-advanced.test.js`** - Advanced astronomical functions
   - Eclipse calculations
   - Occultation functions
   - Planetary phenomena
   - Rise/set/transit calculations
   - Azimuth/altitude functions
   - Atmospheric refraction
   - House system calculations

3. **`swisseph-integration.test.js`** - Integration and real-world scenarios
   - Complete birth chart calculations
   - Sidereal vs tropical coordinates
   - Time zone handling
   - Coordinate transformations
   - Performance tests
   - Edge cases and error handling

4. **`swisseph-constants.test.js`** - Constants and configuration validation
   - Astronomical constants
   - Planet number constants
   - Flag bit constants
   - Sidereal mode constants
   - Eclipse constants
   - Boundary value testing

### Mock Implementation

The test suite uses a sophisticated mock implementation (`tests/__mocks__/swisseph-wasm.js`) that:

- Simulates the WebAssembly module interface
- Provides realistic astronomical calculations for testing
- Handles memory allocation and deallocation
- Supports different coordinate systems and flags
- Includes error simulation for edge cases

### Test Coverage

The test suite covers:

- ✅ **106 tests** covering all major functionality
- ✅ Constants and configuration validation
- ✅ Core astronomical calculations
- ✅ Advanced ephemeris functions
- ✅ Error handling and edge cases
- ✅ Memory management
- ✅ Integration scenarios
- ✅ Performance considerations

## Running Tests

### Prerequisites

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- swisseph.test.js
npm test -- swisseph-advanced.test.js
npm test -- swisseph-integration.test.js
npm test -- swisseph-constants.test.js
```

## Test Configuration

The test suite is configured with:

- **Jest** as the test runner
- **Babel** for ES module transformation
- **jsdom** environment for browser-like testing
- **ES modules** support with experimental VM modules
- **Mock WebAssembly module** for isolated testing

## Key Testing Patterns

### 1. Async Initialization
```javascript
beforeEach(async () => {
  swe = new SwissEph();
  await swe.initSwissEph();
});
```

### 2. Memory Management Testing
```javascript
afterEach(() => {
  if (swe && swe.close) {
    swe.close();
  }
});
```

### 3. Mock Data Validation
```javascript
const result = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
expect(result).toBeInstanceOf(Float64Array);
expect(result.length).toBe(4);
```

### 4. Error Handling
```javascript
expect(() => {
  swe.calc(jd, 999, swe.SEFLG_SWIEPH);
}).toThrow();
```

## Mock Implementation Details

The mock WebAssembly module provides:

- **Realistic astronomical positions** based on Julian day and planet
- **Different coordinate systems** (tropical, sidereal, equatorial)
- **Memory management simulation** with malloc/free
- **Error simulation** for invalid inputs
- **String conversion utilities** for testing

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Use descriptive test names that explain what is being tested
3. Include both positive and negative test cases
4. Test edge cases and error conditions
5. Update the mock implementation if new functions are added
6. Ensure tests are isolated and don't depend on external resources

## Notes

- Tests use a mock WebAssembly module to avoid dependencies on actual ephemeris files
- The mock provides realistic but simplified astronomical calculations
- Some tests are adjusted to work with mock data rather than real astronomical values
- All tests should pass consistently regardless of the system or time zone
