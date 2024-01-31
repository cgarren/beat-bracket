import mixpanel from "mixpanel-browser";
import { useCallback } from "react";
import toast from "react-hot-toast";

export default function useShareBracket(bracketLink) {
  const share = useCallback(() => {
    navigator.clipboard.writeText(bracketLink);
    mixpanel.track("Bracket Share", {
      link: bracketLink,
    });
    toast.success("Link copied to clipboard!", {
      id: "copied-link",
    });
  }, [bracketLink]);

  return { share };
}
