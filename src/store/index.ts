import { useAuthStore } from "./useAuthStore";
import { useTodoStore } from "./useTodoStore";
import { useRootStore, useAllStores } from "./useRootStore";

/**
 * Root store that provides access to all Zustand stores
 * This allows accessing any store state from a single import
 */
export const useStore = () => {
  return {
    auth: useAuthStore,
    root: useRootStore,
  };
};

/**
 * Type-safe selector hook for accessing all stores
 * Usage: const { user } = useStoreSelector((state) => ({ user: state.auth.user }))
 */
export const useStoreSelector = <T>(
  selector: (stores: {
    auth: ReturnType<typeof useAuthStore>;
    todo: ReturnType<typeof useTodoStore>;
    root: ReturnType<typeof useRootStore>;
  }) => T
): T => {
  const authStore = useAuthStore();
  const todoStore = useTodoStore();
  const rootStore = useRootStore();
  return selector({ auth: authStore, todo: todoStore, root: rootStore });
};

/**
 * Direct access to all stores (outside React components)
 * Usage: const authStore = stores.auth
 */
export const stores = {
  get auth() {
    return useAuthStore.getState();
  },
  get todo() {
    return useTodoStore.getState();
  },
  get root() {
    return useRootStore.getState();
  },
};

/**
 * Subscribe to all stores
 * Usage: stores.subscribe((state) => console.log(state))
 */
export const subscribeToAllStores = (
  callback: (state: {
    auth: ReturnType<typeof useAuthStore>;
    todo: ReturnType<typeof useTodoStore>;
    root: ReturnType<typeof useRootStore>;
  }) => void
) => {
  const unsubscribeAuth = useAuthStore.subscribe((authState) => {
    callback({
      auth: authState,
      todo: useTodoStore.getState(),
      root: useRootStore.getState(),
    });
  });

  const unsubscribeTodo = useTodoStore.subscribe((todoState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: todoState,
      root: useRootStore.getState(),
    });
  });

  const unsubscribeRoot = useRootStore.subscribe((rootState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: useTodoStore.getState(),
      root: rootState,
    });
  });

  return () => {
    unsubscribeAuth();
    unsubscribeTodo();
    unsubscribeRoot();
  };
};

// Re-export individual stores and hooks for convenience
export { useAuthStore } from "./useAuthStore";
export { useTodoStore } from "./useTodoStore";
export { useRootStore, useAllStores } from "./useRootStore";
