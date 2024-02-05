import React, { useState } from "react";
import LoadingIndicator from "../LoadingIndicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export default function StartBracketModal({ showModal, setShowModal, startBracket }) {
  const [bracketStarting, setBracketStarting] = useState(false);
  return (
    <AlertDialog open={showModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start Bracket?</AlertDialogTitle>
          <AlertDialogDescription>
            You won&apos;t be able to edit bracket structure after starting!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowModal(false)} variant="outline" disabled={bracketStarting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async (event) => {
              event.preventDefault();
              if (bracketStarting) return;
              setBracketStarting(true);
              await startBracket();
              setBracketStarting(false);
              setShowModal(false);
            }}
            disabled={bracketStarting}
          >
            {bracketStarting ? (
              <span className="flex flex-row items-center">
                <LoadingIndicator dark /> Creating...
              </span>
            ) : (
              "Let's go!"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
