'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { WorkspaceConfig } from '@/types';
import * as s from './CreateTicketModal.css';

const BRANCH_PREFIXES = ['feature', 'bugfix', 'chore', 'refactor'] as const;

const fallbackSlug = (title: string) =>
  title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

interface Props {
  projectId: string;
  defaultBranch: string;
  onClose: () => void;
  workspaceConfig?: WorkspaceConfig | null;
  defaultWorkspace?: string | null;
}

export function CreateTicketModal({
  projectId,
  defaultBranch,
  onClose,
  workspaceConfig,
  defaultWorkspace,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [baseBranch, setBaseBranch] = useState(defaultBranch);
  const [targetWorkspace, setTargetWorkspace] = useState<string>(defaultWorkspace ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchPrefix, setBranchPrefix] = useState<string>('feature');
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          baseBranch,
          branchPrefix,
          targetWorkspace: targetWorkspace || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!title.trim()) {
      setGeneratedSlug('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeneratingSlug(true);
      try {
        const res = await fetch('/api/generate-branch-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() }),
        });
        if (!res.ok) throw new Error('Failed');
        const { slug } = await res.json();
        setGeneratedSlug(slug);
      } catch {
        setGeneratedSlug(fallbackSlug(title.trim()));
      } finally {
        setIsGeneratingSlug(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title]);

  const branchPreview = generatedSlug
    ? `${branchPrefix}/${generatedSlug}`
    : null;

  return (
    <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>// INIT_TASK</span>
          <button className={s.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={s.modalBody}>
            <div className={s.fieldGroup}>
              <label className={s.label}>TASK_TITLE *</label>
              <input
                className={s.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement user auth"
                autoFocus
                required
              />
              <div className={s.branchPrefixGroup}>
                {BRANCH_PREFIXES.map((prefix) => (
                  <button
                    key={prefix}
                    type="button"
                    className={`${s.prefixButton}${branchPrefix === prefix ? ` ${s.prefixButtonActive}` : ''}`}
                    onClick={() => setBranchPrefix(prefix)}
                  >
                    {prefix}/
                  </button>
                ))}
              </div>
              {(isGeneratingSlug || branchPreview) && (
                <span className={s.branchPreview}>
                  {isGeneratingSlug ? `${branchPrefix}/...` : branchPreview}
                </span>
              )}
            </div>

            <div className={s.fieldGroup}>
              <label className={s.label}>DESCRIPTION</label>
              <textarea
                className={s.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional task description..."
              />
            </div>

            {workspaceConfig && workspaceConfig.packages.length > 0 && (
              <div className={s.fieldGroup}>
                <label className={s.label}>TARGET_WORKSPACE</label>
                <select
                  className={s.input}
                  value={targetWorkspace}
                  onChange={(e) => setTargetWorkspace(e.target.value)}
                >
                  <option value="">ALL (no scope)</option>
                  {workspaceConfig.packages.map((pkg) => (
                    <option key={pkg.path} value={pkg.path}>
                      {pkg.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={s.fieldGroup}>
              <label className={s.label}>BASE_BRANCH</label>
              <input
                className={s.input}
                type="text"
                value={baseBranch}
                onChange={(e) => setBaseBranch(e.target.value)}
              />
            </div>
          </div>

          <div className={s.modalFooter}>
            <button type="submit" className={s.submitButton} disabled={isSubmitting || !title.trim()}>
              <span className={s.submitInner}>
                {isSubmitting ? 'EXECUTING...' : '> EXECUTE'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
