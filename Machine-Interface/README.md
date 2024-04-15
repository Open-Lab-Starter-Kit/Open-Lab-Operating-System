# Inmachines App (machine-interface)

This is the interface code for OLOS. This interface is built with TypeScript, Vue.js, Vite, and Quasar.

## Features:

The interface provides all the features needed for the user to be able to control and interact with the machine.

- Controls: Control the machine operation using different functionalities:

  - Jogging in different in different directions.
  - Controlling the speed and the range of the jogging.
  - Real-time changes to the machine while operating.

- File Management: Upload, Delete, Open, and Rename gcode files.
- Console: Check the status of the machine and what command is being executed, send manual commands to the machine.

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```
