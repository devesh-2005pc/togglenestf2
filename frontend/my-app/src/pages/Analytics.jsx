import "../theme/Analytics.css";
import { useState, useEffect, useRef } from "react";
import {
  FaSyncAlt,
  FaArrowUp,
  FaClock,
  FaCheckCircle,
  FaBullseye
} from "react-icons/fa";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const Analytics = () => {
  const refreshCount = useRef(0);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("--");

  const [teamVelocity] = useState(1);
  const [avgCycleTime, setAvgCycleTime] = useState("3.2");
  const [completionRate, setCompletionRate] = useState(60);

  const [cumulativeFlow, setCumulativeFlow] = useState([]);
  const [burndownData, setBurndownData] = useState([]);

  /* -------------------- DATA GENERATION -------------------- */

  const generateCumulativeFlow = (level) => {
    return Array.from({ length: 10 }, (_, i) => {
      if (i === 0) {
        return {
          date: "Day 1",
          todo: 10,
          progress: 0,
          review: 0,
          done: 0
        };
      }

      const growth = Math.min(level + i * 0.25, 6);

      return {
        date: `Day ${i + 1}`,
        todo: Math.max(10 - growth - i * 0.4, 1),
        progress: Math.max(1 + growth * 0.3, 1),
        review: Math.max(growth * 0.25, 0),
        done: Math.max(growth + i * 0.5, 0)
      };
    });
  };

  const generateBurndown = (level) => {
    const sprintTotal = 30;

    return Array.from({ length: 10 }, (_, i) => {
      if (i === 0) {
        return {
          day: "Day 1",
          ideal: sprintTotal,
          actual: sprintTotal
        };
      }

      const ideal = sprintTotal - (sprintTotal / 9) * i;
      const actual =
        sprintTotal -
        (level * 2 + i * 2 + Math.floor(Math.random() * 1.2));

      return {
        day: `Day ${i + 1}`,
        ideal: Math.max(ideal, 0),
        actual: Math.max(actual, 0)
      };
    });
  };

  /* -------------------- REFRESH LOGIC -------------------- */

  const fetchAnalytics = () => {
    setIsRefreshing(true);
    refreshCount.current += 1;

    setTimeout(() => {
      const level =
        refreshCount.current < 6
          ? refreshCount.current * 0.4
          : 2 + refreshCount.current * 0.3;

      // Avg Cycle Time (1.0 – 7.0, small decimals)
      const baseCycle = 3.2;
      const improvement = Math.min(level * 0.15, 2);
      const noise = Math.random() * 0.2 - 0.1;

      const avgTime = Math.max(
        1,
        Math.min(7, baseCycle - improvement + noise)
      );

      setAvgCycleTime(avgTime.toFixed(1));
      setCompletionRate(Math.min(60 + level * 6, 95));

      setCumulativeFlow(generateCumulativeFlow(level));
      setBurndownData(generateBurndown(level));

      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 700);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* -------------------- UI -------------------- */

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <button className="btn primary" onClick={fetchAnalytics}>
          {isRefreshing ? <FaSyncAlt className="spin" /> : <FaSyncAlt />} Refresh
        </button>
      </div>

      <main className="analytics-main">
        {/* METRICS */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="icon blue"><FaArrowUp /></div>
            <h2>{teamVelocity}</h2>
            <p>Team Velocity</p>
          </div>

          <div className="metric-card">
            <div className="icon yellow"><FaClock /></div>
            <h2>{avgCycleTime}</h2>
            <p>Avg Cycle Time</p>
          </div>

          <div className="metric-card">
            <div className="icon green"><FaCheckCircle /></div>
            <h2>{completionRate}%</h2>
            <p>Completion Rate</p>
          </div>

          <div className="metric-card">
            <div className="icon teal"><FaBullseye /></div>
            <h2>{completionRate > 80 ? "Healthy" : "At Risk"}</h2>
            <p>Sprint Health</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Cumulative Flow</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cumulativeFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area stackId="1" dataKey="todo" fill="#94a3b8" />
                <Area stackId="1" dataKey="progress" fill="#3b82f6" />
                <Area stackId="1" dataKey="review" fill="#facc15" />
                <Area stackId="1" dataKey="done" fill="#22c55e" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Sprint Burndown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" />
                <Line dataKey="actual" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="last-updated">Last updated: {lastUpdated}</p>
      </main>
    </div>
  );
};

export default Analytics;
