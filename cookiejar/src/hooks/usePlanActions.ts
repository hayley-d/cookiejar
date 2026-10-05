import { router } from 'expo-router';
import { ActionSheetIOS, Alert } from 'react-native';

import { planNameError } from '@/plans/planNameError';

type UsePlanActionsOptions = {
  planName: string;
  isActive: boolean;
  renamePlan: (name: string) => Promise<void>;
  duplicatePlan: () => Promise<number>;
  deletePlan: () => Promise<void>;
  deactivatePlan: () => Promise<void>;
  onChangeStartDate: () => void;
};

const menuOptions = ['Rename', 'Duplicate', 'Delete', 'Cancel'];
const renameMenuIndex = 0;
const duplicateMenuIndex = 1;
const deleteMenuIndex = 2;
const cancelMenuIndex = 3;

const activeMenuOptions = ['Change start date', 'Deactivate', 'Cancel'];
const changeStartDateMenuIndex = 0;
const deactivateMenuIndex = 1;
const activeCancelMenuIndex = 2;

export function usePlanActions({
  planName,
  isActive,
  renamePlan,
  duplicatePlan,
  deletePlan,
  deactivatePlan,
  onChangeStartDate,
}: UsePlanActionsOptions) {
  const showFailure = (title: string) => {
    Alert.alert(title, 'Something went wrong. Please try again.');
  };

  const promptRename = (defaultName: string) => {
    Alert.prompt(
      'Rename plan',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: (enteredName?: string) => {
            const name = enteredName ?? '';
            const nameError = planNameError(name);
            if (nameError !== null) {
              Alert.alert(nameError, undefined, [{ text: 'OK', onPress: () => promptRename(defaultName) }]);
              return;
            }
            if (name.trim() === planName) {
              return;
            }
            renamePlan(name.trim()).catch(() => showFailure('Could not rename the plan'));
          },
        },
      ],
      'plain-text',
      defaultName,
    );
  };

  const duplicate = async () => {
    try {
      const duplicatedPlanId = await duplicatePlan();
      router.push({ pathname: '/plans/[planId]', params: { planId: String(duplicatedPlanId) } });
    } catch {
      showFailure('Could not duplicate the plan');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      `Delete "${planName}"?`,
      isActive ? "This is your active plan. This can't be undone." : "This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlan();
              router.back();
            } catch {
              showFailure('Could not delete the plan');
            }
          },
        },
      ],
    );
  };

  const openMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: planName,
        options: menuOptions,
        destructiveButtonIndex: deleteMenuIndex,
        cancelButtonIndex: cancelMenuIndex,
      },
      (optionIndex) => {
        if (optionIndex === renameMenuIndex) {
          promptRename(planName);
        } else if (optionIndex === duplicateMenuIndex) {
          duplicate();
        } else if (optionIndex === deleteMenuIndex) {
          confirmDelete();
        }
      },
    );
  };

  const openActiveMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: planName,
        options: activeMenuOptions,
        destructiveButtonIndex: deactivateMenuIndex,
        cancelButtonIndex: activeCancelMenuIndex,
      },
      (optionIndex) => {
        if (optionIndex === changeStartDateMenuIndex) {
          onChangeStartDate();
        } else if (optionIndex === deactivateMenuIndex) {
          deactivatePlan().catch(() => showFailure('Could not deactivate the plan'));
        }
      },
    );
  };

  return { openMenu, openActiveMenu };
}
