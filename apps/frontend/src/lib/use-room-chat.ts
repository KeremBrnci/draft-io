'use client';

import type { RoomChatMessageDto } from '@draft-io/shared-types';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiClientError } from '@/lib/api/client';
import { getRoomChatMessages, sendRoomChatMessage } from '@/lib/api/room-chat';
import type { StoredLobbySession } from '@/lib/lobby-session';
import { parseRoomChatMessage, subscribeRoomSocket } from '@/lib/room-socket';

const MAX_MESSAGE_LENGTH = 280;

function sortMessages(messages: readonly RoomChatMessageDto[]): RoomChatMessageDto[] {
  return [...messages].sort(
    (left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
  );
}

export function useRoomChat(
  lobbyCode: string,
  session: StoredLobbySession | null,
): {
  readonly messages: readonly RoomChatMessageDto[];
  readonly sendMessage: (body: string) => Promise<void>;
  readonly sending: boolean;
  readonly error: string | null;
  readonly canSend: boolean;
} {
  const [messages, setMessages] = useState<readonly RoomChatMessageDto[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIdsRef = useRef(new Set<string>());

  const appendMessage = useCallback((message: RoomChatMessageDto) => {
    if (seenIdsRef.current.has(message.id)) {
      return;
    }

    seenIdsRef.current.add(message.id);
    setMessages((current) => sortMessages([...current, message]));
  }, []);

  useEffect(() => {
    seenIdsRef.current.clear();
    setMessages([]);

    if (session === null) {
      return;
    }

    let cancelled = false;

    void getRoomChatMessages(lobbyCode, session.sessionToken)
      .then((loaded) => {
        if (cancelled) {
          return;
        }

        for (const message of loaded) {
          seenIdsRef.current.add(message.id);
        }
        setMessages(sortMessages(loaded));
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiClientError) {
          setError(loadError.message);
        } else {
          setError('Sohbet geçmişi yüklenemedi.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lobbyCode, session]);

  useEffect(() => {
    if (lobbyCode.length === 0) {
      return;
    }

    return subscribeRoomSocket(lobbyCode, (event, payload) => {
      if (event !== 'CHAT_MESSAGE') {
        return;
      }

      const message = parseRoomChatMessage(payload);
      if (message !== null) {
        appendMessage(message);
      }
    });
  }, [appendMessage, lobbyCode]);

  const sendMessage = useCallback(
    async (body: string): Promise<void> => {
      if (session === null || sending) {
        return;
      }

      const trimmed = body.trim();
      if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
        setError('Mesaj 1-280 karakter arasında olmalı.');
        return;
      }

      setSending(true);
      setError(null);

      try {
        const message = await sendRoomChatMessage(lobbyCode, {
          sessionToken: session.sessionToken,
          body: trimmed,
        });
        appendMessage(message);
      } catch (sendError) {
        if (sendError instanceof ApiClientError) {
          setError(sendError.message);
        } else {
          setError('Mesaj gönderilemedi.');
        }
      } finally {
        setSending(false);
      }
    },
    [appendMessage, lobbyCode, sending, session],
  );

  return {
    messages,
    sendMessage,
    sending,
    error,
    canSend: session !== null,
  };
}
