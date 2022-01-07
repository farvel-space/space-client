import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./AvatarReadyPlayerMe.scss";
import { ReactComponent as CloseIcon } from "../icons/Close.svg";
import { FormattedMessage } from "react-intl";
import { IconButton } from "../input/IconButton";
import { FullscreenLayout } from "../layout/FullscreenLayout";
import { Column } from "../layout/Column";

export function AvatarReadyPlayerMe({ onClose }) {
  const onSuccess = useCallback(
    ({ url }) => {
      // maybe using the scene like that does not work?
      const store = window.APP.store;
      const scene = document.querySelector("a-scene");

      store.update({ profile: { ...store.state.profile, ...{ avatarId: url } } });
      // avatar_updated seems to only work after being in the room --> scene-entry-manager is not yet loaded
      // this seems to be a bug, since profile-entry-panel also uses this event, but it does not work when entering the room via setup dialog.
      scene.emit("avatar_updated");
      // TODO: when set for a second time, the avatar is not updated -> might be a caching issue with our cors proxy
      onClose();
    },
    [onClose]
  );

  useEffect(
    () => {
      function receiveMessage(event) {
        // Check if the received message is a string and a glb url
        // if not ignore it, and print details to the console
        if (typeof event.data === "string" && event.data.startsWith("https://") && event.data.endsWith(".glb")) {
          const url = event.data;
          console.log(`Avatar URL: ${url}`);
          onSuccess({ url });
        } /* else {
          console.log(`Received message from unknown source: ${event.data}`);
        } */
      }
      window.addEventListener("message", receiveMessage, false);

      return () => {
        window.removeEventListener("message", receiveMessage, false);
      };
    },
    [onSuccess]
  );

  return (
    <FullscreenLayout
      headerLeft={
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      }
      headerCenter={
        <>
          <h3>
            <FormattedMessage id="avatar.readyplayerme.dialog.title" defaultMessage="Create an avatar" />
          </h3>
        </>
      }
      //   headerRight={}
    >
      <Column grow padding center className={styles.content}>
        <iframe src="https://demo.readyplayer.me/" className={styles.iframe} allow="camera *; microphone *" />
      </Column>
    </FullscreenLayout>
  );
}

AvatarReadyPlayerMe.propTypes = {
  onClose: PropTypes.func
};

AvatarReadyPlayerMe.defaultProps = {
  noResultsMessage: "No Results"
};
