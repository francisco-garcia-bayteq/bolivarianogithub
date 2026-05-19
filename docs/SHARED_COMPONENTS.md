# Guía de Componentes Compartidos

## Ubicación

Todos los componentes compartidos viven en:

```
src/presentation/components/
```

El archivo `index.ts` actúa como barrel y re-exporta cada componente. Los features los importan desde `../components`:

```typescript
import { Button, LabeledInput, ErrorMessage } from '../components';
```

## Componentes existentes

| Componente | Archivo | Propósito |
|---|---|---|
| `Button` | `Button.tsx` | Botón con variantes `primary` / `outline` y estado de carga |
| `LabeledInput` | `LabeledInput.tsx` | Campo de texto con label y estado de error |
| `ErrorMessage` | `ErrorMessage.tsx` | Banner de error con fondo y borde semánticos |
| `LoadingState` | `LoadingState.tsx` | Indicador de carga centrado con mensaje opcional |
| `EmptyState` | `EmptyState.tsx` | Mensaje de lista vacía |

---

## Anatomía de un componente compartido

Cada componente sigue esta estructura:

```
┌─────────────────────────────────────────────────┐
│  1. Imports (React, RN, useTheme, ThemeColors)  │
│  2. Props interface (tipado estricto)            │
│  3. Función del componente (named export)        │
│  4. useStyles(colors) con useMemo               │
└─────────────────────────────────────────────────┘
```

### Ejemplo de referencia — `ErrorMessage`

```typescript
// src/presentation/components/ErrorMessage.tsx
import React, {useMemo} from 'react';
import {View, Text, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';

interface ErrorMessageProps {
  message: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorMessage({message, style}: ErrorMessageProps) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.errorBg,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.errorBorder,
        },
        text: {
          color: colors.error,
          fontSize: 14,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
```

---

## Paso a paso: crear un nuevo componente

Se usa **"Badge"** como ejemplo.

### Paso 1 — Definir las props

Crea el archivo `src/presentation/components/Badge.tsx` y define la interfaz de props:

```typescript
import React, {useMemo} from 'react';
import {View, Text, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}
```

**Reglas para las props:**
- Tipado estricto; evitar `any`.
- Props opcionales con valor por defecto en la desestructuración.
- Incluir `style?: StyleProp<ViewStyle>` para permitir personalización externa.
- Usar union types (`type BadgeVariant`) para variantes en lugar de `string`.

### Paso 2 — Implementar el componente

```typescript
export function Badge({
  label,
  variant = 'neutral',
  style,
}: BadgeProps) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const variantStyles = {
    success: {bg: colors.successBg, text: colors.success},
    warning: {bg: colors.warningBg, text: colors.warning},
    error:   {bg: colors.errorBg, text: colors.error},
    neutral: {bg: colors.borderSubtle, text: colors.textSecondary},
  };

  const v = variantStyles[variant];

  return (
    <View style={[styles.container, {backgroundColor: v.bg}, style]}>
      <Text style={[styles.text, {color: v.text}]}>{label}</Text>
    </View>
  );
}
```

**Reglas del componente:**
- Siempre `named export` (nunca `export default`).
- Obtener colores con `useTheme()` — nunca hardcodear valores hex.
- Componer estilos con array: `[styles.base, condicionales, style]`.
- No incluir lógica de negocio; si necesitas datos, recíbelos por props.

### Paso 3 — Crear los estilos con `useStyles`

```typescript
function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          alignSelf: 'flex-start',
        },
        text: {
          fontSize: 12,
          fontWeight: '600',
        },
      }),
    [colors],
  );
}
```

**Reglas de estilos:**
- Siempre `useStyles(colors: ThemeColors)` como función separada al final del archivo.
- Envolver en `useMemo` con `[colors]` como dependencia.
- Usar `StyleSheet.create` dentro del `useMemo`.
- Usar tokens del tema (`colors.xxx`) — nunca valores hex directos.

### Paso 4 — Registrar en el barrel

Editar `src/presentation/components/index.ts`:

```typescript
export {Button} from './Button';
export {LabeledInput} from './LabeledInput';
export {ErrorMessage} from './ErrorMessage';
export {LoadingState} from './LoadingState';
export {EmptyState} from './EmptyState';
export {Badge} from './Badge';          // <-- nuevo
```

