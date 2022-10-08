const translator = document.createElement("div");
translator.setAttribute("id", "translatorExtensionContainer");
translator.classList.add("translatorExtension");
const translatorTip = document.createElement("div");
translatorTip.classList.add("translatorExtension");
const globalStyle = document.createElement("style");
globalStyle.innerHTML = `
.translatorExtension {
  font-family: Segoe UI, "Segoe UI Web (West European)", -apple-system,
    BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif;
  display: none;
  padding: 4px;
  position:absolute;
  z-index:999999999;
  max-width: 30vw;
  line-height: 1.5em;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 15px;
}
`;
document.head.appendChild(globalStyle);
setStyle(translatorTip, {
  position: "fixed",
  display: "flex",
  justifyContent: "center",
  bottom: "-40vh",
  left: "0",
  right: "0",
  margin: "0 auto",
  width: "100%",
  transition: "all 80ms",
  visibility: "hidden",
});
document.body.appendChild(translator);
document.body.appendChild(translatorTip);
if (!localStorage.getItem("muTranslatorIsOpen")) {
  localStorage.setItem("muTranslatorIsOpen", 1);
}
document.addEventListener("mouseup", (evt) => {
  if (
    evt.target.id !== "translatorExtensionContainer" &&
    localStorage.getItem("muTranslatorIsOpen") == 1
  ) {
    const text = document.getSelection().toString();
    if (text.trim()) {
      const [originLanguage, targetLanguage] = getLangOriginAndTarget(
        text,
      );
      browser.runtime.sendMessage(
        {
          type: "deepl",
          text: text.replaceAll("/", "\\/"),
          from: originLanguage,
          to: targetLanguage,
        },
        (resp) => {
          setStyle(translator, {
            display: "block",
            top: `${evt.pageY}px`,
            left: `${evt.pageX}px`,
          });
          translator.textContent = resp;
        },
      );
    }
  }
});
document.addEventListener("mousedown", (evt) => {
  if (evt.target.id !== "translatorExtensionContainer") {
    translator.innerHTML = "";
    setStyle(translator, {
      display: "none",
    });
  }
});
document.addEventListener("keyup", (evt) => {
  if (evt.ctrlKey && evt.keyCode === 18 || evt.altKey && evt.keyCode === 17) {
    let text = "";
    if (localStorage.getItem("muTranslatorIsOpen") == 1) {
      localStorage.setItem("muTranslatorIsOpen", 0);
      text = "划词翻译已关闭";
    } else {
      localStorage.setItem("muTranslatorIsOpen", 1);
      text = "划词翻译已开启";
    }
    translatorTip.innerText = text;
    setStyle(translatorTip, {
      bottom: "8px",
      visibility: "visible",
    });
    const st = setTimeout(() => {
      setStyle(translatorTip, {
        bottom: "-40vh",
        visibility: "hidden",
      });
      clearTimeout(st);
    }, 2000);
  }
});
function isChinese(text) {
  return /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(text);
}

function setStyle(e, s) {
  for (const k in s) {
    const v = s[k];
    if (typeof v === "string") {
      e.style[k] = v;
    }
  }
}

function getLangOriginAndTarget(text) {
  const o = isChinese(text) ? "zh" : "en";
  const t = o === "en" ? "zh" : "en";
  return [o, t];
}
