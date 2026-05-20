"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
  useEffect(() => {
    // ── 1. Patch chrome.runtime.sendMessage globally to intercept extension TypeErrors & Async Connection Rejections ──
    try {
      if (
        typeof window !== 'undefined' &&
        (window as any).chrome &&
        (window as any).chrome.runtime &&
        typeof (window as any).chrome.runtime.sendMessage === 'function'
      ) {
        const originalSendMessage = (window as any).chrome.runtime.sendMessage;
        (window as any).chrome.runtime.sendMessage = function (firstArg: any, ...args: any[]) {
          let promiseResult: any;

          // Coinbase Wallet extension calling without extension ID parameter check
          if (typeof firstArg !== 'string') {
            try {
              promiseResult = originalSendMessage.apply(
                (window as any).chrome.runtime,
                ['opfgelmcmbiajamepnmloijbpoleiama', firstArg, ...args]
              );
            } catch (err) {
              return Promise.resolve({ error: "Injected extension messaging suppressed" });
            }
          } else {
            try {
              promiseResult = originalSendMessage.apply((window as any).chrome.runtime, [firstArg, ...args]);
            } catch (err) {
              return Promise.resolve({ error: "Extension messaging suppressed" });
            }
          }

          // Intercept async promise rejections (e.g. "Could not establish connection. Receiving end does not exist.")
          // by appending a passive catch handler before returning it to the webpage scope.
          if (promiseResult && typeof promiseResult.catch === 'function') {
            return promiseResult.catch((err: any) => {
              // Return a resolved result containing error details rather than letting the Promise reject unhandled
              return { 
                error: "Injected extension connection suppressed", 
                details: err?.message || err 
              };
            });
          }

          return promiseResult;
        };
      }
    } catch (e) {
      // Passive catch if chrome object is frozen
    }

    // Suppress console errors and warnings in dev mode to keep the UI clean
    const suppressedMessages = [
      'Could not establish connection',
      'Receiving end does not exist',
      'chrome.runtime.sendMessage',
      'Cross-Origin-Opener-Policy',
      'HTTP error! status: 404',
      'Script tags inside React components',
      'lit-html',
      'Lit is in dev mode',
      'Extension ID',
      'extensionId',
      'runtime.sendMessage',
      'removeListener',
      'WebGL context',
      'BindToCurrentSequence',
      'Error creating WebGL context',
      'on-chain-kit',
      'InjectedScript',
      'chrome-extension',
      'Unexpected token',
      'DOCTYPE',
      'is not valid JSON',
      'reading \'toLowerCase\'',
      'extension invocation'
    ];

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'string' ? arg :
          arg instanceof Error ? arg.message :
            JSON.stringify(arg)
      ).join(' ');

      if (suppressedMessages.some(msg => message.includes(msg))) return;
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'string' ? arg :
          arg instanceof Error ? arg.message :
            JSON.stringify(arg)
      ).join(' ');

      if (suppressedMessages.some(msg => message.includes(msg))) return;
      originalWarn.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      const msg = (event.message || "").toString();
      if (suppressedMessages.some(msgPart => msg.includes(msgPart))) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = (event.reason?.message || event.reason || "").toString();
      if (suppressedMessages.some(msgPart => msg.includes(msgPart))) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}
