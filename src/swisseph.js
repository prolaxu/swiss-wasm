import WasamSwissEph from '../wsam/swisseph.js';

class SwissEph {
  // #region Constants
  SE_AUNIT_TO_KM = 149597870.7;
  SE_AUNIT_TO_LIGHTYEAR = 1.5812507409819728411242766893179e-5; // = 1.0 / 63241.07708427
  SE_AUNIT_TO_PARSEC = 4.8481368110952742659276431719005e-6; // = 1.0 / 206264.8062471

  SE_MAX_STNAME = 256;

  SE_SIDBITS = 256;
  SE_SIDBIT_ECL_T0 = 256;
  SE_SIDBIT_SSY_PLANE = 512;
  SE_SIDBIT_USER_UT = 1024;

  SE_BIT_DISC_CENTER = 256;
  SE_BIT_DISC_BOTTOM = 8192;
  SE_BIT_GEOCTR_NO_ECL_LAT = 128;
  SE_BIT_NO_REFRACTION = 512;
  SE_BIT_CIVIL_TWILIGHT = 1024;
  SE_BIT_NAUTIC_TWILIGHT = 2048;
  SE_BIT_ASTRO_TWILIGHT = 4096;
  SE_BIT_FIXED_DISC_SIZE = 16384; // = 16 * 1024

  TJD_INVALID = 99999999.0;
  SIMULATE_VICTORVB = 1;

  SE_PHOTOPIC_FLAG = 0;
  SE_SCOTOPIC_FLAG = 1;
  SE_MIXEDOPIC_FLAG = 2;

  ephemeris= {
      swisseph: 2, // = SEFLG_SWIEPH
      moshier: 4, // = SEFLG_MOSEPH
      de200: "de200.eph",
      de405: "de405.eph",
      de406: "de406.eph",
      de406e: "de406e.eph",
      de414: "de414.eph",
      de421: "de421.eph",
      de422: "de422.eph",
      de430: "de430.eph",
      de431: "de431.eph",
  };

  // Calendar types
  SE_JUL_CAL = 0;
  SE_GREG_CAL = 1;

  // Planet numbers
  SE_SUN = 0;
  SE_MOON = 1;
  SE_MERCURY = 2;
  SE_VENUS = 3;
  SE_EARTH = 14;
  SE_MARS = 4;
  SE_JUPITER = 5;
  SE_SATURN = 6;
  SE_URANUS = 7;
  SE_NEPTUNE = 8;
  SE_PLUTO = 9;

  // Moon nodes
  SE_MEAN_NODE = 10;
  SE_TRUE_NODE = 11;
  SE_MEAN_APOG = 12;
  SE_OSCU_APOG = 13;
  SE_INTP_APOG = 21;
  SE_INTP_PERG = 22;

  // Base asteroids
  SE_CHIRON = 15;
  SE_PHOLUS = 16;
  SE_CERES = 17;
  SE_PALLAS = 18;
  SE_JUNO = 19;
  SE_VESTA = 20;

  SE_NPLANETS = 23;
  SE_AST_OFFSET = 10000;
  SE_VARUNA = 30000; // = SE_AST_OFFSET + 20000
  SE_FICT_OFFSET = 40;
  SE_FICT_OFFSET_1 = 39;
  SE_FICT_MAX = 999;
  SE_NFICT_ELEM = 15;
  SE_COMET_OFFSET = 1000;
  SE_NALL_NAT_POINTS = 38; // = SE_NPLANETS + SE_NFICT_ELEM

  // Hamburger or Uranian "planets"
  SE_CUPIDO = 40;
  SE_HADES = 41;
  SE_ZEUS = 42;
  SE_KRONOS = 43;
  SE_APOLLON = 44;
  SE_ADMETOS = 45;
  SE_VULKANUS = 46;
  SE_POSEIDON = 47;

  // Other fictitious bodies
  SE_ISIS = 48;
  SE_NIBIRU = 49;
  SE_HARRINGTON = 50;
  SE_NEPTUNE_LEVERRIER = 51;
  SE_NEPTUNE_ADAMS = 52;
  SE_PLUTO_LOWELL = 53;
  SE_PLUTO_PICKERING = 54;
  SE_VULCAN = 55;
  SE_WHITE_MOON = 56;
  SE_PROSERPINA = 57;
  SE_WALDEMATH = 58;

