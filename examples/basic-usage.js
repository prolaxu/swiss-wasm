/**
 * Basic Usage Examples for SwissEph Library
 * 
 * This file demonstrates fundamental operations with the Swiss Ephemeris
 * WebAssembly library including planetary calculations, time conversions,
 * and coordinate transformations.
 */

import SwissEph from '../src/swisseph.js';

/**
 * Example 1: Basic Planetary Position Calculation
 * Calculates the position of the Sun for a specific date and time
 */
async function basicPlanetaryPosition() {
  console.log('=== Basic Planetary Position ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    // Calculate Julian Day for June 15, 2023, 12:00 UTC
    const jd = swe.julday(2023, 6, 15, 12.0);
    console.log(`Julian Day: ${jd}`);
    
    // Calculate Sun position
    const sunPosition = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
    
    console.log(`Sun Position:`);
    console.log(`  Longitude: ${sunPosition[0].toFixed(6)}°`);
    console.log(`  Latitude: ${sunPosition[1].toFixed(6)}°`);
    console.log(`  Distance: ${sunPosition[2].toFixed(6)} AU`);
    console.log(`  Speed: ${sunPosition[3].toFixed(6)}°/day`);
    
    // Convert longitude to zodiac sign
    const sign = Math.floor(sunPosition[0] / 30);
    const degree = sunPosition[0] % 30;
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    console.log(`  Zodiac: ${degree.toFixed(2)}° ${signs[sign]}`);
    
  } finally {
    swe.close();
  }
}

/**
 * Example 2: Multiple Planet Calculation
 * Calculates positions for all major planets
 */
async function multiplePlanets() {
  console.log('\n=== Multiple Planet Positions ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    const jd = swe.julday(2023, 6, 15, 12.0);
    
    const planets = [
      { id: swe.SE_SUN, name: 'Sun' },
      { id: swe.SE_MOON, name: 'Moon' },
      { id: swe.SE_MERCURY, name: 'Mercury' },
      { id: swe.SE_VENUS, name: 'Venus' },
      { id: swe.SE_MARS, name: 'Mars' },
      { id: swe.SE_JUPITER, name: 'Jupiter' },
      { id: swe.SE_SATURN, name: 'Saturn' },
      { id: swe.SE_URANUS, name: 'Uranus' },
      { id: swe.SE_NEPTUNE, name: 'Neptune' },
      { id: swe.SE_PLUTO, name: 'Pluto' }
    ];
    
    console.log('Planet Positions for June 15, 2023:');
    
    for (const planet of planets) {
      const position = swe.calc_ut(jd, planet.id, swe.SEFLG_SWIEPH);
      console.log(`${planet.name.padEnd(10)}: ${position[0].toFixed(2)}°`);
    }
    
  } finally {
    swe.close();
  }
}

/**
 * Example 3: Time Zone Conversion
 * Demonstrates proper handling of time zones
 */
async function timeZoneExample() {
  console.log('\n=== Time Zone Conversion ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    // Birth time: May 15, 1990, 2:30 PM in New York (UTC-5)
    const year = 1990;
    const month = 5;
    const day = 15;
    const hour = 14; // 2 PM
    const minute = 30;
    const timezone = -5; // UTC-5 (Eastern Daylight Time)
    
    // Convert to UTC
    const utcHour = hour + minute / 60 - timezone;
    const jd = swe.julday(year, month, day, utcHour);
    
    console.log(`Local time: ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour}:${minute.toString().padStart(2, '0')} (UTC${timezone})`);
    console.log(`UTC time: ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${utcHour.toFixed(2)}`);
    console.log(`Julian Day: ${jd}`);
    
    // Calculate Sun position for this time
    const sunPos = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
    console.log(`Sun position: ${sunPos[0].toFixed(2)}°`);
    
  } finally {
    swe.close();
  }
}

/**
 * Example 4: Sidereal vs Tropical Comparison
 * Shows the difference between tropical and sidereal calculations
 */
async function siderealVsTropical() {
  console.log('\n=== Sidereal vs Tropical Comparison ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    const jd = swe.julday(2023, 6, 15, 12.0);
    
    // Tropical calculation (default)
    const tropical = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
    
    // Set Lahiri ayanamsa for sidereal calculation
    swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
    
    // Sidereal calculation
    const sidereal = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL);
    
    // Get ayanamsa value
    const ayanamsa = swe.get_ayanamsa(jd);
    
    console.log(`Tropical Sun position: ${tropical[0].toFixed(6)}°`);
    console.log(`Sidereal Sun position: ${sidereal[0].toFixed(6)}°`);
    console.log(`Ayanamsa (Lahiri): ${ayanamsa.toFixed(6)}°`);
    console.log(`Difference: ${(tropical[0] - sidereal[0]).toFixed(6)}°`);
    
  } finally {
    swe.close();
  }
}

