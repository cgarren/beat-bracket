import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import useSpotify from "./useSpotify";
import { LoginContext } from "../context/LoginContext";

export default function useUserInfo(userId) {
  const { loadSpotifyRequest } = useSpotify();
  const { loggedIn } = useContext(LoginContext);
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["spotify-user-info", { userId }],
    queryFn: async () => {
      if (loggedIn) {
        const url = `https://api.spotify.com/v1/users/${userId}`;
        const response = await loadSpotifyRequest(url);
        const responseData = await response.json();
        return responseData;
      }
      return null;
    },
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    cacheTime: 3600000,
  });
  return { data, isPending, isFetching, error };
}
