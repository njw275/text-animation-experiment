import React, { useEffect, useState, ReactNode, useRef } from "react";
import { motion, stagger, animate } from "framer-motion";
import styles from "./TextAnimation.module.scss";
import ReactDOM from "react-dom";

type TextAnimationProps = {
  sentence: string;
};

type LetterComponentProps = {
  wordIndex: number;
  portalRoot: HTMLElement;
  children: ReactNode;
  index: number;
};

/**
 *
 * Reference: https://www.instagram.com/p/DLcefMOsxkZ/?img_index=1
 *
 *
 * Sources:
 *     SVG Gooey Effect - https://css-tricks.com/gooey-effect/
 *
 */

const TextAnimation = ({ sentence = "" }: TextAnimationProps) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement[]>([]);

  const [numLines, setNumLines] = useState(25);
  const [width, setWidth] = useState(475);

  useEffect(() => {
    const temp: HTMLElement[] = [];

    sentence.split(" ").forEach((word, j) => {
      const root = document.getElementById(
        `portal-root-${word}-${j}`
      ) as HTMLElement;
      temp.push(root);
    });

    setPortalRoot(temp);
  }, [sentence]);

  useEffect(() => {
    sentence.split(" ").forEach((_, i) => {
      const inner_letters = [
        ...document.querySelectorAll(`.inner-${i}`),
      ].reverse();
      const letters = [...document.querySelectorAll(`.letter-${i}`)].reverse();

      const sequence = [
        [
          inner_letters,
          { x: [-1 * width, 0] },
          { at: 0, duration: 1.5, delay: stagger(0.33) },
        ],
        [
          letters,
          { x: [-1 * width, 0] },
          { at: 0, duration: 1.5, delay: stagger(0.33) },
        ],
        [
          inner_letters,
          { x: [0, width] },
          { at: 5, duration: 1.5, delay: stagger(0.33) },
        ],
        [
          letters,
          { x: [0, width] },
          { at: 5, duration: 1.5, delay: stagger(0.33) },
        ],
      ];

      animate(sequence, {
        repeat: Infinity,
        delay: i * 0.5,
        ease: "easeInOut",
      });
    });
  }, [portalRoot, width]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function adjustSizing() {
      const words = document.querySelectorAll(`.${styles.wordWrapper}`);
      let tempWidth = 0;
      words.forEach((word) => {
        if (word.clientWidth > tempWidth) tempWidth = word.clientWidth;
      });

      const wordWrapperHeight = document
        .querySelector(`.${styles.wordWrapper}`)!
        .getBoundingClientRect().height;

      wrapperRef.current!.style.width = tempWidth + 100 + "px";
      wrapperRef.current!.style.height =
        wordWrapperHeight * Math.max(sentence.split(" ").length, 1) + 40 + "px";

      setWidth(tempWidth + 100);
      setNumLines(Math.ceil((tempWidth + 100) / 30) + 2);
    }

    if (wrapperRef.current) {
      adjustSizing();
      window.addEventListener("resize", adjustSizing);
    }

    return () => {
      window.removeEventListener("resize", adjustSizing);
    };
  }, [wrapperRef, sentence]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.bg}>
        <div className={styles.lineContainer}>
          {new Array(numLines).fill(0).map((_, z) => {
            return (
              <div
                key={`bg-line-${z}-${numLines}`}
                className={styles.line}
              ></div>
            );
          })}
        </div>

        <div className={styles.portalWrapper}>
          {sentence.split(" ").map((word, j) => {
            return (
              <div
                key={`port-root-key-${word}-${j}`}
                className={styles.portalRoot}
                id={`portal-root-${word}-${j}`}
              ></div>
            );
          })}
        </div>

        <div className={styles.bigGroup}>
          {sentence.split(" ").map((word, j) => {
            return (
              <div key={`word-wrapper-${j}`} className={styles.wordWrapper}>
                {word.split("").map((letter, i) => {
                  return (
                    <LetterComponent
                      portalRoot={portalRoot[j]}
                      key={`${i}-${letter}`}
                      index={i}
                      wordIndex={j}
                    >
                      {letter}
                    </LetterComponent>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <svg
        className={styles.blurSvg}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="goo-outline" colorInterpolationFilters="sRGB">
            {/* <!-- Step 1: Goo blur --> */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />

            {/* <!-- Step 2: Goo color matrix --> */}
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 18 -7"
              result="goo"
            />

            {/* <!-- Step 3: Create outline shape by dilation --> */}
            <feMorphology
              in="goo"
              operator="dilate"
              radius="1.5"
              result="dilated"
            />

            {/* <!-- Step 4: Fill the dilated region with blue --> */}
            <feFlood floodColor="black" result="blueFlood" />
            <feComposite
              in="blueFlood"
              in2="dilated"
              operator="in"
              result="blueOutline"
            />

            {/* <!-- Step 5: Subtract inner goo to isolate outline only --> */}
            <feComposite
              in="dilated"
              in2="goo"
              operator="out"
              result="outlineOnly"
            />

            {/* <!-- Step 6: Merge blue outline, original graphic, and goo --> */}
            <feMerge>
              <feMergeNode in="blueOutline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

function MyPortalComponent({
  portalRoot,
  children,
}: {
  portalRoot: HTMLElement;
  children: ReactNode;
}) {
  if (!portalRoot) {
    return null;
  }

  return ReactDOM.createPortal(children, portalRoot);
}

const LetterComponent = ({
  wordIndex,
  portalRoot,
  children,
  index,
}: LetterComponentProps) => {
  return (
    <>
      <MyPortalComponent
        key={`portal-${wordIndex}-${index}`}
        portalRoot={portalRoot}
      >
        <span
          key={`letter-inportal-${index}-${wordIndex}`}
          className={`${styles.inner} inner-${wordIndex} ${styles.font}`}
        >
          {children}
        </span>
      </MyPortalComponent>

      <motion.span
        className={`${styles.letter} letter-${wordIndex} ${styles.font}`}
        key={`letter-${index}-${wordIndex}`}
      >
        {children}
      </motion.span>
    </>
  );
};

export default TextAnimation;
