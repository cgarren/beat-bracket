/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { navigate } from "gatsby";
// Third Party
import { v4 as uuidv4 } from "uuid";
import { backOff } from "exponential-backoff";
// Components
import Seo from "../../../../../components/SEO";
import BracketView from "../../../../../components/Bracket/BracketView";
import Layout from "../../../../../components/Layout";
import BracketWinnerInfo from "../../../../../components/Bracket/BracketWinnerInfo";
import ActionButton from "../../../../../components/Bracket/ActionButton";
import TrackNumber from "../../../../../components/BracketCard/TrackNumber";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useHelper from "../../../../../hooks/useHelper";
import useBackend from "../../../../../hooks/useBackend";
import useSpotify from "../../../../../hooks/useSpotify";
// Assets
import ShareIcon from "../../../../../assets/svgs/shareIcon.svg";
import DuplicateIcon from "../../../../../assets/svgs/duplicateIcon.svg";
// Context
import { LoginContext } from "../../../../../context/LoginContext";

export default function App({ params, location }) {
  const defaultValues = useMemo(
    () => ({
      bracketId: params.id,
      owner: { name: undefined, id: params.userId },
      locationState: location.state,
      seedingMethod: "popularity",
      inclusionMethod: "popularity",
      limit: 32,
      fills: 0,
      editMode: false,
      commands: [],
      bracket: new Map(),
      template: { id: null, ownerId: null, displayName: null },
      songSource: { type: undefined },
      currentlyPlayingId: null,
      showBracket: false,
      loadingText: "Loading...",
      saving: false,
      waitingToSave: false,
      lastSaved: { time: 0, commandsLength: 0 },
      playbackEnabled: false,
      alertInfo: { show: false, message: null, type: null, timeoutId: null },
    }),
    [params.id, params.userId, location.state],
  );

  const [bracketId, setBracketId] = useState(defaultValues.bracketId);
  const [owner, setOwner] = useState(defaultValues.owner);
  const [locationState, setLocationState] = useState(defaultValues.locationState);
  const [limit, setLimit] = useState(defaultValues.limit);
  const [fills, setFills] = useState(defaultValues.fills);
  const [editMode, setEditMode] = useState(defaultValues.editMode);
  const [commands, setCommands] = useState(defaultValues.commands);
  const [bracket, setBracket] = useState(defaultValues.bracket);
  const [template, setTemplate] = useState(defaultValues.template);
  const [songSource, setSongSource] = useState(defaultValues.songSource);
  const [showBracket, setShowBracket] = useState(defaultValues.showBracket);
  const [saving, setSaving] = useState(defaultValues.saving);
  const [alertInfo, setAlertInfo] = useState(defaultValues.alertInfo);

  const { loggedIn, loginInfo } = useContext(LoginContext);
  const { isCurrentUser, getUserInfo, getArtist, getPlaylist } = useSpotify();
  const { bracketSorter } = useHelper();
  const { getBracket, updateBracket } = useBackend();
  const { getNumberOfColumns } = useBracketGeneration();

  const editable = loggedIn && isCurrentUser(owner.id);
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

  // ALERTS

  const showAlert = useCallback(
    (message, type = "info", timeout = true) => {
      if (alertInfo.timeoutId) {
        clearTimeout(alertInfo.timeoutId);
      }
      let timeoutId = null;
      if (timeout) {
        timeoutId = setTimeout(() => {
          setAlertInfo({ show: false, message: null, type: null, timeoutId: null });
        }, 5000);
      }
      setAlertInfo({ show: true, message: message, type: type, timeoutId: timeoutId });
    },
    [alertInfo],
  );

  // SAVE

  async function saveBracket(data) {
    // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    if (saving !== true && editable && bracket.size > 0 && !editMode) {
      try {
        setSaving(true);
        // write to database and stuff
        console.debug("Saving bracket...");
        await backOff(() => updateBracket(bracketId, data), {
          jitter: "full",
          maxDelay: 25000,
          timeMultiple: 5,
          retry: (e) => {
            console.debug(e);
            if (e.cause && e.cause.code === 429) {
              console.debug("429 error! Retrying with delay...", e);
              return true;
            }
            return false;
          },
        });
        console.debug("Bracket Saved");
        // show notification Saved", "success");
        setSaving(false);
      } catch (error) {
        if (error.cause && error.cause.code === 429) {
          showAlert("Error saving bracket! Wait a minute or two and then try making another choice", "error");
        } else {
          showAlert(error.message, "error");
        }
        setSaving("error");
      }
    }
  }

  // RESET STATE
  const resetState = useCallback(async () => {
    setBracketId(defaultValues.bracketId);
    setOwner(defaultValues.owner);
    setLocationState(defaultValues.locationState);
    setLimit(defaultValues.limit);
    setFills(defaultValues.fills);
    setEditMode(defaultValues.editMode);
    setCommands(defaultValues.commands);
    setBracket(defaultValues.bracket);
    setTemplate(defaultValues.template);
    setSongSource(defaultValues.songSource);
    setShowBracket(defaultValues.showBracket);
    setSaving(defaultValues.saving);
    setAlertInfo(defaultValues.alertInfo);
  }, [defaultValues]);

  // START BRACKET

  const checkAndUpdateSongSource = useCallback(
    async (tempSongSource) => {
      if (loggedIn) {
        if (tempSongSource.type === "artist") {
          const artist = await getArtist(tempSongSource.artist.id);
          setSongSource({ type: "artist", artist: { name: artist.name, id: artist.id } });
        } else if (tempSongSource.type === "playlist") {
          const playlist = await getPlaylist(tempSongSource.playlist.id);
          setSongSource({ type: "playlist", playlist: { name: playlist.name, id: playlist.id } });
        }
      }
    },
    [getArtist, getPlaylist, loggedIn],
  );

  const checkAndUpdateOwnerUsername = useCallback(
    async (ownerId) => {
      if (ownerId && loggedIn) {
        getUserInfo(ownerId).then((newUserInfo) => {
          if (newUserInfo) {
            setOwner({ id: newUserInfo.id, name: newUserInfo.display_name });
          }
        });
      }
    },
    [getUserInfo, loggedIn],
  );

  const initializeLoadedBracket = useCallback(
    async (loadedBracket) => {
      // set owner details
      setOwner({ id: loadedBracket.ownerId, name: loadedBracket.ownerUsername });
      checkAndUpdateOwnerUsername(loadedBracket.ownerId);

      // set bracket data
      let mymap = new Map(Object.entries(loadedBracket.bracketData));
      mymap = new Map([...mymap].sort(bracketSorter));
      setBracket(mymap);

      // set song source
      if (
        loadedBracket.template.songSource &&
        (loadedBracket.template.songSource.type === "artist" || loadedBracket.template.songSource.type === "playlist")
      ) {
        setSongSource(loadedBracket.template.songSource);
        checkAndUpdateSongSource(loadedBracket.template.songSource);
      }

      setLimit(loadedBracket.template.tracks.length);
      setTemplate({
        id: loadedBracket.template.id,
        ownerId: loadedBracket.template.ownerId,
        ownerUsername: loadedBracket.template.ownerUsername,
        displayName: loadedBracket.template.displayName,
      });
      setFills(loadedBracket.template.fills);
      setShowBracket(true);
    },
    [commands.length, bracketSorter, checkAndUpdateOwnerUsername, checkAndUpdateSongSource],
  );

  // INITIALIZE BRACKET

  const kickOff = useCallback(async () => {
    // console.debug("Kicking off", bracketId, locationState);
    if (bracketId && owner.id) {
      try {
        const loadedBracket = await getBracket(bracketId, owner.id);
        try {
          await initializeLoadedBracket(loadedBracket);
        } catch (e) {
          showAlert("Error loading bracket", "error", false);
          console.error(e);
        }
      } catch (error) {
        if (error.cause && error.cause.code === 404) {
          setBracket(null);
        } else if (error.cause && error.cause.code === 429) {
          showAlert("Error loading bracket! Please try again later", "error", false);
        } else {
          showAlert(error.message, "error", false);
          console.error(error);
        }
      }
    }
  }, [initializeLoadedBracket, bracketId, owner.id, locationState, limit, showAlert, setBracket, getBracket]);

  useEffect(() => {
    kickOff();
  }, []);

  // SHARE

  const share = useCallback(() => {
    navigator.clipboard.writeText(location.href);
    console.debug("copied link");
    showAlert("Link copied to clipboard!", "success");
  }, [location.href]);

  // DUPLICATE

  const duplicateBracket = useCallback(async () => {
    if (template && template.id && template.ownerId && loginInfo && loginInfo.userId) {
      // generate new bracket id
      const uuid = uuidv4();
      console.debug(`Create New Bracket with id: ${uuid}`);

      // navigate to new bracket psge (same page really)
      await navigate(`/user/${loginInfo.userId}/bracket/${uuid}`, { template: template });
      // window.location.state = { template: template };
      // window.location.reload();

      // const newBracket = await fillBracket(bracketTracks, getNumberOfColumns(bracketTracks.length));
      // console.debug("old bracket:", bracket);
      // console.debug("New bracket:", newBracket);

      // reset state because we stay on the same page
      await resetState();

      // set state for new bracket
      setBracketId(uuid);
      setOwner({ id: loginInfo.userId, name: undefined });
      setLocationState({ template: template });
      // setLoadingText("Duplicating bracket...");
      // // setBracket(newBracket);

      // await initializeBracketFromTemplate(template, loginInfo.userId, uuid);
      navigate(`/user/${loginInfo.userId}/bracket/${uuid}`, { state: { template: template } });

      // kick off new bracket creation
    } else {
      showAlert("Error duplicating bracket", "error");
      console.error("Error duplicating bracket. Something is wrong with the template:", template);
    }
  }, [template, loginInfo, resetState]);

  if (bracket?.size > 0 && !bracketWinner && params.userId === loginInfo?.userId) {
    console.log(location.state);
    console.log("winner1", bracketWinner);
    navigate(`/user/${params.userId}/bracket/${params.id}/fill`, { state: location.state });
    // return <Redirect to={`/user/${params.userId}/bracket/${params.id}/fill`} />;
  }

  return (
    <Layout noChanges={() => true} path={location.pathname}>
      <div className="text-center">
        <h1>
          {owner.name && songSource && bracket && bracketTracks ? (
            <div className="mx-auto mb-2 flex flex-col gap-0 items-center justify-center max-w-[90%]">
              <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
                <span className="truncate w-auto font-bold">
                  {Boolean(songSource.type === "artist") ? songSource.artist.name : null}
                  {Boolean(songSource.type === "playlist") ? songSource.playlist.name : null}
                </span>
                {Boolean(bracketTracks && bracketTracks.length) && <TrackNumber numTracks={bracketTracks.length} />}
              </div>
              <span className="text-md">by {owner.name}</span>
              {template.ownerId !== owner.id && template.ownerUsername && (
                <span className="text-sm">{`Created from a template by ${template.ownerUsername}`}</span>
              )}
              {/* {fills && fills > 0 && bracketWinner ? <span className="text-md">Filled out {fills} {fills === 1 ? "time" : "times"}!</span> : null} */}
            </div>
          ) : bracket?.size > 0 ? (
            <div>Error fetching bracket details!</div>
          ) : (
            <div className="font-bold mb-2">{bracket ? "Getting bracket..." : "Bracket not found"}</div>
          )}
        </h1>
        {bracketWinner && (
          <BracketWinnerInfo
            bracketWinner={bracketWinner}
            showSongInfo={songSource && songSource.type === "playlist"}
          />
        )}
      </div>
      <hr />
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center gap-2">
            <ActionButton onClick={share} icon={<ShareIcon />} text="Share" />
            {!editable && template.ownerId !== loginInfo?.userId && (
              <ActionButton
                onClick={duplicateBracket}
                icon={<DuplicateIcon />}
                text={loggedIn ? "Make my own picks" : "Login to pick your own winners!"}
                disabled={!loggedIn}
              />
            )}
          </div>
        </div>
        <BracketView
          bracket={bracket}
          bracketTracks={bracketTracks}
          setShowBracket={setShowBracket}
          showBracket={showBracket}
          songSource={songSource}
        />
      </div>
    </Layout>
  );
}

export function Head({ params }) {
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
    <Seo title="View/edit bracket" />
  );
}
