"use client";

import React, { useRef, useState } from "react";

const initialBody = [
  {
    type: "header1",
    children: [
      {
        color: "#000000",
        bold: true,
        text: "h1 tag",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        color: "#000000",
        bold: false,
        text: "p tag",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        color: "#000000",
        bold: false,
        text: "A line of text in a paragraph.",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        color: "#000000",
        bold: false,
        text: "This is repository for text ",
      },
      {
        color: "#ff0000",
        bold: true,
        text: "highlight ",
      },
      {
        color: "#000000",
        bold: false,
        text: "experiment.",
      },
    ],
  },
];

export default function Home() {
  const [body, setBody] = useState(initialBody);

  const handleEditTextBold = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selection = document.getSelection();
    if (!selection) return;
    const firstRange = selection.getRangeAt(0);
    const lastRange = selection.getRangeAt(selection.rangeCount - 1);
    const startContainer = firstRange.startContainer;
    const endContainer = lastRange.endContainer;
    const isSameNode = firstRange.startContainer === lastRange.endContainer;
    const isSameOffset = firstRange.startOffset === lastRange.endOffset;
    const startOffset = firstRange.startOffset;
    const endOffset = lastRange.endOffset;
    const startElementId = startContainer.parentElement?.id;
    const endElementId = endContainer.parentElement?.id;
    console.log(":", firstRange);
    if (isSameNode && isSameOffset) return;
    if (!startElementId) return;
    const startParentIndex = Number(startElementId.split("-")[1]);
    const startChildIndex = Number(startElementId.split("-")[2]);
    const isBold = body[startParentIndex].children[startChildIndex].bold;
    // 選択したコンテンツが異なるstyleとまたがっていない場合
    if (isSameNode) {
      setBody((b) =>
        b.map((bd, index) => {
          if (index !== startParentIndex) return bd;
          const newChildren = bd.children;
          const editChild = newChildren[startChildIndex];
          const prevText = editChild.text;
          const forwardChild = {
            ...editChild,
            text: prevText.slice(0, startOffset),
          };
          const middleChild = {
            ...editChild,
            text: prevText.slice(startOffset, endOffset),
            bold: !isBold,
          };
          const backwardChild = {
            ...editChild,
            text: prevText.slice(endOffset),
          };
          newChildren.splice(
            startChildIndex,
            1,
            forwardChild,
            middleChild,
            backwardChild,
          );
          return {
            ...bd,
            children: newChildren,
          };
        }),
      );
    } else {
      // コンテンツのスタイルがまたがっている場合
      if (!endElementId) return;
      const endParentIndex = Number(endElementId.split("-")[1]);
      const endChildIndex = Number(endElementId.split("-")[2]);
      setBody((b) =>
        b.map((bd, index) => {
          // FIXME: 正しくindexが取れてない
          // if (startParentIndex === endParentIndex) {
          //   const newChildren = bd.children;
          //   const editChild = newChildren[startChildIndex];
          //   const prevText = editChild.text;
          //   const forwardChild = {
          //     ...editChild,
          //     text: prevText.slice(0, startOffset),
          //   };
          //   const backwardChild = {
          //     ...editChild,
          //     text: prevText.slice(startOffset),
          //     bold: !isBold,
          //   };
          //   newChildren.splice(startChildIndex, 1, forwardChild, backwardChild);
          //   return {
          //     ...bd,
          //     children: newChildren,
          //   };
          // } else {
          if (index === startParentIndex) {
            const newChildren = bd.children;
            const editChild = newChildren[startChildIndex];
            const prevText = editChild.text;
            const forwardChild = {
              ...editChild,
              text: prevText.slice(0, startOffset),
            };
            const backwardChild = {
              ...editChild,
              text: prevText.slice(startOffset),
              bold: !isBold,
            };
            newChildren.splice(startChildIndex, 1, forwardChild, backwardChild);
            return {
              ...bd,
              children: newChildren.map((child, cIndex) =>
                cIndex >= startChildIndex ? { ...child, bold: !isBold } : child,
              ),
            };
          } else if (index > startParentIndex && index < endParentIndex) {
            return {
              ...bd,
              children: bd.children.map((child) => {
                return { ...child, bold: !isBold };
              }),
            };
          } else if (index === endParentIndex) {
            const newChildren = bd.children;
            const editChild = newChildren[endChildIndex];
            const prevText = editChild.text;
            const forwardChild = {
              ...editChild,
              text: prevText.slice(0, endOffset),
              bold: !isBold,
            };
            const backwardChild = {
              ...editChild,
              text: prevText.slice(endOffset),
            };
            newChildren.splice(endChildIndex, 1, forwardChild, backwardChild);
            return {
              ...bd,
              children: newChildren.map((child, cIndex) =>
                cIndex <= endChildIndex ? { ...child, bold: !isBold } : child,
              ),
            };
          }
          return bd;
          // }
        }),
      );
    }
  };

  const handleEditTextColor = () => {};

  return (
    <main className="flex min-h-screen flex-col items-center gap-2 p-24">
      <div className="flex flex-row items-center">
        <button className="font-bold" onClick={handleEditTextBold}>
          bold
        </button>
        <input type="color" name="" id="" onChange={handleEditTextColor} />
      </div>
      <div>
        {body.map((body, index) => {
          switch (body.type) {
            case "header1": {
              return (
                <h1 key={index} id={`${body.type}-${index}`}>
                  {body.children.map((child) => child.text)}
                </h1>
              );
            }
            case "paragraph": {
              return (
                <p key={index} id={`${body.type}-${index}`}>
                  {body.children.map((child, childIndex) => (
                    <span
                      key={childIndex}
                      id={`${body.type}-${index}-${childIndex}`}
                      style={{
                        fontWeight: child.bold ? "bold" : "normal",
                        color: child.color,
                      }}
                    >
                      {child.text}
                    </span>
                  ))}
                </p>
              );
            }
            default: {
              return (
                <p key={index}>{body.children.map((child) => child.text)}</p>
              );
            }
          }
        })}
      </div>
    </main>
  );
}