  SE_FIXSTAR = -10;
  SE_ASC = 0;
  SE_MC = 1;
  SE_ARMC = 2;
  SE_VERTEX = 3;
  SE_EQUASC = 4;
  SE_COASC1 = 5;
  SE_COASC2 = 6;
  SE_POLASC = 7;
  SE_NASCMC = 8;

  // Flag bits for "iflag" parameter of the "swe_calc" functions
  SEFLG_JPLEPH = 1;
  SEFLG_SWIEPH = 2;
  SEFLG_MOSEPH = 4;
  SEFLG_HELCTR = 8;
  SEFLG_TRUEPOS = 16;
  SEFLG_J2000 = 32;
  SEFLG_NONUT = 64;
  SEFLG_SPEED3 = 128;
  SEFLG_SPEED = 256;
  SEFLG_NOGDEFL = 512;
  SEFLG_NOABERR = 1024;
  SEFLG_ASTROMETRIC = 1536; // = SEFLG_NOABERR | SEFLG_NOGDEFL
  SEFLG_EQUATORIAL = 2048; // = 2  *1024
  SEFLG_XYZ = 4096; // = 4 * 1024
  SEFLG_RADIANS = 8192; // = 8 * 1024
  SEFLG_BARYCTR = 16384; // = 16 * 1024
  SEFLG_TOPOCTR = 32768; // = 32 * 1024
  SEFLG_ORBEL_AA = 32768; // = SEFLG_TOPOCTR
  SEFLG_SIDEREAL = 65536; // = 64 * 1024
  SEFLG_ICRS = 131072; // = 128 * 1024
  SEFLG_DPSIDEPS_1980 = 262144; // = 256*1024
  SEFLG_JPLHOR = 262144; // = SEFLG_DPSIDEPS_1980
  SEFLG_JPLHOR_APPROX = 524288; // = 512*1024
  SEFLG_DEFAULTEPH = 2; // = SEFLG_SWIEPH

  // Sidereal modes
  SE_SIDM_FAGAN_BRADLEY = 0;
  SE_SIDM_LAHIRI = 1;
  SE_SIDM_DELUCE = 2;
  SE_SIDM_RAMAN = 3;
  SE_SIDM_USHASHASHI = 4;
  SE_SIDM_KRISHNAMURTI = 5;
  SE_SIDM_DJWHAL_KHUL = 6;
  SE_SIDM_YUKTESHWAR = 7;
  SE_SIDM_JN_BHASIN = 8;
  SE_SIDM_BABYL_KUGLER1 = 9;
  SE_SIDM_BABYL_KUGLER2 = 10;
  SE_SIDM_BABYL_KUGLER3 = 11;
  SE_SIDM_BABYL_HUBER = 12;
  SE_SIDM_BABYL_ETPSC = 13;
  SE_SIDM_ALDEBARAN_15TAU = 14;
  SE_SIDM_HIPPARCHOS = 15;
  SE_SIDM_SASSANIAN = 16;
  SE_SIDM_GALCENT_0SAG = 17;
  SE_SIDM_J2000 = 18;
  SE_SIDM_J1900 = 19;
  SE_SIDM_B1950 = 20;
  SE_SIDM_SURYASIDDHANTA = 21;
  SE_SIDM_SURYASIDDHANTA_MSUN = 22;
  SE_SIDM_ARYABHATA = 23;
  SE_SIDM_ARYABHATA_MSUN = 24;
  SE_SIDM_SS_REVATI = 25;
  SE_SIDM_SS_CITRA = 26;
  SE_SIDM_TRUE_CITRA = 27;
  SE_SIDM_TRUE_REVATI = 28;
  SE_SIDM_TRUE_PUSHYA = 29;
  SE_SIDM_GALCENT_RGILBRAND = 30;
  SE_SIDM_GALEQU_IAU1958 = 31;
  SE_SIDM_GALEQU_TRUE = 32;
  SE_SIDM_GALEQU_MULA = 33;
  SE_SIDM_GALALIGN_MARDYKS = 34;
  SE_SIDM_TRUE_MULA = 35;
  SE_SIDM_GALCENT_MULA_WILHELM = 36;
  SE_SIDM_ARYABHATA_522 = 37;
  SE_SIDM_BABYL_BRITTON = 38;
  SE_SIDM_TRUE_SHEORAN = 39;
  SE_SIDM_GALCENT_COCHRANE = 40;
  SE_SIDM_GALEQU_FIORENZA = 41;
  SE_SIDM_VALENS_MOON = 42;
  SE_SIDM_USER = 255;
  SE_NSIDM_PREDEF = 43;

