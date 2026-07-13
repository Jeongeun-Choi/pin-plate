'use client';

import { useId, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { vars } from '@pin-plate/ui';
import { usePosts } from '@/features/post/hooks/usePosts';
import {
  buildMyPageReportStats,
  type MyPageReportStats,
  type ReportMetric,
} from '../utils/reportStats';
import * as s from './MyPageReport.css';

const reportColors = [
  vars.colors.primary.default,
  vars.colors.primary.light,
  vars.colors.background.border,
  vars.colors.status.success,
];

const sampleReportStats: MyPageReportStats = {
  weeklyRestaurants: [
    { name: '오렌지 키친', count: 4 },
    { name: '소금집 델리', count: 3 },
    { name: '초록 식탁', count: 2 },
  ],
  monthlyRestaurants: [
    { name: '오렌지 키친', count: 8 },
    { name: '소금집 델리', count: 6 },
    { name: '초록 식탁', count: 4 },
  ],
  weeklyAreas: [
    { name: '서울시 성동구', count: 4 },
    { name: '서울시 마포구', count: 3 },
    { name: '서울시 서대문구', count: 2 },
  ],
  monthlyAreas: [
    { name: '서울시 성동구', count: 8 },
    { name: '서울시 마포구', count: 6 },
    { name: '서울시 서대문구', count: 4 },
  ],
  topTags: [
    { name: '파스타', count: 5 },
    { name: '브런치', count: 4 },
    { name: '카페', count: 3 },
    { name: '재방문', count: 2 },
  ],
};

const chartValueFormatter = (value: unknown) =>
  [`${Number(value) || 0}개`, '기록'] as [string, string];

type ReportCategoryId = 'restaurants' | 'areas' | 'tags';
type ReportPeriodId = 'weekly' | 'monthly';

const reportCategoryTabs: { id: ReportCategoryId; label: string }[] = [
  { id: 'restaurants', label: '음식점' },
  { id: 'areas', label: '장소' },
  { id: 'tags', label: '태그' },
];

const reportPeriodTabs: { id: ReportPeriodId; label: string }[] = [
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
];

const renderEmptyState = (message: string) => (
  <div className={s.emptyChartState}>{message}</div>
);

interface MetricListProps {
  metrics: ReportMetric[];
}

interface RestaurantRankingListProps {
  metrics: ReportMetric[];
}

const MetricList = ({ metrics }: MetricListProps) => (
  <div className={s.locationList}>
    {metrics.map((metric, index) => (
      <div key={metric.name} className={s.locationRow}>
        <span className={s.legendLabel}>
          <span
            className={s.legendDot}
            style={{
              backgroundColor: reportColors[index % reportColors.length],
            }}
          />
          {metric.name}
        </span>
        <strong>{metric.count}개</strong>
      </div>
    ))}
  </div>
);

const RestaurantRankingList = ({ metrics }: RestaurantRankingListProps) => {
  const maxCount = Math.max(...metrics.map((metric) => metric.count), 1);

  return (
    <ol className={s.restaurantRankList}>
      {metrics.map((metric, index) => {
        const barWidth = `${Math.max((metric.count / maxCount) * 100, 12)}%`;

        return (
          <li
            key={metric.name}
            className={s.restaurantRankItem}
            aria-label={`${index + 1}위 ${metric.name} ${metric.count}회`}
          >
            <div className={s.restaurantRankHeader}>
              <span className={s.restaurantRankNumber}>{index + 1}</span>
              <span className={s.restaurantName} title={metric.name}>
                {metric.name}
              </span>
              <strong className={s.restaurantCount}>{metric.count}회</strong>
            </div>
            <div className={s.restaurantBarTrack}>
              <span
                className={s.restaurantBarFill}
                style={{ width: barWidth }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
};

interface MyPageReportPreviewProps {
  isLocked?: boolean;
  onLoginClick?: () => void;
  stats?: MyPageReportStats;
  isLoading?: boolean;
}

export const MyPageReportPreview = ({
  isLocked = false,
  onLoginClick,
  stats = sampleReportStats,
  isLoading = false,
}: MyPageReportPreviewProps) => {
  const [activeReportCategoryId, setActiveReportCategoryId] =
    useState<ReportCategoryId>('restaurants');
  const [activeReportPeriodId, setActiveReportPeriodId] =
    useState<ReportPeriodId>('weekly');

  const reportTitleId = useId();
  const lockTitleId = useId();
  const lockDescriptionId = useId();
  const tabPanelId = useId();
  const hasWeeklyRestaurants = stats.weeklyRestaurants.length > 0;
  const hasMonthlyRestaurants = stats.monthlyRestaurants.length > 0;
  const hasWeeklyAreas = stats.weeklyAreas.length > 0;
  const hasMonthlyAreas = stats.monthlyAreas.length > 0;
  const hasTopTags = stats.topTags.length > 0;

  const renderRestaurantChart = (periodId: ReportPeriodId) => {
    const restaurants =
      periodId === 'weekly'
        ? stats.weeklyRestaurants
        : stats.monthlyRestaurants;
    const hasRestaurants =
      periodId === 'weekly' ? hasWeeklyRestaurants : hasMonthlyRestaurants;
    const title =
      periodId === 'weekly'
        ? '이번 주 자주 간 음식점'
        : '이번 달 자주 간 음식점';
    const loadingMessage =
      periodId === 'weekly'
        ? '이번 주 음식점 기록을 불러오는 중이에요.'
        : '이번 달 음식점 기록을 불러오는 중이에요.';
    const emptyMessage =
      periodId === 'weekly'
        ? '이번 주 음식점 기록이 아직 없어요.'
        : '이번 달 음식점 기록이 아직 없어요.';

    return (
      <div className={isLocked ? s.previewChartCard : s.chartCard}>
        <h3 className={s.chartTitle}>{title}</h3>
        {isLoading && renderEmptyState(loadingMessage)}
        {!isLoading && !hasRestaurants && renderEmptyState(emptyMessage)}
        {!isLoading && hasRestaurants && (
          <div
            className={
              isLocked ? s.previewRestaurantRankFrame : s.restaurantRankFrame
            }
          >
            <RestaurantRankingList metrics={restaurants} />
          </div>
        )}
      </div>
    );
  };

  const renderAreaChart = (periodId: ReportPeriodId) => {
    const areas =
      periodId === 'weekly' ? stats.weeklyAreas : stats.monthlyAreas;
    const hasAreas = periodId === 'weekly' ? hasWeeklyAreas : hasMonthlyAreas;
    const title =
      periodId === 'weekly' ? '이번 주 장소 분포' : '이번 달 장소 분포';
    const loadingMessage =
      periodId === 'weekly'
        ? '이번 주 장소 기록을 불러오는 중이에요.'
        : '이번 달 장소 기록을 불러오는 중이에요.';
    const emptyMessage =
      periodId === 'weekly'
        ? '이번 주 장소 기록이 아직 없어요.'
        : '이번 달 장소 기록이 아직 없어요.';

    return (
      <div className={isLocked ? s.previewChartCard : s.chartCard}>
        <h3 className={s.chartTitle}>{title}</h3>
        {isLoading && renderEmptyState(loadingMessage)}
        {!isLoading && !hasAreas && renderEmptyState(emptyMessage)}
        {!isLoading && hasAreas && (
          <div className={isLocked ? s.previewDonutSummary : s.donutSummary}>
            <div className={isLocked ? s.previewPieFrame : s.pieFrame}>
              <ResponsiveContainer
                width="100%"
                height="100%"
                initialDimension={{ width: 120, height: 120 }}
              >
                <PieChart>
                  <Pie
                    data={areas}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={28}
                    outerRadius={48}
                    paddingAngle={3}
                  >
                    {areas.map((area, index) => (
                      <Cell
                        key={area.name}
                        fill={reportColors[index % reportColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={chartValueFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <MetricList metrics={areas} />
          </div>
        )}
      </div>
    );
  };

  const renderMonthlyChart = () => (
    <div className={isLocked ? s.previewChartCard : s.chartCard}>
      <h3 className={s.chartTitle}>월간 장소 분포</h3>
      {isLoading && renderEmptyState('이번 달 기록을 불러오는 중이에요.')}
      {!isLoading &&
        !hasMonthlyAreas &&
        renderEmptyState('이번 달 기록이 아직 없어요.')}
      {!isLoading && hasMonthlyAreas && (
        <div className={isLocked ? s.previewDonutSummary : s.donutSummary}>
          <div className={isLocked ? s.previewPieFrame : s.pieFrame}>
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 120, height: 120 }}
            >
              <PieChart>
                <Pie
                  data={stats.monthlyAreas}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={28}
                  outerRadius={48}
                  paddingAngle={3}
                >
                  {stats.monthlyAreas.map((place, index) => (
                    <Cell
                      key={place.name}
                      fill={reportColors[index % reportColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={chartValueFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <MetricList metrics={stats.monthlyAreas} />
        </div>
      )}
    </div>
  );

  const renderTagChart = () => (
    <div className={isLocked ? s.previewChartCard : s.chartCard}>
      <h3 className={s.chartTitle}>자주 남긴 태그</h3>
      {isLoading && renderEmptyState('태그를 불러오는 중이에요.')}
      {!isLoading &&
        !hasTopTags &&
        renderEmptyState('이번 달 태그가 아직 없어요.')}
      {!isLoading && hasTopTags && (
        <div className={isLocked ? s.previewTagList : s.tagList}>
          {stats.topTags.map((tag) => (
            <span key={tag.name} className={s.tagChip}>
              {tag.name} · {tag.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderActiveReport = () => {
    if (activeReportCategoryId === 'areas') {
      return renderAreaChart(activeReportPeriodId);
    }

    if (activeReportCategoryId === 'tags') return renderTagChart();

    return renderRestaurantChart(activeReportPeriodId);
  };

  return (
    <section className={s.reportSection} aria-labelledby={reportTitleId}>
      <div className={s.reportHeader}>
        <h2 id={reportTitleId} className={s.reportTitle}>
          취향 리포트
        </h2>
        <p className={s.reportDescription}>
          주간·월간으로 자주 간 음식점과 장소를 정리해드려요.
        </p>
      </div>

      <div className={s.lockedPreview}>
        <div
          className={isLocked ? s.previewContent : s.tabbedPreviewContent}
          aria-hidden={isLocked}
        >
          {isLocked && (
            <>
              {renderRestaurantChart('weekly')}
              {renderMonthlyChart()}
              {renderTagChart()}
            </>
          )}

          {!isLocked && (
            <>
              <div
                className={s.tabList}
                role="tablist"
                aria-label="리포트 종류"
              >
                {reportCategoryTabs.map((tab) => {
                  const isActive = activeReportCategoryId === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      id={`${tabPanelId}-${tab.id}-tab`}
                      className={isActive ? s.tabActive : s.tab}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`${tabPanelId}-${tab.id}-panel`}
                      onClick={() => setActiveReportCategoryId(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeReportCategoryId !== 'tags' && (
                <div
                  className={s.periodTabList}
                  role="tablist"
                  aria-label="리포트 기간"
                >
                  {reportPeriodTabs.map((tab) => {
                    const isActive = activeReportPeriodId === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        id={`${tabPanelId}-${activeReportCategoryId}-${tab.id}-tab`}
                        className={isActive ? s.periodTabActive : s.periodTab}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`${tabPanelId}-${activeReportCategoryId}-${tab.id}-panel`}
                        onClick={() => setActiveReportPeriodId(tab.id)}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                id={`${tabPanelId}-${activeReportCategoryId}-${activeReportPeriodId}-panel`}
                role="tabpanel"
                aria-labelledby={`${tabPanelId}-${activeReportCategoryId}-${activeReportPeriodId}-tab`}
              >
                {renderActiveReport()}
              </div>
            </>
          )}
        </div>

        {isLocked && onLoginClick && (
          <div
            className={s.lockOverlay}
            aria-labelledby={lockTitleId}
            aria-describedby={lockDescriptionId}
          >
            <div className={s.lockCopy}>
              <p id={lockTitleId} className={s.lockTitle}>
                로그인하면 내 취향 차트가 열려요
              </p>
              <p id={lockDescriptionId} className={s.lockDescription}>
                기록을 계정에 저장하면 주간·월간 리포트와 기기 간 동기화를
                사용할 수 있어요.
              </p>
            </div>
            <button
              type="button"
              className={s.overlayButton}
              onClick={onLoginClick}
            >
              로그인하고 리포트 보기
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export const MyPageReportSection = () => {
  const { data: posts = [], isLoading: isPostsLoading } = usePosts();

  const reportStats = useMemo(() => buildMyPageReportStats(posts), [posts]);

  return <MyPageReportPreview stats={reportStats} isLoading={isPostsLoading} />;
};
