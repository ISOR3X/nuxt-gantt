import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("absolute w-full border-b border-muted"),
  },
  variants: {
    highlight: {
      true: {
        root: tw(
          "z-10 before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[1px] before:bg-primary",
        ),
      },
    },
  },
};
