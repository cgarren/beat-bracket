/* eslint-disable prettier/prettier */
// React
import React, { useMemo, useCallback, useContext } from "react";
// Third Party
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
// Helpers
import { bracketSorter, isEdgeSong } from "../../../../../utils/helpers";
import { getBracket } from "../../../../../utils/backend";
import { openBracket } from "../../../../../utils/impureHelpers";
// Components
import Seo from "../../../../../components/SEO";
import BracketView from "../../../../../components/Bracket/ViewBracket";
import Layout from "../../../../../components/Layout";
import BracketWinnerInfo from "../../../../../components/Bracket/BracketWinnerInfo";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useAuthentication from "../../../../../hooks/useAuthentication";
import useUserInfo from "../../../../../hooks/useUserInfo";
import useShareBracket from "../../../../../hooks/useShareBracket";
// Assets
import ShareIcon from "../../../../../assets/svgs/shareIcon.svg";
import DuplicateIcon from "../../../../../assets/svgs/duplicateIcon.svg";
// Context
import { UserInfoContext } from "../../../../../context/UserInfoContext";
import BracketHeader from "../../../../../components/BracketHeader";
import LoginButton from "../../../../../components/Controls/LoginButton";
import { Button } from "../../../../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../../components/ui/tabs";

export default function App({ params, location }) {
  const userInfo = useContext(UserInfoContext);
  const { isCurrentUser } = useAuthentication();
  const { getNumberOfColumns } = useBracketGeneration();
  const { share } = useShareBracket(location.href);

  const { data: ownerInfo = {} } = useUserInfo(params.userId)?.data || {};

  const owner = useMemo(
    () => ({ name: ownerInfo?.display_name, id: params.userId }),
    [ownerInfo?.display_name, params?.userId],
  );

  const { data: loadedBracket, isPending: fetchPending } = useQuery({
    queryKey: ["backend", "bracket", { bracketId: params.id, userId: owner.id }],
    queryFn: async () => getBracket(params.id, owner.id),
    enabled: Boolean(params.id && owner.id),
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    retry: (failureCount, error) => error?.cause?.code !== 404 && failureCount < 3,
    meta: {
      errorMessage: "Error loading bracket",
    },
  });

  const songSource = useMemo(() => {
    if (loadedBracket?.template?.songSource?.type === "artist") {
      return {
        type: "artist",
        artist: {
          name: loadedBracket.template.songSource.artist.name,
          id: loadedBracket.template.songSource.artist.id,
        },
      };
    }
    if (loadedBracket?.template?.songSource?.type === "playlist") {
      return {
        type: "playlist",
        playlist: {
          name: loadedBracket.template.songSource.playlist.name,
          id: loadedBracket.template.songSource.playlist.id,
        },
      };
    }
    return null;
  }, [loadedBracket?.template?.songSource]);

  const formatType = useMemo(() => {
    if (loadedBracket?.template?.formatType) return loadedBracket.template.formatType;
    if (loadedBracket?.formatType) return loadedBracket.formatType;
    return "singleElimination";
  }, [loadedBracket]);

  const bracket = useMemo(() => {
    if (!loadedBracket?.bracketData) return null;
    const mainData = loadedBracket.bracketData.main ? loadedBracket.bracketData.main : loadedBracket.bracketData;
    let mymap = new Map(Object.entries(mainData));
    mymap = new Map([...mymap].sort(bracketSorter));
    return mymap;
  }, [loadedBracket?.bracketData]);

  const secondChanceBracket = useMemo(() => {
    if (formatType !== "secondChance") return null;
    if (!loadedBracket?.bracketData?.secondChance) return null;
    let mymap = new Map(Object.entries(loadedBracket.bracketData.secondChance));
    mymap = new Map([...mymap].sort(bracketSorter));
    return mymap;
  }, [loadedBracket?.bracketData, formatType]);

  const template = useMemo(() => {
    if (loadedBracket?.template) {
      return {
        id: loadedBracket.template.id,
        ownerId: loadedBracket.template.ownerId,
        displayName: loadedBracket.template.displayName,
        ownerUsername: loadedBracket.template.ownerUsername,
      };
    }
    return { id: null, ownerId: null, displayName: null };
  }, [loadedBracket?.template]);

  const bracketTracks = useMemo(() => {
    const tracks = [];
    if (bracket) {
      bracket.forEach((item) => {
        if (isEdgeSong(item, (id) => bracket.get(id))) {
          tracks.push(item.song);
        }
      });
    }
    return tracks;
  }, [bracket]);

  const secondChanceBracketTracks = useMemo(() => {
    const tracks = [];
    if (secondChanceBracket) {
      secondChanceBracket.forEach((item) => {
        if (isEdgeSong(item, (id) => secondChanceBracket.get(id))) {
          if (item.song) tracks.push(item.song);
        }
      });
    }
    return tracks;
  }, [secondChanceBracket]);

  const bracketWinner = useMemo(() => {
    if (bracket) {
      const cols = getNumberOfColumns(bracketTracks.length) - 1;
      const left = bracket.get(`l${cols}0`);
      const right = bracket.get(`r${cols}0`);
      if (left && left.winner && left.song) {
        return left.song;
      }
      if (right && right.winner && right.song) {
        return right.song;
      }
    }
    return null;
  }, [bracket, bracketTracks, getNumberOfColumns]);

  const trackedProps = useMemo(
    () => ({
      "Bracket Id": params?.id,
      "Owner Username": owner?.name,
      "Seeding Method": loadedBracket?.template?.seedingMethod,
      "Inclusion Method": loadedBracket?.template?.inclusionMethod,
      "Song Source Type": songSource?.type,
      "Song Source Name": songSource?.[songSource?.type]?.name,
      "Song Source Id": songSource?.[songSource?.type]?.id,
      Tracks: bracketTracks?.length,
    }),
    [params.id, owner.name, loadedBracket?.template, songSource, bracketTracks.length],
  );

  // DUPLICATE

  const duplicateBracket = useCallback(async () => {
    if (template?.id && template?.ownerId && userInfo?.id && bracket) {
      console.log("Getting things ready to duplicate...");
      // update template tracks with seed numbers and new preview urls
      const tracks = [];
      bracket.forEach((value) => {
        if (value.col === 0 && value.seed !== undefined) {
          tracks.push({ ...value.song, seed: value.seed });
        }
      });
      console.log("Tracks to duplicate:", tracks);

      // update template with new preview urls IF the user owns the template (never true for now)
      // if (!isCurrentUser(template.ownerId)) {
      //   const updatedTracks = await updatePreviewUrls(tracks);
      //   console.log("Tracks updated with preview urls:", updatedTracks);
      //   await updateTemplate(template.id, { tracks: updatedTracks });
      // }

      // generate new bracket id
      const uuid = uuidv4();
      console.debug(`Create New Bracket with id: ${uuid}`);

      // navigate to new bracket page
      openBracket(uuid, userInfo.id, "fill", { template: { ...template, tracks: tracks } });
    } else {
      toast.error("Error duplicating bracket");
      console.error("Error duplicating bracket. Something is wrong with the template:", template);
    }
  }, [template, userInfo?.id]);

  // redirect
  if (bracket?.size > 0 && !bracketWinner && isCurrentUser(params.userId)) {
    // navigate(`/user/${params.userId}/bracket/${params.id}/fill`, { state: location.state });
    openBracket(params.id, params.userId, "fill", location.state);
    // return <Redirect to={`/user/${params.userId}/bracket/${params.id}/fill`} />;
  }

  if (fetchPending || !bracket) {
    return (
      <Layout noChanges={() => true} path={location.pathname} pageName="View Bracket">
        {fetchPending && <LoadingIndicator loadingText="Loading bracket..." />}
        {!fetchPending && !bracket && <div className="font-bold mb-2">Bracket not found</div>}
      </Layout>
    );
  }

  return (
    <Layout noChanges={() => true} path={location.pathname} pageName="View Bracket" trackedProps={trackedProps}>
      <div className="text-center">
        <BracketHeader
          songSource={songSource}
          owner={{ name: owner?.name ?? loadedBracket.ownerUsername, id: owner?.id }}
          template={template}
          bracketTracks={bracketTracks}
        />
        {bracketWinner && (
          <BracketWinnerInfo
            bracketWinner={bracketWinner}
            showSongInfo={songSource && songSource.type === "playlist"}
          />
        )}
      </div>
      {bracket && songSource && (
        <>
          <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30 mt-1">
            <div className="flex items-center gap-2">
              <Button onClick={share} variant="secondary" className="flex justify-center gap-1">
                <div className="w-4 h-4">
                  <ShareIcon />
                </div>
                Share
              </Button>
              {userInfo?.id && !isCurrentUser(params.userId) && !isCurrentUser(template.ownerId) && (
                <Button onClick={duplicateBracket} className="flex justify-center gap-1">
                  <div className="w-4 h-4">
                    <DuplicateIcon />
                  </div>
                  Make my own picks
                </Button>
              )}
              {!userInfo?.id && (
                <div className="relative">
                  <LoginButton />
                  <div className="absolute top-[105%] left-1/2 -translate-x-1/2 whitespace-nowrap">
                    ⬆️ Pick your own winners!
                  </div>
                </div>
              )}
            </div>
          </div>
          {formatType === "secondChance" ? (
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="mx-auto mb-2">
                <TabsTrigger value="main">Main Bracket</TabsTrigger>
                <TabsTrigger value="secondChance">Second Chance</TabsTrigger>
              </TabsList>
              <TabsContent value="main">
                <BracketView bracket={bracket} bracketTracks={bracketTracks} songSource={songSource} />
              </TabsContent>
              <TabsContent value="secondChance">
                {secondChanceBracket ? (
                  <BracketView bracket={secondChanceBracket} bracketTracks={bracketTracks} songSource={songSource} />
                ) : (
                  <div className="text-center">No second chance bracket data found.</div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <BracketView bracket={bracket} bracketTracks={bracketTracks} songSource={songSource} />
          )}
        </>
      )}
    </Layout>
  );
}

export function Head({ params, location }) {
  // const [name, setName] = useState(null);
  // const [userName, setUserName] = useState(null);

  // useEffect(() => {
  //   async function updateTitle() {
  //     if (params && params.id && params.userId) {
  //       try {
  //         const loadedBracket = await getBracket(params.id, params.userId);
  //         if (loadedBracket && loadedBracket.userName) {
  //           setUserName(loadedBracket.userName);
  //           if (loadedBracket.songSource && loadedBracket.songSource.type === "artist") {
  //             setName(loadedBracket.songSource.artist.name);
  //           } else if (loadedBracket.songSource && loadedBracket.songSource.type === "playlist") {
  //             setName(loadedBracket.songSource.playlist.name);
  //           }
  //         }
  //       } catch (error) {

  //       }
  //     }
  //   }
  //   updateTitle();
  // }, [params]);

  return (
    // name && userName ? `${name} bracket by ${userName}` : "View/edit bracket"
    <Seo title="View Bracket" pathname={location.pathname} />
  );
}
