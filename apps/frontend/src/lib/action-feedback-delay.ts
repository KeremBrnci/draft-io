export const ACTION_FEEDBACK_DELAY_MS = 200;

export function waitForActionFeedback(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ACTION_FEEDBACK_DELAY_MS);
  });
}

export async function runDelayedAction(
  setLoading: (loading: boolean) => void,
  action: () => Promise<void>,
  options?: { readonly canRun?: () => boolean },
): Promise<void> {
  if (options?.canRun?.() === false) {
    return;
  }

  setLoading(true);

  try {
    await waitForActionFeedback();

    if (options?.canRun?.() === false) {
      return;
    }

    await action();
  } finally {
    setLoading(false);
  }
}
