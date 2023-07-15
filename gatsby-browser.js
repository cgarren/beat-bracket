import "@fontsource/righteous"
import "./global-styles.css"

import React from "react"
import { LoginProvider } from "./src/context/LoginContext"

export const wrapRootElement = ({ element }) => (
	<LoginProvider>{element}</LoginProvider>
)