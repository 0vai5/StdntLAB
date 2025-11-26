import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/lib/types/todo";
import type { TodoFilters } from "@/lib/types/todo-filters";
import type { RecentActivity } from "@/lib/types/activity";

interface TodoState {
  todos: Todo[];
  recentActivities: RecentActivity[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: (userId: number) => Promise<void>;
  fetchTodos: (userId: number, groupId?: number | null) => Promise<void>;
  createTodo: (userId: number, input: CreateTodoInput) => Promise<Todo | null>;
  updateTodo: (todoId: number, input: UpdateTodoInput) => Promise<Todo | null>;
  deleteTodo: (todoId: number) => Promise<boolean>;
  toggleTodoStatus: (
    todoId: number,
    status: Todo["status"]
  ) => Promise<boolean>;
  getTodosByGroup: (groupId: number) => Todo[];
  getTodosByFilter: (filters: TodoFilters) => Todo[];
  getRecentActivities: (limit?: number) => RecentActivity[];
  addRecentActivity: (
    activity: Omit<RecentActivity, "id" | "created_at">
  ) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  recentActivities: [],
  isLoading: false,
  isInitialized: false,

  initialize: async (userId: string | number) => {
    set({ isLoading: true, isInitialized: false });
    await get().fetchTodos(userId);
    set({ isLoading: false, isInitialized: true });
  },

  fetchTodos: async (userId: string | number, groupId?: number | null) => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      // First, get the numeric user ID from Users table if userId is a UUID string
      let numericUserId: number;
      if (typeof userId === "string") {
        const { data: userData } = await supabase
          .from("Users")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!userData) {
          set({ todos: [], isLoading: false });
          return;
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      let query = supabase
        .from("Todos")
        .select("*")
        .eq("user_id", numericUserId)
        .order("created_at", { ascending: false });

      if (groupId !== undefined) {
        if (groupId === null) {
          query = query.is("group_id", null);
        } else {
          query = query.eq("group_id", groupId);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching todos:", error);
        set({ todos: [], isLoading: false });
        return;
      }

      // Map database 'due_date' to TypeScript 'date' field
      const mappedTodos = (data || []).map((todo: any) => ({
        ...todo,
        date: todo.due_date || null,
      }));

      set({ todos: mappedTodos || [], isLoading: false });
    } catch (error) {
      console.error("Error fetching todos:", error);
      set({ todos: [], isLoading: false });
    }
  },

  createTodo: async (userId: string | number, input: CreateTodoInput) => {
    const supabase = createClient();

    try {
      // Get numeric user ID if userId is a UUID string
      let numericUserId: number;
      if (typeof userId === "string") {
        const { data: userData } = await supabase
          .from("Users")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!userData) {
          console.error("User not found");
          return null;
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      const { data, error } = await supabase
        .from("Todos")
        .insert({
          user_id: numericUserId,
          title: input.title,
          description: input.description || null,
          due_date: input.date || null, // Map 'date' to 'due_date' for database
          status: input.status,
          type: input.type,
          priority: input.priority || null,
          group_id: input.group_id || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating todo:", error);
        return null;
      }

      // Map database 'due_date' to TypeScript 'date' field
      const newTodo: Todo = {
        ...data,
        date: data.due_date || null,
      };
      set((state) => ({
        todos: [newTodo, ...state.todos],
      }));

      // Add recent activity
      get().addRecentActivity({
        type: "todo_created",
        message: `Created todo "${newTodo.title}"`,
        todo_id: newTodo.id,
        todo_title: newTodo.title,
      });

      return newTodo;
    } catch (error) {
      console.error("Error creating todo:", error);
      return null;
    }
  },

  updateTodo: async (todoId: number, input: UpdateTodoInput) => {
    const supabase = createClient();

    try {
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.date !== undefined) updateData.due_date = input.date; // Map 'date' to 'due_date' for database
      if (input.status !== undefined) updateData.status = input.status;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.group_id !== undefined) updateData.group_id = input.group_id;

      const { data, error } = await supabase
        .from("Todos")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", todoId)
        .select()
        .single();

      if (error) {
        console.error("Error updating todo:", error);
        return null;
      }

      // Map database 'due_date' to TypeScript 'date' field
      const updatedTodo: Todo = {
        ...data,
        date: data.due_date || null,
      };
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === todoId ? updatedTodo : todo
        ),
      }));

      // Add recent activity
      const activityType =
        input.status === "completed" ? "todo_completed" : "todo_updated";
      get().addRecentActivity({
        type: activityType,
        message:
          input.status === "completed"
            ? `Completed todo "${updatedTodo.title}"`
            : `Updated todo "${updatedTodo.title}"`,
        todo_id: updatedTodo.id,
        todo_title: updatedTodo.title,
      });

      return updatedTodo;
    } catch (error) {
      console.error("Error updating todo:", error);
      return null;
    }
  },

  deleteTodo: async (todoId: number) => {
    const supabase = createClient();

    try {
      const todo = get().todos.find((t) => t.id === todoId);

      const { error } = await supabase.from("Todos").delete().eq("id", todoId);

      if (error) {
        console.error("Error deleting todo:", error);
        return false;
      }

      // Remove from local state
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== todoId),
      }));

      // Add recent activity
      if (todo) {
        get().addRecentActivity({
          type: "todo_deleted",
          message: `Deleted todo "${todo.title}"`,
          todo_id: todo.id,
          todo_title: todo.title,
        });
      }

      return true;
    } catch (error) {
      console.error("Error deleting todo:", error);
      return false;
    }
  },

  toggleTodoStatus: async (todoId: number, status: Todo["status"]) => {
    return await get().updateTodo(todoId, { status });
  },

  getTodosByGroup: (groupId: number) => {
    return get().todos.filter((todo) => todo.group_id === groupId);
  },

  getTodosByFilter: (filters: TodoFilters) => {
    let filtered = [...get().todos];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((todo) =>
        filters.status!.includes(todo.status)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((todo) => filters.type!.includes(todo.type));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(
        (todo) => todo.priority && filters.priority!.includes(todo.priority)
      );
    }

    if (filters.group_id !== undefined) {
      if (filters.group_id === null) {
        filtered = filtered.filter((todo) => todo.group_id === null);
      } else {
        filtered = filtered.filter(
          (todo) => todo.group_id === filters.group_id
        );
      }
    }

    if (filters.date_from) {
      filtered = filtered.filter(
        (todo) => todo.date && todo.date >= filters.date_from!
      );
    }

    if (filters.date_to) {
      filtered = filtered.filter(
        (todo) => todo.date && todo.date <= filters.date_to!
      );
    }

    return filtered;
  },

  getRecentActivities: (limit = 10) => {
    return get()
      .recentActivities.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  },

  addRecentActivity: (activity: Omit<RecentActivity, "id" | "created_at">) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random()}`,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      recentActivities: [newActivity, ...state.recentActivities].slice(0, 50), // Keep last 50
    }));
  },
}));
