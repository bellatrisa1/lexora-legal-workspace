'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { resetDemo, simulateFailure } from '@/lib/api/mock';
import { Dialog } from '@/components/dialog';
import { PageHeading } from '@/components/common';
import s from '@/components/ui.module.scss';
export default function Help() {
  const cache = useQueryClient();
  const [message, setMessage] = useState('');
  return (
    <div className={s.settings}>
      <PageHeading
        title="Help & resources"
        description="Get to know your workspace and explore the demo."
      />
      <div className={s.stack}>
        <section className={s.panel}>
          <div className={s.body}>
            <p className={s.eyebrow}>Start here</p>
            <h2>Legal work, connected</h2>
            <p>
              Lexora connects clients, matters, documents, tasks and conversations within an
              organization. All names and records in this workspace are fictional.
            </p>
            <h3>01 · From a new engagement to a shared update</h3>
            <ol>
              <li>
                <Link href="/matters/new" className={s.link}>
                  Create a matter
                </Link>{' '}
                with a client, practice area, jurisdiction and future target date.
              </li>
              <li>Open the matter and send a message in the Messages section.</li>
              <li>Change its status and review the Activity timeline.</li>
            </ol>
            <h3>02 · Review work from the client’s perspective</h3>
            <ol>
              <li>In Settings or the navigation panel, select the Client demo view.</li>
              <li>Open Northstar Acquisition and review its documents and conversation.</li>
              <li>
                Send a message. Switch back to Lawyer to respond manually. No automated legal reply
                is generated.
              </li>
              <li>Open Tasks to update a work item and Calendar to review upcoming deadlines.</li>
            </ol>
            <hr className={s.divider} />
            <details>
              <summary>Where does my data go?</summary>
              <p>
                Changes exist only in the memory of this tab. Reloading restores the original
                dataset. No backend, authentication, real file storage or realtime delivery is
                connected.
              </p>
            </details>
            <hr className={s.divider} />
            <details>
              <summary>What do the downloaded files contain?</summary>
              <p>
                Clearly marked demonstration text samples. They are generated in your browser and
                contain no operative legal document or legal advice.
              </p>
            </details>
            <hr className={s.divider} />
            <details>
              <summary>What about languages and AI?</summary>
              <p>
                This stage is English-only. Five-language localization will be adapted to Lexora
                next. AI-assisted document review is a future capability, subject to professional
                review; no chatbot or AI integration exists in this build.
              </p>
            </details>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Demo controls</h2>
          </div>
          <div className={s.body}>
            <p className={s.muted}>
              Simulate a failed API call or restore the original workspace. These controls are for
              testing the prototype.
            </p>
            <div className={s.actions}>
              <button
                className={s.secondary}
                onClick={() => {
                  simulateFailure();
                  void cache.resetQueries({ queryKey: ['workspace'] });
                  setMessage('Workspace error simulated. Open Matters to test recovery.');
                }}
              >
                Simulate API error
              </button>
              <Dialog
                title="Reset demo workspace?"
                trigger="Reset demo data"
                className={s.secondary}
              >
                <div className={s.body}>
                  <p>
                    This removes changes made in this tab and restores the fictional sample data.
                  </p>
                  <div className={s.actions}>
                    <button
                      className={s.button}
                      data-dialog-close
                      onClick={() => {
                        resetDemo();
                        void cache.invalidateQueries({ queryKey: ['workspace'] });
                        setMessage('Demo workspace restored.');
                      }}
                    >
                      Reset workspace
                    </button>
                    <button className={s.secondary} data-dialog-close>
                      Cancel
                    </button>
                  </div>
                </div>
              </Dialog>
            </div>
            <p role="status" className={s.success} style={{ marginTop: 16 }}>
              {message}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
