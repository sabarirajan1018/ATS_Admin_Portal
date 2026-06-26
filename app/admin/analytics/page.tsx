'use client';

import { useMemo } from 'react';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { candidates } from '@/lib/mock-data';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  Brain,
  Building2,
  CheckCircle2,
  TrendingUp,
  Users,
} from 'lucide-react';

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

export default function AnalyticsPage() {
  const { candidates: liveCandidates, employerRequests } = useAdminStore();

  const stats = useMemo(() => {
    const total = liveCandidates.length;
    const approved = liveCandidates.filter((c) => c.status === 'approved').length;
    const rejected = liveCandidates.filter((c) => c.status === 'rejected').length;
    const pending = liveCandidates.filter((c) => c.status === 'pending').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    const aiApproved = liveCandidates.filter((c) => c.aiStatus === 'approved').length;
    const aiRejected = liveCandidates.filter((c) => c.aiStatus === 'rejected').length;
    const aiAccuracy = aiApproved + aiRejected > 0 ? Math.round((aiApproved / (aiApproved + aiRejected)) * 100) : 0;
    const avgConfidence =
      liveCandidates.reduce((acc, c) => acc + c.aiExtracted.confidenceScore, 0) /
      (liveCandidates.filter((c) => c.aiExtracted.confidenceScore > 0).length || 1);

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate,
      aiAccuracy,
      avgConfidence: Math.round(avgConfidence),
    };
  }, [liveCandidates]);

  const occupationData = useMemo(() => {
    const counts = new Map<string, number>();
    liveCandidates.forEach((c) => {
      counts.set(c.occupation, (counts.get(c.occupation) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [liveCandidates]);

  const countryData = useMemo(() => {
    const counts = new Map<string, number>();
    liveCandidates.forEach((c) => {
      counts.set(c.country, (counts.get(c.country) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [liveCandidates]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, i) => ({
      month: m,
      candidates: 8 + i * 3 + Math.floor(Math.random() * 5),
      approvals: 4 + i * 2 + Math.floor(Math.random() * 4),
      aiProcessed: 6 + i * 2 + Math.floor(Math.random() * 4),
    }));
  }, []);

  const caseStageData = useMemo(() => {
    const stages = [
      'Profile Created',
      'Documents',
      'AI Processing',
      'Admin Review',
      'Matching',
      'Contact',
      'Visa',
      'Final',
    ];
    return stages.map((stage, idx) => {
      const count = liveCandidates.filter((c) => {
        const stageOrder = [
          'profile_created',
          'documents_uploaded',
          'ai_processing',
          'admin_review',
          'employer_matching',
          'contact_request',
          'visa_assessment',
          'final_approval',
        ];
        return stageOrder.indexOf(c.caseStatus) >= idx;
      }).length;
      return { stage, count };
    });
  }, [liveCandidates]);

  const aiAccuracyData = useMemo(
    () => [
      { metric: 'Skills Extraction', score: 94 },
      { metric: 'Experience', score: 88 },
      { metric: 'Education', score: 96 },
      { metric: 'Occupation Match', score: 91 },
      { metric: 'Certifications', score: 89 },
      { metric: 'Summary Quality', score: 92 },
    ],
    [],
  );

  const employerActivity = useMemo(() => {
    const approved = employerRequests.filter((r) => r.status === 'approved').length;
    const pending = employerRequests.filter((r) => r.status === 'pending').length;
    const rejected = employerRequests.filter((r) => r.status === 'rejected').length;
    return [
      { name: 'Approved', value: approved, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Rejected', value: rejected, color: '#f43f5e' },
    ];
  }, [employerRequests]);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Visual insights and KPIs across the recruitment pipeline."
      />

      <div className="space-y-6 p-4 lg:p-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Candidates"
            value={stats.total}
            icon={Users}
            sparkData={monthlyData.map((d) => d.candidates)}
            color="#0ea5e9"
          />
          <KpiCard
            label="Approval Rate"
            value={`${stats.approvalRate}%`}
            icon={CheckCircle2}
            sparkData={monthlyData.map((d) => d.approvals)}
            color="#10b981"
          />
          <KpiCard
            label="AI Accuracy"
            value={`${stats.aiAccuracy}%`}
            icon={Brain}
            sparkData={monthlyData.map((d) => d.aiProcessed)}
            color="#8b5cf6"
          />
          <KpiCard
            label="Avg AI Confidence"
            value={`${stats.avgConfidence}%`}
            icon={TrendingUp}
            sparkData={[72, 78, 84, 86, 88, stats.avgConfidence]}
            color="#f59e0b"
          />
        </div>

        {/* Charts grid row 1 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Candidate Growth"
            subtitle="Monthly registrations and approvals"
            icon={Activity}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="candidates"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0ea5e9' }}
                  activeDot={{ r: 5 }}
                  name="Registered"
                />
                <Line
                  type="monotone"
                  dataKey="approvals"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  name="Approved"
                />
                <Line
                  type="monotone"
                  dataKey="aiProcessed"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#8b5cf6' }}
                  name="AI Processed"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="AI Processing Accuracy"
            subtitle="Accuracy by extraction category"
            icon={Brain}
          >
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={aiAccuracyData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar
                  name="Accuracy"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            title="Occupation Distribution"
            subtitle="Candidates by occupation"
            icon={Users}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={occupationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {occupationData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span className="text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Employer Activity"
            subtitle="Employer request breakdown"
            icon={Building2}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={employerActivity}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {employerActivity.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Case Pipeline"
            subtitle="Candidates at each stage"
            icon={Activity}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={caseStageData} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#0ea5e9" name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 3: Country bar */}
        <ChartCard
          title="Candidates by Country"
          subtitle="Geographic distribution of registered candidates"
          icon={Users}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={countryData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Candidates">
                {countryData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AI accuracy detailed */}
        <ChartCard
          title="AI Processing Accuracy Details"
          subtitle="How accurate is the AI extraction across different fields"
          icon={Brain}
        >
          <div className="space-y-3">
            {aiAccuracyData.map((item) => (
              <div key={item.metric}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.metric}</span>
                  <span className="font-bold text-slate-900">{item.score}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-500 transition-all duration-700"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  sparkData,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  sparkData: number[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <span className="text-xs font-medium text-emerald-600">+12%</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <div className="mt-2 flex items-end gap-0.5" style={{ height: 32 }}>
        {sparkData.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t transition-all"
            style={{
              height: `${(v / Math.max(...sparkData)) * 100}%`,
              backgroundColor: color,
              opacity: 0.3 + (i / sparkData.length) * 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
