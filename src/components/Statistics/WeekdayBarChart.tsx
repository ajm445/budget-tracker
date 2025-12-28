import React, { useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WeekdayExpenseData } from '../../types/statistics';

interface WeekdayBarChartProps {
  data: WeekdayExpenseData[];
}

const WeekdayBarChart: React.FC<WeekdayBarChartProps> = ({ data }) => {
  // 통화 변환 함수 - useCallback으로 메모이제이션 (KRW만 사용)
  const convertAmount = useCallback((amountInKRW: number): number => {
    return amountInKRW;
  }, []);

  // 요일 순서 조정 (월~일) - useMemo로 메모이제이션
  const sortedData = useMemo(() => {
    const weekdayOrder = ['월', '화', '수', '목', '금', '토', '일'];
    return weekdayOrder
      .map(day => data.find(d => d.weekday === day))
      .filter((d): d is WeekdayExpenseData => d !== undefined);
  }, [data]);

  // 데이터를 선택된 통화로 변환 - useMemo로 메모이제이션
  const chartData = useMemo(() => sortedData.map(item => ({
    ...item,
    averageExpense: convertAmount(item.averageExpense),
    totalExpense: convertAmount(item.totalExpense),
  })), [sortedData, convertAmount]);

  // 커스텀 툴팁 - useMemo로 메모이제이션
  const CustomTooltip = useMemo(() => {
    const TooltipComponent: React.FC<{
      active?: boolean;
      payload?: Array<{ value: number; dataKey: string; color: string }>;
      label?: string;
    }> = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const data = sortedData.find(d => d.weekday === label);
        if (!data) return null;

        return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <p className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{label}요일</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              평균 지출: <span className="font-semibold">₩{convertAmount(data.averageExpense).toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              총 지출: <span className="font-semibold">₩{convertAmount(data.totalExpense).toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              거래 수: <span className="font-semibold">{data.transactionCount}건</span>
            </p>
          </div>
        );
      }
      return null;
    };
    return TooltipComponent;
  }, [sortedData, convertAmount]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  // 최대/최소 지출 요일 계산
  const maxExpenseDay = useMemo(() => sortedData.reduce((max, day) =>
    day.averageExpense > max.averageExpense ? day : max
  , sortedData[0] || { weekday: '없음', averageExpense: 0 }), [sortedData]);

  const minExpenseDay = useMemo(() => sortedData.reduce((min, day) =>
    day.averageExpense < min.averageExpense && day.averageExpense > 0 ? day : min
  , sortedData[0] || { weekday: '없음', averageExpense: Infinity }), [sortedData]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-xl">📅</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
          요일별 평균 지출
        </h3>
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm transition-colors duration-300">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" opacity={0.3} />
            <XAxis
              dataKey="weekday"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: '600' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: '500' }}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => {
                return Math.round(value).toLocaleString();
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
            <Legend
              wrapperStyle={{ fontSize: '14px', fontWeight: '600', paddingTop: '16px' }}
              iconType="rect"
            />
            <Bar
              dataKey="averageExpense"
              name="평균 지출"
              fill="url(#barGradient)"
              radius={[12, 12, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 인사이트 - 개선된 디자인 */}
      <div className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 border border-purple-200 dark:border-purple-700 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full blur-3xl opacity-20"></div>
        <div className="relative flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-base">💡</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1 transition-colors duration-300">
              생활 패턴 인사이트
            </p>
            <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-300 transition-colors duration-300">
              <span className="font-bold text-pink-700 dark:text-pink-400">{maxExpenseDay.weekday}요일</span>에 가장 많이 지출하고,{' '}
              <span className="font-bold text-purple-700 dark:text-purple-400">{minExpenseDay.weekday}요일</span>에 가장 적게 지출합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WeekdayBarChart);
