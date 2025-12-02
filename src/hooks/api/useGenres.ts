import { useQuery } from '@tanstack/react-query';
import * as mangaService from '../../lib/api/mangaService';

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: mangaService.getAllGenres,
  });
}; 