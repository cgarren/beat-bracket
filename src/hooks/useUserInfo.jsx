import { useQuery } from "@tanstack/react-query";
import useSpotify from "./useSpotify";

export default function useUserInfo(userId) {
  const { loadSpotifyRequest } = useSpotify();
  const { data, isLoading, error } = useQuery({
    queryKey: ["spotify-user-info"],
    queryFn: async () => {
      const url = `https://api.spotify.com/v1/users/${userId}`;
      const response = await loadSpotifyRequest(url);
      const responseData = await response.json();
      return responseData;
    },
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    cacheTime: 3600000,
    meta: {
      errorMessage: "Error loading user info",
    },
  });
  return { data, isLoading, error };
}
