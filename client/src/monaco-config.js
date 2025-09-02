// Configure Monaco Editor to use local assets before any Monaco components are loaded
import { loader } from '@monaco-editor/react';

// Configure Monaco loader to use local assets instead of CDN
loader.config({
  paths: {
    vs: '/monaco/vs'
  }
});

export default loader;