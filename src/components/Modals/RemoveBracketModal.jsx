import React from "react";
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

export default function RemoveBracketModal({ showModal, setShowModal, removeBracket, bracketName }) {
  return (
    <AlertDialog open={showModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bracket?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This "${bracketName}" bracket will be permanently deleted!`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowModal(false)} variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={removeBracket}>
            Delete bracket
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
