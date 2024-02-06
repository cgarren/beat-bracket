import { useCallback, useContext } from "react";
import toast from "react-hot-toast";
import { MixpanelContext } from "../context/MixpanelContext";

export default function useShareBracket(bracketLink) {
  const mixpanel = useContext(MixpanelContext);
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
