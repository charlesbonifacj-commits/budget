import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Profile, Category, Expense, Goal, DueDate } from "@shared/schema";

export function useProfiles() {
  return useQuery<Profile[]>({ queryKey: ["/api/profiles"] });
}

export function useCategories() {
  return useQuery<Category[]>({ queryKey: ["/api/categories"] });
}

export function useExpenses(month?: string) {
  const url = month ? `/api/expenses?month=${month}` : "/api/expenses";
  return useQuery<Expense[]>({ queryKey: ["/api/expenses", month] });
}

export function useGoals() {
  return useQuery<Goal[]>({ queryKey: ["/api/goals"] });
}

export function useDueDates() {
  return useQuery<DueDate[]>({ queryKey: ["/api/due-dates"] });
}

export function useSeedData() {
  return useMutation({
    mutationFn: () => apiRequest("POST", "/api/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/due-dates"] });
    },
  });
}

// ── Profiles ──
export function useCreateProfile() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/profiles", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/profiles"] }); },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/profiles/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/profiles"] }); },
  });
}

export function useDeleteProfile() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });
}

// ── Categories ──
export function useCreateCategory() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/categories", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); },
  });
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/categories/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); },
  });
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });
}

// ── Expenses ──
export function useCreateExpense() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/expenses", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/expenses"] }); },
  });
}

export function useUpdateExpense() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/expenses/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/expenses"] }); },
  });
}

export function useDeleteExpense() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/expenses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/expenses"] }); },
  });
}

// ── Goals ──
export function useCreateGoal() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/goals", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); },
  });
}

export function useUpdateGoal() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/goals/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); },
  });
}

export function useDeleteGoal() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); },
  });
}

// ── Due Dates ──
export function useCreateDueDate() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/due-dates", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/due-dates"] }); },
  });
}

export function useUpdateDueDate() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/due-dates/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/due-dates"] }); },
  });
}

export function useDeleteDueDate() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/due-dates/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/due-dates"] }); },
  });
}
