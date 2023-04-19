import React, { useState } from "react";
import FAQSection from "./FAQSection";
import LoginButton from "../LoginButton";
import CornerButton from "../BracketCard/CornerButton";
import ShareIcon from "../../assets/svgs/shareIcon.svg";
import RocketIcon from "../../assets/svgs/rocketIcon.svg";
import EditIcon from "../../assets/svgs/editIcon.svg";
import ActionButton from "../Bracket/ActionButton";

const FAQ = ({ loggedIn, path }) => {
  const [expandedSection, setExpandedSection] = useState(
    path == "/" ? 0 : null
  );
  const questions = [
    {
      question: "What is Beat Bracket?",
      answer: (
        <>
          Beat Bracket allows you to create and share music brackets for any
          artist on Spotify
          {!loggedIn
            ? ". Login with a Spotify account to create a bracket of your own!"
            : ""}
        </>
      ),
      paths: ["*"],
    },
    {
      question: "Why do I need a Spotify account to use Beat Bracket?",
      answer:
        "This site uses Spotify's API to get information about artists and tracks. After you create a bracket, it is also associated with your Spotify account so that you'll be able to edit and share it later!",
      paths: ["*"],
    },
    {
      question: "How do I create a bracket?",
      answer: (
        <ol className="list-decimal list-inside">
          {!loggedIn ? (
            <li>
              To create a bracket, you must first{" "}
              <LoginButton variant="bordered" />
            </li>
          ) : null}
          <li>
            Click the "Create Bracket" card (only appears if your account has
            room for another bracket)
          </li>
          <li>
            Select an artist from the popup and a bracket will be created
            containing the artist's most popular tracks
          </li>
        </ol>
      ),
      paths: ["/my-brackets/"],
    },
    {
      question: "How do I edit a bracket?",
      answer: (
        <>
          Click{" "}
          <span className="inline-block">
            <ActionButton icon={<EditIcon />} text="Edit" />
          </span>
          . You can drag and drop songs to rearrange or click{" "}
          <CornerButton autoPosition={false} /> to make a swap. To adjust the
          number of tracks and choose different seeding methods use the
          dropdowns at the top. To start picking songs to advance, click{" "}
          <span className="inline-block">
            <ActionButton icon={<RocketIcon />} text={"Start Bracket"} />
          </span>
        </>
      ),
      paths: ["user/*/bracket/*"],
    },
    {
      question: "How do I complete a bracket?",
      answer: (
        <>
          Start selecting songs to advance to the next round! If an audio
          preview is availiable for a track, you'll see a "play" icon next to
          the track name which will play 30 seconds of the song. You can also
          click the Spotify icon in the top right to open the track in Spotify.
          Keep selecting songs until you have a winner!
        </>
      ),
      paths: ["user/*/bracket/*"],
    },
    {
      question: "How do I share a bracket?",
      answer: (
        <>
          Click{" "}
          <span className="inline-block">
            <ActionButton icon={<ShareIcon />} text="Share" />
          </span>{" "}
          to get a publicly accessible link to your bracket!
        </>
      ),
      paths: ["/user/*/bracket/*"],
    },
    {
      question: "How do I delete a bracket?",
      answer: (
        <>
          Click the <CornerButton autoPosition={false} /> button in the top
          right corner of a bracket card
        </>
      ),
      paths: ["/my-brackets/"],
    },
    {
      question:
        "Why is there a limit on the number of brackets that I can have?",
      answer:
        "Storage can be expensive! Beat Bracket currently has limited storage space and is only able to support a certain number of brackets per account. In the future I may add a way to purchase more storage space, but for now I'm limiting the number of brackets per account to keep costs down",
      paths: ["/my-brackets/"],
    },
    {
      question: "Why are there duplicate/similar tracks in my bracket?",
      answer: (
        <>
          Spotify makes it difficult to consolidate all versions of the same
          song (especially when they are titled slightly differently eg.
          "Remastered" or "Radio edit"). This application uses a custom
          algorithm to avoid showing duplicates but there are still some cases
          where it happens. If you notice this, please{" "}
          <a
            className="text-green-500 hover:text-green-700 underline"
            href="mailto:feedback@beatbracket.com"
          >
            let me know
          </a>{" "}
          and I'll try to fix it! In the meantime, you can manually replace the
          duplicate track with another one of the artist's songs
        </>
      ),
      paths: ["/user/*/bracket/*"],
    },
    {
      question: "How do I sign out or switch accounts?",
      answer:
        'Click your profile in the top right corner and select "Sign Out". You will be re-prompted to authorize Beat Bracket to access your account on the next sign in',
      paths: ["/my-brackets/", "/user/*/bracket/*"],
    },
    {
      question: "How do I suggest an improvement?",
      answer: (
        <>
          Send me an email at{" "}
          <a
            className="text-green-500 hover:text-green-700 underline"
            href="mailto:feedback@beatbracket.com"
          >
            feedback@beatbracket.com
          </a>
        </>
      ),
      paths: ["/my-brackets/", "/user/*/bracket/*"],
    },
  ];

  return (
    <>
      <div className="mx-4 text-left">
        {/* <h1 className="pt-5 pl-5 text-4xl text-white font-bold">FAQs</h1> */}
        {questions.map((question, index) => {
          console.log(path);
          for (let i = 0; i < question.paths.length; i++) {
            const regex = new RegExp(question.paths[i].replace("*", ".*"));
            if (regex.test(path)) {
              return (
                <FAQSection
                  key={index}
                  question={question.question}
                  answer={question.answer}
                  expanded={expandedSection === index}
                  toggleExpanded={() => {
                    setExpandedSection(
                      expandedSection === index ? null : index
                    );
                  }}
                />
              );
            }
          }
          return null;
        })}
      </div>
    </>
  );
};

export default FAQ;
