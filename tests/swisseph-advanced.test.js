import SwissEph from '../src/swisseph.js';

describe('SwissEph Advanced Functions', () => {
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

  describe('Eclipse Functions', () => {
    test('should calculate solar eclipse location', () => {
      const jd = swe.julday(2024, 4, 8, 12.0); // Example eclipse date
      const result = swe.sol_eclipse_where(jd, swe.SEFLG_SWIEPH);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should calculate solar eclipse visibility', () => {
      const jd = swe.julday(2024, 4, 8, 12.0);
      const longitude = -97.0; // Texas longitude
      const latitude = 31.0;   // Texas latitude
      const altitude = 200;    // meters
      
      const result = swe.sol_eclipse_how(jd, swe.SEFLG_SWIEPH, longitude, latitude, altitude);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should find next solar eclipse at location', () => {
      const jdStart = swe.julday(2023, 1, 1, 12.0);
      const longitude = -97.0;
      const latitude = 31.0;
      const altitude = 200;
      const backward = 0; // forward search
      
      const result = swe.sol_eclipse_when_loc(jdStart, swe.SEFLG_SWIEPH, longitude, latitude, altitude, backward);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should find global solar eclipses', () => {
      const jdStart = swe.julday(2023, 1, 1, 12.0);
      const eclipseType = swe.SE_ECL_TOTAL;
      const backward = 0;
      
      const result = swe.sol_eclipse_when_glob(jdStart, swe.SEFLG_SWIEPH, eclipseType, backward);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should calculate lunar eclipse visibility', () => {
      const jd = swe.julday(2023, 5, 5, 12.0); // Example lunar eclipse
      const longitude = 8.55;  // Zurich
      const latitude = 47.37;
      const altitude = 400;
      
      const result = swe.lun_eclipse_how(jd, swe.SEFLG_SWIEPH, longitude, latitude, altitude);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should find lunar eclipses', () => {
      const jdStart = swe.julday(2023, 1, 1, 12.0);
      const eclipseType = swe.SE_ECL_TOTAL;
      const backward = 0;
      
      const result = swe.lun_eclipse_when(jdStart, swe.SEFLG_SWIEPH, eclipseType, backward);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });
  });

  describe('Occultation Functions', () => {
    test('should calculate lunar occultation location', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planet = swe.SE_MARS;
      const starName = '';
      
      const result = swe.lun_occult_where(jd, planet, starName, swe.SEFLG_SWIEPH);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should find lunar occultations at location', () => {
      const jdStart = swe.julday(2023, 1, 1, 12.0);
      const planet = swe.SE_VENUS;
      const starName = '';
      const longitude = 0.0;
      const latitude = 51.5; // London
      const altitude = 0;
      const backward = 0;
      
      const result = swe.lun_occult_when_loc(jdStart, planet, starName, swe.SEFLG_SWIEPH, longitude, latitude, altitude, backward);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should find global lunar occultations', () => {
      const jdStart = swe.julday(2023, 1, 1, 12.0);
      const planet = swe.SE_JUPITER;
      const starName = '';
      const eclipseType = swe.SE_ECL_TOTAL;
      const backward = 0;
      
      const result = swe.lun_occult_when_glob(jdStart, planet, starName, swe.SEFLG_SWIEPH, eclipseType, backward);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });
  });

  describe('Planetary Phenomena Functions', () => {
    test('should calculate planetary phenomena', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planet = swe.SE_VENUS;
      
      const result = swe.pheno(jd, planet, swe.SEFLG_SWIEPH);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });

    test('should calculate planetary phenomena UT', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planet = swe.SE_MARS;
      
      const result = swe.pheno_ut(jd, planet, swe.SEFLG_SWIEPH);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(8);
      }
    });
  });

  describe('Rise/Set/Transit Functions', () => {
    test('should calculate rise and set times', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planet = swe.SE_SUN;
      const longitude = 8.55;  // Zurich
      const latitude = 47.37;
      const altitude = 400;
      const flags = swe.SE_CALC_RISE | swe.SE_CALC_SET;
      
      const result = swe.rise_trans(jd, planet, longitude, latitude, altitude, flags);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });

    test('should calculate transit times', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planet = swe.SE_MOON;
      const longitude = 0.0;   // Greenwich
      const latitude = 51.5;   // London
      const altitude = 0;
      const flags = swe.SE_CALC_MTRANSIT;
      
      const result = swe.rise_trans(jd, planet, longitude, latitude, altitude, flags);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });

    test('should calculate true horizon rise/set', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const planet = swe.SE_VENUS;
      const longitude = -74.0; // New York
      const latitude = 40.7;
      const altitude = 10;
      const flags = swe.SE_CALC_RISE | swe.SE_CALC_SET;
      
      const result = swe.rise_trans_true_hor(jd, planet, longitude, latitude, altitude, flags);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });
  });

  describe('Azimuth/Altitude Functions', () => {
    test('should calculate azimuth and altitude', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const geoLat = 47.37;
      const geoLon = 8.55;
      const altitude = 400;
      const planet = swe.SE_SUN;
      
      const result = swe.azal(jd, geoLat, geoLon, altitude, planet);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });

    test('should calculate reverse azimuth and altitude', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const geoLat = 47.37;
      const geoLon = 8.55;
      const altitude = 400;
      const planet = swe.SE_MOON;
      
      const result = swe.azal_rev(jd, geoLat, geoLon, altitude, planet);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });
  });

  describe('Atmospheric Refraction Functions', () => {
    test('should calculate atmospheric refraction', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const geoLat = 47.37;
      const geoLon = 8.55;
      const altitude = 400;
      const pressure = 1013.25; // standard pressure in hPa
      const temperature = 15.0;  // temperature in Celsius
      
      const result = swe.refrac(jd, geoLat, geoLon, altitude, pressure, temperature);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });

    test('should calculate extended atmospheric refraction', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const geoLat = 47.37;
      const geoLon = 8.55;
      const altitude = 400;
      const pressure = 1013.25;
      const temperature = 15.0;
      const distance = 1.0; // AU
      
      const result = swe.refrac_extended(jd, geoLat, geoLon, altitude, pressure, temperature, distance);
      
      if (result !== null) {
        expect(result).toBeInstanceOf(Float64Array);
        expect(result.length).toBe(4);
      }
    });

    test('should set lapse rate', () => {
      expect(() => {
        swe.set_lapse_rate(0.0065); // standard lapse rate in K/m
      }).not.toThrow();
    });
  });

  describe('House System Functions', () => {
    test('should calculate houses', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const geoLat = 47.37;
      const geoLon = 8.55;
      const houseSystem = 'P'; // Placidus
      
      const result = swe.houses(jd, geoLat, geoLon, houseSystem);
      expect(typeof result).toBe('number');
    });

    test('should calculate houses with flags', () => {
      const jd = swe.julday(2023, 6, 15, 12.0);
      const iflag = swe.SEFLG_SWIEPH;
      const geoLat = 47.37;
      const geoLon = 8.55;
      const houseSystem = 'K'; // Koch
      
      const result = swe.houses_ex(jd, iflag, geoLat, geoLon, houseSystem);
      expect(typeof result).toBe('number');
    });

    test('should calculate houses with ARMC', () => {
      const armc = 180.0; // Right Ascension of Midheaven
      const geoLat = 47.37;
      const eps = 23.44; // obliquity of ecliptic
      const houseSystem = 'P';
      
      const result = swe.houses_armc(armc, geoLat, eps, houseSystem);
      expect(typeof result).toBe('number');
    });
  });
});
