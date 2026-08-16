"use client";

import * as React from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import php from "highlight.js/lib/languages/php";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";

import "highlight.js/styles/github-dark-dimmed.css";

let registered = false;
function ensureLanguages() {
  if (registered) return;
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("php", php);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("cpp", cpp);
  hljs.registerLanguage("c++", cpp);
  hljs.registerLanguage("shell", bash);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("json", json);
  registered = true;
}

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    ensureLanguages();
    if (ref.current) {
      ref.current.removeAttribute("data-highlighted");
      hljs.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <pre className="overflow-x-auto rounded-md bg-[#0d1117] p-4 text-xs">
      <code ref={ref} className={`language-${language.toLowerCase()}`}>
        {code}
      </code>
    </pre>
  );
}
