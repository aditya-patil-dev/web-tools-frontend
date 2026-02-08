import { Card } from "react-bootstrap";

export default function AdminDashboardPage() {
    return (
        <div className="adminGrid">
            <div className="metricRow">
                {[
                    { label: "Total Users", value: "12,480", icon: "bi-people" },
                    { label: "Revenue", value: "₹ 4.8L", icon: "bi-currency-rupee" },
                    { label: "Active Sessions", value: "1,023", icon: "bi-activity" },
                    { label: "Errors", value: "7", icon: "bi-exclamation-triangle" },
                ].map((m) => (
                    <div className="metricCard" key={m.label}>
                        <div className="metricIcon">
                            <i className={`bi ${m.icon}`} />
                        </div>
                        <div>
                            <div className="metricLabel">{m.label}</div>
                            <div className="metricValue">{m.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="contentRow">
                <div className="card glassCard">
                    <div className="card-body">
                        <h2 className="h6 mb-2">Quick Overview</h2>
                        <p className="muted mb-0">
                            This is your admin dashboard shell. Next we’ll plug real data, charts,
                            and modules like Users, Orders, Events, etc.
                        </p>
                    </div>
                </div>

                <div className="card glassCard">
                    <div className="card-body">
                        <h2 className="h6 mb-2">Recent Activity</h2>
                        <ul className="activityList">
                            <li>
                                <span className="dot" /> New user signed up
                            </li>
                            <li>
                                <span className="dot" /> Payment received
                            </li>
                            <li>
                                <span className="dot" /> Admin updated settings
                            </li>
                            <li>
                                <span className="dot" /> Export generated
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
