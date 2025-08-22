import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Route, Switch } from 'wouter';
import InvitationGenerator from '../src/pages/InvitationGenerator';

// Mock the content-templates module
jest.mock('../../content-templates', () => ({
  invitationTemplates: [
    {
      id: 'goan-romance',
      name: 'Goan Romance',
      preview: '/templates/template-goan-romance.jpg',
      category: 'goan-beach',
      style: 'Traditional Elegance',
      description: 'Classic Goan wedding invitation with vibrant floral borders',
      features: ['Floral Border Design', 'Traditional Typography'],
      colors: ['Crimson Red', 'Forest Green', 'Gold', 'Cream'],
      price: 'Free',
      popular: true,
      premium: false,
      schema: {
        layout: 'portrait',
        fields: [
          {
            id: 'scriptureText',
            name: 'Scripture Text',
            type: 'text',
            required: true,
            placeholder: 'Two hearts become one'
          },
          {
            id: 'brideName',
            name: 'Bride Name',
            type: 'text',
            required: true,
            placeholder: 'Gabriella'
          },
          {
            id: 'groomName',
            name: 'Groom Name',
            type: 'text',
            required: true,
            placeholder: 'Armando'
          }
        ],
        elements: {
          scriptureText: { key: 'scriptureText', x: 50, y: 8, fontSize: 16, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' },
          brideName: { key: 'brideName', x: 50, y: 45, fontSize: 28, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' },
          groomName: { key: 'groomName', x: 50, y: 52, fontSize: 28, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' }
        },
        colorSchemes: [
          {
            name: 'Romance',
            primary: '#DC143C',
            secondary: '#228B22',
            accent: '#FFD700',
            background: '#F5F5DC'
          }
        ],
        typography: {
          fonts: [
            {
              name: 'Script',
              family: 'Dancing Script',
              weights: [400, 600, 700],
              category: 'script'
            }
          ]
        }
      }
    }
  ]
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock html2canvas and jsPDF
jest.mock('html2canvas', () => jest.fn());
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn()
  }))
}));

const renderWithRouter = (templateId: string) => {
  return render(
    <Switch>
      <Route path="/generate-invitation/:templateId" component={InvitationGenerator} />
    </Switch>
  );
};

describe('InvitationGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders invitation generator with template', async () => {
    renderWithRouter('goan-romance');

    await waitFor(() => {
      expect(screen.getByText('Goan Romance')).toBeInTheDocument();
    });

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Edit Text')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('updates text fields when user types', async () => {
    renderWithRouter('goan-romance');

    await waitFor(() => {
      expect(screen.getByLabelText('Scripture Text')).toBeInTheDocument();
    });

    const scriptureInput = screen.getByLabelText('Scripture Text');
    fireEvent.change(scriptureInput, { target: { value: 'New scripture text' } });

    expect(scriptureInput).toHaveValue('New scripture text');
  });

  test('saves draft to localStorage', async () => {
    renderWithRouter('goan-romance');

    await waitFor(() => {
      expect(screen.getByText('Save Draft')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Draft');
    fireEvent.click(saveButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'invitation-draft-goan-romance',
      expect.stringContaining('"templateId":"goan-romance"')
    );
  });

  test('loads saved draft from localStorage', async () => {
    const savedDraft = {
      templateId: 'goan-romance',
      pages: [
        {
          id: 'page-1',
          templateData: {
            scriptureText: 'Saved scripture text',
            brideName: 'Saved bride name',
            groomName: 'Saved groom name'
          }
        }
      ],
      timestamp: new Date().toISOString()
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedDraft));

    renderWithRouter('goan-romance');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Saved scripture text')).toBeInTheDocument();
    });
  });

  test('navigates back when template not found', async () => {
    const mockNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderWithRouter('non-existent-template');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('adds new page when Add Page button is clicked', async () => {
    renderWithRouter('goan-romance');

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    const addPageButton = screen.getByText('Add Page');
    fireEvent.click(addPageButton);

    // Should show Page 1 and Page 2 tabs
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  test('removes page when X button is clicked', async () => {
    renderWithRouter('goan-romance');

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    // Add a page first
    const addPageButton = screen.getByText('Add Page');
    fireEvent.click(addPageButton);

    // Now remove the second page
    const removeButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')?.getAttribute('data-testid') === 'X'
    );
    
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      
      // Should only show Page 1
      expect(screen.getByText('Page 1')).toBeInTheDocument();
      expect(screen.queryByText('Page 2')).not.toBeInTheDocument();
    }
  });
});
