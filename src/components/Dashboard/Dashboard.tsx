import React, { useState } from 'react';
import type { Transaction } from '../../types/transaction';
import type { RecurringExpense, CategoryBudget } from '../../types/database';
import type { SavingsGoal } from '../../types/savingsGoal';
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenseWithRecurring,
  calculateMonthlyBalanceWithRecurring
} from '../../utils/calculations';
import { getKSTDate } from '../../utils/dateUtils';
import BalanceCard from './BalanceCard';
import CurrentTimeDisplay from './CurrentTimeDisplay';
import { TransactionCalendar } from '../Calendar';
import { StatisticsDashboard } from '../Statistics';
import RecurringExpenseManager from '../RecurringExpenses/RecurringExpenseManager';
import { SavingsGoalManager } from '../SavingsGoals';

/**
 * 대시보드 뷰 모드 타입
 * - summary: 요약 보기 (현재 달 기준 수입/지출/잔액)
 * - calendar: 캘린더 보기 (월별 거래 내역 캘린더 형식)
 * - statistics: 통계 분석 (차트 및 분석 데이터)
 * - recurring-expenses: 고정지출 (매월 반복되는 지출 관리)
 * - savings-goals: 저축 목표 (저축 목표 관리)
 */
export type ViewMode = 'summary' | 'calendar' | 'statistics' | 'recurring-expenses' | 'savings-goals';

/**
 * Dashboard 컴포넌트의 Props 정의
 */
interface DashboardProps {
  /** 전체 거래 내역 배열 */
  transactions: Transaction[];
  /** 고정지출 내역 배열 */
  recurringExpenses?: RecurringExpense[];
  /** 고정지출 변경 시 호출되는 콜백 함수 */
  onRecurringExpensesChange?: (expenses: RecurringExpense[]) => void;
  /** 카테고리 예산 내역 배열 */
  categoryBudgets?: CategoryBudget[];
  /** 카테고리 예산 변경 시 호출되는 콜백 함수 */
  onCategoryBudgetsChange?: (budgets: CategoryBudget[]) => void;
  /** 저축 목표 내역 배열 */
  savingsGoals?: SavingsGoal[];
  /** 저축 목표 변경 시 호출되는 콜백 함수 */
  onSavingsGoalsChange?: (goals: SavingsGoal[]) => void;
  /** 뷰 모드 변경 시 호출되는 콜백 함수 */
  onViewModeChange?: (mode: ViewMode) => void;
  /** 현재 선택된 뷰 모드 (기본값: 'summary') */
  currentViewMode?: ViewMode;
  /** 캘린더에서 날짜 클릭 시 호출되는 콜백 함수 */
  onCalendarDateClick?: ((date?: Date) => void) | undefined;
  /** 거래 삭제 시 호출되는 콜백 함수 */
  onDeleteTransaction?: ((id: string) => void) | undefined;
  /** 거래 수정 시 호출되는 콜백 함수 */
  onEditTransaction?: ((transaction: Transaction) => void) | undefined;
}

/**
 * 대시보드 메인 컴포넌트
 *
 * 가계부의 메인 화면으로, 수입/지출/잔액 요약, 캘린더 뷰, 통계 분석을 제공합니다.
 * 세 가지 뷰 모드(요약/캘린더/통계) 간 전환이 가능합니다.
 *
 * @component
 * @example
 * ```tsx
 * <Dashboard
 *   transactions={transactions}
 *   currentViewMode="summary"
 *   onViewModeChange={setViewMode}
 *   onCalendarDateClick={handleDateClick}
 * />
 * ```
 */
