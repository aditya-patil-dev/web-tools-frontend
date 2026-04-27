"use client";

import { FEATURES } from "./features.config";
import DynamicIcon from "@/components/ui/DynamicIcon";

interface Feature {
    icon: string;
    title: string;
    description: string;
}
interface WhyChooseUsConfig {
    header: { title: string; subtitle: string };
    features: Feature[];
}
interface WhyChooseUsProps {
    config?: WhyChooseUsConfig;
}

const DEFAULT_CONFIG: WhyChooseUsConfig = {
    header: {
        title: "Why Choose <span>Us</span>",
        subtitle: "Built to help you work faster, smarter, and more efficiently — without unnecessary complexity.",
    },
    features: FEATURES,
};

export default function WhyChooseUs({ config = DEFAULT_CONFIG }: WhyChooseUsProps) {
    return (
        <section className="why-wrapper">
            <div className="why-container">
                <div className="why-header">
                    <h2 dangerouslySetInnerHTML={{ __html: config.header.title }} />
                    <p>{config.header.subtitle}</p>
                </div>

                <div className="why-grid">
                    {config.features.map((feature, index) => (
                        <div key={index} className="why-card">
                            <div className="why-icon">
                                {/* DynamicIcon: accepts emoji OR any react-icons name e.g. "HiOutlineSparkles" */}
                                <DynamicIcon name={feature.icon} size={28} fallback={<span>✨</span>} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}