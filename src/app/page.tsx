"use client";

import React, { useState } from "react";

// TODO: boldとcolorで同じような処理をしているのでリファクタリング

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
    // 新規に設定するbold
    if (isSameNode && isSameOffset) return;
    if (!startElementId) return;
    const startParentIndex = Number(startElementId.split("-")[1]);
    const startChildIndex = Number(startElementId.split("-")[2]);
    const isBold = body[startParentIndex].children[startChildIndex].bold;
    // 選択したコンテンツが異なるstyleとまたがっていない場合(1つの子コンポーネントで選択されている場合)
    if (isSameNode) {
      setBody((b) =>
        b.map((bd, index) => {
          if (index !== startParentIndex) return bd;
          const newChildren = bd.children;
          const editChild = newChildren[startChildIndex];
          /**編集前のテキスト */
          const prevText = editChild.text;
          /**指定の文字のオフセット値より前のテキストのboldはそのまま */
          const forwardChild = {
            ...editChild,
            text: prevText.slice(0, startOffset),
          };
          /**指定の文字のオフセット値より前のテキストのboldを変更 */
          const middleChild = {
            ...editChild,
            text: prevText.slice(startOffset, endOffset),
            bold: !isBold,
          };
          /**指定の文字のオフセット値より後のテキストのboldはそのまま */
          const backwardChild = {
            ...editChild,
            text: prevText.slice(endOffset),
          };
          // 元の子要素を削除し、新規の３つの子要素を挿入
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
      // 同じ親要素の場合(同じ<p></p>のchildrenで<span></sapn>が異なる場合)
      if (startParentIndex === endParentIndex) {
        setBody((b) =>
          b.map((bd, index) => {
            // 選択された親要素の場合のみ処理を行う
            if (index === startParentIndex) {
              const newChildren = bd.children;
              /**編集の始めの子要素 */
              const forwardEditChild = newChildren[startChildIndex];
              /**編集の終わりの子要素 */
              const backwardEditChild = newChildren[endChildIndex];
              /**編集前の始めの子要素のテキスト */
              const forwardPrevText = forwardEditChild.text;
              /**編集前の終わりの子要素のテキスト */
              const backwardPrevText = backwardEditChild.text;
              /**始めの文字オフセット値以前のテキストはそのまま */
              const forwardChild = {
                ...forwardEditChild,
                text: forwardPrevText.slice(0, startOffset),
              };
              /**始めの文字オフセット値以降のテキストは編集 */
              const backwardChild = {
                ...forwardEditChild,
                text: forwardPrevText.slice(startOffset),
                bold: !isBold,
              };
              /**終わりの文字オフセット値以前のテキストは編集 */
              const forwardEndChild = {
                ...backwardEditChild,
                text: backwardPrevText.slice(0, endOffset),
                bold: !isBold,
              };
              /**終わりの文字オフセット値以降のテキストはそのまま */
              const backwardEndChild = {
                ...backwardEditChild,
                text: backwardPrevText.slice(endOffset),
              };
              // 元の子要素を削除し、新規に文字オフセット値で分割された子要素を代入
              newChildren.splice(
                startChildIndex,
                1,
                forwardChild,
                backwardChild,
              );
              newChildren.splice(
                endChildIndex + 1,
                1,
                forwardEndChild,
                backwardEndChild,
              );
              return {
                ...bd,
                children: newChildren.map((child, cIndex) =>
                  // 中間の子要素にもスタイルを反映
                  cIndex > startChildIndex && cIndex <= startChildIndex + 1
                    ? { ...child, bold: !isBold }
                    : child,
                ),
              };
            } else return bd;
          }),
        );
      } else {
        // 異なる親要素の場合(別の<p>タグとまたがる場合)
        setBody((b) =>
          b.map((bd, index) => {
            // 始めの親要素
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
              newChildren.splice(
                startChildIndex,
                1,
                forwardChild,
                backwardChild,
              );
              return {
                ...bd,
                children: newChildren.map((child, cIndex) =>
                  cIndex > startChildIndex
                    ? { ...child, bold: !isBold }
                    : child,
                ),
              };
            }
            // 中間の親要素
            else if (index > startParentIndex && index < endParentIndex) {
              return {
                ...bd,
                children: bd.children.map((child) => {
                  return { ...child, bold: !isBold };
                }),
              };
            }
            // 終わりの親要素
            else if (index === endParentIndex) {
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
            // 始め以前、終わり以降の親要素
            return bd;
          }),
        );
      }
    }
  };

  const handleEditTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newColor = e.currentTarget.value;
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
    if (isSameNode && isSameOffset) return;
    if (!startElementId) return;
    const startParentIndex = Number(startElementId.split("-")[1]);
    const startChildIndex = Number(startElementId.split("-")[2]);
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
            color: newColor,
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
      if (startParentIndex === endParentIndex) {
        setBody((b) =>
          b.map((bd, index) => {
            if (index === startParentIndex) {
              const newChildren = bd.children;
              const forwardEditChild = newChildren[startChildIndex];
              const backwardEditChild = newChildren[endChildIndex];
              const forwardPrevText = forwardEditChild.text;
              const forwardChild = {
                ...forwardEditChild,
                text: forwardPrevText.slice(0, startOffset),
              };
              const backwardChild = {
                ...forwardEditChild,
                text: forwardPrevText.slice(startOffset),
                color: newColor,
              };
              newChildren.splice(
                startChildIndex,
                1,
                forwardChild,
                backwardChild,
              );
              const backwardPrevText = backwardEditChild.text;
              const forwardEndChild = {
                ...backwardEditChild,
                text: backwardPrevText.slice(0, endOffset),
                color: newColor,
              };
              const backwardEndChild = {
                ...backwardEditChild,
                text: backwardPrevText.slice(endOffset),
              };
              newChildren.splice(
                endChildIndex + 1,
                1,
                forwardEndChild,
                backwardEndChild,
              );
              const newObj = {
                ...bd,
                children: newChildren.map((child, cIndex) =>
                  cIndex > startChildIndex && cIndex <= endChildIndex + 1
                    ? { ...child, color: newColor }
                    : child,
                ),
              };
              console.log("new:", newObj);
              return newObj;
            } else return bd;
          }),
        );
      } else {
        setBody((b) =>
          b.map((bd, index) => {
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
                color: newColor,
              };
              newChildren.splice(
                startChildIndex,
                1,
                forwardChild,
                backwardChild,
              );
              return {
                ...bd,
                children: newChildren.map((child, cIndex) =>
                  cIndex > startChildIndex
                    ? { ...child, color: newColor }
                    : child,
                ),
              };
            } else if (index > startParentIndex && index < endParentIndex) {
              return {
                ...bd,
                children: bd.children.map((child) => {
                  return { ...child, color: newColor };
                }),
              };
            } else if (index === endParentIndex) {
              const newChildren = bd.children;
              const editChild = newChildren[endChildIndex];
              const prevText = editChild.text;
              const forwardChild = {
                ...editChild,
                text: prevText.slice(0, endOffset),
                color: newColor,
              };
              const backwardChild = {
                ...editChild,
                text: prevText.slice(endOffset),
              };
              newChildren.splice(endChildIndex, 1, forwardChild, backwardChild);
              return {
                ...bd,
                children: newChildren.map((child, cIndex) =>
                  cIndex <= endChildIndex
                    ? { ...child, color: newColor }
                    : child,
                ),
              };
            }
            return bd;
          }),
        );
      }
    }
  };

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
      <div>
        {JSON.stringify(body, null, 2)
          .split("\n")
          .map((json, index) => (
            <pre key={index}>
              {json}
              <br />
            </pre>
          ))}
      </div>
    </main>
  );
}
