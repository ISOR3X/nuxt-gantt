export default {
  slots: {
    root: "absolute text-nowrap inline-flex items-center h-full px-0.5 text-sm",
  },
  variants: {
    hasDate: {
      true: {
        root: "border-l border-muted",
      }
    }
  }
};
