'use client';

import type { RoomChatMessageDto } from '@draft-io/shared-types';
import { useEffect, useRef, useState } from 'react';

import { PlayButton } from '@/components/play/play-button';

import './room-chat.css';

interface RoomChatPanelProps {
  readonly messages: readonly RoomChatMessageDto[];
  readonly viewerParticipantId: string | null;
  readonly canSend: boolean;
  readonly sending: boolean;
  readonly error: string | null;
  readonly onSend: (body: string) => Promise<void>;
}

export function RoomChatPanel({
  messages,
  viewerParticipantId,
  canSend,
  sending,
  error,
  onSend,
}: RoomChatPanelProps): React.ReactElement {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list === null) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function handleSubmit(): Promise<void> {
    const body = draft.trim();
    if (body.length === 0 || sending) {
      return;
    }

    await onSend(body);
    setDraft('');
  }

  return (
    <aside className="room-chat" aria-label="Oda sohbeti">
      <header className="room-chat__header">
        <h2 className="room-chat__title">Sohbet</h2>
        <p className="room-chat__subtitle">Odadaki herkesle anlık mesajlaş</p>
      </header>

      <div ref={listRef} className="room-chat__messages" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="room-chat__empty">Henüz mesaj yok. İlk mesajı sen yaz.</p>
        ) : (
          messages.map((message) => {
            const isMe = viewerParticipantId === message.participantId;
            return (
              <article
                key={message.id}
                className={`room-chat__message${isMe ? ' room-chat__message--me' : ''}`}
              >
                <header className="room-chat__message-header">
                  <strong>{isMe ? 'Sen' : message.displayName}</strong>
                  <time dateTime={message.sentAt}>
                    {new Date(message.sentAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </header>
                <p className="room-chat__message-body">{message.body}</p>
              </article>
            );
          })
        )}
      </div>

      {error !== null ? (
        <p className="room-chat__error" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="room-chat__composer"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label className="room-chat__label" htmlFor="room-chat-input">
          Mesaj yaz
        </label>
        <textarea
          id="room-chat-input"
          className="room-chat__input"
          rows={2}
          maxLength={280}
          value={draft}
          placeholder={canSend ? 'Mesajını yaz…' : 'Sohbet için odaya katılmış olmalısın'}
          disabled={!canSend || sending}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
        />
        <div className="room-chat__composer-footer">
          <span className="room-chat__counter">{draft.length}/280</span>
          <PlayButton
            type="submit"
            className="play-btn--primary room-chat__send"
            loading={sending}
            loadingLabel="Gönderiliyor…"
            disabled={!canSend || draft.trim().length === 0}
          >
            Gönder
          </PlayButton>
        </div>
      </form>
    </aside>
  );
}
