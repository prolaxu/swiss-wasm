/**
 * Birth Chart Calculation Example
 * 
 * This example demonstrates how to calculate a complete birth chart
 * including planetary positions, houses, and various coordinate systems.
 */

import SwissEph from '../src/swisseph.js';

/**
 * Birth Chart Calculator Class
 * Provides methods for calculating comprehensive birth charts
 */
class BirthChartCalculator {
  constructor() {
    this.swe = null;
    this.initialized = false;
  }

  /**
   * Initialize the Swiss Ephemeris
   */
  async init() {
    if (!this.initialized) {
      this.swe = new SwissEph();
      await this.swe.initSwissEph();
      this.initialized = true;
    }
  }

  /**
   * Calculate a complete birth chart
   * @param {Object} birthData - Birth information
   * @param {number} birthData.year - Birth year
   * @param {number} birthData.month - Birth month (1-12)
   * @param {number} birthData.day - Birth day
   * @param {number} birthData.hour - Birth hour (0-23)
   * @param {number} birthData.minute - Birth minute (0-59)
   * @param {number} birthData.timezone - Timezone offset from UTC
   * @param {number} birthData.latitude - Birth latitude
   * @param {number} birthData.longitude - Birth longitude
   * @param {string} birthData.houseSystem - House system ('P', 'K', 'E', etc.)
   * @returns {Object} Complete birth chart data
   */
  async calculateBirthChart(birthData) {
    await this.init();

    const {
      year, month, day, hour, minute, timezone,
      latitude, longitude, houseSystem = 'P'
    } = birthData;

    // Convert local time to UTC
    const utcHour = hour + minute / 60 - timezone;
    const jd = this.swe.julday(year, month, day, utcHour);

    // Calculate planetary positions
    const planets = await this.calculatePlanets(jd);
    
    // Calculate houses
    const houses = await this.calculateHouses(jd, latitude, longitude, houseSystem);
    
    // Calculate additional points
    const additionalPoints = await this.calculateAdditionalPoints(jd);
    
    // Calculate aspects
    const aspects = this.calculateAspects(planets);

    return {
      birthData: {
        ...birthData,
        julianDay: jd,
        utcTime: utcHour
      },
      planets,
      houses,
      additionalPoints,
      aspects,
      metadata: {
        calculatedAt: new Date().toISOString(),
        swissEphVersion: this.swe.version()
      }
    };
  }

  /**
   * Calculate positions for all major planets
   * @param {number} jd - Julian Day
   * @returns {Object} Planet positions
   */
  async calculatePlanets(jd) {
    const planetList = [
      { id: this.swe.SE_SUN, name: 'Sun', symbol: '☉' },
      { id: this.swe.SE_MOON, name: 'Moon', symbol: '☽' },
      { id: this.swe.SE_MERCURY, name: 'Mercury', symbol: '☿' },
      { id: this.swe.SE_VENUS, name: 'Venus', symbol: '♀' },
      { id: this.swe.SE_MARS, name: 'Mars', symbol: '♂' },
      { id: this.swe.SE_JUPITER, name: 'Jupiter', symbol: '♃' },
      { id: this.swe.SE_SATURN, name: 'Saturn', symbol: '♄' },
      { id: this.swe.SE_URANUS, name: 'Uranus', symbol: '♅' },
      { id: this.swe.SE_NEPTUNE, name: 'Neptune', symbol: '♆' },
      { id: this.swe.SE_PLUTO, name: 'Pluto', symbol: '♇' }
    ];

    const planets = {};

    for (const planet of planetList) {
      const position = this.swe.calc_ut(jd, planet.id, this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED);
      
      planets[planet.name] = {
        id: planet.id,
        name: planet.name,
        symbol: planet.symbol,
        longitude: position[0],
        latitude: position[1],
        distance: position[2],
        speed: position[3],
        zodiacSign: this.getZodiacSign(position[0]),
        house: null // Will be calculated later with houses
      };
    }

    return planets;
  }

