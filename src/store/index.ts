import { useAuthStore } from "./useAuthStore";
import { useTodoStore } from "./useTodoStore";
import { useGroupStore } from "./useGroupStore";
import { useRootStore, useAllStores } from "./useRootStore";

/**
 * Root store that provides access to all Zustand stores
 * This allows accessing any store state from a single import
 */
export const useStore = () => {
  return {
    auth: useAuthStore,
    todo: useTodoStore,
    group: useGroupStore,
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
    group: ReturnType<typeof useGroupStore>;
    root: ReturnType<typeof useRootStore>;
  }) => T
): T => {
  const authStore = useAuthStore();
  const todoStore = useTodoStore();
  const groupStore = useGroupStore();
  const rootStore = useRootStore();
  return selector({ auth: authStore, todo: todoStore, group: groupStore, root: rootStore });
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
  get group() {
    return useGroupStore.getState();
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
    group: ReturnType<typeof useGroupStore>;
    root: ReturnType<typeof useRootStore>;
  }) => void
) => {
  const unsubscribeAuth = useAuthStore.subscribe((authState) => {
    callback({
      auth: authState,
      todo: useTodoStore.getState(),
      group: useGroupStore.getState(),
      root: useRootStore.getState(),
    });
  });

  const unsubscribeTodo = useTodoStore.subscribe((todoState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: todoState,
      group: useGroupStore.getState(),
      root: useRootStore.getState(),
    });
  });

  const unsubscribeGroup = useGroupStore.subscribe((groupState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: useTodoStore.getState(),
      group: groupState,
      root: useRootStore.getState(),
    });
  });

  const unsubscribeRoot = useRootStore.subscribe((rootState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: useTodoStore.getState(),
      group: useGroupStore.getState(),
      root: rootState,
    });
  });

  return () => {
    unsubscribeAuth();
    unsubscribeTodo();
    unsubscribeGroup();
    unsubscribeRoot();
  };
};

// Re-export individual stores and hooks for convenience
export { useAuthStore } from "./useAuthStore";
export { useTodoStore } from "./useTodoStore";
export { useGroupStore } from "./useGroupStore";
export { useRootStore, useAllStores } from "./useRootStore";
