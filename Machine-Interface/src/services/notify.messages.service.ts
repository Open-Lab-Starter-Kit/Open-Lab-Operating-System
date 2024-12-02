import { Notify } from 'quasar';

export const showNotifyMessage = () => {
  const success = (message: string) => {
    Notify.create({
      message,
      icon: 'task_alt',
      color: 'green-4',
      timeout: 2000,
    });
  };

  const error = (message: string | unknown) => {
    if (typeof message === 'string') {
      Notify.create({
        message,
        icon: 'highlight_off',
        color: 'red',
        timeout: 2000,
      });
    }
  };

  return { success, error };
};
