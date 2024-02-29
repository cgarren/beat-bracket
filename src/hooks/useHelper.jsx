// Screnshot library
import { useCallback } from "react";
import { navigate } from "gatsby";

export default function useHelper() {
  const openBracket = useCallback(
    async (uuid, userId, mode = "", state = {}, replace = false) => {
      console.debug(`Opening Bracket: ${uuid}`);
      // open the bracket editor and pass the bracket id off
      if (typeof window !== "undefined") {
        console.log("nav to", `/user/${userId}/bracket/${uuid}/${mode}`, state);
        navigate(`/user/${userId}/bracket/${uuid}/${mode}`, {
          state: state,
          replace: replace,
        });
      }
    },
    [navigate],
  );

  return {
    openBracket,
  };
}
