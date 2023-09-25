import React from "react";
import Modal from "../Modal";
import ActionButton from "./ActionButton";

export const StartBracketModal = ({
    showModal,
    setShowModal,
    startBracket,
}) => {
    return (
        <>
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <h1 className="text-xl font-bold">Start Bracket?</h1>
                    <p className="mt-2 text-xs">
                        Start filling out this bracket? You will not be able to
                        edit bracket structure after starting.
                    </p>
                    <div className="mt-2 flex flex-row justify-around">
                        <ActionButton
                            onClick={() => setShowModal(false)}
                            text={"Keep editing"}
                            customStyling={"mr-2 bg-gray-200 hover:bg-gray-300"}
                        />
                        <ActionButton
                            onClick={startBracket}
                            text={"Fill out bracket"}
                            customStyling={
                                "bg-black text-white hover:bg-gray-500"
                            }
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};
