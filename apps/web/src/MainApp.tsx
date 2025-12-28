import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { useAnalyticsEvent } from './hooks/useAnalyticsEvent';
import type { Transaction, TransactionFormData } from './types';
import type { RecurringExpense, CategoryBudget } from './types/database';
import type { SavingsGoal } from './types/savingsGoal';
import Dashboard from './components/Dashboard';
import type { ViewMode } from './components/Dashboard';
import { TransactionFormModal } from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ThemeToggle from './components/ui/ThemeToggle';
import AccountManagementModal from './components/Auth/AccountManagementModal';
import { formatInputDateToKorean, formatDateForInput } from './utils/dateUtils';
import * as transactionService from './services/transactionService';
import * as recurringExpenseService from './services/recurringExpenseService';
import * as savingsGoalService from './services/savingsGoalService';
import { fetchAllCategoryBudgets, subscribeToCategoryBudgets } from './services/categoryBudgetService';
import {
  saveCurrentMonthBudgetsToLocal,
} from './utils/localStorageBudget';

// Expense Tracker Component (기존 가계부 기능)
const ExpenseTracker: React.FC = () => {
  const { user } = useAuth();
  const { trackAddTransaction, trackDeleteTransaction, trackViewChange } = useAnalyticsEvent();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]); // 고정지출 데이터
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]); // 카테고리 예산 데이터
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]); // 저축 목표 데이터
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // 임시 모드에서 고정지출이 변경될 때 로컬스토리지에 저장
  useEffect(() => {
    if (!user && recurringExpenses.length >= 0) {
      console.log('💾 Saving recurring expenses to localStorage:', recurringExpenses.length);
      localStorage.setItem('temp_recurring_expenses', JSON.stringify(recurringExpenses));
    }
  }, [recurringExpenses, user]);

  // 임시 모드에서 카테고리 예산이 변경될 때 로컬스토리지에 저장 (현재 월 기준)
  useEffect(() => {
    if (!user && categoryBudgets.length >= 0) {
      console.log('💾 Saving category budgets to localStorage (current month):', categoryBudgets.length);
      saveCurrentMonthBudgetsToLocal(categoryBudgets);
    }
  }, [categoryBudgets, user]);

  // 거래 내역 로드 및 로그아웃 시 초기화
  useEffect(() => {
    const loadTransactions = async (): Promise<void> => {
      // 로그인 안 된 상태면 빈 배열로 초기화 (로그아웃 시 즉시 UI 업데이트)
      if (!user) {
        console.log('🔄 User logged out, clearing transactions');
        setTransactions([]);
        setLoading(false);
        return;
      }

      // 로그인 상태면 Supabase에서 로드
      console.log('📥 User logged in, loading transactions');
      setLoading(true);
      const { data, error } = await transactionService.fetchTransactions();

      if (error) {
        console.error('Failed to load transactions:', error);
      } else if (data) {
        console.log(`✅ Loaded ${data.length} transactions`);
        setTransactions(data);
      }

      setLoading(false);
    };

    void loadTransactions();
  }, [user]);

  // 고정지출 로드 및 로그아웃 시 초기화
  useEffect(() => {
    const loadRecurringExpenses = async (): Promise<void> => {
      // 로그인 안 된 상태면 빈 배열로 초기화 (로그아웃 시 즉시 UI 업데이트)
      if (!user) {
        console.log('🔄 User logged out, clearing recurring expenses');
        setRecurringExpenses([]);
        return;
      }

      // 로그인 상태면 Supabase에서 로드
      console.log('📥 User logged in, loading recurring expenses');
      const { data, error } = await recurringExpenseService.fetchAllRecurringExpenses();

      if (error) {
        console.error('Failed to load recurring expenses:', error);
      } else if (data) {
        console.log(`✅ Loaded ${data.length} recurring expenses`);
        setRecurringExpenses(data);
      }
    };

    void loadRecurringExpenses();
  }, [user]);

  // 카테고리 예산 로드 및 로그아웃 시 초기화
  useEffect(() => {
    const loadCategoryBudgets = async (): Promise<void> => {
      // 비로그인 상태면 즉시 빈 배열로 초기화 (로그아웃 시)
      if (!user) {
        console.log('🔄 User logged out, clearing category budgets');
        setCategoryBudgets([]);
        return;
      }

      // 로그인 상태면 Supabase에서 로드
      console.log('📥 User logged in, loading category budgets from Supabase');
      const { data, error } = await fetchAllCategoryBudgets();

      if (error) {
        console.error('Failed to load category budgets:', error);
        setCategoryBudgets([]);
      } else if (data) {
        console.log(`✅ Loaded ${data.length} category budgets from Supabase`);
        setCategoryBudgets(data);
      }
    };

    void loadCategoryBudgets();
  }, [user]);

  // 저축 목표 로드 및 로그아웃 시 초기화
  useEffect(() => {
    const loadSavingsGoals = async (): Promise<void> => {
      // 비로그인 상태면 즉시 빈 배열로 초기화 (로그아웃 시)
      if (!user) {
        console.log('🔄 User logged out, clearing savings goals');
        setSavingsGoals([]);
        return;
      }

      // 로그인 상태면 Supabase에서 로드
      console.log('📥 User logged in, loading savings goals from Supabase');
      const { data, error } = await savingsGoalService.fetchSavingsGoals();

      if (error) {
        console.error('Failed to load savings goals:', error);
        setSavingsGoals([]);
      } else if (data) {
        console.log(`✅ Loaded ${data.length} savings goals from Supabase`);
        setSavingsGoals(data);
      }
    };

    void loadSavingsGoals();
  }, [user]);

  // 실시간 구독 설정 (다른 브라우저/탭에서의 변경사항 감지용)
  useEffect(() => {
    if (!user) return;

    const subscription = transactionService.subscribeToTransactions(
      user.id,
      (payload) => {
        console.log('Real-time update:', payload);

        // INSERT 이벤트 - 중복 방지를 위해 이미 존재하는지 확인
        if (payload.eventType === 'INSERT' && payload.new) {
          console.log('🔴 Realtime INSERT event:', payload.new);
          const newTransaction = transactionService.mapSupabaseToLocal(
            payload.new
          );
          setTransactions((prev) => {
            // 이미 존재하는 거래인지 확인 (중복 방지)
            const exists = prev.some((t) => t.id === newTransaction.id);
            if (exists) {
              console.log('⚠️ Transaction already exists, skipping INSERT');
              return prev;
            }
            console.log('✅ Adding from Realtime:', newTransaction.id);
            return [newTransaction, ...prev];
          });
        }

        // UPDATE 이벤트 - 항상 최신 데이터로 업데이트
        if (payload.eventType === 'UPDATE' && payload.new) {
          const updatedTransaction = transactionService.mapSupabaseToLocal(
            payload.new
          );
          setTransactions((prev) =>
            prev.map((t) =>
              t.id === updatedTransaction.id ? updatedTransaction : t
            )
          );
        }

        // DELETE 이벤트 - 이미 삭제되었을 수 있으므로 확인 후 삭제
        if (payload.eventType === 'DELETE' && payload.old) {
          setTransactions((prev) => {
            const filtered = prev.filter((t) => t.id !== payload.old.id);
            if (filtered.length === prev.length) {
              console.log('Transaction already deleted, skipping DELETE');
            }
            return filtered;
          });
        }
      }
    );

    return (): void => {
      subscription.unsubscribe();
    };
  }, [user]);

  // 카테고리 예산 실시간 구독 설정
  useEffect(() => {
    if (!user) return;

    const loadBudgetsQuietly = async (): Promise<void> => {
      const { data } = await fetchAllCategoryBudgets();
      if (data) {
        setCategoryBudgets(data);
      }
    };

    const subscription = subscribeToCategoryBudgets(user.id, () => {
      void loadBudgetsQuietly();
    });

    return (): void => {
      subscription.unsubscribe();
    };
  }, [user]);

  // 폼이 생성되거나 날짜가 변경될 때 자동으로 스크롤
  useEffect((): void => {
    if ((showAddForm || editingTransaction) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAddForm, preselectedDate, editingTransaction]);

  // 뷰 모드가 변경되면 폼 닫기 (요약 보기가 아닌 경우)
  useEffect((): void => {
    if (viewMode !== 'summary') {
      setShowAddForm(false);
      setEditingTransaction(null);
      setPreselectedDate(null);
    }
  }, [viewMode]);

  const addTransaction = async (
    data: TransactionFormData
  ): Promise<void> => {
    const newTransaction = {
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: formatInputDateToKorean(data.date),
    };

    // 로그인 상태면 Supabase에 저장
    if (user) {
      console.log('🔵 Adding transaction to Supabase...', newTransaction);

      const { data: addedTransaction, error } =
        await transactionService.addTransaction(newTransaction, user.id);

      console.log('🔵 Supabase response:', { addedTransaction, error });

      if (error) {
        console.error('❌ Failed to add transaction:', error);
        toast.error('거래 내역 추가에 실패했습니다.');
      } else if (addedTransaction) {
        console.log('✅ Transaction added, updating UI:', addedTransaction);

        // 즉시 UI 업데이트 (Realtime 이벤트를 기다리지 않음)
        setTransactions((prev) => {
          console.log('📝 Current transactions:', prev.length);
          const updated = [addedTransaction, ...prev];
          console.log('📝 Updated transactions:', updated.length);
          return updated;
        });

        toast.success('거래 내역이 추가되었습니다.');
        // Google Analytics 이벤트 추적
        trackAddTransaction(data.type, parseFloat(data.amount));
        // 폼 닫기는 TransactionForm 내부에서 사용자 확인 후 처리
      } else {
        console.warn('⚠️ No transaction returned from Supabase');
      }
    } else {
      // 비로그인 상태면 로컬 메모리에만 저장
      const localTransaction: Transaction = {
        id: `local-${Date.now()}-${Math.random()}`, // 임시 로컬 ID
        ...newTransaction,
      };

      setTransactions((prev) => [localTransaction, ...prev]);
      // Google Analytics 이벤트 추적
      trackAddTransaction(data.type, parseFloat(data.amount));
      // 폼 닫기는 TransactionForm 내부에서 사용자 확인 후 처리

      // 알림: 로그인하지 않으면 데이터가 저장되지 않음
      toast('⚠️ 로그인하지 않아 데이터가 임시로만 저장됩니다.\n새로고침 시 데이터가 사라집니다.', {
        icon: '⚠️',
        duration: 4000,
      });
    }
  };

  const handleAddTransactionWithDate = (date?: Date): void => {
    if (date) {
      const dateString = formatDateForInput(date);
      setPreselectedDate(dateString);
    }
    setShowAddForm(true);
  };

  const updateTransaction = async (
    id: string,
    data: TransactionFormData
  ): Promise<void> => {
    const updatedData = {
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: formatInputDateToKorean(data.date),
    };

    // 로그인 상태면 Supabase에 업데이트
    if (user && !id.startsWith('local-')) {
      const { data: updatedTransaction, error } =
        await transactionService.updateTransaction(id, updatedData);

      if (error) {
        console.error('Failed to update transaction:', error);
        toast.error('거래 내역 수정에 실패했습니다.');
      } else if (updatedTransaction) {
        // 즉시 UI 업데이트 (Realtime 이벤트를 기다리지 않음)
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updatedTransaction : t))
        );
        toast.success('거래 내역이 수정되었습니다.');
        setEditingTransaction(null);
      }
    } else {
      // 비로그인 상태거나 로컬 데이터면 로컬에서만 수정
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updatedData } : t
        )
      );
      setEditingTransaction(null);
      toast.success('거래 내역이 수정되었습니다.');
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    // 삭제할 거래 정보 저장 (이벤트 추적용)
    const transactionToDelete = transactions.find((t) => t.id === id);

    // 로그인 상태면 Supabase에서 삭제
    if (user && !id.startsWith('local-')) {
      // 먼저 UI에서 즉시 제거 (낙관적 업데이트)
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      const { error } = await transactionService.deleteTransaction(id);

      if (error) {
        console.error('Failed to delete transaction:', error);
        toast.error('거래 내역 삭제에 실패했습니다.');
        // 삭제 실패 시 다시 추가 (롤백)
        if (transactionToDelete) {
          setTransactions((prev) => [transactionToDelete, ...prev]);
        }
      } else {
        toast.success('거래 내역이 삭제되었습니다.');
        // Google Analytics 이벤트 추적
        if (transactionToDelete) {
          trackDeleteTransaction(transactionToDelete.type);
        }
      }
    } else {
      // 비로그인 상태거나 로컬 데이터면 로컬에서만 삭제
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('거래 내역이 삭제되었습니다.');
      // Google Analytics 이벤트 추적
      if (transactionToDelete) {
        trackDeleteTransaction(transactionToDelete.type);
      }
    }
  };

  const handleEditTransaction = (transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setShowAddForm(false); // 추가 폼이 열려있으면 닫기
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4 transition-colors duration-300" />
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">거래 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 비로그인 상태 안내 */}
      {!user && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 transition-colors duration-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 transition-colors duration-300">
                임시 모드로 사용 중입니다
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2 transition-colors duration-300">
                현재 로그인하지 않아 입력한 데이터가 저장되지 않습니다.
                새로고침하면 모든 데이터가 사라집니다.
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
                💡 <strong>로그인</strong>하여 데이터를 안전하게 저장하세요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard - 뷰 모드 상태를 내부에서 관리 */}
      <Dashboard
        transactions={transactions}
        recurringExpenses={recurringExpenses}
        onRecurringExpensesChange={setRecurringExpenses}
        categoryBudgets={categoryBudgets}
        onCategoryBudgetsChange={setCategoryBudgets}
        savingsGoals={savingsGoals}
        onSavingsGoalsChange={setSavingsGoals}
        onViewModeChange={(newMode) => {
          setViewMode(newMode);
          trackViewChange(newMode);
        }}
        currentViewMode={viewMode}
        onCalendarDateClick={handleAddTransactionWithDate}
        onDeleteTransaction={deleteTransaction}
        onEditTransaction={handleEditTransaction}
      />

      {/* Add Transaction Button - 요약 보기에서만 표시 */}
      {/* 모달 방식으로 통합되어 주석처리 */}
      {/* {viewMode === 'summary' && (
        <div>
          <button
            onClick={() => handleAddTransactionWithDate()}
            className="w-full md:w-auto bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>➕</span>
            내역 추가하기
          </button>
        </div>
      )} */}

      {/* Add/Edit Transaction Form */}
      {(showAddForm || editingTransaction) && (
        <TransactionFormModal
          onSubmit={addTransaction}
          onCancel={() => {
            setShowAddForm(false);
            setPreselectedDate(null);
            setEditingTransaction(null);
          }}
          initialDate={preselectedDate ?? undefined}
          editingTransaction={editingTransaction}
          onUpdate={updateTransaction}
        />
      )}

      {/* Transaction List - 요약 보기일 때만 표시 */}
      {viewMode === 'summary' && (
        <TransactionList
          transactions={transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          onDeleteTransaction={deleteTransaction}
          onEditTransaction={handleEditTransaction}
          showSearch={true}
          initialDisplayCount={7}
        />
      )}
    </div>
  );
};

