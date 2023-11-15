import React, { useContext, useEffect } from "react";
import NavBar from "./NavBar/NavBar";
import Clicky from "./Clicky";
import Footer from "./Footer";
import { MixpanelContext } from "../context/MixpanelContext";

const Layout = ({ children, noChanges, path }) => {
    const mixpanel = useContext(MixpanelContext);

    // Runs once, after page load
    useEffect(() => {
        console.debug("Tracked page load", path);
        mixpanel.track_pageview();
    }, [mixpanel, path]);

    return (
        <>
            <Clicky />
            <div className="text-center clear-both">
                <main className="font-sans text-black bg-gradient-radial from-zinc-200 to-zinc-300 relative text-center min-h-screen pb-[24px]">
                    {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
                    <NavBar noChanges={noChanges} />
                    {children}
                </main>
                <Footer path={path} />
            </div>
        </>
    );
};

export default Layout;
