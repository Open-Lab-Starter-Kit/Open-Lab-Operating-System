import { Dialog } from 'quasar';
import { Constants } from 'src/constants';

export const createDialogComponent = (
  msgType: string,
  okLabel = 'Ok',
  cancelLabel = 'Cancel',
  msgCode = 0
) => {
  if (msgType === Constants.DISCONNECTED) {
    return Dialog.create({
      title: msgType,
      message: Constants.LONG_MESSAGES.DISCONNECTED_MESSAGE as string,
      persistent: true,
      noEscDismiss: true,
      color: 'primary',
      ok: {
        label: okLabel,
        flat: true,
      },
    });
  } else if (msgType === Constants.ALARM) {
    return Dialog.create({
      title: msgType + ' ' + msgCode,
      message: Constants.LONG_MESSAGES.ALARM_MESSAGES[msgCode],
      persistent: true,
      noEscDismiss: true,
      color: 'primary',
      ok: {
        label: okLabel,
        flat: true,
      },
      cancel: {
        label: cancelLabel,
        flat: true,
      },
    });
  }
  return Dialog.create({
    title: msgType + ' ' + msgCode,
    message: Constants.LONG_MESSAGES.ERROR_MESSAGES[msgCode],
    persistent: true,
    noEscDismiss: true,
    color: 'primary',
    ok: {
      label: okLabel,
      flat: true,
    },
    cancel: {
      label: cancelLabel,
      flat: true,
    },
  });
};
