export class BrowserFingerprint {
    constructor({ requireConsent = true, logger = console } = {}) {
      this.data = {};
      this.requireConsent = requireConsent;  // Whether we need user consent before fingerprinting
      this.logger = logger;                  // Logging interface (defaults to console)
    }
  
    // Generate the final browser fingerprint as a hash
    async generateFingerprint() {
      this.logger.log("Starting fingerprint generation...");
  
      // Check if the user consents to fingerprinting (if required)
    //   if (this.requireConsent && !this.checkUserConsent()) {
    //     this.logger.warn("User did not consent to fingerprinting. Aborting.");
    //     return null;
    //   }
  
      try {
        // Collect all fingerprinting data from various sources
        await this.collect();
  
        // Convert collected data into a stable, JSON-serialized string
        const serialized = this.serializeData();
  
        // Hash the serialized data to produce the final fingerprint
        const fingerprint = await this.sha256(serialized);
        this.logger.log("Fingerprint generation completed successfully.");
        return fingerprint;
      } catch (err) {
        // If something goes wrong during collection or hashing, log and return null
        this.logger.error("Error generating fingerprint:", err);
        return null;
      }
    }
  
    // Simulate checking for user consent. In a real app, replace with a proper UI or stored preference.
    checkUserConsent() {
      // If the user clicks "Cancel", returns false and we abort the process
      return window.confirm("Allow browser fingerprinting for additional security?");
    }
  
    // Collect various signals and store them in `this.data`
    async collect() {
      this.logger.log("Collecting basic signals (UA, language, timezone, screen, hardware, features)...");
  
      // Basic browser and environment info
      this.data.userAgent = navigator.userAgent || "";
      this.data.language = navigator.language || "";
      this.data.languages = navigator.languages?.join(",") || "";
      this.data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      this.data.screen = this.getScreenInfo();
      this.data.hardware = this.getHardwareInfo();
      this.data.features = this.getFeatureInfo();
  
      this.logger.log("Collecting advanced signals: Canvas, Fonts, WebGL, Audio...");
  
      // More advanced fingerprinting techniques, each wrapped in safeCall to handle errors gracefully
      this.data.canvasHash = await this.safeCall(() => this.getCanvasFingerprint(), "canvas fingerprint");
      this.data.fonts = await this.safeCall(() => this.detectFonts(["Arial", "Courier New", "Times New Roman", "NonExistentFont"]), "font detection");
      this.data.webgl = await this.safeCall(() => this.getWebGLInfo(), "webgl info");
      this.data.audioHash = await this.safeCall(() => this.getAudioFingerprint(), "audio fingerprint");
    }
  
    // Gather screen-related info (dimensions, pixel ratio)
    getScreenInfo() {
      return {
        width: screen.width || 0,
        height: screen.height || 0,
        colorDepth: screen.colorDepth || 0,
        pixelRatio: window.devicePixelRatio || 1
      };
    }
  
    // Gather basic hardware info (CPU cores, device memory if available)
    getHardwareInfo() {
      return {
        cores: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory || null
      };
    }
  
    // Check the availability of certain browser features (storage APIs)
    getFeatureInfo() {
      return {
        localStorage: this.checkLocalStorage(),
        sessionStorage: this.checkSessionStorage(),
        indexedDB: this.checkIndexedDB(),
      };
    }
  
    // Test if localStorage is writable
    checkLocalStorage() {
      try {
        localStorage.setItem("_test", "1");
        localStorage.removeItem("_test");
        return true;
      } catch (e) {
        return false;
      }
    }
  
    // Test if sessionStorage is writable
    checkSessionStorage() {
      try {
        sessionStorage.setItem("_test", "1");
        sessionStorage.removeItem("_test");
        return true;
      } catch (e) {
        return false;
      }
    }
  
    // Check if IndexedDB is supported
    checkIndexedDB() {
      return !!window.indexedDB;
    }
  
