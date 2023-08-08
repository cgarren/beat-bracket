import React from "react";
import CornerButton from "../BracketCard/CornerButton";

const questions = [
    {
        question: "What is Beat Bracket?",
        answer: (
            <>
                Beat Bracket allows you to create and share music brackets for
                any artist or playlist on Spotify. I created it because I love
                music and web development and I noticed a lack of good
                bracket-making tools of there for music in particular. I hope
                you enjoy it!
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
                    Click the "Create Bracket" card (only appears if your
                    account has room for another bracket)
                </li>
                <li>
                    Select an artist or playlist from the popup and a bracket
                    will be created containing (by default) the most popular
                    tracks from your chosen source.
                </li>
                <br />
                Only the playlists that you have liked will appear. If you don't
                see a playlist that you're looking for, you can like it from
                your Spotify account!
            </ol>
        ),
        paths: ["/my-brackets/"],
    },
    {
        question: "How do I edit a bracket?",
        answer: (
            <>
                Click "Edit". You can drag and drop songs to rearrange or click
                "x" to make a swap. To adjust the number of tracks and choose
                different seeding methods use the dropdowns near the top. When
                you're finished, click "Done" and begin picking songs to advance
                to the next round.
                <br />
                <br />
                NOTE: A bracket can only be edited if no tracks have been
                selected to advance yet!
            </>
        ),
        paths: ["user/*/bracket/*"],
    },
    {
        question: "How do I complete a bracket?",
        answer: (
            <>
                Start selecting songs to advance to the next round! If an audio
                preview is availiable for a track, you'll see a "Play" icon next
                to the track name which will play 30 seconds of the song. You
                can also click the Spotify icon in the top right to open the
                track in Spotify. Keep selecting songs until you have a winner!
            </>
        ),
        paths: ["user/*/bracket/*"],
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
                top right corner of a bracket card.
            </>
        ),
        paths: ["/my-brackets/"],
    },
    {
        question:
            "Why is there a limit on the number of brackets that I can have?",
        answer: "Storage can be expensive! Beat Bracket currently has limited storage space and is only able to support a certain number of brackets per account. In the future I may add a way to purchase more storage space, but for now I'm limiting the number of brackets per account to keep costs down.",
        paths: ["/my-brackets/"],
    },
    {
        question: "Why are there duplicate/similar tracks in my bracket?",
        answer: (
            <>
                Spotify makes it difficult to consolidate all versions of the
                same song (especially when they are titled slightly differently
                eg. "Remastered" or "Radio edit"). This application uses a
                custom algorithm to avoid showing duplicates but there are still
                some cases where it happens. If you notice this, please{" "}
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
        paths: ["/user/*/bracket/*"],
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
                leads to less variations of gray and brown. If you notice a
                color that doesn't seem to match the album art, feel free to{" "}
                <a
                    className="text-green-500 hover:text-green-700 underline"
                    href="mailto:feedback@beatbracket.com"
                >
                    reach out.
                </a>
                !
            </>
        ),
        paths: ["/user/*/bracket/*"],
    },
    {
        question: "How do I sign out or switch accounts?",
        answer: 'Click your profile in the top right corner and select "Sign Out". You will be re-prompted to authorize Beat Bracket to access your account on the next sign in.',
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
