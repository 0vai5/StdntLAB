import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/lib/types/todo";
import type { TodoFilters } from "@/lib/types/todo-filters";
import type { RecentActivity } from "@/lib/types/activity";
import { TodoStatus } from "@/lib/types";

interface TodoState {
  todos: Todo[];
  recentActivities: RecentActivity[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: (userId: number) => Promise<void>;
  fetchTodos: (userId: number, groupId?: number | null) => Promise<void>;
  createTodo: (userId: number, input: CreateTodoInput) => Promise<Todo | null>;
  updateTodo: (
    todoId: number,
    input: UpdateTodoInput,
    userId?: number
  ) => Promise<Todo | null>;
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
    await get().fetchTodos(Number(userId));
    set({ isLoading: false, isInitialized: true });
  },

  fetchTodos: async (userId: number, groupId?: number | null) => {
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

      // If groupId is explicitly null, fetch personal todos AND group todos
      // Group todos should be shown with completion status from todo_completions
      if (groupId === null) {
        // Fetch personal todos
        const { data: personalTodosData, error: personalError } = await supabase
          .from("Todos")
          .select("*")
          .eq("user_id", numericUserId)
          .is("group_id", null)
          .order("created_at", { ascending: false });

        if (personalError) {
          console.error("Error fetching todos:", personalError);
          set({ todos: [], isLoading: false });
          return;
        }

        // Fetch group todos where user is a member
        const { data: memberData } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", numericUserId);

        const userGroupIds = memberData
          ? memberData
              .map((m) => m.group_id)
              .filter((id): id is number => id !== null)
          : [];

        let groupTodosData: Todo[] = [];
        if (userGroupIds.length > 0) {
          const { data: groupTodos, error: groupError } = await supabase
            .from("Todos")
            .select("*")
            .in("group_id", userGroupIds)
            .order("created_at", { ascending: false });

          if (!groupError && groupTodos) {
            groupTodosData = groupTodos;
          }
        }

        // Fetch completed todo IDs from todo_completions
        const { data: completedTodosData } = await supabase
          .from("todo_completions")
          .select("todo_id")
          .eq("user_id", numericUserId)
          .eq("completed", true);

        const completedTodoIds = new Set(
          (completedTodosData || []).map((c) => c.todo_id)
        );

        // Show ALL todos (both completed and pending) for dashboard
        // Personal todos: mark completion based on todo_completions
        // Group todos: mark completion based on todo_completions
        const allTodos = [...(personalTodosData || []), ...groupTodosData];

        const mappedTodos = allTodos.map((todo: Todo) => {
          // Check if todo is completed via todo_completions (for both personal and group)
          const isCompleted = completedTodoIds.has(todo.id);
          return {
            ...todo,
            date: todo.due_date || null,
            // Override status based on todo_completions for both personal and group todos
            status: isCompleted ? ("completed" as TodoStatus) : todo.status,
          };
        });

        set({ todos: mappedTodos || [], isLoading: false });
        return;
      }

      // If groupId is specified, fetch todos for that group
      // Show all group todos, but mark completion status from todo_completions
      if (groupId !== undefined && groupId !== null) {
        const { data, error } = await supabase
          .from("Todos")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching todos:", error);
          set({ todos: [], isLoading: false });
          return;
        }

        // Fetch completed todo IDs from todo_completions
        const { data: completedTodosData } = await supabase
          .from("todo_completions")
          .select("todo_id")
          .eq("user_id", numericUserId)
          .eq("completed", true);

        const completedTodoIds = new Set(
          (completedTodosData || []).map((c) => c.todo_id)
        );

        // Don't filter out completed group todos - show them with completion status
        const mappedTodos = (data || []).map((todo: Todo) => {
          const isCompleted = completedTodoIds.has(todo.id);
          return {
            ...todo,
            date: todo.due_date || null,
            // Override status based on todo_completions
            status: isCompleted ? ("completed" as TodoStatus) : todo.status,
          };
        });

        set({ todos: mappedTodos || [], isLoading: false });
        return;
      }

      // If groupId is undefined, fetch both personal and group todos
      // First, get all groups the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", numericUserId);

      if (memberError) {
        console.error("Error fetching group memberships:", memberError);
        // Continue with personal todos only
      }

      const userGroupIds = memberData
        ? memberData
            .map((m) => m.group_id)
            .filter((id): id is number => id !== null)
        : [];

      // Fetch personal todos
      const { data: personalTodos, error: personalError } = await supabase
        .from("Todos")
        .select("*")
        .eq("user_id", numericUserId)
        .is("group_id", null)
        .order("created_at", { ascending: false });

      if (personalError) {
        console.error("Error fetching personal todos:", personalError);
      }

      // Fetch completed todo IDs from todo_completions
      const { data: completedTodosData } = await supabase
        .from("todo_completions")
        .select("todo_id")
        .eq("user_id", numericUserId)
        .eq("completed", true);

      const completedTodoIds = new Set(
        (completedTodosData || []).map((c) => c.todo_id)
      );

      // Fetch group todos where user is a member
      let groupTodos: Todo[] = [];
      if (userGroupIds.length > 0) {
        const { data: groupTodosData, error: groupTodosError } = await supabase
          .from("Todos")
          .select("*")
          .in("group_id", userGroupIds)
          .order("created_at", { ascending: false });

        if (groupTodosError) {
          console.error("Error fetching group todos:", groupTodosError);
        } else {
          groupTodos = groupTodosData || [];
        }
      }

