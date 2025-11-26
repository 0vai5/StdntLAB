# Zustand Store Architecture

This directory contains all Zustand stores for the application. The stores are organized to provide easy access to all application state.

## Store Structure

- `useAuthStore.ts` - Authentication and user state
- `useRootStore.ts` - Root store that provides access to all stores
- `index.ts` - Main export file with utilities

## Usage Examples

### 1. Access All Stores at Once

```tsx
import { useAllStores } from "@/store";

function MyComponent() {
  const { user, isLoading, signOut } = useAllStores();
  
  return (
    <div>
      {isLoading ? "Loading..." : `Hello ${user?.name}`}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### 2. Access Individual Store

```tsx
import { useAuthStore } from "@/store";

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  
  return <div>{user?.name}</div>;
}
```

### 3. Access Multiple Stores with Selector

```tsx
import { useStoreSelector } from "@/store";

function MyComponent() {
  const { user, isLoading } = useStoreSelector((stores) => ({
    user: stores.auth.user,
    isLoading: stores.auth.isLoading,
  }));
  
  return <div>{user?.name}</div>;
}
```

### 4. Access Stores Outside React Components

```tsx
import { stores } from "@/store";

// Get current auth state
const user = stores.auth.user;
const isLoading = stores.auth.isLoading;

// Call actions
await stores.auth.signOut();
```

### 5. Subscribe to All Stores

```tsx
import { subscribeToAllStores } from "@/store";

const unsubscribe = subscribeToAllStores((state) => {
  console.log("Auth state:", state.auth);
  console.log("Root state:", state.root);
});

// Later, unsubscribe
unsubscribe();
```

### 6. Using Root Store

```tsx
import { useRootStore } from "@/store";

function MyComponent() {
  const getUser = useRootStore((state) => state.getUser);
  const user = getUser();
  
  return <div>{user?.name}</div>;
}
```

## Adding New Stores

When adding a new store:

1. Create the store file: `src/store/useYourStore.ts`
2. Add it to `src/store/index.ts`:
   ```ts
   import { useYourStore } from "./useYourStore";
   
   export const stores = {
     get auth() { return useAuthStore.getState(); },
     get yourStore() { return useYourStore.getState(); },
   };
   ```
3. Update `useAllStores` hook in `useRootStore.ts` to include the new store

## Best Practices

- Use `useAllStores()` when you need multiple stores
- Use individual store hooks when you only need one store
- Use `stores` object for accessing state outside React components
- Use selectors to prevent unnecessary re-renders

