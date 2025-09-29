type RefreshTopic =
  | 'balances'
  | 'allowances'
  | 'pool'
  | 'lp'
  | 'all';

const EVENT_NAME = 'miniamm:refresh';

export type { RefreshTopic };

export function emitRefresh(...topics: RefreshTopic[]) {
  if (typeof window === 'undefined') return;

  const topicsSet = new Set<RefreshTopic>(topics.length ? topics : ['all']);
  const uniqueTopics = Array.from(topicsSet);
  const event = new CustomEvent<{ topics: RefreshTopic[] }>(EVENT_NAME, {
    detail: { topics: uniqueTopics },
  });

  window.dispatchEvent(event);
}

export function subscribeRefresh(callback: (topics: RefreshTopic[]) => void) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ topics: RefreshTopic[] }>;
    const topics = customEvent.detail?.topics;

    if (!topics || topics.length === 0) {
      callback(['all']);
      return;
    }

    callback(topics);
  };

  window.addEventListener(EVENT_NAME, handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
  };
}
