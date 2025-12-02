import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminAxios from "@/lib/api/adminAxios";
import { Age, AgeCreate } from "@/lib/api/types";

const API_BASE = "/ages";

export const useAges = () => {
  const queryClient = useQueryClient();

  const {
    data: ages,
    isLoading: isLoadingAges,
    error: agesError,
  } = useQuery({
    queryKey: ["ages"],
    queryFn: async (): Promise<Age[]> => {
      const response = await adminAxios.get(API_BASE);
      return response.data;
    },
  });

  const createAge = useMutation({
    mutationFn: async (data: AgeCreate): Promise<Age> => {
      const response = await adminAxios.post(API_BASE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ages"] });
    },
  });

  const updateAge = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AgeCreate> }): Promise<Age> => {
      const response = await adminAxios.put(`${API_BASE}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ages"] });
    },
  });

  const deleteAge = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await adminAxios.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ages"] });
    },
  });

  return {
    ages,
    isLoadingAges,
    agesError,
    createAge,
    updateAge,
    deleteAge,
    isCreatingAge: createAge.isPending,
    isUpdatingAge: updateAge.isPending,
    isDeletingAge: deleteAge.isPending,
  };
};
