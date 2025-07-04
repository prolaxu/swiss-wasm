// Test setup file
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock WebAssembly if not available
if (typeof WebAssembly === 'undefined') {
  global.WebAssembly = {
    instantiate: jest.fn(),
    Module: jest.fn()
  };
}
