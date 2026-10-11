'use client';
import type { MessageKey } from '@/i18n/messages';
import { useT } from '@/i18n/provider';

import { useState } from 'react';
import Link from 'next/link';
import { isRestMode } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { resetDemo, simulateFailure } from '@/lib/api/mock';
import { Dialog } from '@/components/dialog';
import { PageHeading } from '@/components/common';
import s from '@/components/ui.module.scss';
export default function Help() {
  const translate = useT();

  const cache = useQueryClient();
  const [message, setMessage] = useState<MessageKey | ''>('');
  return (
    <div className={s.settings}>
      <PageHeading
        title={translate('navigation.helpResources')}
        description={translate('help.getToKnowYourWorkspaceAndExplore')}
      />
      <div className={s.stack}>
        <section className={s.panel}>
          <div className={s.body}>
            <p className={s.eyebrow}> {translate('help.startHere')} </p>
            <h2> {translate('help.legalWorkConnected')} </h2>
            <p> {translate('help.lexoraConnectsClientsMattersDocumentsTasksAnd')} </p>
            <h3> {translate('help.01FromANewEngagementToA')} </h3>
            <ol>
              <li>
                <Link href="/matters/new" className={s.link}>
                  {' '}
                  {translate('matters.createAMatter')}{' '}
                </Link>{' '}
                {translate('help.withAClientPracticeAreaJurisdictionAnd')}{' '}
              </li>
              <li> {translate('help.openTheMatterAndSendAMessage')} </li>
              <li> {translate('help.changeItsStatusAndReviewTheActivity')} </li>
            </ol>
            <h3> {translate('help.02ReviewWorkFromTheClientsPerspective')} </h3>
            <ol>
              <li> {translate('help.inSettingsOrTheNavigationPanelSelect')} </li>
              <li> {translate('help.openNorthstarAcquisitionAndReviewItsDocuments')} </li>
              <li> {translate('help.sendAMessageSwitchBackToLawyer')} </li>
              <li> {translate('help.openTasksToUpdateAWorkItem')} </li>
            </ol>
            <hr className={s.divider} />
            <details>
              <summary> {translate('help.whereDoesMyDataGo')} </summary>
              <p>
                {isRestMode
                  ? translate('help.changesAreSavedThroughTheLocalExpress')
                  : translate('help.changesExistOnlyInThisTabAnd')}
              </p>
            </details>
            <hr className={s.divider} />
            <details>
              <summary> {translate('help.whatDoTheDownloadedFilesContain')} </summary>
              <p> {translate('help.clearlyMarkedDemonstrationTextSamplesTheyAre')} </p>
            </details>
            <hr className={s.divider} />
            <details>
              <summary> {translate('help.whatAboutLanguagesAndAi')} </summary>
              <p> {translate('help.fiveInterfaceLanguagesAreAvailableUserContent')} </p>
            </details>
          </div>
        </section>
        {!isRestMode && (
          <section className={s.panel}>
            <div className={s.panelHeader}>
              <h2> {translate('help.demoControls')} </h2>
            </div>
            <div className={s.body}>
              <p className={s.muted}> {translate('help.simulateAFailedApiCallOrRestore')} </p>
              <div className={s.actions}>
                <button
                  className={s.secondary}
                  onClick={() => {
                    simulateFailure();
                    void cache.resetQueries({ queryKey: ['workspace'] });
                    setMessage('help.workspaceErrorSimulatedOpenMattersToTest');
                  }}
                >
                  {' '}
                  {translate('help.simulateApiError')}{' '}
                </button>
                <Dialog
                  title={translate('help.resetDemoWorkspace')}
                  trigger={translate('help.resetDemoData')}
                  className={s.secondary}
                >
                  <div className={s.body}>
                    <p> {translate('help.thisRemovesChangesMadeInThisTab')} </p>
                    <div className={s.actions}>
                      <button
                        className={s.button}
                        data-dialog-close
                        onClick={() => {
                          resetDemo();
                          void cache.invalidateQueries({ queryKey: ['workspace'] });
                          setMessage('help.demoWorkspaceRestored');
                        }}
                      >
                        {' '}
                        {translate('help.resetWorkspace')}{' '}
                      </button>
                      <button className={s.secondary} data-dialog-close>
                        {' '}
                        {translate('matters.cancel')}{' '}
                      </button>
                    </div>
                  </div>
                </Dialog>
              </div>
              <p role="status" className={s.success} style={{ marginTop: 16 }}>
                {message ? translate(message) : ''}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
