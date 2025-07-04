// Mock WebAssembly module for testing
const mockWasmModule = () => {
  const mockHeap = new ArrayBuffer(1024 * 1024); // 1MB mock heap
  const mockHeapF64 = new Float64Array(mockHeap);
  
  let mallocCounter = 0;
  const allocatedPointers = new Set();
  
  return {
    HEAPF64: mockHeapF64,
    
    _malloc: (size) => {
      const ptr = mallocCounter * 8; // 8 bytes per double
      mallocCounter += Math.ceil(size / 8);
      allocatedPointers.add(ptr);
      return ptr;
    },
    
    _free: (ptr) => {
      allocatedPointers.delete(ptr);
    },
    
    stringToUTF8: (str, buffer, maxLength) => {
      // Mock string to UTF8 conversion
      return str.length;
    },
    
    UTF8ToString: (ptr) => {
      // Mock UTF8 to string conversion
      return "Mock error message";
    },
    
    ccall: (funcName, returnType, argTypes, args) => {
      // Mock ccall implementation
      switch (funcName) {
        case 'swe_set_ephe_path':
          return 'OK';
          
        case 'swe_julday':
          // Mock Julian day calculation
          const [year, month, day, hour] = args;
          return 2451545.0 + (year - 2000) * 365.25 + month * 30 + day + hour / 24;
          
        case 'swe_calc_ut':
          // Mock planet calculation - write to buffer
          const [jd, planet, flags, buffer] = args;
          const bufferIndex = buffer / 8;

          // More realistic astronomical positions based on date and planet
          let longitude;

          // Special handling for summer solstice test (JD around 2460116 for June 21, 2023)
          if (jd > 2460115 && jd < 2460118 && planet === 0) { // Sun around summer solstice
            longitude = 90.0; // 0° Cancer
          } else if (planet === 0) { // Sun
            longitude = 120.5 + (jd - 2451545) * 0.98; // Approximate sun movement
          } else if (planet === 1) { // Moon
            // For new moon test (around JD 2460113), make moon close to sun
            if (jd > 2460112 && jd < 2460115) {
              longitude = 120.5 + (jd - 2451545) * 0.98; // Same as sun for new moon
            } else {
              longitude = 150.0 + (jd - 2451545) * 13.2; // Approximate moon movement
            }
          } else {
            longitude = 120.5 + planet * 30; // Different longitude per planet
          }

          if (flags & 65536) { // SEFLG_SIDEREAL
            longitude -= 24; // Subtract ayanamsa for sidereal
          }
          if (flags & 2048) { // SEFLG_EQUATORIAL
            longitude += 10; // Different for equatorial coordinates
          }

          mockHeapF64[bufferIndex] = longitude % 360;
          mockHeapF64[bufferIndex + 1] = 1.2; // latitude
          mockHeapF64[bufferIndex + 2] = 1.0; // distance
          mockHeapF64[bufferIndex + 3] = 0.5; // longitude speed
          return 0; // success
          
        case 'swe_calc':
          // Mock calc function
          const [jd2, planet2, flags2, resultPtr, errorPtr] = args;

          // Simulate error for invalid planet
          if (planet2 > 100) {
            return -1; // Error flag
          }

          const resultIndex = resultPtr / 8;
          let longitude2;

          // Special handling for summer solstice test
          if (jd2 > 2460115 && jd2 < 2460118 && planet2 === 0) { // Sun around summer solstice
            longitude2 = 90.0; // 0° Cancer
          } else if (planet2 === 0) { // Sun
            longitude2 = 150.75 + (jd2 - 2451545) * 0.98;
          } else if (planet2 === 1) { // Moon
            // For new moon test (around JD 2460113), make moon close to sun
            if (jd2 > 2460112 && jd2 < 2460115) {
              longitude2 = 150.75 + (jd2 - 2451545) * 0.98; // Same as sun for new moon
            } else {
              longitude2 = 180.0 + (jd2 - 2451545) * 13.2;
            }
          } else {
            longitude2 = 150.75 + planet2 * 25;
          }

          if (flags2 & 65536) { // SEFLG_SIDEREAL
            longitude2 -= 24;
          }

          mockHeapF64[resultIndex] = longitude2 % 360; // longitude
          mockHeapF64[resultIndex + 1] = 2.3; // latitude
          mockHeapF64[resultIndex + 2] = 1.5; // distance
          mockHeapF64[resultIndex + 3] = 0.8; // longitude speed
          mockHeapF64[resultIndex + 4] = 0.1; // latitude speed
          mockHeapF64[resultIndex + 5] = 0.01; // distance speed
          return 0; // success flag
          
        case 'swe_version':
          return 'Swiss Ephemeris 2.10.03';
          
        case 'swe_deltat':
          return 69.184; // Mock delta T
          
        case 'swe_sidtime':
          return 12.5; // Mock sidereal time
          
        case 'swe_degnorm':
          // Proper degree normalization: ensure result is between 0 and 360
          let degNorm = args[0] % 360;
          return degNorm < 0 ? degNorm + 360 : degNorm;
          
        case 'swe_split_deg':
          // Mock degree splitting
          const [degSplit, roundFlag, resultPtr2] = args;
          const splitIndex = resultPtr2 / 8;
          mockHeapF64[splitIndex] = Math.floor(degSplit); // degree
          mockHeapF64[splitIndex + 1] = Math.floor((degSplit % 1) * 60); // minutes
          mockHeapF64[splitIndex + 2] = ((degSplit % 1) * 60 % 1) * 60; // seconds
          mockHeapF64[splitIndex + 3] = 0; // fraction
          mockHeapF64[splitIndex + 4] = Math.floor(degSplit / 30); // sign
          return;
          
        case 'swe_revjul':
          // Mock reverse Julian day
          const [jd3, gregflag, buffer2] = args;
          const dateIndex = buffer2 / 8;
          mockHeapF64[dateIndex] = 2023; // year
          mockHeapF64[dateIndex + 1] = 6; // month
          mockHeapF64[dateIndex + 2] = 15; // day
          mockHeapF64[dateIndex + 3] = 12.5; // hour
          return;
          
        case 'swe_utc_to_jd':
          // Mock UTC to Julian day
          const [year2, month2, day2, hour2, min, sec, gregflag2, resultPtr3] = args;
          const jdIndex = resultPtr3 / 8;
          mockHeapF64[jdIndex] = 2451545.0; // ET
          mockHeapF64[jdIndex + 1] = 2451544.9; // UT
          return;
          
        case 'swe_get_planet_name':
          const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
          return planetNames[args[0]] || 'Unknown';

        case 'swe_date_conversion':
          // Mock date conversion - return proper Julian day
          const [year3, month3, day3, hour3, gregflag3] = args;
          return 2451545.0 + (year3 - 2000) * 365.25 + month3 * 30 + day3 + hour3 / 24;

        case 'swe_utc_time_zone':
          // Mock UTC time zone conversion
          const [year4, month4, day4, hour4, min4, sec4, timezone, resultPtr4] = args;
          const tzIndex = resultPtr4 / 8;
          mockHeapF64[tzIndex] = year4; // year
          mockHeapF64[tzIndex + 1] = month4; // month
          mockHeapF64[tzIndex + 2] = day4; // day
          mockHeapF64[tzIndex + 3] = hour4 + timezone; // hour adjusted for timezone
          mockHeapF64[tzIndex + 4] = min4; // minute
          mockHeapF64[tzIndex + 5] = sec4; // second
          return;

        case 'swe_get_ayanamsa':
          return 24.1; // Mock ayanamsa

        case 'swe_get_ayanamsa_ut':
          return 24.1; // Mock ayanamsa UT

        case 'swe_close':
          return;
          
        default:
          if (returnType === 'number') return 0;
          if (returnType === 'string') return 'mock_result';
          return;
      }
    }
  };
};

export default mockWasmModule;
