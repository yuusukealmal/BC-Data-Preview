# Battle Cat Data Diff Preview

A web application for previewing and comparing Battle Cats game data files, supporting multi-version diff comparison and file content preview.

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Syntax Highlighting**: Shiki
- **Encryption/Decryption**: CryptoJS
- **Code Quality**: ESLint + Prettier

## 📦 Installation & Usage

### Requirements

- Node.js >= 16
- npm or yarn

### Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Development Mode

```bash
# Start development server
npm run dev
# or
yarn dev
```

The development server will start at `http://localhost:5173`.

## 📁 Project Structure

```
Battle-Cat-Data-Diff-Preview/
├── public/ # Static assets directory
│ ├── TW/ # Taiwan version data files
│ │── EN/ # English version data files
│ │── JP/ # Japanese version data files
│ │── KR/ # Korean version data files
├── src/ # Source code directory
│ ├── components/ # Vue components
│ │ ├── CodeBlock.vue # Code block component (syntax highlighting)
│ │ ├── FileList.vue # File list component
│ │ ├── ImagePreview.vue # Image preview component
│ │ ├── Manger.vue # Main management component
│ │ ├── PackPreview.vue # File preview component
│ │ └── fileTypeSelector.vue # File type selector
│ ├── config/ # Configuration files
│ │ ├── config.ts # Encryption config (keys, IVs)
│ │ └── versions.ts # Version configuration
│ ├── pages/ # Page components
│ │ ├── ErrorPage.vue # Error page
│ │ └── Home.vue # Home page
│ ├── store/ # State management
│ │ └── fileStore.ts # File state management (Pinia)
│ ├── types/ # TypeScript type definitions
│ │ └── index.ts # Main type definitions
│ ├── utils/ # Utility functions
│ │ ├── crypto/ # Encryption/decryption utilities
│ │ ├── diff/ # Diff comparison utilities
│ │ ├── imageCreate.ts # Image processing utilities
│ │ ├── routeController.ts # Route controller
│ │ └── theme.ts # Theme management utilities
│ ├── App.vue # Root component
│ ├── main.ts # Application entry point
│ ├── router.ts # Router configuration
│ ├── style.css # Global styles
│ └── vite-env.d.ts # Vite environment type definitions
├── .gitignore # Git ignore file
├── .prettierrc # Prettier configuration
├── eslint.config.mjs # ESLint configuration
├── index.html # HTML template
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── vite.config.js # Vite configuration
└── yarn.lock # Yarn lock file
```

## 📝 TODO

- [ ] Add Server Files
- [ ] Better Diff Picture Display and Download
- [ ] Better Diff Code Display
... and so on

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📞 Contact

For questions or suggestions, please contact via GitHub Issues.
