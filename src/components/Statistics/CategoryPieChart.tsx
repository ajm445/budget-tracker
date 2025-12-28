import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryExpenseData } from '../../types/statistics';
import type { CategoryBudget } from '../../types/database';

interface CategoryPieChartProps {
  data: CategoryExpenseData[];
  budgets?: CategoryBudget[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, budgets = [] }) => {
  // 예산 맵 생성
  const budgetMap = useMemo(() => {
    console.log('💰 CategoryPieChart: Creating budget map from', budgets);
    const map = new Map<string, number>();
    budgets.forEach(budget => {
      if (budget.is_active) {
        console.log(`  ✅ Adding budget for ${budget.category}: ${budget.budget_amount} KRW`);
        map.set(budget.category, budget.budget_amount);
      } else {
        console.log(`  ⚠️ Skipping inactive budget for ${budget.category}`);
      }
    });
    console.log('📋 Budget map:', map);
    return map;
  }, [budgets]);

  // 데이터 (이미 KRW)
  const chartData = useMemo(() => data, [data]);

  // 총 지출 계산 - Hook은 early return 전에 호출되어야 함
  const totalExpense = useMemo(() =>
    chartData.reduce((sum, item) => sum + item.amount, 0),
    [chartData]
  );

  // 커스텀 툴팁 - useMemo로 메모이제이션
  const CustomTooltip = useMemo(() => {
    const TooltipComponent: React.FC<{
      active?: boolean;
      payload?: Array<{ payload: CategoryExpenseData & { amount: number } }>;
    }> = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        if (!data) return null;

        return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <p className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{data.category}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              금액: <span className="font-semibold">₩{data.amount.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              비율: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
            </p>
          </div>
        );
      }
      return null;
    };
    return TooltipComponent;
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              카테고리별 지출 분포
            </h3>
            <p className="text-sm text-indigo-100 mt-0.5">
              총 지출: <span className="font-semibold">₩{totalExpense.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* 차트 영역 */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm transition-colors duration-300 mb-6">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={2}
                    stroke="#fff"
                    className="dark:stroke-gray-800"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                iconType="circle"
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 상세 목록 - 개선된 디자인 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300">
            상세 내역
          </h4>
          {chartData.map((item, index) => {
            const budgetAmount = budgetMap.get(item.category) || null;
            const budgetPercent = budgetAmount ? (item.amount / budgetAmount) * 100 : null;
            const isOverBudget = budgetPercent !== null && budgetPercent > 100;

            return (
              <div
                key={index}
                className={`group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-3 sm:p-4 border transition-all duration-200 hover:shadow-md ${
                  isOverBudget
                    ? 'border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                }`}
              >
                {/* 배경 프로그레스 바 */}
                <div
                  className={`absolute inset-0 transition-all duration-300 ${
                    isOverBudget
                      ? 'bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-900/20 dark:to-orange-900/20'
                      : 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />

                {/* 내용 */}
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-md ring-2 ring-white dark:ring-gray-800"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">
                        {item.category}
                      </span>
                      {isOverBudget && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                          예산 초과
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block px-2 py-1 bg-white/80 dark:bg-gray-700/80 rounded-md">
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-xs sm:hidden font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white transition-colors duration-300 min-w-[80px] sm:min-w-[100px] text-right">
                        ₩{item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 예산 정보 */}
                  {budgetAmount !== null && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        예산: ₩{budgetAmount.toLocaleString()}
                      </span>
                      <span className={`font-semibold ${
                        isOverBudget
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {budgetPercent !== null && budgetPercent.toFixed(1)}% 사용
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CategoryPieChart);
