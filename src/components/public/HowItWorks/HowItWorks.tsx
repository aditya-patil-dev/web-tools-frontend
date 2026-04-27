"use client";

import { STEPS } from "./steps.config";
import DynamicIcon from "@/components/ui/DynamicIcon";

interface Step {
    step: string;
    icon: string;
    title: string;
    description: string;
}
interface HowItWorksConfig {
    header: { title: string; subtitle: string };
    steps: Step[];
}
interface HowItWorksProps {
    config?: HowItWorksConfig;
}

const DEFAULT_CONFIG: HowItWorksConfig = {
    header: {
        title: "How It <span>Works</span>",
        subtitle: "Start using our tools in seconds. No learning curve, no setup.",
    },
    steps: STEPS,
};

export default function HowItWorks({ config = DEFAULT_CONFIG }: HowItWorksProps) {
    return (
        <section className="how-wrapper">
            <div className="how-container">
                <div className="how-header">
                    <h2 dangerouslySetInnerHTML={{ __html: config.header.title }} />
                    <p>{config.header.subtitle}</p>
                </div>

                <div className="how-grid">
                    {config.steps.map((step, index) => (
                        <div key={step.step} className="how-card">
                            <div className="how-step">
                                {step.step}
                            </div>

                            <div className="how-icon">
                                {/* DynamicIcon: accepts emoji OR any react-icons name e.g. "TbClick" */}
                                <DynamicIcon name={step.icon} size={28} fallback={<span>🔧</span>} />
                            </div>

                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}