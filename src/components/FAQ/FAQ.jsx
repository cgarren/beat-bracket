import React from "react";
import FAQSection from "./FAQSection";
import LoginButton from "../LoginButton";

const FAQ = ({ loggedIn }) => {
  return (
    <div className="text-left p-4" aria-label="Frequently asked questions">
      <FAQSection
        question={"What is Beat Bracket?"}
        answer={
          <>
            Beat Bracket allows you to create and share brackets for any artist
            on Spotify. You can automatically fill and seed brackets of
            different sizes and then fine-tune manually by moving or replacing
            individual songs
          </>
        }
      />
      <FAQSection
        question={"Why do I need a Spotify account to use Beat Bracket?"}
        answer={
          "This site uses Spotify's API to get information about artists and tracks. After you create a bracket, it is associated with your Spotify account so that you'll be able to edit and share it later!"
        }
      />
      <FAQSection
        question={"How do I create a bracket?"}
        answer={
          <ol className="list-decimal list-inside">
            {!loggedIn ? (
              <li>
                To create a bracket, you must first{" "}
                <LoginButton variant="bordered" />
              </li>
            ) : null}
            <li>Click "Create Bracket"</li>
            <li>
              Select an artist from the popup and a bracket will be created
              containing the artist's most listened to tracks seeded by
              popularity
            </li>
            <li>
              (Optional) Click "Edit" to customize the bracket to your liking.
              You can drag and drop, swap out songs, adjust the number of
              tracks, and choose different seeding methods
            </li>
            <li>
              Start selecting songs to advance to the next round! If an audio
              preview is availiable for a track, you'll see a "play" icon next
              to the track name which will play a 30 second preview of the song.
              You can also click the Spotify icon in the top right to open the
              track in Spotify
            </li>
            <li>Click "Share" to get a link to your newly created bracket!</li>
          </ol>
        }
      />
      <FAQSection
        question={
          "Why is there a limit on the number of brackets that I can have?"
        }
        answer={
          "Storage can be expensive! Beat Bracket currently has limited storage space and is only able to support a certain number of brackets per account. In the future I may add a way to upgrade your account to support more brackets!"
        }
      />
      <FAQSection
        question={"Why are there duplicate/similar tracks in my bracket?"}
        answer={
          <>
            Spotify makes it difficult to consolidate all versions of the same
            song (especially when they are titled slightly differently eg.
            "Remastered" or "Radio edit"). Beat Bracket uses a custom algorithm
            to avoid showing duplicates but there are still some cases where it
            happens. If you notice this, please{" "}
            <a
              className="text-green-500 hover:text-green-700 underline"
              href="mailto:feedback@beatbracket.com"
            >
              let me know
            </a>{" "}
            and I'll try to fix it! In the meantime, you can manually replace
            the duplicate track with another one of the artist's songs
          </>
        }
      />
      <FAQSection
        question={"How do I sign out or switch accounts?"}
        answer={
          'Click your profile in the top right corner and select "Sign Out". You will be re-prompted to authorize Beat Bracket\'s access to your account on the next sign in'
        }
      />
      <FAQSection
        question={"How do I suggest an improvement?"}
        answer={
          <>
            Send me an email at{" "}
            <a
              className="text-green-500 hover:text-green-700 underline"
              href="mailto:feedback@beatbracket.com"
            >
              feedback@beatbracket.com
            </a>
          </>
        }
      />
    </div>
  );
};

export default FAQ;