// Main App Content Component
const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { trackLogout } = useAnalyticsEvent();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const title = '가계부';
  const subtitle = '수입과 지출을 스마트하게 관리해보세요';

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    trackLogout();
  };

  const handleGoToLogin = (): void => {
    navigate('/login');
  };

  const handleOpenAccountModal = (): void => {
    setIsAccountModalOpen(true);
  };

  const handleCloseAccountModal = (): void => {
    setIsAccountModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 flex-shrink-0 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center transition-colors duration-300">
                <span className="text-white font-bold text-sm sm:text-base">
                  💰
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 truncate">{title}</h1>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-300 hidden sm:block">{subtitle}</p>
              </div>
            </div>

            {/* 테마 토글 및 사용자 프로필 또는 로그인 버튼 */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* 다크 모드 토글 버튼 */}
              <ThemeToggle />

              {user ? (
                // 로그인된 상태
                <>
                  {/* 아바타 이미지 */}
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username || profile.display_name || 'User'}
                      className="w-8 h-8 rounded-full hidden sm:block"
                    />
                  )}

                  {/* 데스크톱: 사용자 이름과 버튼 표시 */}
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      {profile?.username || profile?.display_name || profile?.email}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={handleOpenAccountModal}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      >
                        계정 관리
                      </button>
                      <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                      <button
                        onClick={() => void handleSignOut()}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>

                  {/* 모바일: 설정 및 로그아웃 버튼만 표시 */}
                  <div className="flex sm:hidden items-center gap-2">
                    <button
                      onClick={handleOpenAccountModal}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      aria-label="계정 관리"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => void handleSignOut()}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="로그아웃"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                // 로그인 안 된 상태
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 mr-2 transition-colors duration-300">
                    로그인하여 데이터를 저장하세요
                  </div>
                  <button
                    onClick={handleGoToLogin}
                    className="bg-indigo-600 dark:bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">로그인 / 회원가입</span>
                    <span className="sm:hidden">로그인</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ExpenseTracker />
      </main>

      {/* Account Management Modal */}
      <AccountManagementModal
        isOpen={isAccountModalOpen}
        onClose={handleCloseAccountModal}
      />
    </div>
  );
};

export default MainApp;
