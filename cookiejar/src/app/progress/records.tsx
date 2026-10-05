import { router } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { PersonalRecordItemRow } from '@/components/organisms/PersonalRecordItemRow';
import { List } from '@/components/primitives/List';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';

function openSessionSummary(sessionId: number) {
  router.push({ pathname: '/sessions/[sessionId]/summary', params: { sessionId: String(sessionId) } });
}

export default function PersonalRecordsScreen() {
  const { personalRecords, hasLoadFailed } = usePersonalRecords();

  if (personalRecords === null) {
    return hasLoadFailed ? (
      <EmptyState title="Could not load records" message="Something went wrong. Please try again." />
    ) : null;
  }

  if (personalRecords.length === 0) {
    return <EmptyState nuggie="workout" title="No records yet" message="Beat a past lift to set your first record." />;
  }

  return (
    <List
      data={personalRecords}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => <PersonalRecordItemRow item={item} onPress={openSessionSummary} />}
    />
  );
}