### Paso 5 — Usar en un feature

```typescript
// src/presentation/transactions/TransactionsScreen.tsx
import {Badge} from '../components';

<Badge label="Completado" variant="success" />
<Badge label="Pendiente" variant="warning" />
```

---

## Checklist de calidad

Antes de dar por terminado un componente compartido, verifica:

- [ ] **Named export** — `export function Xxx`, no `export default`.
- [ ] **Props tipadas** — interfaz explícita con JSDoc si la prop no es obvia.
- [ ] **`style` prop** — acepta `StyleProp<ViewStyle>` para personalización externa.
- [ ] **Tema** — usa `useTheme()` para todos los colores; cero hex hardcodeados.
- [ ] **`useStyles`** — función separada con `useMemo([colors])`.
- [ ] **Barrel** — exportado desde `index.ts`.
- [ ] **Sin lógica de negocio** — no llama use cases ni accede a DI/Auth.
- [ ] **Nombre descriptivo** — refleja el rol visual, no el feature que lo usa.

---

## Cuándo crear un componente compartido vs. local

| Criterio | Compartido (`presentation/components/`) | Local (`presentation/<feature>/components/`) |
|---|---|---|
| Se usa en 2+ features | Si | — |
| Representa un elemento de UI genérico (botón, badge, card) | Si | — |
| Depende de datos específicos de un feature | — | Si |
| Solo lo usa una pantalla y no tiene potencial de reutilización | — | Si |

> **Regla general:** si el componente necesita `useDI()`, `useAuth()`, o un ViewModel, probablemente es local del feature. Si solo necesita `useTheme()` y props genéricas, es compartido.

---

## Convenciones de nombres

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Componente compartido | `PascalCase` descriptivo | `Badge.tsx`, `Avatar.tsx`, `Card.tsx` |
| Props interface | Nombre del componente + `Props` | `BadgeProps`, `AvatarProps` |
| Variantes (union type) | Nombre del componente + `Variant` | `BadgeVariant`, `ButtonVariant` |
| Hook de estilos | `useStyles` (interno, no exportado) | `function useStyles(colors: ThemeColors)` |

---

## Estructura de archivos

```
src/presentation/
├── components/                   # Componentes COMPARTIDOS (cross-feature)
│   ├── index.ts                  # Barrel de re-exportación
│   ├── Button.tsx
│   ├── LabeledInput.tsx
│   ├── ErrorMessage.tsx
│   ├── LoadingState.tsx
│   ├── EmptyState.tsx
│   └── Badge.tsx                 # (ejemplo nuevo)
├── auth/
│   ├── LoginScreen.tsx
│   ├── useLoginViewModel.ts
│   └── components/               # Componentes LOCALES del feature auth
│       └── PasswordStrength.tsx
└── transactions/
    ├── TransactionsScreen.tsx
    ├── TransactionItem.tsx        # Componente local del feature
    └── useTransactionsViewModel.ts
```

---

## Promover un componente local a compartido

Cuando un componente local empieza a ser necesitado por otro feature:

1. Mover el archivo a `src/presentation/components/`.
2. Eliminar cualquier dependencia de datos específica del feature (extraerla a props).
3. Ajustar imports relativos (`../../providers/theme`).
4. Agregarlo al barrel `index.ts`.
5. Actualizar los imports en el feature original.

---

## Patrones comunes

### Componente con variantes

```typescript
type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
}
```

### Componente con children

```typescript
interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Section({title, children, style}: SectionProps) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}
```

### Componente con ícono

```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}
```

### Componente compuesto (compound)

Para componentes complejos, usa el patrón de sub-componentes:

```typescript
function ListItem({children, style}: ListItemProps) { /* ... */ }
function ListItemTitle({children}: {children: string}) { /* ... */ }
function ListItemSubtitle({children}: {children: string}) { /* ... */ }

ListItem.Title = ListItemTitle;
ListItem.Subtitle = ListItemSubtitle;

export {ListItem};
```

Uso:

```typescript
<ListItem>
  <ListItem.Title>Transferencia</ListItem.Title>
  <ListItem.Subtitle>Hace 2 horas</ListItem.Subtitle>
</ListItem>
```
