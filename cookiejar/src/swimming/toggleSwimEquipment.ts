import { swimEquipmentList, type SwimEquipment } from '@/types/SwimEquipment';

export function toggleSwimEquipment(selectedEquipment: readonly SwimEquipment[], equipment: SwimEquipment): SwimEquipment[] {
  if (selectedEquipment.includes(equipment)) {
    return selectedEquipment.filter((candidate) => candidate !== equipment);
  }
  return swimEquipmentList.filter((candidate) => candidate === equipment || selectedEquipment.includes(candidate));
}
