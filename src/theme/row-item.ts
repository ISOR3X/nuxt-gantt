export default {
  slots: {
    root: "absolute",
  },
  variants: {
    highlight: {
      true: {
        root: "before:absolute before:top-0 before:left-0 before:bottom-0 before:w-[1px] before:bg-primary before:pointer-events-none z-10",
      },
    },
  },
};
