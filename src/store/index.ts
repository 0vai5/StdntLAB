import { useAuthStore } from "./useAuthStore";
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
export const useStoreSelector = <T,>(
  selector: (stores: {
    auth: ReturnType<typeof useAuthStore>;
    root: ReturnType<typeof useRootStore>;
  }) => T
): T => {
  const authStore = useAuthStore();
  const rootStore = useRootStore();
  return selector({ auth: authStore, root: rootStore });
};

/**
 * Direct access to all stores (outside React components)
 * Usage: const authStore = stores.auth
 */
export const stores = {
  get auth() {
    return useAuthStore.getState();
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
    root: ReturnType<typeof useRootStore>;
  }) => void
) => {
  const unsubscribeAuth = useAuthStore.subscribe((authState) => {
    callback({ auth: authState, root: useRootStore.getState() });
  });

  const unsubscribeRoot = useRootStore.subscribe((rootState) => {
    callback({ auth: useAuthStore.getState(), root: rootState });
  });

  return () => {
    unsubscribeAuth();
    unsubscribeRoot();
  };
};

// Re-export individual stores and hooks for convenience
export { useAuthStore } from "./useAuthStore";
export { useRootStore, useAllStores } from "./useRootStore";

