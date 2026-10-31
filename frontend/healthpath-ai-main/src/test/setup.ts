import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock HTMLElement.prototype.scrollIntoView which is absent in jsdom
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.print = () => {};

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window !== "undefined" && typeof window.SpeechSynthesisUtterance === "undefined") {
  class MockSpeechSynthesisUtterance {
    text: string;
    lang: string = "";
    rate: number = 1;
    pitch: number = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string = "") {
      this.text = text;
    }
  }
  // @ts-ignore
  window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  // @ts-ignore
  globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
}

