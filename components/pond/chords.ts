export const pickupPositions = [
  { x: 0.25, y: 0.57 },
  { x: 0.56, y: 0.32 },
  { x: 0.76, y: 0.68 },
];
export const roots = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
export const voicings = [
  "open fifth",
  "major",
  "minor",
  "sus2",
  "sus4",
  "diminished",
  "augmented",
  "major sixth",
  "minor sixth",
  "major seventh",
  "dominant seventh",
  "minor seventh",
  "minor-major seventh",
  "major add9",
  "minor add9",
  "open major",
  "open minor",
  "stacked fourths",
  "stacked fifths",
  "octaves",
] as const;

const degrees: Record<number, string> = {
  0: "root",
  2: "second",
  3: "♭third",
  4: "third",
  5: "fourth",
  6: "♭fifth",
  7: "fifth",
  8: "♯fifth",
  9: "sixth",
  10: "♭seventh",
  11: "seventh",
  12: "octave",
  14: "ninth",
  15: "♭tenth",
  16: "tenth",
  24: "2 octaves",
};

export function readChord(bytes: Uint8Array) {
  const [root, voicing, bass] = bytes;
  const notes = Array.from(bytes.subarray(2, 5), (midi, i) => ({
    hz: 440 * 2 ** ((midi - 69) / 12),
    note: roots[midi % 12] + (Math.floor(midi / 12) - 1),
    label: degrees[bytes[5 + i]],
  }));
  return { root, voicing, bass: bass % 12, notes };
}
