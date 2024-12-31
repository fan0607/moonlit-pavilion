# Moonlit Pavilion (月涌星河，水榭浮光)

## Introduction
A poetic Three.js 3D scene that captures the ethereal beauty of traditional Chinese aesthetics. The project features a mesmerizing particle system that disperses and reassembles the scene elements, creating a dreamlike transition effect triggered by the spacebar. Built with modern frontend technologies, it combines React Three Fiber (R3F) for declarative 3D scene development and TailwindCSS for elegant UI design.

## Features
- **Particle Transformation**: Press `[Space]` to trigger the scene's dispersion and reassembly
- **Interactive Water Surface**: Dynamic water reflection with ripple effects
- **Atmospheric Lighting**: Dynamic moonlight and star illumination
- **Chinese Aesthetics**: Traditional architectural elements with modern particle effects

## Tech Stack
### Core Dependencies
- **Build Tool**: Vite
- **3D Rendering**: Three.js
- **3D Framework**: 
  - React Three Fiber (R3F)
  - React Three Drei (Helper Components)
  - React Three Postprocessing (Post-processing Effects)
- **Physics & Animation**: 
  - @react-three/rapier
  - @react-spring/three
  - Custom Particle System
- **UI Framework**: TailwindCSS
- **Code Style**: ESLint + Prettier

### Effect Components Reference
- **Water Effect**: [@nhtoby311/WaterSurface](https://github.com/nhtoby311/WaterSurface) - Interactive water shader component

## Installation
```bash
# Core dependencies
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install @react-three/rapier @react-spring/three

# Water effect dependencies
npm install @funtech-inc/use-shader-fx
```

## Project Structure
```
greateThreeJS/
├── src/           # Source code
│   ├── components/    # React components
│   ├── scenes/       # 3D scenes
│   ├── shaders/      # Custom shaders
│   └── models/       # 3D model loaders
├── public/        # Static assets
│   ├── models/       # 3D model files
│   ├── textures/     # Texture files
│   └── hdri/         # Environment maps
├── index.html     # Entry HTML file
└── vite.config.js # Vite configuration
```

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Resources
### 3D Models
- Models from [Sketchfab](https://sketchfab.com/)
  
### Textures & Materials
- Environment Maps: [polyhaven](https://polyhaven.com/)
- Water Textures: From WaterSurface component

## Code Style
The project uses ESLint and Prettier for code formatting and linting:
- `.eslintrc.cjs` for code style configuration
- `.prettierrc` for code formatting rules

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Feedback
If you encounter any issues or have suggestions, please feel free to open an issue on GitHub.