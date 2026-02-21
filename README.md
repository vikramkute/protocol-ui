# Protocol Extension

A VS Code extension for managing and testing HTTP requests directly within the editor.

## Features

- 📝 **Create HTTP Requests** - Create and manage HTTP requests in a tree view
- 🗑️ **Delete Requests** - Remove requests from your collection
- 👁️ **View Request Details** - Open a webview panel to view and manage request details
- 🎯 **Quick Access** - Access your requests from the Protocol panel in the activity bar

## Installation

To install and set up this extension for development:

```bash
npm install
```

## Testing the Extension

To build and test the extension, run:

```bash
npm run package
```

This command will:
1. Check for TypeScript type errors
2. Run ESLint to validate code style
3. Build the extension with esbuild in production mode

## Available Commands

The extension provides the following commands:

- **Protocol: Create a request** - Create a new HTTP request
  - Command ID: `protocol.createRequest`
  
- **Protocol: Delete request** - Delete an existing request
  - Command ID: `protocol.deleteRequest`

## Usage

1. Open the Extension Host window to test the extension
2. Click on the Protocol icon in the activity bar to open the Protocol panel
3. Use the "Create a request" button to add new requests
4. Click on a request to view its details in a webview panel
5. Use the delete icon next to a request to remove it

## Development Scripts

- `npm run watch` - Watch for changes and rebuild automatically
- `npm run watch:esbuild` - Watch for changes with esbuild
- `npm run watch:tsc` - Watch for TypeScript compilation errors
- `npm run check-types` - Check for TypeScript type errors
- `npm run lint` - Run ESLint to validate code
- `npm run test` - Run tests

## Requirements

- VS Code >= 1.107.0
- Node.js and npm

## Project Structure

- `src/` - TypeScript source files
  - `extension.ts` - Main extension entry point
  - `providers/` - Data providers for tree views
  - `types/` - TypeScript type definitions
  - `ui/` - UI components and content generators
  - `utilities/` - Helper utilities
  - `webview/` - Webview related files
- `media/` - Extension assets and media files
- `dist/` - Compiled output directory

## License

This project is licensed under the MIT License.