  /**
   * Calculate house cusps and angles
   * @param {number} jd - Julian Day
   * @param {number} latitude - Geographic latitude
   * @param {number} longitude - Geographic longitude
   * @param {string} houseSystem - House system
   * @returns {Object} House information
   */
  async calculateHouses(jd, latitude, longitude, houseSystem) {
    // Calculate houses using the specified system
    const houseResult = this.swe.houses(jd, latitude, longitude, houseSystem);
    
    // Get sidereal time for ARMC calculation
    const sidTime = this.swe.sidtime(jd);
    const armc = (sidTime + longitude / 15) * 15; // Convert to degrees

    const houses = {
      system: houseSystem,
      cusps: [],
      angles: {
        ascendant: null,
        midheaven: null,
        descendant: null,
        imumCoeli: null
      }
    };

    // Extract house cusps (houses 1-12)
    for (let i = 1; i <= 12; i++) {
      houses.cusps[i] = {
        house: i,
        longitude: houseResult, // This would need proper implementation
        zodiacSign: this.getZodiacSign(houseResult)
      };
    }

    // Calculate angles
    houses.angles.ascendant = houses.cusps[1].longitude;
    houses.angles.midheaven = houses.cusps[10].longitude;
    houses.angles.descendant = (houses.cusps[1].longitude + 180) % 360;
    houses.angles.imumCoeli = (houses.cusps[10].longitude + 180) % 360;

    return houses;
  }

  /**
   * Calculate additional astrological points
   * @param {number} jd - Julian Day
   * @returns {Object} Additional points
   */
  async calculateAdditionalPoints(jd) {
    const points = {};

    // Lunar nodes
    const meanNode = this.swe.calc_ut(jd, this.swe.SE_MEAN_NODE, this.swe.SEFLG_SWIEPH);
    const trueNode = this.swe.calc_ut(jd, this.swe.SE_TRUE_NODE, this.swe.SEFLG_SWIEPH);

    points.meanNode = {
      name: 'Mean North Node',
      symbol: '☊',
      longitude: meanNode[0],
      zodiacSign: this.getZodiacSign(meanNode[0])
    };

    points.trueNode = {
      name: 'True North Node',
      symbol: '☊',
      longitude: trueNode[0],
      zodiacSign: this.getZodiacSign(trueNode[0])
    };

    // South nodes (opposite of north nodes)
    points.meanSouthNode = {
      name: 'Mean South Node',
      symbol: '☋',
      longitude: (meanNode[0] + 180) % 360,
      zodiacSign: this.getZodiacSign((meanNode[0] + 180) % 360)
    };

    // Lunar apogee (Lilith)
    const meanApogee = this.swe.calc_ut(jd, this.swe.SE_MEAN_APOG, this.swe.SEFLG_SWIEPH);
    points.lilith = {
      name: 'Mean Lilith',
      symbol: '⚸',
      longitude: meanApogee[0],
      zodiacSign: this.getZodiacSign(meanApogee[0])
    };

    // Chiron
    const chiron = this.swe.calc_ut(jd, this.swe.SE_CHIRON, this.swe.SEFLG_SWIEPH);
    points.chiron = {
      name: 'Chiron',
      symbol: '⚷',
      longitude: chiron[0],
      zodiacSign: this.getZodiacSign(chiron[0])
    };

    return points;
  }

  /**
   * Calculate major aspects between planets
   * @param {Object} planets - Planet positions
   * @returns {Array} List of aspects
   */
  calculateAspects(planets) {
    const aspects = [];
    const planetNames = Object.keys(planets);
    
    // Major aspects with their angles and orbs
    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌' },
      { name: 'Opposition', angle: 180, orb: 8, symbol: '☍' },
      { name: 'Trine', angle: 120, orb: 6, symbol: '△' },
      { name: 'Square', angle: 90, orb: 6, symbol: '□' },
      { name: 'Sextile', angle: 60, orb: 4, symbol: '⚹' },
      { name: 'Quincunx', angle: 150, orb: 3, symbol: '⚻' }
    ];

    // Check all planet pairs
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planets[planetNames[i]];
        const planet2 = planets[planetNames[j]];
        
        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;

