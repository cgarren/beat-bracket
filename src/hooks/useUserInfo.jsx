import { useQuery } from "@tanstack/react-query";
import useSpotify from "./useSpotify";

export default function useUserInfo(userId) {
  const { loadSpotifyRequest } = useSpotify();
  const { data, isLoading, error } = useQuery(
    "spotify-user-info",
    async () => {
      const url = `https://api.spotify.com/v1/users/${userId}`;
      const response = await loadSpotifyRequest(url);
      const responseData = await response.json();
      return responseData;
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  return { data, isLoading, error };
}
