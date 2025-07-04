import SwissEph from '../src/swisseph.js';

describe('SwissEph', () => {
  let swe;

  beforeEach(async () => {
    swe = new SwissEph();
    await swe.initSwissEph();
  });

  afterEach(() => {
    if (swe && swe.close) {
      swe.close();
    }
  });

  describe('Constants', () => {
    test('should have correct planet constants', () => {
      expect(swe.SE_SUN).toBe(0);
      expect(swe.SE_MOON).toBe(1);
      expect(swe.SE_MERCURY).toBe(2);
      expect(swe.SE_VENUS).toBe(3);
      expect(swe.SE_MARS).toBe(4);
      expect(swe.SE_JUPITER).toBe(5);
      expect(swe.SE_SATURN).toBe(6);
      expect(swe.SE_URANUS).toBe(7);
      expect(swe.SE_NEPTUNE).toBe(8);
      expect(swe.SE_PLUTO).toBe(9);
    });

    test('should have correct flag constants', () => {
      expect(swe.SEFLG_JPLEPH).toBe(1);
      expect(swe.SEFLG_SWIEPH).toBe(2);
      expect(swe.SEFLG_MOSEPH).toBe(4);
      expect(swe.SEFLG_HELCTR).toBe(8);
      expect(swe.SEFLG_TRUEPOS).toBe(16);
      expect(swe.SEFLG_J2000).toBe(32);
      expect(swe.SEFLG_SPEED).toBe(256);
      expect(swe.SEFLG_SIDEREAL).toBe(65536);
    });

    test('should have correct calendar constants', () => {
      expect(swe.SE_JUL_CAL).toBe(0);
      expect(swe.SE_GREG_CAL).toBe(1);
    });

    test('should have correct eclipse constants', () => {
      expect(swe.SE_ECL_CENTRAL).toBe(1);
      expect(swe.SE_ECL_NONCENTRAL).toBe(2);
      expect(swe.SE_ECL_TOTAL).toBe(4);
      expect(swe.SE_ECL_ANNULAR).toBe(8);
      expect(swe.SE_ECL_PARTIAL).toBe(16);
    });
  });

  describe('Initialization', () => {
    test('should initialize Swiss Ephemeris module', async () => {
      const newSwe = new SwissEph();
      await expect(newSwe.initSwissEph()).resolves.not.toThrow();
      expect(newSwe.SweModule).toBeDefined();
    });

    test('should set ephemeris path', () => {
      const result = swe.set_ephe_path('test_path');
      expect(result).toBe('OK');
    });
  });

  describe('Julian Day Functions', () => {
    test('should calculate Julian day correctly', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      expect(typeof jd).toBe('number');
      expect(jd).toBeGreaterThan(2400000); // Reasonable Julian day number
    });

    test('should handle different calendar types', () => {
      const jd1 = swe.julday(2023, 6, 15, 12.0);
      const jd2 = swe.julday(1582, 10, 4, 12.0); // Before Gregorian calendar
      expect(typeof jd1).toBe('number');
      expect(typeof jd2).toBe('number');
    });
  });

  describe('Planet Calculations', () => {
    test('should calculate planet positions with calc_ut', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const result = swe.calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
      
      expect(result).toBeInstanceOf(Float64Array);
      expect(result.length).toBe(4);
      expect(typeof result[0]).toBe('number'); // longitude
      expect(typeof result[1]).toBe('number'); // latitude
      expect(typeof result[2]).toBe('number'); // distance
      expect(typeof result[3]).toBe('number'); // longitude speed
    });

    test('should calculate planet positions with calc', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const result = swe.calc(jd, swe.SE_MOON, swe.SEFLG_SWIEPH);
      
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('longitudeSpeed');
      expect(result).toHaveProperty('latitudeSpeed');
      expect(result).toHaveProperty('distanceSpeed');
      
      expect(typeof result.longitude).toBe('number');
      expect(typeof result.latitude).toBe('number');
      expect(typeof result.distance).toBe('number');
    });

    test('should handle different planets', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planets = [swe.SE_SUN, swe.SE_MOON, swe.SE_MERCURY, swe.SE_VENUS];
      
      planets.forEach(planet => {
        const result = swe.calc_ut(jd, planet, swe.SEFLG_SWIEPH);
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      });
    });
  });

  describe('Time Functions', () => {
    test('should calculate delta T', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const deltaT = swe.deltat(jd);
      expect(typeof deltaT).toBe('number');
      expect(deltaT).toBeGreaterThan(0);
    });

    test('should calculate sidereal time', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const sidTime = swe.sidtime(jd);
      expect(typeof sidTime).toBe('number');
      expect(sidTime).toBeGreaterThanOrEqual(0);
      expect(sidTime).toBeLessThan(24);
    });

    test('should calculate equation of time', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const eqTime = swe.time_equ(jd);
      expect(typeof eqTime).toBe('number');
    });
  });

  describe('Utility Functions', () => {
    test('should normalize degrees', () => {
      expect(swe.degnorm(370)).toBe(10);
      expect(swe.degnorm(-10)).toBe(350);
      expect(swe.degnorm(180)).toBe(180);
    });

    test('should split degrees', () => {
      const result = swe.split_deg(123.456789, swe.SE_SPLIT_DEG_ROUND_SEC);
      
      expect(result).toHaveProperty('degree');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('second');
      expect(result).toHaveProperty('fraction');
      expect(result).toHaveProperty('sign');
      
      expect(typeof result.degree).toBe('number');
      expect(typeof result.min).toBe('number');
      expect(typeof result.second).toBe('number');
    });

    test('should get day of week', () => {
      const jd = swe.julday(2023, 6, 15, 12.0); // Thursday
      const dayOfWeek = swe.day_of_week(jd);
      expect(typeof dayOfWeek).toBe('number');
      expect(dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(dayOfWeek).toBeLessThanOrEqual(6);
    });
  });

  describe('Date Conversion Functions', () => {
    test('should convert dates', () => {
      const jd = swe.date_conversion(2023, 6, 15, 12.0, swe.SE_GREG_CAL);
      expect(typeof jd).toBe('number');
      expect(jd).toBeGreaterThan(2400000);
    });

    test('should reverse Julian day to calendar date', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const result = swe.revjul(jd, swe.SE_GREG_CAL);
      
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('hour');
      
      expect(typeof result.year).toBe('number');
      expect(typeof result.month).toBe('number');
      expect(typeof result.day).toBe('number');
      expect(typeof result.hour).toBe('number');
    });

    test('should convert UTC to Julian day', () => {
      const result = swe.utc_to_jd(2023, 6, 15, 12, 30, 45, swe.SE_GREG_CAL);
      
      expect(result).toHaveProperty('julianDayET');
      expect(result).toHaveProperty('julianDayUT');
      
      expect(typeof result.julianDayET).toBe('number');
      expect(typeof result.julianDayUT).toBe('number');
    });
  });

  describe('Version and Info Functions', () => {
    test('should return version string', () => {
      const version = swe.version();
      expect(typeof version).toBe('string');
      expect(version).toContain('Swiss Ephemeris');
    });

    test('should get planet name', () => {
      const sunName = swe.get_planet_name(swe.SE_SUN);
      expect(sunName).toBe('Sun');
      
      const moonName = swe.get_planet_name(swe.SE_MOON);
      expect(moonName).toBe('Moon');
    });
  });

  describe('Error Handling', () => {
    test('should handle calc errors gracefully', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      // Test with invalid planet number
      expect(() => {
        swe.calc(jd, 999, swe.SEFLG_SWIEPH);
      }).toThrow();
    });

    test('should handle invalid Julian day', () => {
      const result = swe.calc_ut(NaN, swe.SE_SUN, swe.SEFLG_SWIEPH);
      expect(result).toBeInstanceOf(Float64Array);
    });
  });

  describe('Memory Management', () => {
    test('should properly allocate and free memory', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);

      // Multiple calculations to test memory management
      for (let i = 0; i < 10; i++) {
        const result = swe.calc_ut(jd + i, swe.SE_SUN, swe.SEFLG_SWIEPH);
        expect(result).toBeInstanceOf(Float64Array);
      }
    });

    test('should handle split_deg memory correctly', () => {
      for (let i = 0; i < 5; i++) {
        const result = swe.split_deg(i * 30.5, swe.SE_SPLIT_DEG_ROUND_SEC);
        expect(result).toHaveProperty('degree');
        expect(result).toHaveProperty('min');
        expect(result).toHaveProperty('second');
      }
    });
  });

  describe('Fixed Star Functions', () => {
    test('should calculate fixed star positions', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const result = swe.fixstar('Sirius', jd, swe.SEFLG_SWIEPH);

      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(6);
      }
    });

    test('should get fixed star magnitude', () => {
      const magnitude = swe.fixstar_mag('Sirius');

      if (magnitude !== null) {
        expect(typeof magnitude).toBe('number');
      }
    });

    test('should handle fixstar2 functions', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const result = swe.fixstar2('Sirius', jd, swe.SEFLG_SWIEPH);

      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
      }
    });
  });

  describe('Topocentric and Sidereal Functions', () => {
    test('should set topocentric location', () => {
      expect(() => {
        swe.set_topo(8.55, 47.37, 400); // Zurich coordinates
      }).not.toThrow();
    });

    test('should set sidereal mode', () => {
      expect(() => {
        swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
      }).not.toThrow();
    });

    test('should get ayanamsa', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);

      const ayanamsa = swe.get_ayanamsa(jd);
      expect(typeof ayanamsa).toBe('number');
    });

    test('should get ayanamsa name', () => {
      const name = swe.get_ayanamsa_name(swe.SE_SIDM_LAHIRI);
      expect(typeof name).toBe('string');
    });
  });

  describe('House System Functions', () => {
    test('should calculate house position', () => {
      const armc = 180.0;
      const geoLat = 47.37;
      const eps = 23.44;
      const hsys = 'P'; // Placidus
      const lon = 120.0;
      const lat = 1.0;

      const housePos = swe.house_pos(armc, geoLat, eps, hsys, lon, lat);
      expect(typeof housePos).toBe('number');
    });
  });

  describe('Coordinate Transformation Functions', () => {
    test('should handle degree differences', () => {
      const diff1 = swe.difdegn(350, 10);
      expect(typeof diff1).toBe('number');

      const diff2 = swe.difdeg2n(350, 10);
      expect(typeof diff2).toBe('number');
    });

    test('should handle centisecond operations', () => {
      const norm = swe.csnorm(3600 * 100 + 1800); // 1.5 degrees in centiseconds
      expect(typeof norm).toBe('number');

      const diff = swe.difcsn(3600 * 100, 1800);
      expect(typeof diff).toBe('number');
    });

    test('should calculate midpoints', () => {
      const degMidp = swe.deg_midp(10, 350);
      expect(typeof degMidp).toBe('number');

      const radMidp = swe.rad_midp(0.1, 6.2);
      expect(typeof radMidp).toBe('number');
    });
  });

  describe('String Conversion Functions', () => {
    test('should convert coordinates to time string', () => {
      const timeStr = swe.cs2timestr(12.5 * 3600 * 100, 58, 0); // 12:30:00
      expect(typeof timeStr).toBe('string');
    });

    test('should convert to longitude/latitude string', () => {
      const lonLatStr = swe.cs2lonlatstr(45.5 * 3600 * 100, 'E', 'W');
      expect(typeof lonLatStr).toBe('string');
    });

    test('should convert to degree string', () => {
      const degStr = swe.cs2degstr(123.456 * 3600 * 100);
      expect(typeof degStr).toBe('string');
    });
  });
});
