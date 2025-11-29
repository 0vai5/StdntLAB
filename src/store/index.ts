import { useAuthStore } from "./useAuthStore";
import { useTodoStore } from "./useTodoStore";
import { useGroupStore } from "./useGroupStore";
import { useMaterialStore } from "./useMaterialStore";
import { useRootStore } from "./useRootStore";

/**
 * Root store that provides access to all Zustand stores
 * This allows accessing any store state from a single import
 */
export const useStore = () => {
  return {
    auth: useAuthStore,
    todo: useTodoStore,
    group: useGroupStore,
    material: useMaterialStore,
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
    material: ReturnType<typeof useMaterialStore>;
    root: ReturnType<typeof useRootStore>;
  }) => T
): T => {
  const authStore = useAuthStore();
  const todoStore = useTodoStore();
  const groupStore = useGroupStore();
  const materialStore = useMaterialStore();
  const rootStore = useRootStore();
  return selector({ auth: authStore, todo: todoStore, group: groupStore, material: materialStore, root: rootStore });
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
  get material() {
    return useMaterialStore.getState();
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
    material: ReturnType<typeof useMaterialStore>;
    root: ReturnType<typeof useRootStore>;
  }) => void
) => {
  const unsubscribeAuth = useAuthStore.subscribe((authState) => {
    callback({
      auth: authState,
      todo: useTodoStore.getState(),
      group: useGroupStore.getState(),
      material: useMaterialStore.getState(),
      root: useRootStore.getState(),
    });
  });

  const unsubscribeTodo = useTodoStore.subscribe((todoState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: todoState,
      group: useGroupStore.getState(),
      material: useMaterialStore.getState(),
      root: useRootStore.getState(),
    });
  });

  const unsubscribeGroup = useGroupStore.subscribe((groupState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: useTodoStore.getState(),
      group: groupState,
      material: useMaterialStore.getState(),
      root: useRootStore.getState(),
    });
  });

  const unsubscribeMaterial = useMaterialStore.subscribe((materialState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: useTodoStore.getState(),
      group: useGroupStore.getState(),
      material: materialState,
      root: useRootStore.getState(),
    });
  });

  const unsubscribeRoot = useRootStore.subscribe((rootState) => {
    callback({
      auth: useAuthStore.getState(),
      todo: useTodoStore.getState(),
      group: useGroupStore.getState(),
      material: useMaterialStore.getState(),
      root: rootState,
    });
  });

  return () => {
    unsubscribeAuth();
    unsubscribeTodo();
    unsubscribeGroup();
    unsubscribeMaterial();
    unsubscribeRoot();
  };
};

// Re-export individual stores and hooks for convenience
export { useAuthStore } from "./useAuthStore";
export { useTodoStore } from "./useTodoStore";
export { useGroupStore } from "./useGroupStore";
export { useMaterialStore } from "./useMaterialStore";
export { useRootStore, useAllStores } from "./useRootStore";