  // Used for "swe_nod_aps" function
  SE_NODBIT_MEAN = 1;
  SE_NODBIT_OSCU = 2;
  SE_NODBIT_OSCU_BAR = 4;
  SE_NODBIT_FOPOINT = 256;

  // Used for eclipse computations
  SE_ECL_NUT = -1;
  SE_ECL_CENTRAL = 1;
  SE_ECL_NONCENTRAL = 2;
  SE_ECL_TOTAL = 4;
  SE_ECL_ANNULAR = 8;
  SE_ECL_PARTIAL = 16;
  SE_ECL_ANNULAR_TOTAL = 32;
  SE_ECL_PENUMBRAL = 64;
  SE_ECL_ALLTYPES_SOLAR = 63; // = SE_ECL_CENTRAL | SE_ECL_NONCENTRAL | SE_ECL_TOTAL | SE_ECL_ANNULAR | SE_ECL_PARTIAL | SE_ECL_ANNULAR_TOTAL
  SE_ECL_ALLTYPES_LUNAR = 84; // = SE_ECL_TOTAL | SE_ECL_PARTIAL | SE_ECL_PENUMBRAL
  SE_ECL_VISIBLE = 128;
  SE_ECL_MAX_VISIBLE = 256;
  SE_ECL_1ST_VISIBLE = 512;
  SE_ECL_PARTBEG_VISIBLE = 512;
  SE_ECL_2ND_VISIBLE = 1024;
  SE_ECL_TOTBEG_VISIBLE = 1024;
  SE_ECL_3RD_VISIBLE = 2048;
  SE_ECL_TOTEND_VISIBLE = 2048;
  SE_ECL_4TH_VISIBLE = 4096;
  SE_ECL_PARTEND_VISIBLE = 4096;
  SE_ECL_PENUMBBEG_VISIBLE = 8192;
  SE_ECL_PENUMBEND_VISIBLE = 16384;
  SE_ECL_OCC_BEG_DAYLIGHT = 8192;
  SE_ECL_OCC_END_DAYLIGHT = 16384;
  SE_ECL_ONE_TRY = 32768; // = 32 * 1024

  // Used for "swe_rise_transit"
  SE_CALC_RISE = 1;
  SE_CALC_SET = 2;
  SE_CALC_MTRANSIT = 4;
  SE_CALC_ITRANSIT = 8;

  // Used for "swe_azalt" and "swe_azalt_rev" functions
  SE_ECL2HOR = 0;
  SE_EQU2HOR = 1;
  SE_HOR2ECL = 0;
  SE_HOR2EQU = 1;

  // Used for "swe_refrac" function
  SE_TRUE_TO_APP = 0;
  SE_APP_TO_TRUE = 1;

  // Rounding flags for "swe_split_deg" function
  SE_SPLIT_DEG_ROUND_SEC = 1;
  SE_SPLIT_DEG_ROUND_MIN = 2;
  SE_SPLIT_DEG_ROUND_DEG = 4;
  SE_SPLIT_DEG_ZODIACAL = 8;
  SE_SPLIT_DEG_KEEP_SIGN = 16;
  SE_SPLIT_DEG_KEEP_DEG= 32;
  SE_SPLIT_DEG_NAKSHATRA = 1024;

  // Used for heliacal functions
  SE_HELIACAL_RISING = 1;
  SE_HELIACAL_SETTING = 2;
  SE_MORNING_FIRST = 1; // = SE_HELIACAL_RISING
  SE_EVENING_LAST = 2; // = SE_HELIACAL_SETTING
  SE_EVENING_FIRST = 3;
  SE_MORNING_LAST = 4;
  SE_ACRONYCHAL_RISING = 5;
  SE_ACRONYCHAL_SETTING = 6;
  SE_COSMICAL_SETTING = 6; // = SE_ACRONYCHAL_SETTING

