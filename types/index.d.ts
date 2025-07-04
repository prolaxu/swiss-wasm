/**
 * Swiss Ephemeris WebAssembly TypeScript Definitions
 * High-precision astronomical calculations for JavaScript
 */

declare module 'swisseph-wasm' {
  /**
   * Main Swiss Ephemeris class
   */
  export default class SwissEph {
    // Constants - Planets
    readonly SE_SUN: 0;
    readonly SE_MOON: 1;
    readonly SE_MERCURY: 2;
    readonly SE_VENUS: 3;
    readonly SE_MARS: 4;
    readonly SE_JUPITER: 5;
    readonly SE_SATURN: 6;
    readonly SE_URANUS: 7;
    readonly SE_NEPTUNE: 8;
    readonly SE_PLUTO: 9;
    readonly SE_EARTH: 14;

    // Constants - Lunar Nodes
    readonly SE_MEAN_NODE: 10;
    readonly SE_TRUE_NODE: 11;
    readonly SE_MEAN_APOG: 12;
    readonly SE_OSCU_APOG: 13;

    // Constants - Asteroids
    readonly SE_CHIRON: 15;
    readonly SE_PHOLUS: 16;
    readonly SE_CERES: 17;
    readonly SE_PALLAS: 18;
    readonly SE_JUNO: 19;
    readonly SE_VESTA: 20;

    // Constants - Calculation Flags
    readonly SEFLG_JPLEPH: 1;
    readonly SEFLG_SWIEPH: 2;
    readonly SEFLG_MOSEPH: 4;
    readonly SEFLG_HELCTR: 8;
    readonly SEFLG_TRUEPOS: 16;
    readonly SEFLG_J2000: 32;
    readonly SEFLG_NONUT: 64;
    readonly SEFLG_SPEED: 256;
    readonly SEFLG_NOGDEFL: 512;
    readonly SEFLG_NOABERR: 1024;
    readonly SEFLG_EQUATORIAL: 2048;
    readonly SEFLG_XYZ: 4096;
    readonly SEFLG_RADIANS: 8192;
    readonly SEFLG_BARYCTR: 16384;
    readonly SEFLG_TOPOCTR: 32768;
    readonly SEFLG_SIDEREAL: 65536;

    // Constants - Sidereal Modes
    readonly SE_SIDM_FAGAN_BRADLEY: 0;
    readonly SE_SIDM_LAHIRI: 1;
    readonly SE_SIDM_DELUCE: 2;
    readonly SE_SIDM_RAMAN: 3;
    readonly SE_SIDM_KRISHNAMURTI: 5;

    // Constants - Calendar Types
    readonly SE_JUL_CAL: 0;
    readonly SE_GREG_CAL: 1;

    // Constants - Degree Splitting
    readonly SE_SPLIT_DEG_ROUND_SEC: 1;
    readonly SE_SPLIT_DEG_ROUND_MIN: 2;
    readonly SE_SPLIT_DEG_ROUND_DEG: 4;
    readonly SE_SPLIT_DEG_ZODIACAL: 8;

    /**
     * Initialize the Swiss Ephemeris WebAssembly module
     */
    initSwissEph(): Promise<void>;

    /**
     * Calculate Julian Day Number
     */
    julday(year: number, month: number, day: number, hour: number): number;

    /**
     * Calculate planetary positions (Universal Time)
     */
    calc_ut(jd: number, planet: number, flags: number): Float64Array;

    /**
     * Calculate planetary positions with detailed output
     */
    calc(jd: number, planet: number, flags: number): {
      longitude: number;
      latitude: number;
      distance: number;
      longitudeSpeed: number;
      latitudeSpeed: number;
      distanceSpeed: number;
    };

    /**
     * Calculate Delta T (difference between Terrestrial Time and Universal Time)
     */
    deltat(jd: number): number;

    /**
     * Calculate sidereal time
     */
    sidtime(jd: number): number;

    /**
     * Convert UTC time to Julian Day
     */
    utc_to_jd(year: number, month: number, day: number, hour: number, minute: number, second: number, gregflag: number): {
      julianDayET: number;
      julianDayUT: number;
    };

    /**
     * Convert Julian Day back to calendar date
     */
    revjul(jd: number, gregflag: number): {
      year: number;
      month: number;
      day: number;
      hour: number;
    };

    /**
     * Convert calendar date to Julian Day
     */
    date_conversion(year: number, month: number, day: number, hour: number, gregflag: number): number;

    /**
     * Normalize degrees to 0-360 range
     */
    degnorm(degrees: number): number;

    /**
     * Split decimal degrees into components
     */
    split_deg(degrees: number, roundflag: number): {
      degree: number;
      min: number;
      second: number;
      fraction: number;
      sign: number;
    };

    /**
     * Get day of week for Julian Day
     */
    day_of_week(jd: number): number;

    /**
     * Set sidereal calculation mode
     */
    set_sid_mode(sidmode: number, t0: number, ayan_t0: number): void;

    /**
     * Get ayanamsa value for sidereal calculations
     */
    get_ayanamsa(jd: number): number;

    /**
     * Get Swiss Ephemeris version
     */
    version(): string;

    /**
     * Get planet name
     */
    get_planet_name(planet: number): string;

    /**
     * Set topocentric location
     */
    set_topo(longitude: number, latitude: number, altitude: number): void;

    /**
     * Calculate fixed star positions
     */
    fixstar(starname: string, jd: number, flags: number): Float64Array | null;

    /**
     * Get fixed star magnitude
     */
    fixstar_mag(starname: string): number | null;

    /**
     * Calculate house positions
     */
    houses(jd: number, latitude: number, longitude: number, hsys: string): number;

    /**
     * Calculate house position for a planet
     */
    house_pos(armc: number, geolat: number, eps: number, hsys: string, lon: number, lat: number): number;

    /**
     * Close Swiss Ephemeris and free memory
     */
    close(): void;
  }

  /**
   * Planet position result from calc_ut
   */
  export interface PlanetPosition {
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
  }

  /**
   * Detailed planet position result from calc
   */
  export interface DetailedPlanetPosition {
    longitude: number;
    latitude: number;
    distance: number;
    longitudeSpeed: number;
    latitudeSpeed: number;
    distanceSpeed: number;
  }

  /**
   * Date components
   */
  export interface DateComponents {
    year: number;
    month: number;
    day: number;
    hour: number;
  }

  /**
   * Julian Day result from UTC conversion
   */
  export interface JulianDayResult {
    julianDayET: number;
    julianDayUT: number;
  }

  /**
   * Degree splitting result
   */
  export interface DegreeSplit {
    degree: number;
    min: number;
    second: number;
    fraction: number;
    sign: number;
  }
}
