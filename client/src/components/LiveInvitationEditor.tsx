import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Save, 
  Type, 
  Palette,
  Move,
  RotateCcw
} from 'lucide-react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
}

interface EditorState {
  elements: TextElement[];
  selectedElementId: string | null;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface LiveInvitationEditorProps {
  template: {
    id: string;
    name: string;
    previewImage: string;
    baseElements: Partial<TextElement>[];
  };
  onSave: (data: any) => void;
  onBack: () => void;
}

export default function LiveInvitationEditor({ template, onSave, onBack }: LiveInvitationEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [editorState, setEditorState] = useState<EditorState>({
    elements: [
      {
        id: 'bride-groom',
        text: 'Naina & Rishabh',
        x: 50,
        y: 40,
        fontSize: 32,
        fontFamily: 'serif',
        color: '#8B4513',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0
      },
      {
        id: 'date',
        text: '20 February 2024',
        x: 50,
        y: 60,
        fontSize: 18,
        fontFamily: 'sans-serif',
        color: '#666',
        fontWeight: 'normal',
        textAlign: 'center',
        rotation: 0
      },
      {
        id: 'venue',
        text: 'JW MARRIOTT, JAIPUR',
        x: 50,
        y: 70,
        fontSize: 14,
        fontFamily: 'sans-serif',
        color: '#8B4513',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0
      },
      {
        id: 'hashtag',
        text: '#NainaKaRishi',
        x: 50,
        y: 80,
        fontSize: 16,
        fontFamily: 'sans-serif',
        color: '#D2691E',
        fontWeight: 'normal',
        textAlign: 'center',
        rotation: 0
      }
    ],
    selectedElementId: null,
    zoom: 1,
    canvasWidth: 400,
    canvasHeight: 600
  });

  // Save state to history
  const saveToHistory = useCallback((state: EditorState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...state });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditorState(history[historyIndex - 1]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditorState(history[historyIndex + 1]);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setEditorState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 2) }));
  };

  const handleZoomOut = () => {
    setEditorState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.5) }));
  };

  // Update text element
  const updateElement = (id: string, updates: Partial<TextElement>) => {
    const newState = {
      ...editorState,
      elements: editorState.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    };
    setEditorState(newState);
    saveToHistory(newState);
  };

  // Handle element selection
  const selectElement = (id: string) => {
    setEditorState(prev => ({ ...prev, selectedElementId: id }));
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setIsDragging(true);
    selectElement(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const element = editorState.elements.find(el => el.id === elementId);
      if (element) {
        setDragOffset({
          x: e.clientX - rect.left - (element.x * editorState.canvasWidth / 100),
          y: e.clientY - rect.top - (element.y * editorState.canvasHeight / 100)
        });
      }
    }
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !editorState.selectedElementId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left - dragOffset.x) / editorState.canvasWidth) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / editorState.canvasHeight) * 100;
      
      updateElement(editorState.selectedElementId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const selectedElement = editorState.elements.find(el => el.id === editorState.selectedElementId);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Tools */}
      <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Invitation</h2>
          <Button variant="ghost" onClick={onBack} className="text-sm">
            ← Back
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Element Properties */}
        {selectedElement && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text Properties
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text">Text</Label>
                  <Input
                    id="text"
                    value={selectedElement.text}
                    onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fontSize">Size</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fontFamily">Font</Label>
                  <select
                    id="fontFamily"
                    value={selectedElement.fontFamily}
                    onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="cursive">Cursive</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="textAlign">Alignment</Label>
                  <select
                    id="textAlign"
                    value={selectedElement.textAlign}
                    onChange={(e) => updateElement(selectedElement.id, { textAlign: e.target.value as any })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="fontWeight">Weight</Label>
                  <select
                    id="fontWeight"
                    value={selectedElement.fontWeight}
                    onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Light</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full" onClick={() => onSave(editorState)}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="relative">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-2xl cursor-crosshair"
            style={{
              width: editorState.canvasWidth * editorState.zoom,
              height: editorState.canvasHeight * editorState.zoom,
              backgroundImage: `url(${template.previewImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Text Elements */}
            {editorState.elements.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-move select-none ${
                  editorState.selectedElementId === element.id 
                    ? 'ring-2 ring-blue-500 ring-opacity-50' 
                    : ''
                }`}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  fontSize: element.fontSize * editorState.zoom,
                  fontFamily: element.fontFamily,
                  color: element.color,
                  fontWeight: element.fontWeight,
                  textAlign: element.textAlign,
                  transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                  transformOrigin: 'center',
                  whiteSpace: 'nowrap'
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onClick={() => selectElement(element.id)}
              >
                {element.text}
              </div>
            ))}

            {/* Selection Indicator */}
            {selectedElement && (
              <div
                className="absolute border-2 border-blue-500 border-dashed pointer-events-none"
                style={{
                  left: `${selectedElement.x}%`,
                  top: `${selectedElement.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '30px'
                }}
              />
            )}
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            {Math.round(editorState.zoom * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}