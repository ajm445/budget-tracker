import React, { useState, useMemo } from 'react';
import type { Transaction } from '../../types/transaction';
import type { TransactionSearchFilter, SearchResultStats } from '../../types/search';
import { initialSearchFilter } from '../../types/search';
import { filterTransactions, calculateSearchStats } from '../../utils/searchUtils';
import TransactionItem from './TransactionItem';
import TransactionSearch from './TransactionSearch';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: ((transaction: Transaction) => void) | undefined;
  /** 검색/필터 기능 표시 여부 (기본값: true) */
  showSearch?: boolean;
  /** 초기 표시 개수 (기본값: 전체 표시) */
  initialDisplayCount?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  showSearch = true,
  initialDisplayCount
}) => {
  const [searchFilter, setSearchFilter] = useState<TransactionSearchFilter>(initialSearchFilter);
  const [displayCount, setDisplayCount] = useState<number>(initialDisplayCount || transactions.length);
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, searchFilter);
  }, [transactions, searchFilter]);

  // 검색 결과 통계
  const searchStats: SearchResultStats = useMemo(() => {
    return calculateSearchStats(filteredTransactions);
  }, [filteredTransactions]);

  // 실제 표시할 거래 내역 (페이지네이션)
  const displayedTransactions = useMemo(() => {
    return initialDisplayCount
      ? filteredTransactions.slice(0, displayCount)
      : filteredTransactions;
  }, [filteredTransactions, displayCount, initialDisplayCount]);

  const hasMore = initialDisplayCount && displayCount < filteredTransactions.length;

  /**
   * 더 보기 핸들러
   */
  const handleLoadMore = (): void => {
    setDisplayCount((prev) => Math.min(prev + (initialDisplayCount || 20), filteredTransactions.length));
  };

  return (
    <div className="space-y-4">
      {/* 검색/필터 패널 */}
      {showSearch && (
        <div className="space-y-4">
          <button
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🔍</span>
              검색 및 필터
            </span>
            <span className="text-xl text-gray-500 dark:text-gray-400">
              {showSearchPanel ? '▲' : '▼'}
            </span>
          </button>

          {showSearchPanel && (
            <TransactionSearch
              filter={searchFilter}
              onFilterChange={setSearchFilter}
              resultCount={filteredTransactions.length}
            />
          )}
        </div>
      )}

      {/* 검색 결과 통계 */}
      {showSearch && showSearchPanel && filteredTransactions.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">총 건수</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {searchStats.totalCount}건
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">총 수입</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ₩{searchStats.totalIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">총 지출</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                ₩{searchStats.totalExpense.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">순액</p>
              <p className={`text-lg font-semibold ${
                searchStats.netBalance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ₩{searchStats.netBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 거래 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
            <span>📅</span>
            {showSearchPanel && filteredTransactions.length !== transactions.length
              ? '검색 결과'
              : '최근 내역'
            }
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 transition-colors duration-300">
              ({displayedTransactions.length}
              {hasMore && `/${filteredTransactions.length}`}개)
            </span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
          {displayedTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <div className="mb-4 text-4xl">
                {showSearchPanel && filteredTransactions.length === 0 ? '🔍' : '📝'}
              </div>
              <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                {showSearchPanel && filteredTransactions.length === 0
                  ? '검색 결과가 없습니다'
                  : '아직 내역이 없습니다'
                }
              </p>
              <p className="text-sm">
                {showSearchPanel && filteredTransactions.length === 0
                  ? '다른 조건으로 검색해보세요.'
                  : '첫 내역을 추가해보세요!'
                }
              </p>
            </div>
          ) : (
            <>
              {displayedTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={onDeleteTransaction}
                  onEdit={onEditTransaction}
                />
              ))}

              {/* 더 보기 버튼 */}
              {hasMore && (
                <div className="p-4">
                  <button
                    onClick={handleLoadMore}
                    className="w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg transition-colors duration-300"
                  >
                    더 보기 ({filteredTransactions.length - displayCount}건 남음)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;