/**
 * Example 5: Date Conversion Functions
 * Demonstrates various date and time conversion utilities
 */
async function dateConversions() {
  console.log('\n=== Date Conversion Functions ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    // Calculate Julian Day
    const jd = swe.julday(2023, 6, 15, 12.5);
    console.log(`Julian Day for 2023-06-15 12:30: ${jd}`);
    
    // Convert back to calendar date
    const date = swe.revjul(jd, swe.SE_GREG_CAL);
    console.log(`Reverse conversion: ${date.year}-${date.month}-${date.day} ${date.hour.toFixed(2)}`);
    
    // UTC to Julian Day conversion
    const utcResult = swe.utc_to_jd(2023, 6, 15, 12, 30, 0, swe.SE_GREG_CAL);
    console.log(`UTC to JD - ET: ${utcResult.julianDayET}, UT: ${utcResult.julianDayUT}`);
    
    // Calculate sidereal time
    const sidTime = swe.sidtime(jd);
    console.log(`Sidereal time: ${sidTime.toFixed(6)} hours`);
    
    // Calculate Delta T
    const deltaT = swe.deltat(jd);
    console.log(`Delta T: ${deltaT.toFixed(2)} seconds`);
    
    // Day of week
    const dayOfWeek = swe.day_of_week(jd);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    console.log(`Day of week: ${days[dayOfWeek]}`);
    
  } finally {
    swe.close();
  }
}

/**
 * Example 6: Degree Utilities
 * Shows how to work with degree values and conversions
 */
async function degreeUtilities() {
  console.log('\n=== Degree Utilities ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    const degrees = 123.456789;
    
    // Normalize degrees
    console.log(`Original: ${degrees}°`);
    console.log(`Normalized: ${swe.degnorm(degrees)}°`);
    console.log(`Normalized (370°): ${swe.degnorm(370)}°`);
    console.log(`Normalized (-10°): ${swe.degnorm(-10)}°`);
    
    // Split degrees into components
    const split = swe.split_deg(degrees, swe.SE_SPLIT_DEG_ROUND_SEC);
    console.log(`Split degrees:`);
    console.log(`  Degrees: ${split.degree}°`);
    console.log(`  Minutes: ${split.min}'`);
    console.log(`  Seconds: ${split.second.toFixed(0)}"`);
    console.log(`  Zodiac sign: ${split.sign} (0=Aries, 1=Taurus, etc.)`);
    
    // Zodiacal format
    const zodiacal = swe.split_deg(degrees, swe.SE_SPLIT_DEG_ZODIACAL);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    console.log(`Zodiacal: ${zodiacal.degree}° ${zodiacal.min}' ${zodiacal.second.toFixed(0)}" ${signs[zodiacal.sign]}`);
    
  } finally {
    swe.close();
  }
}

/**
 * Example 7: Library Information
 * Shows how to get version and other library information
 */
async function libraryInfo() {
  console.log('\n=== Library Information ===');
  
  const swe = new SwissEph();
  await swe.initSwissEph();
  
  try {
    // Get version
    const version = swe.version();
    console.log(`Swiss Ephemeris version: ${version}`);
    
    // Get planet names
    console.log('\nPlanet names:');
    for (let i = 0; i <= 9; i++) {
      const name = swe.get_planet_name(i);
      console.log(`  ${i}: ${name}`);
    }
    
    // Show some constants
    console.log('\nImportant constants:');
    console.log(`  AU to km: ${swe.SE_AUNIT_TO_KM}`);
    console.log(`  AU to light-year: ${swe.SE_AUNIT_TO_LIGHTYEAR}`);
    console.log(`  AU to parsec: ${swe.SE_AUNIT_TO_PARSEC}`);
    
  } finally {
    swe.close();
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('SwissEph Basic Usage Examples\n');
  
  await basicPlanetaryPosition();
  await multiplePlanets();
  await timeZoneExample();
  await siderealVsTropical();
  await dateConversions();
  await degreeUtilities();
  await libraryInfo();
  
  console.log('\n=== All examples completed ===');
}

// Export functions for use in other modules
export {
  basicPlanetaryPosition,
  multiplePlanets,
  timeZoneExample,
  siderealVsTropical,
  dateConversions,
  degreeUtilities,
  libraryInfo,
  runAllExamples
};

// Run examples if this file is executed directly
// Check if running in Node.js and if this is the main module
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
