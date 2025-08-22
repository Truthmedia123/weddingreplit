export type TextAlign = 'left' | 'center' | 'right';
export type FontStyle = 'normal' | 'italic';

export interface TextLayer {
  key: string;
  x: number; // base coordinates in px
  y: number;
  fontFamily: string;
  fontSize: number; // px
  color: string; // hex
  align?: TextAlign; // default 'center'
  fontStyle?: FontStyle;
  lineHeight?: number; // 1.2 default
  maxWidth?: number; // optional wrap width
  defaultText?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  background: string; // /templates/*.png
  width: number; // base canvas width
  height: number; // base canvas height
  layers: TextLayer[];
}
