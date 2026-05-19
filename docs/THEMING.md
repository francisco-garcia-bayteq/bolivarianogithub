# Guía de Theming

## Arquitectura

El sistema de theming se compone de cuatro archivos ubicados en `src/providers/theme/`:

| Archivo | Responsabilidad |
|---|---|
| `colors.ts` | Interfaz `ThemeColors` y paletas `LightColors` / `DarkColors` |
| `useThemeStore.ts` | Store Zustand con el estado del modo (light / dark / system) |
| `ThemeProvider.tsx` | Detecta el esquema de color del sistema y actualiza el store |
| `index.ts` | Re-exporta todo y expone el hook principal `useTheme()` |

---

## Cómo usar el tema en un componente

### 1. Importar el hook

```typescript
import { useTheme, type ThemeColors } from '../../providers/theme';
```

### 2. Obtener los colores

```typescript
export function MiComponente() {
  const { colors, isDark } = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hola</Text>
    </View>
  );
}
```

### 3. Crear estilos reactivos al tema

Usa un hook `useStyles` que reciba `colors` y devuelva un `StyleSheet` memoizado:

```typescript
function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        label: {
          color: colors.textPrimary,
          fontSize: 16,
        },
      }),
    [colors],
  );
}
```

> **Importante:** Siempre envuelve el `StyleSheet.create` en `useMemo` con `[colors]` como dependencia. Esto evita recrear estilos en cada render y garantiza que se actualicen al cambiar de tema.

---

## Cambiar el tema desde la UI

El hook `useTheme()` expone las siguientes funciones:

```typescript
const { colors, isDark, mode, setMode, toggleTheme } = useTheme();
```

| Propiedad | Tipo | Descripción |
|---|---|---|
| `colors` | `ThemeColors` | Paleta activa (light o dark) |
| `isDark` | `boolean` | `true` si el tema activo es oscuro |
| `mode` | `'light' \| 'dark' \| 'system'` | Modo seleccionado por el usuario |
| `setMode` | `(mode) => void` | Fija el modo directamente |
| `toggleTheme` | `() => void` | Alterna entre light y dark |

### Ejemplos

```typescript
// Alternar entre claro y oscuro
<Button title="Cambiar tema" onPress={toggleTheme} />

// Seleccionar un modo específico
<Button title="Modo oscuro" onPress={() => setMode('dark')} />
<Button title="Seguir al sistema" onPress={() => setMode('system')} />
```

---

## Cómo agregar un nuevo color

### Paso 1 — Agregar la propiedad a la interfaz

En `src/providers/theme/colors.ts`, agrega el nuevo color a `ThemeColors`:

```typescript
export interface ThemeColors {
  // ... colores existentes ...
  myNewColor: string;       // <-- agregar aquí
}
```

### Paso 2 — Definir el valor en ambas paletas

En el mismo archivo, agrega el valor en `LightColors` **y** `DarkColors`:

```typescript
export const LightColors: ThemeColors = {
  // ... valores existentes ...
  myNewColor: '#3B82F6',
};

export const DarkColors: ThemeColors = {
  // ... valores existentes ...
  myNewColor: '#60A5FA',
};
```

> TypeScript te obligará a definir el color en ambas paletas. Si olvidas una, el compilador marcará error.

### Paso 3 — Usar el nuevo color

```typescript
const styles = useStyles(colors);
// ...
label: {
  color: colors.myNewColor,
},
```

---

## Cómo modificar un color existente

Simplemente cambia el valor hexadecimal en `LightColors`, `DarkColors`, o ambos dentro de `colors.ts`:

```typescript
export const LightColors: ThemeColors = {
  primary: '#2563EB',   // antes: '#4F46E5'
};
```

Todos los componentes que usen `colors.primary` reflejarán el cambio automáticamente.

---

## Referencia de colores actuales

### Colores base

| Token | Light | Dark | Uso |
|---|---|---|---|
| `background` | `#F9FAFB` | `#111827` | Fondo general de la app |
| `surface` | `#FFFFFF` | `#1F2937` | Tarjetas, modales, superficies elevadas |
| `primary` | `#4F46E5` | `#818CF8` | Botones principales, enlaces, acentos |
| `primaryLight` | `#C7D2FE` | `#312E81` | Fondos suaves del color primario |
| `white` | `#FFFFFF` | `#FFFFFF` | Blanco constante |

### Texto

| Token | Light | Dark | Uso |
|---|---|---|---|
| `textPrimary` | `#111827` | `#F9FAFB` | Títulos, texto principal |
| `textSecondary` | `#6B7280` | `#D1D5DB` | Subtítulos, texto de apoyo |
| `textTertiary` | `#9CA3AF` | `#9CA3AF` | Hints, texto de menor importancia |
| `textLabel` | `#374151` | `#E5E7EB` | Labels de formularios |

### Bordes e inputs

| Token | Light | Dark | Uso |
|---|---|---|---|
| `border` | `#D1D5DB` | `#374151` | Bordes por defecto |
| `borderLight` | `#E5E7EB` | `#374151` | Bordes sutiles |
| `borderSubtle` | `#F3F4F6` | `#1F2937` | Separadores muy sutiles |
| `inputBg` | `#FFFFFF` | `#1F2937` | Fondo de campos de texto |
| `placeholder` | `#9CA3AF` | `#6B7280` | Texto placeholder |

### Feedback

| Token | Light | Dark | Uso |
|---|---|---|---|
| `error` | `#DC2626` | `#F87171` | Texto/íconos de error |
| `errorBg` | `#FEF2F2` | `#451A1A` | Fondo de banners de error |
| `errorBorder` | `#FECACA` | `#7F1D1D` | Borde de elementos con error |
| `success` | `#059669` | `#34D399` | Texto/íconos de éxito |
| `successBg` | `#ECFDF5` | `#064E3B` | Fondo de banners de éxito |
| `warning` | `#D97706` | `#FBBF24` | Texto/íconos de advertencia |
| `warningBg` | `#FFFBEB` | `#451A03` | Fondo de banners de advertencia |

### Otros

| Token | Light | Dark | Uso |
|---|---|---|---|
| `balanceDivider` | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.15)` | Divisor en tarjeta de balance |

---

## Convenciones

1. **Nunca uses colores hardcodeados** en componentes. Siempre referencia `colors.xxx`.
2. **Nombra los tokens por su rol**, no por su valor visual (`textPrimary`, no `darkGray`).
3. **Siempre define ambas variantes** (light y dark) al agregar un color.
4. **Agrupa los colores por categoría** (base, texto, bordes, feedback) al añadir nuevos.
5. **Usa `useMemo`** para los estilos que dependen de `colors`.
