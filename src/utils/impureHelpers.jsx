import { navigate } from "gatsby";

export async function openBracket(uuid, userId, mode = "", state = {}, replace = false) {
  console.debug(`Opening Bracket: ${uuid}`);
  // open the bracket editor and pass the bracket id off
  if (typeof window !== "undefined") {
    console.log("nav to", `/user/${userId}/bracket/${uuid}/${mode}`, state);
    navigate(`/user/${userId}/bracket/${uuid}/${mode}`, {
      state: state,
      replace: replace,
    });
  }
}

export async function donothing() {
  // bruh
}
