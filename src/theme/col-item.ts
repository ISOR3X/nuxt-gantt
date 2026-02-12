import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("absolute inline-flex h-full items-center px-0.5 text-sm text-nowrap"),
  },
  variants: {
    hasDate: {
      true: {
        root: tw("border-l border-muted"),
      },
    },
  },
};
