import React from "react";
import Modal from "../Modal";
import ActionButton from "./ActionButton";

export default function StartBracketModal({ showModal, setShowModal, startBracket }) {
  return (
    <div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h1 className="text-xl font-bold">Start Bracket?</h1>
          <p className="mt-2 text-xs">
            Start filling out this bracket? You will not be able to edit bracket structure after starting.
          </p>
          <div className="mt-2 flex flex-row justify-around">
            <ActionButton
              onClick={() => setShowModal(false)}
              text="Keep editing"
              autoFocus
              customStyling="mr-2 bg-gray-200 hover:bg-gray-300"
            />
            <ActionButton
              onClick={startBracket}
              text="Start bracket"
              customStyling="bg-gray-700 text-white hover:bg-black"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
