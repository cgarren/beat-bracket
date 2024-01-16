import React from "react";
import Modal from "./Modal";
import LoginButton from "../Controls/LoginButton";

export default function LoginExpiredModal({ showModal, setShowModal, bracketSavedLocally }) {
  return (
    showModal && (
      <Modal onClose={() => setShowModal(false)}>
        <h1 className="text-xl font-bold">Session Expired </h1>
        <p className="mt-2 text-s">
          Your session has expired! We were unable to refresh your token automatically due to a system issue. Login
          again using the button below
        </p>
        {/* {bracketSavedLocally && bracketSavedLocally() && (
            <p className="mt-2 text-s">
              <span className="font-bold text-green-600">
                Your bracket in progess has been saved and will be restored after successful login
              </span>
            </p>
          )} */}
        <div className="mt-2 flex flex-row justify-around">
          <LoginButton
            cleanupFunc={() => {
              setShowModal(false);
            }}
          />
        </div>
      </Modal>
    )
  );
}
