/* eslint-disable prettier/prettier */
// React
import React, { useMemo, useCallback, useContext } from "react";
// Third Party
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
// Components
import Seo from "../../../../../components/SEO";
import BracketView from "../../../../../components/Bracket/ViewBracket";
import Layout from "../../../../../components/Layout";
import BracketWinnerInfo from "../../../../../components/Bracket/BracketWinnerInfo";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useHelper from "../../../../../hooks/useHelper";
import useBackend from "../../../../../hooks/useBackend";
import useSpotify from "../../../../../hooks/useSpotify";
import useAuthentication from "../../../../../hooks/useAuthentication";
import useUserInfo from "../../../../../hooks/useUserInfo";
import useShareBracket from "../../../../../hooks/useShareBracket";
// Assets
import ShareIcon from "../../../../../assets/svgs/shareIcon.svg";
import DuplicateIcon from "../../../../../assets/svgs/duplicateIcon.svg";
// Context
import { LoginContext } from "../../../../../context/LoginContext";
import BracketHeader from "../../../../../components/BracketHeader";
import LoginButton from "../../../../../components/Controls/LoginButton";
import { Button } from "../../../../../components/ui/button";

export default function App({ params, location }) {
  const { loggedIn, loginInfo } = useContext(LoginContext);
  const { openBracket } = useSpotify();
  const { isCurrentUser } = useAuthentication();
  const { bracketSorter } = useHelper();
  const { getBracket } = useBackend();
  const { getNumberOfColumns } = useBracketGeneration();
  const { share } = useShareBracket(location.href);

  const { data: ownerInfo } = useUserInfo(params.userId);

  const owner = useMemo(
    () => ({ name: ownerInfo?.display_name, id: params.userId }),
    [ownerInfo?.display_name, params?.userId],
  );

  const { data: loadedBracket, isPending: fetchPending } = useQuery({
    queryKey: ["bracket", { bracketId: params.id, userId: owner.id }],
    queryFn: async () => getBracket(params.id, owner.id),
    enabled: Boolean(params.id && owner.id),
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    retry: (failureCount, error) => error?.cause?.code !== 404,
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

  const bracket = useMemo(() => {
    // console.log(loadedBracket?.bracketData);
    if (loadedBracket?.bracketData) {
      let mymap = new Map(Object.entries(loadedBracket.bracketData));
      mymap = new Map([...mymap].sort(bracketSorter));
      return mymap;
    }
    return null;
  }, [loadedBracket?.bracketData, bracketSorter]);

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
        if (item.song && item.col === 0) {
          tracks.push(item.song);
        }
      });
    }
    return tracks;
  }, [bracket]);

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

  // DUPLICATE

  const duplicateBracket = useCallback(async () => {
    if (template?.id && template?.ownerId && loginInfo?.userId) {
      // generate new bracket id
      const uuid = uuidv4();
      console.debug(`Create New Bracket with id: ${uuid}`);

      // navigate to new bracket page
      openBracket(uuid, loginInfo.userId, "fill", { template: template });
    } else {
      toast.error("Error duplicating bracket");
      console.error("Error duplicating bracket. Something is wrong with the template:", template);
    }
  }, [template, loginInfo]);

  // redirect
  if (bracket?.size > 0 && !bracketWinner && isCurrentUser(params.userId)) {
    // navigate(`/user/${params.userId}/bracket/${params.id}/fill`, { state: location.state });
    openBracket(params.id, params.userId, "fill", location.state);
    // return <Redirect to={`/user/${params.userId}/bracket/${params.id}/fill`} />;
  }

  if (fetchPending || !bracket) {
    return (
      <Layout
        noChanges={() => true}
        path={location.pathname}
        // saveBracketLocally={saveBracketLocally}
        // isBracketSavedLocally={isBracketSavedLocally}
        // deleteBracketSavedLocally={deleteBracketSavedLocally}
      >
        {fetchPending && <LoadingIndicator loadingText="Loading bracket..." />}
        {!fetchPending && !bracket && <div className="font-bold mb-2">Bracket not found</div>}
      </Layout>
    );
  }

  return (
    <Layout noChanges={() => true} path={location.pathname} pageName="View Bracket">
      <div className="text-center">
        <BracketHeader songSource={songSource} owner={owner} template={template} bracketTracks={bracketTracks} />
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
              <Button onClick={share} variant="secondary" icon={<ShareIcon />} className="flex justify-center gap-1">
                <ShareIcon />
                Share
              </Button>
              {loggedIn && !isCurrentUser(params.userId) && !isCurrentUser(template.ownerId) && (
                <Button onClick={duplicateBracket} className="flex justify-center gap-1">
                  <DuplicateIcon />
                  Make my own picks
                </Button>
              )}
              {!loggedIn && (
                <div className="relative">
                  <LoginButton />
                  <div className="absolute top-[105%] left-1/2 -translate-x-1/2 whitespace-nowrap">
                    ⬆️ Pick your own winners!
                  </div>
                </div>
              )}
            </div>
          </div>
          <BracketView bracket={bracket} bracketTracks={bracketTracks} songSource={songSource} />
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
