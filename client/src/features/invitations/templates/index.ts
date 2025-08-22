import { TemplateConfig } from '../types';

export const templates: TemplateConfig[] = [
  {
    id: 'goan-romance',
    name: 'Goan Romance',
    background: '/templates/template-goan-romance.jpg',
    width: 768,
    height: 1152,
    layers: [
      { key: 'headerQuote', x: 384, y: 95, fontSize: 36, fontFamily: 'Playfair Display', color: '#222', align: 'center', fontStyle: 'italic', defaultText: '' },
      { key: 'verse', x: 384, y: 138, fontSize: 18, fontFamily: 'Playfair Display', color: '#333', align: 'center', fontStyle: 'italic', defaultText: '' },
      { key: 'parentsLeft', x: 90, y: 185, fontSize: 18, fontFamily: 'Lato', color: '#222', align: 'left', defaultText: '' },
      { key: 'parentsRight', x: 600, y: 185, fontSize: 18, fontFamily: 'Lato', color: '#222', align: 'right', defaultText: '' },
      { key: 'inviteText', x: 384, y: 240, fontSize: 20, fontFamily: 'Lato', color: '#222', align: 'center', defaultText: '' },
      { key: 'coupleNames', x: 384, y: 325, fontSize: 58, fontFamily: 'Great Vibes', color: '#212121', align: 'center', defaultText: '' },
      { key: 'eventDetails', x: 384, y: 450, fontSize: 22, fontFamily: 'Lato', color: '#212121', align: 'center', defaultText: '' },
      { key: 'reception', x: 384, y: 520, fontSize: 20, fontFamily: 'Lato', color: '#212121', align: 'center', fontStyle: 'italic', defaultText: '' },
      { key: 'addressLeft', x: 90, y: 595, fontSize: 16, fontFamily: 'Lato', color: '#222', align: 'left', defaultText: '' },
      { key: 'addressRight', x: 600, y: 595, fontSize: 16, fontFamily: 'Lato', color: '#222', align: 'right', defaultText: '' },
      { key: 'blessing', x: 384, y: 660, fontSize: 18, fontFamily: 'Lato', color: '#7f4e13', align: 'center', fontStyle: 'italic', defaultText: '' }
    ]
  }
];

export const getTemplateById = (id: string): TemplateConfig | undefined => {
  return templates.find(template => template.id === id);
};
