# BBApp

Aplicacion movil de gestion financiera personal desarrollada con **React Native**. Permite a los usuarios autenticarse y visualizar sus transacciones (ingresos y gastos) con un resumen de balance en tiempo real.

## Stack tecnologico

- **React Native** 0.84.1 (New Architecture)
- **React** 19.2.3
- **TypeScript** 5.8+
- **React Navigation** 7 (Native Stack)
- **Zustand** 5 (estado del tema)
- **react-native-encrypted-storage** (almacenamiento seguro)

## Prerequisitos

| Herramienta | Version minima | Notas |
|---|---|---|
| Node.js | >= 22.11.0 | Verificar con `node -v` |
| npm | Incluido con Node | Verificar con `npm -v` |
| Ruby | >= 2.6.10 | Necesario para CocoaPods (iOS) |
| CocoaPods | >= 1.13 | Se instala via `bundle install` |
| Xcode | Ultima version estable | Solo macOS, necesario para iOS |
| Android Studio | Ultima version estable | Incluye Android SDK y emulador |
| JDK | 17 | Requerido por Android Gradle |

Guia completa de configuracion del entorno: [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment)

## Instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd BBApp

# 2. Instalar dependencias de JavaScript
npm install

# 3. Instalar dependencias nativas de iOS (solo macOS)
bundle install
bundle exec pod install --project-directory=ios
```

## Ejecutar en Android

**1. Iniciar el servidor Metro** en una terminal:

```bash
npm start
```

**2. En otra terminal**, compilar y ejecutar la app:

```bash
npm run android
```

Esto compila la app e instala el APK en el emulador o dispositivo conectado via USB (verificar con `adb devices`).

Tambien se puede abrir la carpeta `android/` directamente en **Android Studio** y ejecutar desde ahi.

## Ejecutar en iOS

> Requiere macOS con Xcode instalado.

**1. Iniciar el servidor Metro** en una terminal:

```bash
npm start
```

**2. En otra terminal**, compilar y ejecutar la app:

```bash
npm run ios
```

Esto compila la app y la abre en el simulador de iOS por defecto.

Tambien se puede abrir `ios/BBApp.xcworkspace` en **Xcode** y ejecutar desde ahi. Siempre usar el archivo `.xcworkspace`, no `.xcodeproj`.

## Scripts disponibles

| Script | Comando | Descripcion |
|---|---|---|
| Metro | `npm start` | Inicia el bundler de desarrollo |
| Android | `npm run android` | Compila y ejecuta en Android |
| iOS | `npm run ios` | Compila y ejecuta en iOS |
| Tests | `npm test` | Ejecuta los tests con Jest |
| Lint | `npm run lint` | Ejecuta ESLint sobre el proyecto |
