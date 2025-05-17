import { MD3LightTheme } from 'react-native-paper';

/** JR 東日本カラー共通テーマ */
export const JRTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006345',
    background: '#FFFFFF',
    outline: '#C8C8C8',
  },
};

/* デフォルトでもエクスポートしておくと import ミスを防げる */
export default JRTheme;