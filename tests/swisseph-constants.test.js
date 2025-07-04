import SwissEph from '../src/swisseph.js';

describe('SwissEph Constants and Edge Cases', () => {
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

  describe('Astronomical Constants', () => {
    test('should have correct astronomical unit conversions', () => {
      expect(swe.SE_AUNIT_TO_KM).toBe(149597870.7);
      expect(swe.SE_AUNIT_TO_LIGHTYEAR).toBeCloseTo(1.5812507409819728411242766893179e-5, 10);
      expect(swe.SE_AUNIT_TO_PARSEC).toBeCloseTo(4.8481368110952742659276431719005e-6, 10);
    });

    test('should have correct planet number constants', () => {
      const expectedPlanets = {
        SE_SUN: 0,
        SE_MOON: 1,
        SE_MERCURY: 2,
        SE_VENUS: 3,
        SE_MARS: 4,
        SE_JUPITER: 5,
        SE_SATURN: 6,
        SE_URANUS: 7,
        SE_NEPTUNE: 8,
        SE_PLUTO: 9,
        SE_EARTH: 14
      };

      Object.entries(expectedPlanets).forEach(([constant, value]) => {
        expect(swe[constant]).toBe(value);
      });
    });

    test('should have correct lunar node constants', () => {
      expect(swe.SE_MEAN_NODE).toBe(10);
      expect(swe.SE_TRUE_NODE).toBe(11);
      expect(swe.SE_MEAN_APOG).toBe(12);
      expect(swe.SE_OSCU_APOG).toBe(13);
    });

    test('should have correct asteroid constants', () => {
      expect(swe.SE_CHIRON).toBe(15);
      expect(swe.SE_PHOLUS).toBe(16);
      expect(swe.SE_CERES).toBe(17);
      expect(swe.SE_PALLAS).toBe(18);
      expect(swe.SE_JUNO).toBe(19);
      expect(swe.SE_VESTA).toBe(20);
    });

    test('should have correct Uranian planet constants', () => {
      const uranianPlanets = {
        SE_CUPIDO: 40,
        SE_HADES: 41,
        SE_ZEUS: 42,
        SE_KRONOS: 43,
        SE_APOLLON: 44,
        SE_ADMETOS: 45,
        SE_VULKANUS: 46,
        SE_POSEIDON: 47
      };

      Object.entries(uranianPlanets).forEach(([constant, value]) => {
        expect(swe[constant]).toBe(value);
      });
    });

    test('should have correct flag bit constants', () => {
      // Test some key flag constants
      expect(swe.SEFLG_JPLEPH).toBe(1);
      expect(swe.SEFLG_SWIEPH).toBe(2);
      expect(swe.SEFLG_MOSEPH).toBe(4);
      expect(swe.SEFLG_HELCTR).toBe(8);
      expect(swe.SEFLG_TRUEPOS).toBe(16);
      expect(swe.SEFLG_J2000).toBe(32);
      expect(swe.SEFLG_NONUT).toBe(64);
      expect(swe.SEFLG_SPEED3).toBe(128);
      expect(swe.SEFLG_SPEED).toBe(256);
      expect(swe.SEFLG_NOGDEFL).toBe(512);
      expect(swe.SEFLG_NOABERR).toBe(1024);
      expect(swe.SEFLG_EQUATORIAL).toBe(2048);
      expect(swe.SEFLG_XYZ).toBe(4096);
      expect(swe.SEFLG_RADIANS).toBe(8192);
      expect(swe.SEFLG_BARYCTR).toBe(16384);
      expect(swe.SEFLG_TOPOCTR).toBe(32768);
      expect(swe.SEFLG_SIDEREAL).toBe(65536);
    });

    test('should have correct composite flag constants', () => {
      expect(swe.SEFLG_ASTROMETRIC).toBe(swe.SEFLG_NOABERR | swe.SEFLG_NOGDEFL);
      expect(swe.SEFLG_ASTROMETRIC).toBe(1536);
      expect(swe.SEFLG_DEFAULTEPH).toBe(swe.SEFLG_SWIEPH);
    });

    test('should have correct sidereal mode constants', () => {
      expect(swe.SE_SIDM_FAGAN_BRADLEY).toBe(0);
      expect(swe.SE_SIDM_LAHIRI).toBe(1);
      expect(swe.SE_SIDM_DELUCE).toBe(2);
      expect(swe.SE_SIDM_RAMAN).toBe(3);
      expect(swe.SE_SIDM_KRISHNAMURTI).toBe(5);
      expect(swe.SE_SIDM_USER).toBe(255);
    });

    test('should have correct eclipse constants', () => {
      expect(swe.SE_ECL_CENTRAL).toBe(1);
      expect(swe.SE_ECL_NONCENTRAL).toBe(2);
      expect(swe.SE_ECL_TOTAL).toBe(4);
      expect(swe.SE_ECL_ANNULAR).toBe(8);
      expect(swe.SE_ECL_PARTIAL).toBe(16);
      expect(swe.SE_ECL_ANNULAR_TOTAL).toBe(32);
      expect(swe.SE_ECL_PENUMBRAL).toBe(64);
      
      // Test composite constants
      expect(swe.SE_ECL_ALLTYPES_SOLAR).toBe(63);
      expect(swe.SE_ECL_ALLTYPES_LUNAR).toBe(84);
    });

    test('should have correct house system constants', () => {
      expect(swe.SE_ASC).toBe(0);
      expect(swe.SE_MC).toBe(1);
      expect(swe.SE_ARMC).toBe(2);
      expect(swe.SE_VERTEX).toBe(3);
      expect(swe.SE_EQUASC).toBe(4);
    });
  });

  describe('Ephemeris Configuration', () => {
    test('should have correct ephemeris constants', () => {
      expect(swe.ephemeris.swisseph).toBe(2);
      expect(swe.ephemeris.moshier).toBe(4);
      expect(swe.ephemeris.de200).toBe("de200.eph");
      expect(swe.ephemeris.de405).toBe("de405.eph");
      expect(swe.ephemeris.de406).toBe("de406.eph");
      expect(swe.ephemeris.de421).toBe("de421.eph");
      expect(swe.ephemeris.de430).toBe("de430.eph");
      expect(swe.ephemeris.de431).toBe("de431.eph");
    });
  });

  describe('Calendar Constants', () => {
    test('should have correct calendar type constants', () => {
      expect(swe.SE_JUL_CAL).toBe(0);
      expect(swe.SE_GREG_CAL).toBe(1);
    });
  });

  describe('Special Values and Limits', () => {
    test('should have correct special values', () => {
      expect(swe.TJD_INVALID).toBe(99999999.0);
      expect(swe.SE_MAX_STNAME).toBe(256);
      expect(swe.SE_NPLANETS).toBe(23);
      expect(swe.SE_AST_OFFSET).toBe(10000);
      expect(swe.SE_FICT_OFFSET).toBe(40);
      expect(swe.SE_COMET_OFFSET).toBe(1000);
    });

    test('should have correct photopic flag constants', () => {
      expect(swe.SE_PHOTOPIC_FLAG).toBe(0);
      expect(swe.SE_SCOTOPIC_FLAG).toBe(1);
      expect(swe.SE_MIXEDOPIC_FLAG).toBe(2);
    });
  });

  describe('Rise/Set/Transit Constants', () => {
    test('should have correct rise/set constants', () => {
      expect(swe.SE_CALC_RISE).toBe(1);
      expect(swe.SE_CALC_SET).toBe(2);
      expect(swe.SE_CALC_MTRANSIT).toBe(4);
      expect(swe.SE_CALC_ITRANSIT).toBe(8);
    });

    test('should have correct coordinate system constants', () => {
      expect(swe.SE_ECL2HOR).toBe(0);
      expect(swe.SE_EQU2HOR).toBe(1);
      expect(swe.SE_HOR2ECL).toBe(0);
      expect(swe.SE_HOR2EQU).toBe(1);
    });

    test('should have correct refraction constants', () => {
      expect(swe.SE_TRUE_TO_APP).toBe(0);
      expect(swe.SE_APP_TO_TRUE).toBe(1);
    });
  });

  describe('Degree Splitting Constants', () => {
    test('should have correct degree splitting flags', () => {
      expect(swe.SE_SPLIT_DEG_ROUND_SEC).toBe(1);
      expect(swe.SE_SPLIT_DEG_ROUND_MIN).toBe(2);
      expect(swe.SE_SPLIT_DEG_ROUND_DEG).toBe(4);
      expect(swe.SE_SPLIT_DEG_ZODIACAL).toBe(8);
      expect(swe.SE_SPLIT_DEG_KEEP_SIGN).toBe(16);
      expect(swe.SE_SPLIT_DEG_KEEP_DEG).toBe(32);
      expect(swe.SE_SPLIT_DEG_NAKSHATRA).toBe(1024);
    });
  });

  describe('Heliacal Constants', () => {
    test('should have correct heliacal event constants', () => {
      expect(swe.SE_HELIACAL_RISING).toBe(1);
      expect(swe.SE_HELIACAL_SETTING).toBe(2);
      expect(swe.SE_MORNING_FIRST).toBe(1);
      expect(swe.SE_EVENING_LAST).toBe(2);
      expect(swe.SE_EVENING_FIRST).toBe(3);
      expect(swe.SE_MORNING_LAST).toBe(4);
      expect(swe.SE_ACRONYCHAL_RISING).toBe(5);
      expect(swe.SE_ACRONYCHAL_SETTING).toBe(6);
      expect(swe.SE_COSMICAL_SETTING).toBe(6);
    });

    test('should have correct heliacal flag constants', () => {
      expect(swe.SE_HELFLAG_LONG_SEARCH).toBe(128);
      expect(swe.SE_HELFLAG_HIGH_PRECISION).toBe(256);
      expect(swe.SE_HELFLAG_OPTICAL_PARAMS).toBe(512);
      expect(swe.SE_HELFLAG_NO_DETAILS).toBe(1024);
      expect(swe.SE_HELFLAG_SEARCH_1_PERIOD).toBe(2048);
      expect(swe.SE_HELFLAG_VISLIM_DARK).toBe(4096);
      expect(swe.SE_HELFLAG_VISLIM_NOMOON).toBe(8192);
      expect(swe.SE_HELFLAG_VISLIM_PHOTOPIC).toBe(16384);
    });
  });

  describe('Node and Apsides Constants', () => {
    test('should have correct node bit constants', () => {
      expect(swe.SE_NODBIT_MEAN).toBe(1);
      expect(swe.SE_NODBIT_OSCU).toBe(2);
      expect(swe.SE_NODBIT_OSCU_BAR).toBe(4);
      expect(swe.SE_NODBIT_FOPOINT).toBe(256);
    });
  });

  describe('Bit Flag Operations', () => {
    test('should handle bit flag combinations correctly', () => {
      // Test combining flags
      const combinedFlags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
      expect(combinedFlags).toBe(258); // 2 + 256

      const complexFlags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
      expect(complexFlags).toBe(65794); // 2 + 65536 + 256
    });

    test('should handle eclipse flag combinations', () => {
      const allSolarEclipses = swe.SE_ECL_CENTRAL | swe.SE_ECL_NONCENTRAL | 
                              swe.SE_ECL_TOTAL | swe.SE_ECL_ANNULAR | 
                              swe.SE_ECL_PARTIAL | swe.SE_ECL_ANNULAR_TOTAL;
      expect(allSolarEclipses).toBe(swe.SE_ECL_ALLTYPES_SOLAR);

      const allLunarEclipses = swe.SE_ECL_TOTAL | swe.SE_ECL_PARTIAL | swe.SE_ECL_PENUMBRAL;
      expect(allLunarEclipses).toBe(swe.SE_ECL_ALLTYPES_LUNAR);
    });
  });

  describe('Boundary Value Testing', () => {
    test('should handle minimum and maximum planet IDs', () => {
      expect(swe.SE_SUN).toBe(0); // Minimum standard planet
      expect(swe.SE_PLUTO).toBe(9); // Maximum standard planet
      expect(swe.SE_NPLANETS).toBe(23); // Total number of planets
    });

    test('should handle asteroid offset calculations', () => {
      const firstAsteroid = swe.SE_AST_OFFSET + 1; // Ceres
      expect(firstAsteroid).toBe(10001);
      
      const varuna = swe.SE_VARUNA;
      expect(varuna).toBe(30000);
      expect(varuna).toBe(swe.SE_AST_OFFSET + 20000);
    });

    test('should handle fictitious body ranges', () => {
      expect(swe.SE_FICT_OFFSET).toBe(40);
      expect(swe.SE_FICT_OFFSET_1).toBe(39);
      expect(swe.SE_FICT_MAX).toBe(999);
      expect(swe.SE_NFICT_ELEM).toBe(15);
    });
  });

  describe('String Constants and Validation', () => {
    test('should validate ephemeris file extensions', () => {
      const ephFiles = [
        swe.ephemeris.de200,
        swe.ephemeris.de405,
        swe.ephemeris.de406,
        swe.ephemeris.de421,
        swe.ephemeris.de430,
        swe.ephemeris.de431
      ];

      ephFiles.forEach(file => {
        expect(typeof file).toBe('string');
        expect(file).toMatch(/\.eph$/);
      });
    });
  });

  describe('Mathematical Constants Validation', () => {
    test('should validate astronomical unit conversions are reasonable', () => {
      // AU to km should be approximately 150 million km
      expect(swe.SE_AUNIT_TO_KM).toBeGreaterThan(149000000);
      expect(swe.SE_AUNIT_TO_KM).toBeLessThan(150000000);

      // AU to light-year should be a very small number
      expect(swe.SE_AUNIT_TO_LIGHTYEAR).toBeGreaterThan(0);
      expect(swe.SE_AUNIT_TO_LIGHTYEAR).toBeLessThan(0.0001);

      // AU to parsec should be even smaller
      expect(swe.SE_AUNIT_TO_PARSEC).toBeGreaterThan(0);
      expect(swe.SE_AUNIT_TO_PARSEC).toBeLessThan(swe.SE_AUNIT_TO_LIGHTYEAR);
    });
  });
});
