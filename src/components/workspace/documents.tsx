'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import type { WorkspaceData } from '@/lib/domain';
import { useWorkspace, useFormat } from '@/lib/queries';
import { documentLabels, errorMessage } from '@/lib/presentation';
import { matterName } from '@/lib/selectors';
import { Badge, Empty, ErrorState, Loading, PageHeading } from '../common';
import s from '../ui.module.scss';
export function DocumentList({ data, matterId }: { data: WorkspaceData; matterId?: string }) {
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
            aria-label="Search documents"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className={s.select}
          aria-label="Document status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All document statuses</option>
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
                <th>Document</th>
                <th>Status</th>
                <th>Added by</th>
                <th>Version</th>
                <th>
                  <span className={s.srOnly}>Download</span>
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
                  <td data-label="Status">
                    <Badge status={doc.status} label={documentLabels[doc.status]} />
                  </td>
                  <td data-label="Added by">
                    {data.users.find((u) => u.id === doc.uploadedBy)?.name}
                    <small>{format.dateTime(doc.uploadedAt)}</small>
                  </td>
                  <td data-label="Version">v{format.number(doc.version)}</td>
                  <td>
                    <a
                      className={s.iconButton}
                      download={`${doc.name}.demo.txt`}
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(`LEXORA — DEMONSTRATION DOCUMENT\n\n${doc.name}\nVersion ${doc.version}\n\nThis fictional sample contains no legal advice or operative agreement. It is generated in the browser. No file was uploaded to a server.`)}`}
                      aria-label={`Download demo sample: ${doc.name}`}
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
          title="No documents found"
          text="Documents linked to this matter will appear here. Try another filter if you are searching."
        />
      )}
      <div className={s.tableFooter}>
        <span>{docs.length} documents</span>
        <span>Demo text samples · no real file storage</span>
      </div>
    </>
  );
}
export function DocumentsPage() {
  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  return (
    <>
      <PageHeading
        title="Documents"
        description="The right version. The right matter. One shared document workspace."
      />
      <section className={s.panel}>
        <DocumentList data={query.data} />
      </section>
    </>
  );
}
