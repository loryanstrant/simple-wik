// Configure Monaco Editor to use local assets before any Monaco components are loaded
import { loader } from '@monaco-editor/react';

// Set up Monaco environment globally before any Monaco components load
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === 'json') {
        return '/monaco/vs/language/json/jsonWorker.js';
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return '/monaco/vs/language/css/cssWorker.js';
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return '/monaco/vs/language/html/htmlWorker.js';
      }
      if (label === 'typescript' || label === 'javascript') {
        return '/monaco/vs/language/typescript/tsWorker.js';
      }
      return '/monaco/vs/base/worker/workerMain.js';
    }
  };
}

// Configure Monaco loader to use local assets instead of CDN
loader.config({
  paths: {
    vs: '/monaco/vs'
  }
});

export default loader;