const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  recurringExpenses = [],
  onRecurringExpensesChange,
  categoryBudgets,
  onCategoryBudgetsChange,
  savingsGoals,
  onSavingsGoalsChange,
  onViewModeChange,
  currentViewMode = 'summary',
  onCalendarDateClick,
  onDeleteTransaction,
  onEditTransaction
}) => {
  const today = getKSTDate();
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth());

  /**
   * 뷰 모드 변경 핸들러
   *
   * @param mode - 변경할 뷰 모드
   */
  const handleViewModeChange = (mode: ViewMode): void => {
    onViewModeChange?.(mode);
  };

  /**
   * 캘린더 월 변경 핸들러
   *
   * 캘린더 뷰에서 월을 변경할 때 호출되며, 내부 상태를 업데이트합니다.
   *
   * @param year - 변경할 연도
   * @param month - 변경할 월 (0-11)
   */
  const handleCalendarMonthChange = (year: number, month: number): void => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  // 요약 보기: 현재 달 기준, 캘린더 보기: 캘린더에서 보고 있는 달 기준
  const displayYear = currentViewMode === 'calendar' ? calendarYear : today.getFullYear();
  const displayMonth = currentViewMode === 'calendar' ? calendarMonth : today.getMonth();

  const totalIncome = calculateMonthlyIncome(transactions, displayYear, displayMonth);
  const totalExpense = calculateMonthlyExpenseWithRecurring(transactions, recurringExpenses, displayYear, displayMonth);
  const balance = calculateMonthlyBalanceWithRecurring(transactions, recurringExpenses, displayYear, displayMonth);

  return (
    <div>
      {/* 오늘 날짜 표시 */}
      <CurrentTimeDisplay />

      {/* 이번달 표시 - 고정지출, 통계, 저축 목표 탭에서는 숨김 */}
      {currentViewMode !== 'recurring-expenses' && currentViewMode !== 'statistics' && currentViewMode !== 'savings-goals' && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
            {currentViewMode === 'calendar'
              ? `${displayYear}년 ${displayMonth + 1}월`
              : '이번달'
            }
          </h2>
        </div>
      )}

      {/* 잔액 카드들 - 요약 및 캘린더 탭에서만 표시 */}
      {(currentViewMode === 'summary' || currentViewMode === 'calendar') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <BalanceCard
            title="총 수입"
            amount={totalIncome}
            icon="📈"
            type="income"
          />

          <BalanceCard
            title="총 지출"
            amount={totalExpense}
            icon="📉"
            type="expense"
          />

          <BalanceCard
            title="잔액"
            amount={balance}
            icon="💳"
            type="balance"
          />
        </div>
      )}

      {/* 뷰 모드 선택 탭 - 모바일 개선 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 mb-4 md:mb-6 overflow-hidden transition-colors duration-300">
        <div className="grid grid-cols-5">
          <button
            onClick={() => handleViewModeChange('summary')}
            className={`
              px-1 sm:px-4 py-2.5 sm:py-4 font-medium transition-colors touch-manipulation
              ${currentViewMode === 'summary'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }
            `}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2">
              <span className="text-lg sm:text-xl">📊</span>
              <span className="text-[10px] sm:text-sm">요약</span>
            </div>
          </button>
          <button
            onClick={() => handleViewModeChange('calendar')}
            className={`
              px-1 sm:px-4 py-2.5 sm:py-4 font-medium transition-colors border-l dark:border-gray-700 touch-manipulation
              ${currentViewMode === 'calendar'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }
            `}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2">
              <span className="text-lg sm:text-xl">📅</span>
              <span className="text-[10px] sm:text-sm">캘린더</span>
            </div>
          </button>
          <button
            onClick={() => handleViewModeChange('recurring-expenses')}
            className={`
              px-1 sm:px-4 py-2.5 sm:py-4 font-medium transition-colors border-l dark:border-gray-700 touch-manipulation
              ${currentViewMode === 'recurring-expenses'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }
            `}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2">
              <span className="text-lg sm:text-xl">💳</span>
              <span className="text-[10px] sm:text-sm">고정지출</span>
            </div>
          </button>
          <button
            onClick={() => handleViewModeChange('savings-goals')}
            className={`
              px-1 sm:px-4 py-2.5 sm:py-4 font-medium transition-colors border-l dark:border-gray-700 touch-manipulation
              ${currentViewMode === 'savings-goals'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }
            `}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2">
              <span className="text-lg sm:text-xl">💰</span>
              <span className="text-[10px] sm:text-sm">저축</span>
            </div>
          </button>
          <button
            onClick={() => handleViewModeChange('statistics')}
            className={`
              px-1 sm:px-4 py-2.5 sm:py-4 font-medium transition-colors border-l dark:border-gray-700 touch-manipulation
              ${currentViewMode === 'statistics'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }
            `}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2">
              <span className="text-lg sm:text-xl">📈</span>
              <span className="text-[10px] sm:text-sm">통계</span>
            </div>
          </button>
        </div>
      </div>

      {/* 선택된 뷰 표시 */}
      {currentViewMode === 'calendar' && (
        <TransactionCalendar
          transactions={transactions}
          recurringExpenses={recurringExpenses}
          onDateClick={onCalendarDateClick}
          onMonthChange={handleCalendarMonthChange}
          onDeleteTransaction={onDeleteTransaction}
          onEditTransaction={onEditTransaction}
        />
      )}

      {currentViewMode === 'statistics' && (
        <StatisticsDashboard
          transactions={transactions}
          recurringExpenses={recurringExpenses}
          categoryBudgets={categoryBudgets}
        />
      )}

      {currentViewMode === 'recurring-expenses' && (
        <RecurringExpenseManager
          {...(recurringExpenses !== undefined && { expenses: recurringExpenses })}
          {...(onRecurringExpensesChange !== undefined && { onExpensesChange: onRecurringExpensesChange })}
          {...(categoryBudgets !== undefined && { budgets: categoryBudgets })}
          {...(onCategoryBudgetsChange !== undefined && { onBudgetsChange: onCategoryBudgetsChange })}
        />
      )}

      {currentViewMode === 'savings-goals' && (
        <SavingsGoalManager
          {...(savingsGoals !== undefined && { goals: savingsGoals })}
          {...(onSavingsGoalsChange !== undefined && { onGoalsChange: onSavingsGoalsChange })}
        />
      )}
    </div>
  );
};

export default Dashboard;