export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  preview: string;
  style: string;
  schema: {
    elements: Record<string, {
      name: string;
      type: string;
      placeholder: string;
      required: boolean;
      validation?: any[];
      x?: number;
      y?: number;
      fontSize?: string;
      fontFamily?: string;
      color?: string;
      textAlign?: string;
    }>;
    fields?: any[];
  };
}

export const invitationTemplates: TemplateConfig[] = [
  {
    id: 'goan-romance',
    name: 'Goan Romance',
    description: 'A classic Goan wedding invitation template',
    previewImage: '/templates/goan-romance.jpg',
    preview: '/templates/goan-romance.jpg',
    style: 'Classic',
    schema: {
      elements: {
        scriptureText: {
          name: 'Scripture Text',
          type: 'text',
          placeholder: 'Enter scripture text',
          required: false,
        },
        coupleNames: {
          name: 'Couple Names',
          type: 'text',
          placeholder: 'Enter couple names',
          required: true,
        },
        parentsMessage: {
          name: 'Parents Message',
          type: 'textarea',
          placeholder: 'Enter parents message',
          required: false,
        },
        invitationWord: {
          name: 'Invitation Word',
          type: 'text',
          placeholder: 'Enter invitation word',
          required: false,
        },
        date: {
          name: 'Date',
          type: 'text',
          placeholder: 'Enter wedding date',
          required: true,
        },
        venueLabel: {
          name: 'Venue Label',
          type: 'text',
          placeholder: 'Enter venue label',
          required: false,
        },
        venueName: {
          name: 'Venue Name',
          type: 'text',
          placeholder: 'Enter venue name',
          required: true,
        },
        time: {
          name: 'Time',
          type: 'text',
          placeholder: 'Enter wedding time',
          required: true,
        },
        blessingMessage: {
          name: 'Blessing Message',
          type: 'textarea',
          placeholder: 'Enter blessing message',
          required: false,
        },
        parentsNames: {
          name: 'Parents Names',
          type: 'textarea',
          placeholder: 'Enter parents names',
          required: false,
        },
      },
      fields: [
        { name: 'Scripture Text', type: 'text', placeholder: 'Enter scripture text', required: false },
        { name: 'Couple Names', type: 'text', placeholder: 'Enter couple names', required: true },
        { name: 'Parents Message', type: 'textarea', placeholder: 'Enter parents message', required: false },
        { name: 'Invitation Word', type: 'text', placeholder: 'Enter invitation word', required: false },
        { name: 'Date', type: 'text', placeholder: 'Enter wedding date', required: true },
        { name: 'Venue Label', type: 'text', placeholder: 'Enter venue label', required: false },
        { name: 'Venue Name', type: 'text', placeholder: 'Enter venue name', required: true },
        { name: 'Time', type: 'text', placeholder: 'Enter wedding time', required: true },
        { name: 'Blessing Message', type: 'textarea', placeholder: 'Enter blessing message', required: false },
        { name: 'Parents Names', type: 'textarea', placeholder: 'Enter parents names', required: false },
      ],
    },
  },
];
