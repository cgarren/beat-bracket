import "@fontsource/righteous"
import "./global-styles.css"

import React from "react"
import mixpanel from "mixpanel-browser";

import { LoginProvider } from "./src/context/LoginContext"
import { MixpanelProvider } from "./src/context/MixpanelContext"

if (process.env.GATSBY_MIXPANEL_TOKEN) {
	if (process.env.NODE_ENV !== "production") {
		console.log(process.env.GATSBY_MIXPANEL_TOKEN)
		mixpanel.init(process.env.GATSBY_MIXPANEL_TOKEN, {
			debug: true,
		});
		mixpanel.disable();
	} else {
		mixpanel.init(process.env.GATSBY_MIXPANEL_TOKEN);
	}
	mixpanel.set_config({ persistence: "localStorage", ignore_dnt: true, api_host: process.env.GATSBY_BACKEND_URL });
} else {
	console.warn("Mixpanel token not set");

}

export const wrapRootElement = ({ element }) => (
	<MixpanelProvider mixpanel={mixpanel}>
		<LoginProvider>
			{element}
		</LoginProvider>
	</MixpanelProvider>
)