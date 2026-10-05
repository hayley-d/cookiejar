import { IconButton } from '@/components/atoms/IconButton';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { TextField } from '@/components/primitives/TextField';
import { useTheme } from '@/theme/useTheme';

type SearchBarProperties = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

const searchIconSize = 16;

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProperties) {
  const theme = useTheme();

  return (
    <Box
      direction="row"
      align="center"
      background="surface"
      borderColor="border"
      radius="medium"
      style={{ paddingLeft: theme.spacing.small + theme.spacing.extraSmall }}
    >
      <Icon name="magnifyingglass" size={searchIconSize} color="textSecondary" />
      <TextField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        returnKeyType="search"
        style={{ flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingLeft: theme.spacing.small }}
      />
      {value === '' ? null : (
        <IconButton
          icon="xmark.circle.fill"
          accessibilityLabel="Clear search"
          color="textSecondary"
          onPress={() => onChangeText('')}
        />
      )}
    </Box>
  );
}