  SE_HELFLAG_LONG_SEARCH = 128;
  SE_HELFLAG_HIGH_PRECISION = 256;
  SE_HELFLAG_OPTICAL_PARAMS = 512;
  SE_HELFLAG_NO_DETAILS = 1024;
  SE_HELFLAG_SEARCH_1_PERIOD = 2048; // = 1 << 11
  SE_HELFLAG_VISLIM_DARK = 4096; // = 1 << 12
  SE_HELFLAG_VISLIM_NOMOON = 8192; // = 1 << 13
  SE_HELFLAG_VISLIM_PHOTOPIC = 16384; // = 1 << 14
  SE_HELFLAG_AVKIND_VR = 32768; // = 1 << 15
  SE_HELFLAG_AVKIND_PTO = 65536; // = 1 << 16
  SE_HELFLAG_AVKIND_MIN7 = 131072; // = 1 << 17
  SE_HELFLAG_AVKIND_MIN9 = 262144; // = 1 << 18
  SE_HELFLAG_AVKIND = 491520; // = SE_HELFLAG_AVKIND_VR | SE_HELFLAG_AVKIND_PTO | SE_HELFLAG_AVKIND_MIN7 | SE_HELFLAG_AVKIND_MIN9
  // #endregion Constants
  
  
  // Initializes the Swiss Ephemeris WebAssembly module
  async initSwissEph() {
    this.SweModule = await WasamSwissEph();
    this.SweModule.set_ephe_path('sweph');
  }

  set_ephe_path(path) {
    return this.SweModule.ccall('swe_set_ephe_path', 'string', ['string'], [path]);
  }

  house_pos(armc, geoLat, eps, hsys, lon, lat) {
    return this.SweModule.ccall('swe_houses_pos', 'number', ['number', 'number', 'number', 'string', 'number', 'number'], [armc, geoLat, eps, hsys, lon, lat]);
  }

  julday(year, month, day, hour) {
    return this.SweModule.ccall('swe_julday', 'number', ['number', 'number', 'number', 'number', 'number'], [year, month, day, hour, 1]);
  }

  calc_ut(julianDay, body, flags) {
    const result = this.SweModule.ccall('swe_calc_ut', 'number', ['number', 'number', 'number'], [julianDay, body, flags]);
    return result;
  }

  deltat(julianDay) {
    return this.SweModule.ccall('swe_deltat', 'number', ['number'], [julianDay]);
  }

  time_equ(julianDay) {
    return this.SweModule.ccall('swe_time_equ', 'number', ['number'], [julianDay]);
  }

  sidtime0(julianDay, eps, nut) {
    return this.SweModule.ccall('swe_sidtime0', 'number', ['number', 'number', 'number'], [julianDay, eps, nut]);
  }

  sidtime(julianDay) {
    return this.SweModule.ccall('swe_sidtime', 'number', ['number'], [julianDay]);
  }

  cotrans(xpo, eps) {
    return this.SweModule.ccall('swe_cotrans', 'void', ['array', 'number'], [xpo, eps]);
  }

  cotrans_sp(xpo, eps) {
    return this.SweModule.ccall('swe_cotrans_sp', 'void', ['array', 'number'], [xpo, eps]);
  }

  get_tid_acc() {
    return this.SweModule.ccall('swe_get_tid_acc', 'number', [], []);
  }

  set_tid_acc(acceleration) {
    this.SweModule.ccall('swe_set_tid_acc', 'void', ['number'], [acceleration]);
  }

  degnorm(x) {
    return this.SweModule.ccall('swe_degnorm', 'number', ['number'], [x]);
  }

  radnorm(x) {
    return this.SweModule.ccall('swe_radnorm', 'number', ['number'], [x]);
  }

  rad_midp(x1, x2) {
    return this.SweModule.ccall('swe_rad_midp', 'number', ['number', 'number'], [x1, x2]);
  }

  deg_midp(x1, x2) {
    return this.SweModule.ccall('swe_deg_midp', 'number', ['number', 'number'], [x1, x2]);
  }

