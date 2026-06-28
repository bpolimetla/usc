import { useState } from "react";

const KEY = "usc_votes";

export function loadVotes() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function saveVotes(v) {
  localStorage.setItem(KEY, JSON.stringify(v));
}

export function useVotes() {
  const [votes, setVotes] = useState(loadVotes);

  const vote = (name, dir) => {
    setVotes((prev) => {
      const next = { ...prev };
      if (prev[name] === dir) delete next[name]; // toggle off if same
      else next[name] = dir;
      saveVotes(next);
      return next;
    });
  };

  return { votes, vote };
}
