'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import type { WorkspaceData } from '@/lib/domain';
import { useWorkspace, useFormat } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';
import { matterName } from '@/lib/selectors';
import { Badge, Empty, ErrorState, Loading, PageHeading } from '../common';
import s from '../ui.module.scss';
export function DocumentList({ data, matterId }: { data: WorkspaceData; matterId?: string }) {
  const { documentLabels } = usePresentation();

  const translate = useT();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const format = useFormat();
  const docs = data.documents.filter(
    (d) =>
      (!matterId || d.matterId === matterId) &&
      (status === 'all' || d.status === status) &&
      `${d.name} ${matterName(data, d.matterId)}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className={s.toolbar}>
        <label className={s.search}>
          <Search size={14} />
          <input
            aria-label={translate('documents.searchDocuments')}
            placeholder={translate('documents.searchDocuments2')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className={s.select}
          aria-label={translate('documents.documentStatus')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all"> {translate('documents.allDocumentStatuses')} </option>
          {Object.entries(documentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {docs.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th> {translate('documents.document')} </th>
                <th> {translate('matters.status')} </th>
                <th> {translate('documents.addedBy')} </th>
                <th> {translate('documents.version')} </th>
                <th>
                  <span className={s.srOnly}> {translate('documents.download')} </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <span className={s.person}>
                      <FileText size={16} />
                      <strong>{doc.name}</strong>
                    </span>
                    <small>
                      {doc.type} ·{' '}
                      <Link href={`/matters/${doc.matterId}`}>
                        {matterName(data, doc.matterId)}
                      </Link>
                    </small>
                  </td>
                  <td data-label={translate('matters.status')}>
                    <Badge status={doc.status} label={documentLabels[doc.status]} />
                  </td>
                  <td data-label={translate('documents.addedBy')}>
                    {data.users.find((u) => u.id === doc.uploadedBy)?.name}
                    <small>{format.dateTime(doc.uploadedAt)}</small>
                  </td>
                  <td data-label={translate('documents.version')}>v{format.number(doc.version)}</td>
                  <td>
                    <a
                      className={s.iconButton}
                      download={`${doc.name}.demo.txt`}
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(translate('documents.sample', { name: doc.name, version: doc.version }))}`}
                      aria-label={translate('documents.downloadSample', { name: doc.name })}
                    >
                      <Download size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={translate('documents.noDocumentsFound')}
          text={translate('documents.documentsLinkedToThisMatterWillAppear')}
        />
      )}
      <div className={s.tableFooter}>
        <span>{translate('documents.count', { count: docs.length })}</span>
        <span> {translate('documents.demoTextSamplesNoRealFileStorage')} </span>
      </div>
    </>
  );
}
export function DocumentsPage() {
  const { errorMessage } = usePresentation();

  const translate = useT();

  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  return (
    <>
      <PageHeading
        title={translate('navigation.documents')}
        description={translate('documents.theRightVersionTheRightMatterOne')}
      />
      <section className={s.panel}>
        <DocumentList data={query.data} />
      </section>
    </>
  );
}
