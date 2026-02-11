import type { Preview } from "@storybook/react";

import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Basic",
          "Form",
          "Feedback",
          "Overlay",
          "Navigation",
          "Data",
          "Layout",
          "Shared",
        ],
      },
    },
    layout: "centered",
  },
};

export default preview;