        // Check each aspect type
        for (const aspectType of aspectTypes) {
          const difference = Math.abs(normalizedAngle - aspectType.angle);
          
          if (difference <= aspectType.orb) {
            aspects.push({
              planet1: planet1.name,
              planet2: planet2.name,
              aspect: aspectType.name,
              symbol: aspectType.symbol,
              angle: aspectType.angle,
              actualAngle: normalizedAngle,
              orb: difference,
              applying: planet1.speed > planet2.speed
            });
          }
        }
      }
    }

    return aspects.sort((a, b) => a.orb - b.orb);
  }

  /**
   * Get zodiac sign information for a longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {Object} Zodiac sign information
   */
  getZodiacSign(longitude) {
    const signs = [
      { name: 'Aries', symbol: '♈', element: 'Fire', quality: 'Cardinal' },
      { name: 'Taurus', symbol: '♉', element: 'Earth', quality: 'Fixed' },
      { name: 'Gemini', symbol: '♊', element: 'Air', quality: 'Mutable' },
      { name: 'Cancer', symbol: '♋', element: 'Water', quality: 'Cardinal' },
      { name: 'Leo', symbol: '♌', element: 'Fire', quality: 'Fixed' },
      { name: 'Virgo', symbol: '♍', element: 'Earth', quality: 'Mutable' },
      { name: 'Libra', symbol: '♎', element: 'Air', quality: 'Cardinal' },
      { name: 'Scorpio', symbol: '♏', element: 'Water', quality: 'Fixed' },
      { name: 'Sagittarius', symbol: '♐', element: 'Fire', quality: 'Mutable' },
      { name: 'Capricorn', symbol: '♑', element: 'Earth', quality: 'Cardinal' },
      { name: 'Aquarius', symbol: '♒', element: 'Air', quality: 'Fixed' },
      { name: 'Pisces', symbol: '♓', element: 'Water', quality: 'Mutable' }
    ];

    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;

    return {
      ...signs[signIndex],
      degree: degree,
      formatted: `${degree.toFixed(2)}° ${signs[signIndex].name}`
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.swe) {
      this.swe.close();
      this.swe = null;
      this.initialized = false;
    }
  }
}

/**
 * Example usage of the Birth Chart Calculator
 */
async function exampleBirthChart() {
  console.log('=== Birth Chart Calculation Example ===\n');

  const calculator = new BirthChartCalculator();

  try {
    // Example birth data
    const birthData = {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      timezone: -5, // UTC-5 (Eastern Daylight Time)
      latitude: 40.7128, // New York City
      longitude: -74.0060,
      houseSystem: 'P' // Placidus
    };

    console.log('Calculating birth chart for:');
    console.log(`Date: ${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')}`);
    console.log(`Time: ${birthData.hour}:${birthData.minute.toString().padStart(2, '0')} (UTC${birthData.timezone})`);
    console.log(`Location: ${birthData.latitude}°N, ${Math.abs(birthData.longitude)}°W\n`);

    const chart = await calculator.calculateBirthChart(birthData);

    // Display planetary positions
    console.log('PLANETARY POSITIONS:');
    console.log('===================');
    for (const [name, planet] of Object.entries(chart.planets)) {
      console.log(`${planet.symbol} ${name.padEnd(10)}: ${planet.zodiacSign.formatted} (${planet.longitude.toFixed(2)}°)`);
    }

    // Display additional points
    console.log('\nADDITIONAL POINTS:');
    console.log('==================');
    for (const [name, point] of Object.entries(chart.additionalPoints)) {
      console.log(`${point.symbol} ${point.name.padEnd(15)}: ${point.zodiacSign.formatted} (${point.longitude.toFixed(2)}°)`);
    }

    // Display major aspects
    console.log('\nMAJOR ASPECTS:');
    console.log('==============');
    chart.aspects.slice(0, 10).forEach(aspect => {
      console.log(`${aspect.planet1} ${aspect.symbol} ${aspect.planet2}: ${aspect.aspect} (orb: ${aspect.orb.toFixed(2)}°)`);
    });

    console.log(`\nTotal aspects found: ${chart.aspects.length}`);
    console.log(`Calculated using Swiss Ephemeris ${chart.metadata.swissEphVersion}`);

  } catch (error) {
    console.error('Error calculating birth chart:', error);
  } finally {
    calculator.destroy();
  }
}

// Export the calculator class and example function
export { BirthChartCalculator, exampleBirthChart };

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleBirthChart().catch(console.error);
}
