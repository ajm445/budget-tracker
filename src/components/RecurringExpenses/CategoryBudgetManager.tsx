import React, { useState, useEffect } from 'react';
import type { CategoryBudget } from '../../types/database';
import { EXPENSE_CATEGORIES } from '../../types/transaction';
import { useAuth } from '../../contexts/AuthContext';
import {
  addCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
  fetchCategoryBudgetsByYearMonth,
  copyPreviousMonthBudgets,
} from '../../services/categoryBudgetService';
import toast from 'react-hot-toast';

type Currency = 'KRW' | 'USD' | 'JPY';

// Currency conversion function
const convertFromKRW = (amount: number): number => amount; // KRW only, no conversion needed

interface CategoryBudgetManagerProps {
  budgets?: CategoryBudget[] | undefined;
  onBudgetsChange?: ((budgets: CategoryBudget[]) => void) | undefined;
}

/**
 * CategoryBudgetManager 컴포넌트
 * 카테고리별 월별 예산을 설정하고 관리하는 컴포넌트
 */
const CategoryBudgetManager: React.FC<CategoryBudgetManagerProps> = ({
  budgets: externalBudgets,
  onBudgetsChange
}) => {
  const { user } = useAuth();
  const currentCurrency = 'KRW' as Currency;

  // 선택된 년월 상태 (기본값: 현재 년월)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 외부 props 사용
  const budgets = externalBudgets || [];

  // 통화 포맷팅
  const formatCurrency = (amount: number, currency: Currency): string => {
    const currencyMap = {
      KRW: { symbol: '₩', decimals: 0 },
      USD: { symbol: '$', decimals: 2 },
      JPY: { symbol: '¥', decimals: 0 },
    };

    const { symbol, decimals } = currencyMap[currency];
    return `${symbol}${amount.toLocaleString('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  // KRW만 사용 (통화 변환 불필요)

  // 새 예산 입력 폼 상태
  const [newBudget, setNewBudget] = useState<{
    category: string;
    amount: string;
  }>({
    category: '',
    amount: '',
  });

  // 수정 중인 예산 상태
  const [editingBudget, setEditingBudget] = useState<{
    amount: string;
  }>({
    amount: '',
  });

  // 숫자 포맷팅 함수 (쉼표 추가)
  const formatNumberWithCommas = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';

    // 천 단위 구분 쉼표 추가
    return Number(numbers).toLocaleString('ko-KR');
  };

  // 쉼표 제거하여 숫자만 추출
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // 예산 데이터는 MainApp에서 props로 전달받아 관리
  // 실시간 구독도 MainApp에서 관리

  // 선택된 년월이 변경되면 해당 월의 예산을 로드 (user 변경 시에는 로드하지 않음)
  // user 변경(로그아웃)은 MainApp에서 처리
  useEffect(() => {
    const loadBudgetsByYearMonth = async () => {
      if (user) {
        // 로그인 상태: Supabase에서 조회
        const { data, error } = await fetchCategoryBudgetsByYearMonth(selectedYear, selectedMonth);
        if (error) {
          console.error('Failed to load budgets by year/month:', error);
          if (onBudgetsChange) {
            onBudgetsChange([]);
          }
        } else if (data && onBudgetsChange) {
          onBudgetsChange(data);
        }
      } else {
        // 비로그인 상태: localStorage에서 조회
        const { loadCategoryBudgetsFromLocal } = await import('../../utils/localStorageBudget');
        const localBudgets = loadCategoryBudgetsFromLocal(selectedYear, selectedMonth);
        console.log(`📦 Loading budgets from localStorage for ${selectedYear}-${selectedMonth}:`, localBudgets.length);
        if (onBudgetsChange) {
          onBudgetsChange(localBudgets);
        }
      }
    };

    void loadBudgetsByYearMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.amount) {
      setError('카테고리와 금액을 모두 입력해주세요.');
      return;
    }

    const amount = parseFloat(removeCommas(newBudget.amount));
    if (isNaN(amount) || amount <= 0) {
      setError('올바른 금액을 입력해주세요.');
      return;
    }

    // 이미 존재하는 카테고리인지 확인
    if (budgets.some((b) => b.category === newBudget.category)) {
      setError('이미 해당 카테고리의 예산이 설정되어 있습니다.');
      return;
    }

    // 로그인 상태면 Supabase에 저장
    if (user) {
      try {
        const { data: addedBudget, error: addError } = await addCategoryBudget({
          category: newBudget.category,
          year: selectedYear,
          month: selectedMonth,
          budget_amount: amount,
        });

        if (addError) {
          // 중복 키 오류인 경우 특별 처리 - 비활성화된 데이터가 남아있을 수 있음
          if ('code' in addError && addError.code === '23505') {
            setError('데이터베이스에 이전 예산 데이터가 남아있습니다. 잠시 후 다시 시도해주세요.');
            toast.error('이전 예산 데이터가 남아있습니다. 관리자에게 문의하거나 다른 카테고리를 선택해주세요.');
          } else {
            throw addError;
          }
          return;
        }

        // 즉시 UI 업데이트 (실시간 구독을 기다리지 않음)
        if (addedBudget && onBudgetsChange) {
          onBudgetsChange([...budgets, addedBudget]);
        }

        // 폼 초기화
        setNewBudget({
          category: '',
          amount: '',
        });
        setError(null);
        setShowAddModal(false);
        toast.success('예산이 추가되었습니다.');
      } catch (err) {
        console.error('Failed to add budget:', err);
        setError('예산 추가에 실패했습니다.');
        toast.error('예산 추가에 실패했습니다.');
      }
    } else {
      // 비로그인 상태면 콜백을 통해 MainApp에 알림
      const localBudget: CategoryBudget = {
        id: `local-${Date.now()}-${Math.random()}`,
        user_id: 'local',
        category: newBudget.category,
        year: selectedYear,
        month: selectedMonth,
        budget_amount: amount,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (onBudgetsChange) {
        onBudgetsChange([...budgets, localBudget]);
      }

      // 폼 초기화
      setNewBudget({
        category: '',
        amount: '',
      });
      setError(null);
      setShowAddModal(false);
      toast.success('예산이 추가되었습니다.');
      toast('⚠️ 로그인하지 않아 데이터가 임시로만 저장됩니다.\n새로고침 시 데이터가 사라집니다.', {
        icon: '⚠️',
        duration: 4000,
      });
    }
  };

  const handleStartEdit = (budget: CategoryBudget) => {
    setEditingId(budget.id);
    setEditingBudget({
      amount: formatNumberWithCommas(budget.budget_amount.toString()),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingBudget({ amount: '' });
  };

  const handleSaveEdit = async (budgetId: string) => {
    const amount = parseFloat(removeCommas(editingBudget.amount));
    if (isNaN(amount) || amount <= 0) {
      setError('올바른 금액을 입력해주세요.');
      return;
    }

    // 로그인 상태면 Supabase에 업데이트
    if (user && !budgetId.startsWith('local-')) {
      try {
        const { data: updatedBudget, error: updateError } = await updateCategoryBudget(budgetId, {
          budget_amount: amount,
        });

        if (updateError) throw updateError;

        // 즉시 UI 업데이트 (실시간 구독을 기다리지 않음)
        if (updatedBudget && onBudgetsChange) {
          onBudgetsChange(
            budgets.map((b) => (b.id === budgetId ? updatedBudget : b))
          );
        }

        setEditingId(null);
        setError(null);
        toast.success('예산이 수정되었습니다.');
      } catch (err) {
        console.error('Failed to update budget:', err);
        setError('예산 수정에 실패했습니다.');
      }
    } else {
      // 비로그인 상태면 콜백을 통해 MainApp에 알림
      if (onBudgetsChange) {
        onBudgetsChange(
          budgets.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  budget_amount: amount,
                  updated_at: new Date().toISOString(),
                }
              : b
          )
        );
      }

      setEditingId(null);
      setError(null);
      toast.success('예산이 수정되었습니다.');
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('정말 이 예산을 삭제하시겠습니까?')) return;

    // 로그인 상태면 Supabase에서도 삭제
    if (user && !budgetId.startsWith('local-')) {
      try {
        const { error: deleteError } = await deleteCategoryBudget(budgetId);
        if (deleteError) throw deleteError;

        // 즉시 UI 업데이트 (실시간 구독을 기다리지 않음)
        if (onBudgetsChange) {
          onBudgetsChange(budgets.filter((b) => b.id !== budgetId));
        }

        setError(null);
        toast.success('예산이 삭제되었습니다.');
      } catch (err) {
        console.error('Failed to delete budget:', err);
        setError('예산 삭제에 실패했습니다.');
      }
    } else {
      // 비로그인 상태면 콜백을 통해 MainApp에 알림
      if (onBudgetsChange) {
        onBudgetsChange(budgets.filter((b) => b.id !== budgetId));
      }
      setError(null);
      toast.success('예산이 삭제되었습니다.');
    }
  };

  // 전월 예산 복사
  const handleCopyPreviousMonth = async () => {
    // 전월 계산
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

    if (!confirm(`${prevYear}년 ${prevMonth}월의 예산을 ${selectedYear}년 ${selectedMonth}월로 복사하시겠습니까?`)) {
      return;
    }

    try {
      if (user) {
        // 로그인 상태: Supabase에서 복사
        const { data: copiedBudgets, error: copyError } = await copyPreviousMonthBudgets(
          prevYear,
          prevMonth,
          selectedYear,
          selectedMonth
        );

        if (copyError) throw copyError;

        if (copiedBudgets && copiedBudgets.length > 0) {
          // 즉시 UI 업데이트
          if (onBudgetsChange) {
            onBudgetsChange(copiedBudgets);
          }
          toast.success(`${prevYear}년 ${prevMonth}월 예산을 복사했습니다. (${copiedBudgets.length}개)`);
        } else {
          toast(`${prevYear}년 ${prevMonth}월에 설정된 예산이 없습니다.`, {
            icon: 'ℹ️',
          });
        }
      } else {
        // 비로그인 상태: localStorage에서 복사
        const {
          loadCategoryBudgetsFromLocal,
          saveCategoryBudgetsToLocal
        } = await import('../../utils/localStorageBudget');

        const previousBudgets = loadCategoryBudgetsFromLocal(prevYear, prevMonth);

        if (previousBudgets.length === 0) {
          toast(`${prevYear}년 ${prevMonth}월에 설정된 예산이 없습니다.`, {
            icon: 'ℹ️',
          });
          return;
        }

        // 새로운 월로 복사
        const newBudgets: CategoryBudget[] = previousBudgets.map((budget) => ({
          ...budget,
          id: `local-${Date.now()}-${Math.random()}`,
          year: selectedYear,
          month: selectedMonth,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        // 저장
        saveCategoryBudgetsToLocal(selectedYear, selectedMonth, newBudgets);

        // UI 업데이트
        if (onBudgetsChange) {
          onBudgetsChange(newBudgets);
        }

        toast.success(`${prevYear}년 ${prevMonth}월 예산을 복사했습니다. (${newBudgets.length}개)`);
      }
    } catch (err) {
      console.error('Failed to copy previous month budgets:', err);
      toast.error('전월 예산 복사에 실패했습니다.');
    }
  };

  // 아직 예산이 설정되지 않은 카테고리 목록
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (category) => !budgets.some((b) => b.category === category)
  );

  return (
    <div className="space-y-4">
      {/* 카테고리 예산 설명 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              카테고리 예산이란?
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              돈을 효율적으로 관리하기 위해 매월 각 카테고리별로 얼마나 지출할지 미리 계획할 수 있습니다.
              식비, 교통비, 쇼핑 등 카테고리별 예산을 설정하면 지출 현황을 통계 탭에서 한눈에 파악할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 년월 선택 및 전월 복사 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* 년월 선택 */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              조회 기간:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 전월 복사 및 히스토리 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>이력</span>
            </button>
            <button
              type="button"
              onClick={handleCopyPreviousMonth}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>전월 복사</span>
            </button>
          </div>
        </div>
      </div>

      {/* 예산 추가 버튼 */}
      {availableCategories.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              카테고리별 예산 목록
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              각 카테고리별 월별 예산 금액
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>예산 추가</span>
          </button>
        </div>
      )}

      {/* 예산 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 transition-colors duration-300">
        <div className="p-4 sm:p-6">
          {availableCategories.length === 0 && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              설정된 예산 ({budgets.length})
            </h3>
          )}

          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                설정된 예산이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                카테고리별 예산을 설정하여 지출을 효율적으로 관리해보세요
              </p>
              {availableCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  <span className="text-lg">+</span>
                  <span>첫 예산 추가하기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md"
                >
                  {editingId === budget.id ? (
                    // 수정 모드
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {budget.category}
                        </span>
                        {!budget.is_active && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded-full text-gray-600 dark:text-gray-300">
                            비활성
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex gap-2 flex-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editingBudget.amount}
                            onChange={(e) => {
                              const formatted = formatNumberWithCommas(e.target.value);
                              setEditingBudget({
                                ...editingBudget,
                                amount: formatted,
                              });
                            }}
                            className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="금액"
                          />
                        </div>

                        <div className="flex gap-2 sm:ml-auto">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(budget.id)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 일반 모드 - 고정지출 카드 스타일
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {budget.category}
                          </h4>
                          {!budget.is_active && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded-full text-gray-600 dark:text-gray-300">
                              비활성
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(
                              convertFromKRW(budget.budget_amount),
                              currentCurrency
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(budget)}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="수정"
                        >
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="삭제"
                        >
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 안내 메시지 */}
      {budgets.length > 0 && availableCategories.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            모든 카테고리에 대한 예산이 설정되었습니다.
          </p>
        </div>
      )}

      {/* 예산 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                새 예산 추가
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedYear}년 {selectedMonth}월
                </span> 예산을 설정합니다
              </p>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* 카테고리 선택 - 버튼 그리드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    카테고리 {!newBudget.category && <span className="text-red-500 dark:text-red-400">*</span>}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setNewBudget({ ...newBudget, category })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          newBudget.category === category
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 금액 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    월 예산 금액 (₩) {!newBudget.amount && <span className="text-red-500 dark:text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newBudget.amount}
                    onChange={(e) => {
                      const formatted = formatNumberWithCommas(e.target.value);
                      setNewBudget({ ...newBudget, amount: formatted });
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleAddBudget}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                    setNewBudget({
                      category: '',
                      amount: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-300"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 히스토리 모달 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  예산 히스토리
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <BudgetHistoryContent
                currentYear={selectedYear}
                currentMonth={selectedMonth}
                onSelectMonth={(year, month) => {
                  setSelectedYear(year);
                  setSelectedMonth(month);
                  setShowHistoryModal(false);
                }}
                user={user}
                currentCurrency={currentCurrency}
                formatCurrency={formatCurrency}
                convertFromKRW={convertFromKRW}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 히스토리 모달 내용 컴포넌트
interface BudgetHistoryContentProps {
  currentYear: number;
  currentMonth: number;
  onSelectMonth: (year: number, month: number) => void;
  user: any;
  currentCurrency: Currency;
  formatCurrency: (amount: number, currency: Currency) => string;
  convertFromKRW: (amount: number) => number;
}

const BudgetHistoryContent: React.FC<BudgetHistoryContentProps> = ({
  currentYear,
  currentMonth,
  onSelectMonth,
  user,
  currentCurrency,
  formatCurrency,
  convertFromKRW,
}) => {
  const [historyData, setHistoryData] = useState<{
    year: number;
    month: number;
    budgets: CategoryBudget[];
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        if (user) {
          // 로그인 상태: Supabase에서 모든 년월의 예산 조회
          // 현재 월을 포함하여 과거 12개월 조회
          const monthsToLoad: { year: number; month: number }[] = [];
          for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - 1 - i, 1);
            monthsToLoad.push({
              year: date.getFullYear(),
              month: date.getMonth() + 1,
            });
          }

          const results = await Promise.all(
            monthsToLoad.map(async ({ year, month }) => {
              const { data } = await fetchCategoryBudgetsByYearMonth(year, month);
              return {
                year,
                month,
                budgets: data || [],
              };
            })
          );

          // 데이터가 있는 월만 필터링
          setHistoryData(results.filter((r) => r.budgets.length > 0));
        } else {
          // 비로그인 상태: localStorage에서 모든 키 조회
          const { getAllCategoryBudgetKeys, loadCategoryBudgetsFromLocal } = await import(
            '../../utils/localStorageBudget'
          );

          const keys = getAllCategoryBudgetKeys();
          const results = keys.map(({ year, month }) => ({
            year,
            month,
            budgets: loadCategoryBudgetsFromLocal(year, month),
          }));

          setHistoryData(results);
        }
      } catch (err) {
        console.error('Failed to load budget history:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [user, currentYear, currentMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          저장된 예산 히스토리가 없습니다
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          예산을 설정하면 여기에 기록이 남습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {historyData.map(({ year, month, budgets }) => {
        const totalBudget = budgets.reduce((sum, b) => sum + b.budget_amount, 0);
        const isCurrent = year === currentYear && month === currentMonth;

        return (
          <div
            key={`${year}-${month}`}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              isCurrent
                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {year}년 {month}월
                </h3>
                {isCurrent && (
                  <span className="px-2 py-0.5 bg-indigo-600 dark:bg-indigo-500 text-white text-xs rounded-full">
                    현재
                  </span>
                )}
              </div>
              {!isCurrent && (
                <button
                  type="button"
                  onClick={() => onSelectMonth(year, month)}
                  className="px-3 py-1 text-sm bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  이 달 보기
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                총 예산: <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(convertFromKRW(totalBudget), currentCurrency)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="text-xs bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1.5"
                  >
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      {budget.category}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(convertFromKRW(budget.budget_amount), currentCurrency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBudgetManager;