    // Generate a canvas fingerprint by drawing and hashing the result
    async getCanvasFingerprint() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
  
      // Draw text and shapes that should render slightly differently on different systems
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(0, 0, 100, 50);
      ctx.fillStyle = "#069";
      ctx.fillText("BrowserFingerprint", 10, 10);
      ctx.strokeStyle = "#069";
      ctx.strokeRect(5, 5, 90, 40);
  
      // Convert to data URL and hash the result
      const data = canvas.toDataURL();
      return await this.sha256(data);
    }
  
    // Naive font detection: check if certain fonts are available by comparing text widths against base fonts
    async detectFonts(fonts) {
      const testString = "mmmmmmmmmmlli";
      const baseFonts = ["monospace", "serif", "sans-serif"];
      const testSize = "72px";
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
  
      const detected = [];
      for (const font of fonts) {
        let isDetected = false;
        for (const base of baseFonts) {
          // Measure width with a base font
          ctx.font = `${testSize} ${base}`;
          const baseWidth = ctx.measureText(testString).width;
  
          // Now measure with the test font plus the base fallback
          ctx.font = `${testSize} '${font}',${base}`;
          const testWidth = ctx.measureText(testString).width;
          // If width differs, the test font is likely available
          if (testWidth !== baseWidth) {
            isDetected = true;
            break;
          }
        }
        if (isDetected) detected.push(font);
      }
      return detected;
    }
  
    // Obtain WebGL info (GPU vendor and renderer) for fingerprinting
    async getWebGLInfo() {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return null;
  
      // Using WEBGL_debug_renderer_info for vendor/renderer strings
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return null;
  
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return { vendor, renderer };
    }
  
    // Generate an audio fingerprint by rendering audio offline and hashing the result
    async getAudioFingerprint() {
      // If OfflineAudioContext not available, skip
      if (typeof OfflineAudioContext === "undefined") return null;
  
      // Create a silent oscillator and process it offline
      const ctx = new OfflineAudioContext(1, 44100, 44100);
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 10000;
  
      const gain = ctx.createGain();
      gain.gain.value = 0.001; // very quiet
  
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(0.1);
  
      const buffer = await ctx.startRendering();
      const channelData = buffer.getChannelData(0);
  
      // Convert samples to a string and hash (sampling every 1000th sample for brevity)
      let hashString = "";
      for (let i = 0; i < channelData.length; i += 1000) {
        hashString += channelData[i].toFixed(5);
      }
      return this.sha256(hashString);
    }
  
    // Serialize data into a stable JSON string by sorting keys
    serializeData() {
      const ordered = this.sortObjectKeys(this.data);
      return JSON.stringify(ordered);
    }
  
    // Recursively sort object keys so the fingerprint is stable
    sortObjectKeys(obj) {
      if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
        const sortedObj = {};
        const keys = Object.keys(obj).sort();
        for (const k of keys) {
          sortedObj[k] = this.sortObjectKeys(obj[k]);
        }
        return sortedObj;
      } else if (Array.isArray(obj)) {
        return obj.map((v) => this.sortObjectKeys(v));
      }
      return obj;
    }
  
    // Compute SHA-256 hash of a string using the Web Crypto API
    async sha256(str) {
      if (window.crypto?.subtle && typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        return this.bufferToHex(hashBuffer);
      } else {
        // If hashing not supported, log a warning and return a dummy value
        this.logger.warn("SHA-256 not supported by this browser. Returning dummy hash.");
        return "sha256-not-supported";
      }
    }
  
    // Convert ArrayBuffer from crypto.subtle.digest() into a hex string
    bufferToHex(buffer) {
      const bytes = new Uint8Array(buffer);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  
    // Wrap calls in a try/catch to handle errors gracefully
    async safeCall(fn, label) {
      try {
        return await fn();
      } catch (err) {
        this.logger.error(`Error during ${label}:`, err);
        return null;
      }
    }
  }
