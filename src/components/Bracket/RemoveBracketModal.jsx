import React from "react";
import Modal from "../Modal";
import ActionButton from "./ActionButton";

export default function RemoveBracketModal({ showModal, setShowModal, removeBracket, bracketName }) {
  if (showModal)
    return (
      <Modal onClose={() => setShowModal(false)}>
        <h1 className="text-xl font-bold">Delete Bracket?</h1>
        <p className="mt-2 text-sm">{`This "${bracketName}" bracket will be permanently deleted!`}</p>
        <div className="mt-2 flex flex-row justify-around">
          <ActionButton onClick={() => setShowModal(false)} text="Cancel" autoFocus variant="secondary" />
          <ActionButton onClick={removeBracket} text="Delete bracket" variant="danger" />
        </div>
      </Modal>
    );
  return null;
}
