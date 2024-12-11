# Browser Fingerprint Generator

A robust browser fingerprinting library that generates unique device signatures by analyzing various browser characteristics and hardware capabilities. Built with privacy in mind and modern ES modules.

## 🚀 Features

- **Privacy-First**: Built-in consent management system
- **Multiple Data Points**:
  - Canvas fingerprinting
  - Audio fingerprinting
  - WebGL detection
  - Font enumeration
  - Hardware profiling
  - Browser feature detection
- **Error Resilient**: Graceful fallbacks for unsupported features
- **Modern Architecture**: Built with ES modules
- **Zero Dependencies**: Pure vanilla JavaScript
- **Secure Hashing**: SHA-256 via Web Crypto API

## 📦 Installation

1. Clone this repository or download the files
2. Include the files in your project


## 📊 Collected Data Points

The fingerprint is generated from multiple data sources:

- **Browser Environment**
  - User Agent
  - Language preferences
  - Timezone
  - Screen properties
  - Hardware capabilities

- **Advanced Fingerprinting**
  - Canvas rendering characteristics
  - Audio processing signatures
  - WebGL capabilities and GPU info
  - Available system fonts
  - Storage API support

## 🛠️ Development Setup

Due to ES module restrictions, you'll need to serve the files through a web server:



## 🔒 Privacy Considerations

- User consent is required by default
- All data is hashed using SHA-256
- No data persistence
- Transparent data collection
- No external service dependencies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - Feel free to use this in your own projects!

## 🔍 Technical Details

The fingerprint generator uses various browser APIs to collect unique identifiers:

- Canvas API for rendering-based fingerprinting
- Web Audio API for audio processing fingerprints
- WebGL for GPU information
- Navigator API for system details
- Web Storage APIs for feature detection
