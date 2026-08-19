import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useBoardStore } from "../store/boardStore";

function Analytics() {
  const tasks = useBoardStore((state) => state.tasks);

  const analytics = useMemo(() => {
    const total = tasks.length;

    const todo = tasks.filter(
      (task) => task.status === "todo"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const review = tasks.filter(
      (task) => task.status === "review"
    ).length;

    const done = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const high = tasks.filter(
      (task) => task.priority === "High"
    ).length;

    const medium = tasks.filter(
      (task) => task.priority === "Medium"
    ).length;

    const low = tasks.filter(
      (task) => task.priority === "Low"
    ).length;

    const completionRate =
      total > 0
        ? Math.round((done / total) * 100)
        : 0;

    return {
      total,
      todo,
      inProgress,
      review,
      done,
      high,
      medium,
      low,
      completionRate,
    };
  }, [tasks]);

  /*
   * TASK STATUS
   */
  const statusData = useMemo(
    () => [
      {
        name: "To Do",
        value: analytics.todo,
      },
      {
        name: "In Progress",
        value: analytics.inProgress,
      },
      {
        name: "Review",
        value: analytics.review,
      },
      {
        name: "Done",
        value: analytics.done,
      },
    ],
    [analytics]
  );

  /*
   * PRIORITY BREAKDOWN
   */
  const priorityData = useMemo(
    () => [
      {
        name: "High",
        value: analytics.high,
      },
      {
        name: "Medium",
        value: analytics.medium,
      },
      {
        name: "Low",
        value: analytics.low,
      },
    ],
    [analytics]
  );

  /*
   * SPRINT VELOCITY
   *
   * Current board represents the current sprint.
   * Velocity = number of completed tasks.
   */
  const velocityData = useMemo(
    () => [
      {
        sprint: "Current Sprint",
        completed: analytics.done,
      },
    ],
    [analytics.done]
  );

  /*
   * COMPLETION TREND
   *
   * Uses current board status to show the
   * progression from total tasks to completed tasks.
   */
  const completionTrendData = useMemo(
    () => [
      {
        stage: "Total",
        tasks: analytics.total,
      },
      {
        stage: "To Do",
        tasks: analytics.todo,
      },
      {
        stage: "In Progress",
        tasks: analytics.inProgress,
      },
      {
        stage: "Review",
        tasks: analytics.review,
      },
      {
        stage: "Completed",
        tasks: analytics.done,
      },
    ],
    [analytics]
  );

  const statusColors = [
    "#94a3b8",
    "#3b82f6",
    "#eab308",
    "#22c55e",
  ];

  const priorityColors = [
    "#ef4444",
    "#eab308",
    "#22c55e",
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-1 text-slate-500">
          Track sprint performance and task progress
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Tasks"
          value={analytics.total}
          valueClass="text-slate-900"
        />

        <SummaryCard
          title="Completed"
          value={analytics.done}
          valueClass="text-green-600"
        />

        <SummaryCard
          title="In Progress"
          value={analytics.inProgress}
          valueClass="text-blue-600"
        />

        <SummaryCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          valueClass="text-purple-600"
        />
      </div>

      {/* CHART GRID */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* =========================
            SPRINT VELOCITY
        ========================= */}
        <ChartCard
          title="Sprint Velocity"
          description="Completed tasks in the current sprint"
        >
          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="sprint" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="completed"
                name="Completed Tasks"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* =========================
            TASK STATUS
        ========================= */}
        <ChartCard
          title="Task Status"
          description="Distribution across board columns"
        >
          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                label
                animationDuration={800}
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={`status-${index}`}
                    fill={statusColors[index]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* =========================
            PRIORITY BREAKDOWN
        ========================= */}
        <ChartCard
          title="Priority Breakdown"
          description="Tasks grouped by priority"
        >
          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart
              data={priorityData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="value"
                name="Tasks"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              >
                {priorityData.map((_, index) => (
                  <Cell
                    key={`priority-${index}`}
                    fill={priorityColors[index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* =========================
            COMPLETION TREND
        ========================= */}
        <ChartCard
          title="Completion Trend"
          description="Task progression across the sprint"
        >
          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <LineChart
              data={completionTrendData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="stage" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="tasks"
                name="Tasks"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* COMPLETION PROGRESS */}
      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Sprint Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overall completion of the current sprint
            </p>
          </div>

          <span className="text-2xl font-bold text-blue-600">
            {analytics.completionRate}%
          </span>
        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${analytics.completionRate}%`,
            }}
          />
        </div>

        <div className="mt-4 flex justify-between text-sm text-slate-500">
          <span>
            {analytics.done} completed
          </span>

          <span>
            {analytics.total - analytics.done} remaining
          </span>
        </div>
      </section>
    </main>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: number | string;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2
        className={`mt-2 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}

/* =========================
   CHART CARD
========================= */

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-5 w-full overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export default Analytics;