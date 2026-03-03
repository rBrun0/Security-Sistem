export const NR_STANDARDS = Array.from({ length: 38 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    value: `NR-${number}`,
    label: `NR-${number}`,
  };
});
