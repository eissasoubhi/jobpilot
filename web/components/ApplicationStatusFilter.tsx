'use client';

import { FilterTabs } from '@/components/FilterTabs';
import { FormField } from '@/components/UI';
import {
  applicationStatusLabel,
  applicationStatusOptions,
  filterApplications,
  type ApplicationStatusFilter as ApplicationStatusFilterValue,
} from '@/lib/application-status';
import type { Application } from '@/lib/types';

import styles from './ApplicationStatusFilter.module.css';

type ApplicationStatusFilterProps = {
  applications: readonly Application[];
  value: ApplicationStatusFilterValue;
  onChange: (value: ApplicationStatusFilterValue) => void;
};

const QUICK_FILTERS: readonly ApplicationStatusFilterValue[] = [
  'ALL',
  'READY_TO_SUBMIT',
  'SUBMITTED',
];

function applicationCountLabel(count: number): string {
  return `${count} candidature${count === 1 ? '' : 's'}`;
}

export function ApplicationStatusFilter({
  applications,
  value,
  onChange,
}: ApplicationStatusFilterProps) {
  const baseOptions = applicationStatusOptions(applications);
  const options = baseOptions.some((option) => option.value === value)
    ? baseOptions
    : [
        ...baseOptions,
        { value, label: applicationStatusLabel(value), count: 0 },
      ];
  const optionByValue = new Map(options.map((option) => [option.value, option]));
  const visibleCount = filterApplications(applications, value).length;
  const activeLabel = optionByValue.get(value)?.label ?? applicationStatusLabel(value);
  const quickOptions = QUICK_FILTERS.flatMap((filter) => {
    const option = optionByValue.get(filter);

    return option
      ? [{ value: filter, label: `${option.label} (${option.count})` }]
      : [];
  });

  return (
    <div className={styles.panel}>
      <div className={styles.quickFilters}>
        <FilterTabs
          ariaLabel="Filtres rapides des candidatures"
          options={quickOptions}
          value={value}
          onChange={onChange}
        />
      </div>

      <div className={styles.detailRow}>
        <div className={styles.statusField}>
          <FormField label="Filtrer les candidatures par statut">
            <select
              id="application-status-filter"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            >
              {options.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className={styles.summary} role="status" aria-live="polite" aria-atomic="true">
          <span className={styles.summaryLabel}>Vue active</span>
          <strong className={styles.summaryStatus}>{activeLabel}</strong>
          <span className={styles.summaryCount}>
            {applicationCountLabel(visibleCount)} · {applications.length} au total
          </span>
        </div>
      </div>
    </div>
  );
}