import React, { useEffect, useState, useMemo, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import BracketCard from "../components/BracketCard/BracketCard";
import CreateBracketCard from "../components/BracketCard/CreateBracketCard";
import Seo from "../components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import LoadingIndicator from "../components/LoadingIndicator";
import BracketGrid from "../components/BracketGrid";
import { camelCaseToTitleCase } from "../utils/helpers";
import { MixpanelContext } from "../context/MixpanelContext";
import { UserInfoContext } from "../context/UserInfoContext";
import { getBrackets, getMaxBrackets } from "../utils/backend";

export default function App({ location }) {
  const [activeTab, setActiveTab] = useState("all");
  const mixpanel = useContext(MixpanelContext);
  const maxBrackets = getMaxBrackets();
  const userInfo = useContext(UserInfoContext);
  const {
    data: brackets,
    isError,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ["backend", "brackets", { userId: userInfo?.id }],
    queryFn: () => getBrackets(userInfo?.id),
    retry: (failureCount, err) => {
      console.log("failureCount:", failureCount, "error:", err);
      return false;
    },
    enabled: Boolean(userInfo?.id),
    meta: {
      errorMessage: "Error loading brackets",
    },
  });

  const shownBrackets = useMemo(() => {
    if (!brackets) return [];
    return brackets.filter((bracket) => {
      if (activeTab === "all") return true;
      if (activeTab === "inProgress") return !bracket.completed && !bracket.winner;
      if (activeTab === "completed") return bracket.completed || bracket.winner;
      return true;
    });
  }, [activeTab, brackets]);

  // scroll to top of window on page load
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <Layout noChanges={() => true} path={location.pathname} pageName="My Brackets">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">My Brackets</h1>
        {(isError || !userInfo?.id) && (
          <div className="text-md text-gray-600 mb-2">
            Error loading brackets! {!userInfo?.id && "You must be logged in to view your brackets."}
          </div>
        )}
        {isLoading && <LoadingIndicator loadingText="Loading brackets" />}
        {isSuccess && brackets && (
          <div className="flex flex-col justify-center">
            {maxBrackets && (
              <p className="text-sm text-gray-600 mb-2">{`${brackets.length}/${maxBrackets} brackets used`}</p>
            )}
            <Tabs
              value={activeTab}
              className="mx-auto"
              onValueChange={(value) => {
                mixpanel.track("Click Tab", { "Tab Group": "Filter Brackets", Tab: camelCaseToTitleCase(value) });
                setActiveTab(value);
              }}
            >
              {brackets.length > 0 && (
                <TabsList className="grid grid-cols-3 max-w-[400px] overflow-x-auto mx-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              )}
              <TabsContent
                value="all"
                // className={cx(
                //   "pt-3 items-stretch sm:mx-5 gap-5",
                //   { "inline-grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2": brackets.length >= 3 },
                //   { "flex flex-row flex-wrap justify-center": brackets.length < 3 },
                // )}
              >
                <BracketGrid numberOfBrackets={shownBrackets.length + (brackets.length < maxBrackets ? 1 : 0)}>
                  {brackets.length < maxBrackets && <CreateBracketCard />}{" "}
                  {shownBrackets.map((bracket) => (
                    <BracketCard bracket={bracket} key={bracket.id} />
                  ))}
                </BracketGrid>
              </TabsContent>

              <TabsContent value="inProgress">
                <BracketGrid numberOfBrackets={shownBrackets.length}>
                  {shownBrackets.map((bracket) => (
                    <BracketCard bracket={bracket} key={bracket.id} />
                  ))}
                </BracketGrid>
              </TabsContent>
              <TabsContent value="completed">
                <BracketGrid numberOfBrackets={shownBrackets.length}>
                  {shownBrackets.map((bracket) => (
                    <BracketCard bracket={bracket} key={bracket.id} />
                  ))}
                </BracketGrid>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function Head({ location }) {
  return <Seo title="My brackets" pathname={location.pathname} />;
}
