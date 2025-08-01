import React, { useRef, useState } from "react";
import TextAnimation from "./TextAnimation";

const App = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [sentence, setSentence] = useState(
    "Keep going the horizon moves with you"
  );

  console.log("sent", sentence);

  return (
    <div className="appWrapper">
      <TextAnimation sentence={sentence} />
      <div className="inputWrapper">
        <input
          className="input"
          placeholder="Keep going the horizon moves with you"
          type="text"
          ref={inputRef}
        />
        <button
          className="enterButton"
          onClick={() => {
            if (inputRef.current) setSentence(inputRef.current.value);
          }}
        >
          Show New Message
        </button>
      </div>
      <div className="linksContainer">
        <a
          href="https://www.instagram.com/p/DLcefMOsxkZ/?img_index=1"
          target="_blank"
        >
          Reference Animation
        </a>
        <a href="https://css-tricks.com/gooey-effect/" target="_blank">
          SVG Gooey Effect Reference
        </a>
      </div>
    </div>
  );
};

export default App;
