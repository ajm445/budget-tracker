import React, { useState, useEffect } from 'react';
import { Plus, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import type { SavingsGoal, SavingsGoalFormData } from '../../types/savingsGoal';
import * as savingsGoalService from '../../services/savingsGoalService';
import SavingsGoalForm from './SavingsGoalForm';
import SavingsGoalItem from './SavingsGoalItem';

interface SavingsGoalManagerProps {
  /** 외부에서 관리하는 저축 목표 리스트 (선택적) */
  goals?: SavingsGoal[];
  /** 저축 목표 변경 시 호출되는 콜백 (선택적) */
  onGoalsChange?: (goals: SavingsGoal[]) => void;
}

const SavingsGoalManager: React.FC<SavingsGoalManagerProps> = ({
  goals: externalGoals,
  onGoalsChange
}) => {
  const { user } = useAuth();

  const [internalGoals, setInternalGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showAddSavingsModal, setShowAddSavingsModal] = useState<SavingsGoal | null>(null);

  // 내부 상태와 외부 props 동기화
  const goals = externalGoals !== undefined ? externalGoals : internalGoals;
  const setGoals = (
    newGoals: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])
  ): void => {
    const updatedGoals = typeof newGoals === 'function' ? newGoals(goals) : newGoals;
    if (onGoalsChange) {
      onGoalsChange(updatedGoals);
    } else {
      setInternalGoals(updatedGoals);
    }
  };

  // 저축 목표 로드
  useEffect(() => {
    const loadGoals = async (): Promise<void> => {
      // 비로그인 상태일 때는 외부에서 props로 관리하므로 로드하지 않음
      if (!user) {
        console.log('📦 Non-logged in mode - using external goals from props');
        setLoading(false);
        return;
      }

      // 로그인 상태면 Supabase에서 로드
      console.log('📥 User logged in, loading savings goals');
      setLoading(true);
      const { data, error } = await savingsGoalService.fetchSavingsGoals();

      if (error) {
        console.error('Failed to load savings goals:', error);
        toast.error('저축 목표를 불러오는데 실패했습니다.');
      } else if (data) {
        setGoals(data);
      }

      setLoading(false);
    };

    void loadGoals();
  }, [user]);

  // 실시간 구독
  useEffect(() => {
    if (!user) return;

    const subscription = savingsGoalService.subscribeToSavingsGoals(
      user.id,
      () => {
        void loadGoalsQuietly();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadGoalsQuietly = async (): Promise<void> => {
    if (!user) return;

    const { data } = await savingsGoalService.fetchSavingsGoals();
    if (data) {
      setGoals(data);
    }
  };


  /**
   * 저축 목표 추가/수정 처리
   */
  const handleSubmit = async (formData: SavingsGoalFormData): Promise<void> => {
    const targetAmount = parseFloat(formData.target_amount);
    const currentAmount = parseFloat(formData.current_amount) || 0;

    const goalData: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user?.id || '',
      name: formData.name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      deadline: formData.deadline || null,
      category: (formData.category as SavingsGoal['category']) || null,
      description: formData.description || null,
      is_completed: false
    };

    if (editingGoal) {
      // 수정
      if (user && !editingGoal.id.startsWith('local-')) {
        const { error } = await savingsGoalService.updateSavingsGoal(editingGoal.id, goalData);

        if (error) {
          toast.error('수정에 실패했습니다.');
          return;
        }
      }

      setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
      toast.success('저축 목표가 수정되었습니다.');
    } else {
      // 추가
      if (user) {
        const { data, error } = await savingsGoalService.addSavingsGoal(goalData, user.id);

        if (error) {
          toast.error('저축 목표 추가에 실패했습니다.');
          return;
        }

        if (data) {
          setGoals([data, ...goals]);
        }
      } else {
        // 비로그인 상태: 로컬 ID 생성
        const localGoal: SavingsGoal = {
          ...goalData,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setGoals([localGoal, ...goals]);
      }

      toast.success('저축 목표가 추가되었습니다.');
    }

    setShowForm(false);
    setEditingGoal(null);
  };

  /**
   * 저축 목표 삭제
   */
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('이 저축 목표를 삭제하시겠습니까?')) return;

    // 로그인 상태면 Supabase에서도 삭제
    if (user && !id.startsWith('local-')) {
      const { error } = await savingsGoalService.deleteSavingsGoal(id);

      if (error) {
        toast.error('삭제에 실패했습니다.');
        return;
      }
    }

    // UI 업데이트
    setGoals(goals.filter(g => g.id !== id));
    toast.success('저축 목표가 삭제되었습니다.');
  };

  /**
   * 수정 버튼 클릭
   */
  const handleEdit = (goal: SavingsGoal): void => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  /**
   * 폼 취소
   */
  const handleCancelForm = (): void => {
    setShowForm(false);
    setEditingGoal(null);
  };

  /**
   * 저축 추가 버튼 클릭
   */
  const handleAddSavings = (goal: SavingsGoal): void => {
    setShowAddSavingsModal(goal);
  };

  /**
   * 저축 금액 추가 처리
   */
  const handleSavingsSubmit = async (amount: number): Promise<void> => {
    if (!showAddSavingsModal) return;

    if (user && !showAddSavingsModal.id.startsWith('local-')) {
      const { error } = await savingsGoalService.updateSavingsAmount(
        showAddSavingsModal.id,
        amount
      );

      if (error) {
        toast.error('저축 금액 추가에 실패했습니다.');
        return;
      }
    } else {
      // 로컬 업데이트
      const newCurrentAmount = showAddSavingsModal.current_amount + amount;
      const isCompleted = newCurrentAmount >= showAddSavingsModal.target_amount;

      setGoals(
        goals.map(g =>
          g.id === showAddSavingsModal.id
            ? {
                ...g,
                current_amount: newCurrentAmount,
                is_completed: isCompleted
              }
            : g
        )
      );
    }

    toast.success('저축 금액이 추가되었습니다.');
    setShowAddSavingsModal(null);
  };

  // 활성 목표와 완료 목표 분리
  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">저축 목표를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Coins size={28} />
            저축 목표
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            목표를 설정하고 저축을 시작하세요
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors duration-300"
        >
          <Plus size={20} />
          새 목표
        </button>
      </div>

      {/* 목표 없음 */}
      {goals.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-300">
          <Coins size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            아직 저축 목표가 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            첫 번째 저축 목표를 만들어보세요!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            <Plus size={20} />
            저축 목표 추가
          </button>
        </div>
      )}

      {/* 활성 목표 */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            진행 중인 목표 ({activeGoals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map((goal) => (
              <SavingsGoalItem
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddSavings={handleAddSavings}
              />
            ))}
          </div>
        </div>
      )}

      {/* 완료된 목표 */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            달성한 목표 ({completedGoals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <SavingsGoalItem
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* 저축 목표 폼 */}
      {showForm && (
        editingGoal ? (
          <SavingsGoalForm
            initialData={{
              name: editingGoal.name,
              target_amount: editingGoal.target_amount.toString(),
              current_amount: editingGoal.current_amount.toString(),
              deadline: editingGoal.deadline || '',
              category: editingGoal.category || '',
              description: editingGoal.description || ''
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
          />
        ) : (
          <SavingsGoalForm
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
          />
        )
      )}

      {/* 저축 추가 모달 */}
      {showAddSavingsModal && (
        <AddSavingsModal
          goal={showAddSavingsModal}
          onSubmit={handleSavingsSubmit}
          onCancel={() => setShowAddSavingsModal(null)}
        />
      )}
    </div>
  );
};

/**
 * 저축 추가 모달 컴포넌트
 */
interface AddSavingsModalProps {
  goal: SavingsGoal;
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}

const AddSavingsModal: React.FC<AddSavingsModalProps> = ({
  goal,
  onSubmit,
  onCancel
}) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('올바른 금액을 입력해주세요.');
      return;
    }

    onSubmit(numAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full transition-colors duration-300">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            저축 추가 - {goal.name}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              추가 금액 (₩)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-300 ${
                error
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors duration-300"
            >
              추가
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-300"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoalManager;
