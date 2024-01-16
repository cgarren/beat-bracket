import React from "react";
import Modal from "./Modal";
import ActionButton from "../Controls/ActionButton";

export default function StartBracketModal({ showModal, setShowModal, startBracket }) {
  if (showModal)
    return (
      <Modal onClose={() => setShowModal(false)}>
        <h1 className="text-xl font-bold">Start Bracket?</h1>
        <p className="mt-2 text-sm">You will not be able to edit bracket structure after starting</p>
        <div className="mt-2 flex flex-row justify-around">
          <ActionButton onClick={() => setShowModal(false)} text="Keep editing" autoFocus variant="secondary" />
          <ActionButton onClick={startBracket} text="Start bracket" variant="primary" />
        </div>
      </Modal>
    );
  return null;
}
