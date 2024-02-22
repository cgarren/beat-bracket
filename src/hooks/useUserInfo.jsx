import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import useSpotify from "./useSpotify";
import { LoginContext } from "../context/LoginContext";
import guestProfileImage from "../assets/images/guestProfileImage.png";

export default function useUserInfo(userId) {
  const { loadSpotifyRequest } = useSpotify();
  const { spotifyLoggedIn } = useContext(LoginContext);

  const userIdToFetch = userId || "me";
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["spotify-user-info", { userIdToFetch }],
    queryFn: async () => {
      let url = `https://api.spotify.com/v1/users/${userIdToFetch}`;
      if (userIdToFetch === "me") {
        url = "https://api.spotify.com/v1/me";
      }
      const response = await loadSpotifyRequest(url);
      const responseData = await response.json();
      if (responseData.images.length === 0) {
        responseData.images.push({
          url: guestProfileImage,
        });
      }
      return responseData;
    },
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    cacheTime: 3600000,
    enabled: spotifyLoggedIn,
  });
  return { data, isPending, isFetching, error };
}
