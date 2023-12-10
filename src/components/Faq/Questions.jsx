import React from "react";
import CornerButton from "../BracketCard/CornerButton";
import PlayIcon from "../../assets/svgs/playIcon.svg";
import { Link } from "gatsby";
import OpenInSpotifyButton from "../Bracket/OpenInSpotifyButton";

const questions = [
    {
        question: "What is Beat Bracket?",
        answer: (
            <>
                Beat Bracket allows you to create and share music brackets for
                any artist or playlist on Spotify. I created it because I love
                music and I noticed a lack of good bracket-making tools out
                there for music in particular. I hope you enjoy it!
            </>
        ),
        paths: ["*"],
    },
    {
        question: "Why do I need a Spotify account to use Beat Bracket?",
        answer: "This site uses Spotify's API to get information about artists, playlists, and tracks. After you create a bracket, it is associated with your Spotify account so that you'll be able to edit and share it later!",
        paths: ["*"],
    },
    {
        question: "How do I create a bracket?",
        answer: (
            <ol className="list-decimal list-inside">
                <li>
                    Click the "Create Bracket" card on the{" "}
                    <Link
                        className="text-green-500
                        hover:text-green-700
                        underline"
                        to="/my-brackets"
                    >
                        My Brackets page
                    </Link>{" "}
                    (only appears if your account has room for another bracket)
                </li>
                <li>
                    Select an artist or playlist* from the popup and a bracket
                    will be created containing the most popular tracks from your
                    chosen source
                </li>
                <li>
                    Customize the bracket by adjusting the number of tracks,
                    tracks to include and seeding method. You can drag and drop
                    songs to rearrange them
                </li>
                <li>Click "Start Bracket"</li>
                <br />
                *Only the playlists that you have liked will appear. If you
                don't see a playlist that you're looking for, you can like it
                from your Spotify account!
            </ol>
        ),
        paths: ["*"],
    },
    {
        question: "How do I complete a bracket?",
        answer: (
            <>
                After you start a bracket, select songs to advance to the next
                round by clicking on them! If an audio preview is availiable for
                a track, you'll see a{" "}
                <div className="inline-flex items-center align-middle bg-black text-white rounded">
                    <PlayIcon />
                </div>{" "}
                icon next to the track name which will play 30 seconds of the
                song. You can also click the{" "}
                <OpenInSpotifyButton
                    songId={null}
                    extraClasses="inline-flex align-middle"
                />{" "}
                icon in the top right to open the track in Spotify. Keep
                selecting songs until you have a winner!
            </>
        ),
        paths: ["*"], //user/*/bracket/*
    },
    {
        question: "How do I share a bracket?",
        answer: (
            <>
                Click "Share" to get a publicly accessible link to your bracket!
            </>
        ),
        paths: ["/user/*/bracket/*"],
    },
    {
        question: "How do I delete a bracket?",
        answer: (
            <>
                Click the <CornerButton autoPosition={false} /> button in the
                top right corner of a bracket's card
            </>
        ),
        paths: ["*"],
    },
    {
        question:
            "Why is there a limit on the number of brackets that I can have?",
        answer: (
            <>
                Beat Bracket currently has limited storage space and is only
                able to support a certain number of brackets per account. In the
                future I may add a way to purchase more storage space, but for
                now I'm limiting the number of brackets per account to keep
                costs down. If this is a feature you would like to see, please{" "}
                <a
                    className="text-green-500 hover:text-green-700 underline"
                    href="mailto:feedback@beatbracket.com"
                >
                    reach out
                </a>
                !
            </>
        ),
        paths: ["/my-brackets/"],
    },
    {
        question: "Why are there duplicate/similar tracks in my bracket?",
        answer: (
            <>
                Spotify makes it difficult to consolidate all versions of the
                same song (especially when they are titled slightly differently
                eg. "Remastered" or "Radio edit"). Beat Bracket uses a custom
                algorithm to avoid showing duplicates but there are still some
                cases where it happens. If you notice this, please{" "}
                <a
                    className="text-green-500 hover:text-green-700 underline"
                    href="mailto:feedback@beatbracket.com"
                >
                    let me know
                </a>{" "}
                and I'll try to fix it! In the meantime, you can manually
                replace the duplicate track with another one of the artist's
                songs. Note that this does not apply to playlists.
            </>
        ),
        paths: ["*"], ///user/*/bracket/*
    },
    {
        question: "Where do the song colors come from?",
        answer: (
            <>
                The colors are generated using a nifty{" "}
                <a
                    className="text-green-500 hover:text-green-700 underline"
                    href="https://jariz.github.io/vibrant.js/"
                >
                    package
                </a>{" "}
                that gets the most vibrant color from the album art of each
                track. I've noticed that this method tends to give better
                results than just getting the most prominent color because it
                has less variations of gray and brown. If you notice a color
                that doesn't seem to match the album art, feel free to{" "}
                <a
                    className="text-green-500 hover:text-green-700 underline"
                    href="mailto:feedback@beatbracket.com"
                >
                    reach out
                </a>
                !
            </>
        ),
        paths: ["/user/*/bracket/*"],
    },
    {
        question: "How do I log out or switch accounts?",
        answer: 'Click your profile in the top right corner and select "Log out". You will be re-prompted to authorize Beat Bracket to access your account on the next sign in.',
        paths: ["/my-brackets/", "/user/*/bracket/*"],
    },
    {
        question: "How do I suggest an improvement or get in touch?",
        answer: (
            <>
                Send me an email at{" "}
                <a
                    className="text-green-500 hover:text-green-700 underline"
                    href="mailto:feedback@beatbracket.com"
                >
                    feedback@beatbracket.com
                </a>
                . I'd love to hear from you!
            </>
        ),
        paths: ["/my-brackets/", "/user/*/bracket/*"],
    },
];

export default questions;
