const { TextDecoder, TextEncoder } = require('node:util')

Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder })
Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder })
