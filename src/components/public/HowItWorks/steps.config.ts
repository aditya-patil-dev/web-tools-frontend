export type StepItem = {
  step: string;
  title: string;
  description: string;
  icon: string;
};

export const STEPS: StepItem[] = [
  {
    step: "01",
    title: "Choose a Tool",
    description: "Browse our collection and pick the tool that fits your task.",
    icon: "🧰",
  },
  {
    step: "02",
    title: "Upload or Enter Data",
    description:
      "Upload files or enter text depending on the tool you selected.",
    icon: "📤",
  },
  {
    step: "03",
    title: "Get Instant Results",
    description:
      "Our tools process everything instantly so you can download or copy results.",
    icon: "⚡",
  },
];