      // Show ALL todos (both completed and pending) for dashboard
      // Personal todos: mark completion based on todo_completions
      // Group todos: mark completion based on todo_completions
      const allTodos = [...(personalTodos || []), ...groupTodos];
      const mappedTodos = allTodos.map((todo: Todo) => {
        // Check if todo is completed via todo_completions
        const isCompleted = completedTodoIds.has(todo.id);
        return {
          ...todo,
          date: todo.due_date || null,
          // Override status based on todo_completions for both personal and group todos
          status: isCompleted ? ("completed" as TodoStatus) : todo.status,
        };
      });

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

  updateTodo: async (
    todoId: number,
    input: UpdateTodoInput,
    userId?: number
  ) => {
    const supabase = createClient();
    const todo = get().todos.find((t) => t.id === todoId);

    // For group todos, if updating status, use todo_completions
    if (todo && todo.group_id !== null && input.status !== undefined) {
      const numericUserId = userId || todo.user_id;

      try {
        if (input.status === "completed") {
          // Check if completion already exists
          const { data: existingCompletion } = await supabase
            .from("todo_completions")
            .select("id")
            .eq("todo_id", todoId)
            .eq("user_id", numericUserId)
            .single();

          if (!existingCompletion) {
            // Create todo_completions entry
            const { error: completionError } = await supabase
              .from("todo_completions")
              .insert({
                todo_id: todoId,
                user_id: numericUserId,
                completed_at: new Date().toISOString(),
                completed: true,
              });

            if (completionError) {
              console.error("Error creating todo completion:", completionError);
              return null;
            }
          }
        } else {
          // Remove todo_completions entry
          const { error: deleteError } = await supabase
            .from("todo_completions")
            .delete()
            .eq("todo_id", todoId)
            .eq("user_id", numericUserId);

          if (deleteError) {
            console.error("Error deleting todo completion:", deleteError);
            return null;
          }
        }

        // Update local state (don't update database status for group todos)
        const updatedTodo: Todo = {
          ...todo,
          ...input,
          status: input.status || todo.status,
        };
        set((state) => ({
          todos: state.todos.map((t) => (t.id === todoId ? updatedTodo : t)),
        }));

        return updatedTodo;
      } catch (error) {
        console.error("Error updating group todo:", error);
        return null;
      }
    }

    // For personal todos or non-status updates for group todos, proceed normally
    try {
      // Get the current todo to check if status is changing to completed
      const currentTodo = get().todos.find((t) => t.id === todoId);
      const isCompleting =
        input.status === "completed" && currentTodo?.status !== "completed";

      const updateData: UpdateTodoInput = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;
      // For group todos, don't update status in database (handled via todo_completions)
      if (input.status !== undefined && (!todo || todo.group_id === null)) {
        updateData.status = input.status;
      }
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

      // If completing a personal todo, create a completion record
      if (isCompleting && currentTodo && currentTodo.group_id === null) {
        // Use provided userId, or fall back to todo's user_id (creator)
        let numericUserId: number | undefined = userId;

        if (!numericUserId && currentTodo) {
          numericUserId = currentTodo.user_id;
        }

        if (numericUserId) {
          const completedAt = new Date().toISOString();
          const { error: completionError } = await supabase
            .from("todo_completions")
            .insert({
              todo_id: todoId,
              user_id: numericUserId,
              completed_at: completedAt,
              completed: true,
            });

          if (completionError) {
            console.error("Error creating completion record:", completionError);
            // Don't fail the todo update if completion record fails
          }
        }
      }

      // Map database 'due_date' to TypeScript 'date' field
      // For group todos, preserve the status from input (not from database)
      const updatedTodo: Todo = {
        ...data,
        date: data.due_date || null,
        // If it's a group todo and status was updated, use the input status
        status:
          todo && todo.group_id !== null && input.status !== undefined
            ? input.status
            : data.status,
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

  toggleTodoStatus: async (todoId: number, status: TodoStatus) => {
    const supabase = createClient();
    const todo = get().todos.find((t) => t.id === todoId);

    if (!todo) {
      return false;
    }

    // For group todos, use todo_completions instead of updating todo status
    if (todo.group_id !== null) {
      try {
        // Get current user ID from the first todo (assuming all todos are for same user)
        const numericUserId = todo.user_id;

        if (status === "completed") {
          // Create todo_completions entry
          const { error: completionError } = await supabase
            .from("todo_completions")
            .insert({
              todo_id: todoId,
              user_id: numericUserId,
              completed_at: new Date().toISOString(),
              completed: true,
            });

          if (completionError) {
            console.error("Error creating todo completion:", completionError);
            return false;
          }
        } else {
          // Remove todo_completions entry
          const { error: deleteError } = await supabase
            .from("todo_completions")
            .delete()
            .eq("todo_id", todoId)
            .eq("user_id", numericUserId);

          if (deleteError) {
            console.error("Error deleting todo completion:", deleteError);
            return false;
          }
        }

        // Update local state
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === todoId ? { ...t, status } : t
          ),
        }));

        return true;
      } catch (error) {
        console.error("Error toggling group todo status:", error);
        return false;
      }
    } else {
      // For personal todos, update status normally
      const result = await get().updateTodo(todoId, { status });
      return result !== null;
    }
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
        (todo) => todo.due_date && todo.due_date >= filters.date_from!
      );
    }

    if (filters.date_to) {
      filtered = filtered.filter(
        (todo) => todo.due_date && todo.due_date <= filters.date_to!
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
