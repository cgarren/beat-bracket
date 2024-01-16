import React, { useState } from "react";
import Modal from "./Modal";
import ActionButton from "../Controls/ActionButton";
import LoadingIndicator from "../LoadingIndicator";

export default function StartBracketModal({ showModal, setShowModal, startBracket }) {
  const [bracketStarting, setBracketStarting] = useState(false);
  if (showModal)
    return (
      <Modal
        onClose={() => {
          if (!bracketStarting) {
            setShowModal(false);
          }
        }}
      >
        <h1 className="text-xl font-bold">Start Bracket?</h1>
        <p className="mt-2 text-sm">You will not be able to edit bracket structure after starting</p>
        <div className="mt-2 flex flex-row justify-around">
          <ActionButton
            onClick={() => setShowModal(false)}
            text="Keep editing"
            autoFocus
            variant="secondary"
            disabled={bracketStarting}
          />
          <ActionButton
            onClick={async () => {
              if (bracketStarting) return;
              setBracketStarting(true);
              await startBracket();
              setBracketStarting(false);
              setShowModal(false);
            }}
            text={
              bracketStarting ? (
                <span className="flex flex-row items-center">
                  <LoadingIndicator dark /> Creating...
                </span>
              ) : (
                "Start bracket"
              )
            }
            variant="primary"
            disabled={bracketStarting}
          />
        </div>
      </Modal>
    );
  return null;
}