  split_deg(ddeg, roundFlag) {
    const resultPtr = this.SweModule._malloc(5 * Float64Array.BYTES_PER_ELEMENT);
    this.SweModule.ccall('swe_split_deg', 'void', ['number', 'number', 'pointer'], [ddeg, roundFlag, resultPtr]);
    const result = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 5);
    this.SweModule._free(resultPtr);
    return {
      degree: result[0],
      min: result[1],
      second: result[2],
      fraction: result[3],
      sign: result[4],
    };
  }

  csnorm(p) {
    return this.SweModule.ccall('swe_csnorm', 'number', ['number'], [p]);
  }

  difcsn(p1, p2) {
    return this.SweModule.ccall('swe_difcsn', 'number', ['number', 'number'], [p1, p2]);
  }

  difdegn(p1, p2) {
    return this.SweModule.ccall('swe_difdegn', 'number', ['number', 'number'], [p1, p2]);
  }

  difcs2n(p1, p2) {
    return this.SweModule.ccall('swe_difcs2n', 'number', ['number', 'number'], [p1, p2]);
  }

  difdeg2n(p1, p2) {
    return this.SweModule.ccall('swe_difdeg2n', 'number', ['number', 'number'], [p1, p2]);
  }

  difrad2n(p1, p2) {
    return this.SweModule.ccall('swe_difrad2n', 'number', ['number', 'number'], [p1, p2]);
  }

  csroundsec(x) {
    return this.SweModule.ccall('swe_csroundsec', 'number', ['number'], [x]);
  }

  d2l(x) {
    return this.SweModule.ccall('swe_d2l', 'number', ['number'], [x]);
  }

  day_of_week(julianDay) {
    return this.SweModule.ccall('swe_day_of_week', 'number', ['number'], [julianDay]);
  }

  cs2timestr(t, sep, suppressZero) {
    return this.SweModule.ccall('swe_cs2timestr', 'string', ['number', 'number', 'number'], [t, sep, suppressZero]);
  }

  cs2lonlatstr(t, pChar, mChar) {
    return this.SweModule.ccall('swe_cs2lonlatstr', 'string', ['number', 'string', 'string'], [t, pChar, mChar]);
  }

  cs2degstr(t) {
    return this.SweModule.ccall('swe_cs2degstr', 'string', ['number'], [t]);
  }

  date_conversion(year, month, day, hour, gregflag) {
    const julianDay = this.SweModule.ccall(
      'swe_date_conversion',
      'number',
      ['number', 'number', 'number', 'number', 'number'],
      [year, month, day, hour, gregflag]
    );
    return julianDay;
  }

  revjul(julianDay, gregflag) {
    const buffer = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    this.SweModule.ccall(
      'swe_revjul',
      'void',
      ['number', 'number', 'pointer'],
      [julianDay, gregflag, buffer]
    );
    const result = new Float64Array(this.SweModule.HEAPF64.buffer, buffer, 4);
    this.SweModule._free(buffer);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
    };
  }

  utc_to_jd(year, month, day, hour, minute, second, gregflag) {
    const resultPtr = this.SweModule._malloc(2 * Float64Array.BYTES_PER_ELEMENT);
    this.SweModule.ccall(
      'swe_utc_to_jd',
      'void',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [year, month, day, hour, minute, second, gregflag, resultPtr]
    );
    const result = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 2);
    this.SweModule._free(resultPtr);
    return {
      julianDayET: result[0],
      julianDayUT: result[1],
    };
  }

  jdet_to_utc(julianDay, gregflag) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    this.SweModule.ccall(
      'swe_jdet_to_utc',
      'void',
      ['number', 'number', 'pointer'],
      [julianDay, gregflag, resultPtr]
    );
    const result = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(resultPtr);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
      minute: result[4],
      second: result[5],
    };
  }

  jdut1_to_utc(julianDay, gregflag) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    this.SweModule.ccall(
      'swe_jdut1_to_utc',
      'void',
      ['number', 'number', 'pointer'],
      [julianDay, gregflag, resultPtr]
    );
    const result = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(resultPtr);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
      minute: result[4],
      second: result[5],
    };
  }

  utc_time_zone(year, month, day, hour, minute, second, timezone) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    this.SweModule.ccall(
      'swe_utc_time_zone',
      'void',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [year, month, day, hour, minute, second, timezone, resultPtr]
    );
    const result = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(resultPtr);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
      minute: result[4],
      second: result[5],
    };
  }

  version() {
    return this.SweModule.ccall('swe_version', 'string', [], []);
  }

  calc(julianDay, body, flags) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const errorBuffer = this.SweModule._malloc(256);
    const retFlag = this.SweModule.ccall(
      'swe_calc',
      'number',
      ['number', 'number', 'number', 'pointer', 'pointer'],
      [julianDay, body, flags, resultPtr, errorBuffer]
    );
    if (retFlag < 0) {
      const error = this.SweModule.UTF8ToString(errorBuffer);
      this.SweModule._free(resultPtr);
      this.SweModule._free(errorBuffer);
      throw new Error(`Error in swe_calc: ${error}`);
    }
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(resultPtr);
    this.SweModule._free(errorBuffer);
    return {
      longitude: results[0],
      latitude: results[1],
      distance: results[2],
      longitudeSpeed: results[3],
      latitudeSpeed: results[4],
      distanceSpeed: results[5],
    };
  }

  fixstar(star, julianDay, flags) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = this.SweModule._malloc(star.length + 1);
    this.SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_fixstar',
      'number',
      ['pointer', 'number', 'number', 'pointer'],
      [starBuffer, julianDay, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(starBuffer);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  fixstar_mag(star) {
    const magBuffer = this.SweModule._malloc(8);
    const starBuffer = this.SweModule._malloc(star.length + 1);
    this.SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_fixstar_mag',
      'number',
      ['pointer', 'pointer'],
      [starBuffer, magBuffer]
    );
    const magnitude = this.SweModule.HEAPF64[magBuffer / 8];
    this.SweModule._free(starBuffer);
    this.SweModule._free(magBuffer);
    return retFlag < 0 ? null : magnitude;
  }

  fixstar2(star, julianDay, flags) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = this.SweModule._malloc(star.length + 1);
    this.SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_fixstar2',
      'number',
      ['pointer', 'number', 'number', 'pointer'],
      [starBuffer, julianDay, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(starBuffer);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  fixstar2_ut(star, julianDay, flags) {
    const resultPtr = this.SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = this.SweModule._malloc(star.length + 1);
    this.SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_fixstar2_ut',
      'number',
      ['pointer', 'number', 'number', 'pointer'],
      [starBuffer, julianDay, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 6);
    this.SweModule._free(starBuffer);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  fixstar2_mag(star) {
    const magBuffer = this.SweModule._malloc(8);
    const starBuffer = this.SweModule._malloc(star.length + 1);
    this.SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_fixstar2_mag',
      'number',
      ['pointer', 'pointer'],
      [starBuffer, magBuffer]
    );
    const magnitude = this.SweModule.HEAPF64[magBuffer / 8];
    this.SweModule._free(starBuffer);
    this.SweModule._free(magBuffer);
    return retFlag < 0 ? null : magnitude;
  }

  close() {
    this.SweModule.ccall('swe_close', 'void', [], []);
  }

  set_jpl_file(filename) {
    const fileBuffer = this.SweModule._malloc(filename.length + 1);
    this.SweModule.stringToUTF8(filename, fileBuffer, filename.length + 1);
    const result = this.SweModule.ccall(
      'swe_set_jpl_file',
      'string',
      ['pointer'],
      [fileBuffer]
    );
    this.SweModule._free(fileBuffer);
    return result;
  }

  get_planet_name(planetId) {
    return this.SweModule.ccall(
      'swe_get_planet_name',
      'string',
      ['number'],
      [planetId]
    );
  }

  set_topo(longitude, latitude, altitude) {
    this.SweModule.ccall(
      'swe_set_topo',
      'void',
      ['number', 'number', 'number'],
      [longitude, latitude, altitude]
    );
  }

  set_sid_mode(sidMode, t0, ayanT0) {
    this.SweModule.ccall(
      'swe_set_sid_mode',
      'void',
      ['number', 'number', 'number'],
      [sidMode, t0, ayanT0]
    );
  }

  get_ayanamsa(julianDay) {
    return this.SweModule.ccall(
      'swe_get_ayanamsa',
      'number',
      ['number'],
      [julianDay]
    );
  }

  get_ayanamsa_ut(julianDay) {
    return this.SweModule.ccall(
      'swe_get_ayanamsa_ut',
      'number',
      ['number'],
      [julianDay]
    );
  }

  get_ayanamsa_ex(julianDay, ephemerisFlag) {
    const resultPtr = this.SweModule._malloc(8);
    const retFlag = this.SweModule.ccall(
      'swe_get_ayanamsa_ex',
      'number',
      ['number', 'number', 'pointer'],
      [julianDay, ephemerisFlag, resultPtr]
    );
    const result = this.SweModule.HEAPF64[resultPtr / 8];
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : result;
  }

  get_ayanamsa_ex_ut(julianDay, ephemerisFlag) {
    const resultPtr = this.SweModule._malloc(8);
    const retFlag = this.SweModule.ccall(
      'swe_get_ayanamsa_ex_ut',
      'number',
      ['number', 'number', 'pointer'],
      [julianDay, ephemerisFlag, resultPtr]
    );
    const result = this.SweModule.HEAPF64[resultPtr / 8];
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : result;
  }

  get_ayanamsa_name(siderealMode) {
    return this.SweModule.ccall(
      'swe_get_ayanamsa_name',
      'string',
      ['number'],
      [siderealMode]
    );
  }

  nod_aps(julianDay, planet, flags, method) {
    return this.SweModule.ccall(
      'swe_nod_aps',
      'number',
      ['number', 'number', 'number', 'number'],
      [julianDay, planet, flags, method]
    );
  }

  nod_aps_ut(julianDay, planet, flags, method) {
    return this.SweModule.ccall(
      'swe_nod_aps_ut',
      'number',
      ['number', 'number', 'number', 'number'],
      [julianDay, planet, flags, method]
    );
  }

  get_orbital_elements(julianDay, planet, flags) {
    return this.SweModule.ccall(
      'swe_get_orbital_elements',
      'number',
      ['number', 'number', 'number'],
      [julianDay, planet, flags]
    );
  }

  orbit_max_min_true_distance(julianDay, planet, flags) {
    return this.SweModule.ccall(
      'swe_orbit_max_min_true_distance',
      'number',
      ['number', 'number', 'number'],
      [julianDay, planet, flags]
    );
  }

  heliacal_ut(julianDayStart, geoPos, atmosData, observerData, objectName, eventType, flags) {
    return this.SweModule.ccall(
      'swe_heliacal_ut',
      'number',
      ['number', 'array', 'array', 'array', 'string', 'number', 'number'],
      [julianDayStart, geoPos, atmosData, observerData, objectName, eventType, flags]
    );
  }

  heliacal_pheno_ut(julianDay, geoPos, atmosData, observerData, objectName, eventType, heliacalFlag) {
    return this.SweModule.ccall(
      'swe_heliacal_pheno_ut',
      'number',
      ['number', 'array', 'array', 'array', 'string', 'number', 'number'],
      [julianDay, geoPos, atmosData, observerData, objectName, eventType, heliacalFlag]
    );
  }

  vis_limit_mag(julianDay, geoPos, atmosData, observerData, objectName, heliacalFlag) {
    return this.SweModule.ccall(
      'swe_vis_limit_mag',
      'number',
      ['number', 'array', 'array', 'array', 'string', 'number'],
      [julianDay, geoPos, atmosData, observerData, objectName, heliacalFlag]
    );
  }

  houses(julianDay, geoLat, geoLon, houseSystem) {
    return this.SweModule.ccall(
      'swe_houses',
      'number',
      ['number', 'number', 'number', 'string'],
      [julianDay, geoLat, geoLon, houseSystem]
    );
  }

  houses_ex(julianDay, iflag, geoLat, geoLon, houseSystem) {
    return this.SweModule.ccall(
      'swe_houses_ex',
      'number',
      ['number', 'number', 'number', 'number', 'string'],
      [julianDay, iflag, geoLat, geoLon, houseSystem]
    );
  }

  houses_ex2(julianDay, iflag, geoLat, geoLon, houseSystem) {
    return this.SweModule.ccall(
      'swe_houses_ex2',
      'number',
      ['number', 'number', 'number', 'number', 'string'],
      [julianDay, iflag, geoLat, geoLon, houseSystem]
    );
  }

  houses_armc(armc, geoLat, eps, houseSystem) {
    return this.SweModule.ccall(
      'swe_houses_armc',
      'number',
      ['number', 'number', 'number', 'string'],
      [armc, geoLat, eps, houseSystem]
    );
  }

  houses_armc_ex2(armc, geoLat, eps, houseSystem) {
    return this.SweModule.ccall(
      'swe_houses_armc_ex2',
      'number',
      ['number', 'number', 'number', 'string'],
      [armc, geoLat, eps, houseSystem]
    );
  }

  sol_eclipse_where(julianDay, flags) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_sol_eclipse_where',
      'number',
      ['number', 'number', 'pointer'],
      [julianDay, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  lun_occult_where(julianDay, planet, starName, flags) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = this.SweModule._malloc(starName.length + 1);
    this.SweModule.stringToUTF8(starName, starBuffer, starName.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_lun_occult_where',
      'number',
      ['number', 'number', 'pointer', 'number', 'pointer'],
      [julianDay, planet, starBuffer, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(starBuffer);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  sol_eclipse_how(julianDay, flags, longitude, latitude, altitude) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_sol_eclipse_how',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, flags, longitude, latitude, altitude, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  sol_eclipse_when_loc(julianDayStart, flags, longitude, latitude, altitude, backward) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_sol_eclipse_when_loc',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, longitude, latitude, altitude, backward, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  lun_occult_when_loc(julianDayStart, planet, starName, flags, longitude, latitude, altitude, backward) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = this.SweModule._malloc(starName.length + 1);
    this.SweModule.stringToUTF8(starName, starBuffer, starName.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_lun_occult_when_loc',
      'number',
      ['number', 'number', 'pointer', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, planet, starBuffer, flags, longitude, latitude, altitude, backward, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(starBuffer);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  sol_eclipse_when_glob(julianDayStart, flags, eclipseType, backward) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_sol_eclipse_when_glob',
      'number',
      ['number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, eclipseType, backward, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  lun_occult_when_glob(julianDayStart, planet, starName, flags, eclipseType, backward) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = this.SweModule._malloc(starName.length + 1);
    this.SweModule.stringToUTF8(starName, starBuffer, starName.length + 1);
    const retFlag = this.SweModule.ccall(
      'swe_lun_occult_when_glob',
      'number',
      ['number', 'number', 'pointer', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, planet, starBuffer, flags, eclipseType, backward, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(starBuffer);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  lun_eclipse_how(julianDay, flags, longitude, latitude, altitude) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_lun_eclipse_how',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, flags, longitude, latitude, altitude, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  lun_eclipse_when(julianDayStart, flags, eclipseType, backward) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_lun_eclipse_when',
      'number',
      ['number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, eclipseType, backward, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  lun_eclipse_when_loc(julianDayStart, flags, longitude, latitude, altitude, backward) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_lun_eclipse_when_loc',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, longitude, latitude, altitude, backward, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  pheno(julianDay, planet, flags) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_pheno',
      'number',
      ['number', 'number', 'number', 'pointer'],
      [julianDay, planet, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  pheno_ut(julianDay, planet, flags) {
    const resultPtr = this.SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_pheno_ut',
      'number',
      ['number', 'number', 'number', 'pointer'],
      [julianDay, planet, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 8);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  refrac(julianDay, geoLat, geoLon, altitude, pressure, temperature) {
    const resultPtr = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_refrac',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, pressure, temperature, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 4);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  refrac_extended(julianDay, geoLat, geoLon, altitude, pressure, temperature, distance) {
    const resultPtr = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_refrac_extended',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, pressure, temperature, distance, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 4);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  set_lapse_rate(lapseRate) {
    this.SweModule.ccall(
      'swe_set_lapse_rate',
      'void',
      ['number'],
      [lapseRate]
    );
  }

  azal(julianDay, geoLat, geoLon, altitude, planet) {
    const resultPtr = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_azalt',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, planet, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 4);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  azal_rev(julianDay, geoLat, geoLon, altitude, planet) {
    const resultPtr = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_azalt_rev',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, planet, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 4);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  rise_trans(julianDay, planet, longitude, latitude, altitude, flags) {
    const resultPtr = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_rise_trans',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, planet, longitude, latitude, altitude, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 4);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

  rise_trans_true_hor(julianDay, planet, longitude, latitude, altitude, flags) {
    const resultPtr = this.SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = this.SweModule.ccall(
      'swe_rise_trans_true_hor',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, planet, longitude, latitude, altitude, flags, resultPtr]
    );
    const results = new Float64Array(this.SweModule.HEAPF64.buffer, resultPtr, 4);
    this.SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  }

}

export default SwissEph;