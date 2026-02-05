 import { useState, useRef, useCallback, useEffect } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Slider } from "@/components/ui/slider";
 import { 
   Move, 
   RotateCw, 
   Maximize2, 
   Trash2, 
   Type, 
   Image as ImageIcon,
   Layers,
   Copy,
   FlipHorizontal,
   FlipVertical
 } from "lucide-react";
 import { toast } from "sonner";
 
 interface DesignElement {
   id: string;
   type: "image" | "text";
   x: number;
   y: number;
   width: number;
   height: number;
   rotation: number;
   scaleX: number;
   scaleY: number;
   content: string;
   color?: string;
   fontSize?: number;
   fontFamily?: string;
   zIndex: number;
 }
 
 interface CaseDesignEditorProps {
   caseColor: string;
   caseColorClass: string;
   aspectRatio: string;
   borderRadius: string;
   cameraModule: React.ReactNode;
   notchModule: React.ReactNode;
   onDesignChange?: (elements: DesignElement[]) => void;
 }
 
 const CaseDesignEditor = ({
   caseColor,
   caseColorClass,
   aspectRatio,
   borderRadius,
   cameraModule,
   notchModule,
   onDesignChange
 }: CaseDesignEditorProps) => {
   const [elements, setElements] = useState<DesignElement[]>([]);
   const [selectedId, setSelectedId] = useState<string | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [isResizing, setIsResizing] = useState(false);
   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
   const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
   const canvasRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const selectedElement = elements.find(el => el.id === selectedId);
 
   useEffect(() => {
     onDesignChange?.(elements);
   }, [elements, onDesignChange]);
 
   const generateId = () => Math.random().toString(36).substr(2, 9);
 
   const addTextElement = () => {
     const newElement: DesignElement = {
       id: generateId(),
       type: "text",
       x: 50,
       y: 50,
       width: 100,
       height: 30,
       rotation: 0,
       scaleX: 1,
       scaleY: 1,
       content: "Nhập text",
       color: "#000000",
       fontSize: 16,
       fontFamily: "Arial",
       zIndex: elements.length
     };
     setElements([...elements, newElement]);
     setSelectedId(newElement.id);
     toast.success("Đã thêm text mới");
   };
 
   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       if (file.size > 5 * 1024 * 1024) {
         toast.error("Kích thước file tối đa 5MB");
         return;
       }
       const reader = new FileReader();
       reader.onload = (event) => {
         const newElement: DesignElement = {
           id: generateId(),
           type: "image",
           x: 20,
           y: 60,
           width: 80,
           height: 80,
           rotation: 0,
           scaleX: 1,
           scaleY: 1,
           content: event.target?.result as string,
           zIndex: elements.length
         };
         setElements([...elements, newElement]);
         setSelectedId(newElement.id);
         toast.success("Đã thêm hình ảnh mới");
       };
       reader.readAsDataURL(file);
     }
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const updateElement = (id: string, updates: Partial<DesignElement>) => {
     setElements(elements.map(el => 
       el.id === id ? { ...el, ...updates } : el
     ));
   };
 
   const deleteElement = (id: string) => {
     setElements(elements.filter(el => el.id !== id));
     setSelectedId(null);
     toast.success("Đã xóa element");
   };
 
   const duplicateElement = (id: string) => {
     const element = elements.find(el => el.id === id);
     if (element) {
       const newElement: DesignElement = {
         ...element,
         id: generateId(),
         x: element.x + 10,
         y: element.y + 10,
         zIndex: elements.length
       };
       setElements([...elements, newElement]);
       setSelectedId(newElement.id);
       toast.success("Đã sao chép element");
     }
   };
 
   const moveLayer = (id: string, direction: "up" | "down") => {
     const index = elements.findIndex(el => el.id === id);
     if (
       (direction === "up" && index < elements.length - 1) ||
       (direction === "down" && index > 0)
     ) {
       const newElements = [...elements];
       const swapIndex = direction === "up" ? index + 1 : index - 1;
       [newElements[index], newElements[swapIndex]] = [newElements[swapIndex], newElements[index]];
       newElements.forEach((el, i) => el.zIndex = i);
       setElements(newElements);
     }
   };
 
   const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
     e.stopPropagation();
     setSelectedId(elementId);
     setIsDragging(true);
     setDragStart({ x: e.clientX, y: e.clientY });
   }, []);
 
   const handleResizeStart = useCallback((e: React.MouseEvent, elementId: string) => {
     e.stopPropagation();
     const element = elements.find(el => el.id === elementId);
     if (element) {
       setIsResizing(true);
       setResizeStart({ 
         width: element.width, 
         height: element.height,
         x: e.clientX,
         y: e.clientY
       });
     }
   }, [elements]);
 
   const handleMouseMove = useCallback((e: React.MouseEvent) => {
     if (!canvasRef.current || !selectedId) return;
 
     const canvas = canvasRef.current.getBoundingClientRect();
 
     if (isDragging) {
       const deltaX = ((e.clientX - dragStart.x) / canvas.width) * 100;
       const deltaY = ((e.clientY - dragStart.y) / canvas.height) * 100;
       
       const element = elements.find(el => el.id === selectedId);
       if (element) {
         const newX = Math.max(0, Math.min(100 - element.width, element.x + deltaX));
         const newY = Math.max(0, Math.min(100 - element.height, element.y + deltaY));
         updateElement(selectedId, { x: newX, y: newY });
         setDragStart({ x: e.clientX, y: e.clientY });
       }
     }
 
     if (isResizing) {
       const deltaX = ((e.clientX - resizeStart.x) / canvas.width) * 100;
       const deltaY = ((e.clientY - resizeStart.y) / canvas.height) * 100;
       
       const newWidth = Math.max(10, resizeStart.width + deltaX);
       const newHeight = Math.max(10, resizeStart.height + deltaY);
       
       updateElement(selectedId, { width: newWidth, height: newHeight });
     }
   }, [isDragging, isResizing, selectedId, dragStart, resizeStart, elements]);
 
   const handleMouseUp = useCallback(() => {
     setIsDragging(false);
     setIsResizing(false);
   }, []);
 
   const handleCanvasClick = (e: React.MouseEvent) => {
     if (e.target === canvasRef.current) {
       setSelectedId(null);
     }
   };
 
   return (
     <div className="space-y-4">
       {/* Toolbar */}
       <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg">
         <Button variant="outline" size="sm" onClick={addTextElement}>
           <Type className="w-4 h-4 mr-1" />
           Thêm text
         </Button>
         <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
           <ImageIcon className="w-4 h-4 mr-1" />
           Thêm ảnh
         </Button>
         <input
           ref={fileInputRef}
           type="file"
           accept="image/*"
           onChange={handleImageUpload}
           className="hidden"
         />
         
         {selectedId && (
           <>
             <div className="w-px bg-border mx-2" />
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => duplicateElement(selectedId)}
             >
               <Copy className="w-4 h-4" />
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => moveLayer(selectedId, "up")}
             >
               <Layers className="w-4 h-4" />
               ↑
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => moveLayer(selectedId, "down")}
             >
               <Layers className="w-4 h-4" />
               ↓
             </Button>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => updateElement(selectedId, { 
                 scaleX: (selectedElement?.scaleX || 1) * -1 
               })}
             >
               <FlipHorizontal className="w-4 h-4" />
             </Button>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => updateElement(selectedId, { 
                 scaleY: (selectedElement?.scaleY || 1) * -1 
               })}
             >
               <FlipVertical className="w-4 h-4" />
             </Button>
             <Button 
               variant="destructive" 
               size="sm" 
               onClick={() => deleteElement(selectedId)}
             >
               <Trash2 className="w-4 h-4" />
             </Button>
           </>
         )}
       </div>
 
       {/* Canvas */}
       <div className="flex justify-center">
         <div
           ref={canvasRef}
           className={`relative w-56 ${aspectRatio} ${borderRadius} overflow-hidden shadow-2xl border-4 border-gray-800 cursor-crosshair select-none`}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
           onClick={handleCanvasClick}
         >
           {/* Case Background */}
           <div className={`absolute inset-0 ${caseColorClass}`} />
           
           {/* Design Elements */}
           {[...elements]
             .sort((a, b) => a.zIndex - b.zIndex)
             .map((element) => (
               <div
                 key={element.id}
                 className={`absolute cursor-move transition-shadow ${
                   selectedId === element.id 
                     ? "ring-2 ring-primary ring-offset-1" 
                     : "hover:ring-1 hover:ring-primary/50"
                 }`}
                 style={{
                   left: `${element.x}%`,
                   top: `${element.y}%`,
                   width: `${element.width}%`,
                   height: `${element.height}%`,
                   transform: `rotate(${element.rotation}deg) scaleX(${element.scaleX}) scaleY(${element.scaleY})`,
                   zIndex: element.zIndex + 10
                 }}
                 onMouseDown={(e) => handleMouseDown(e, element.id)}
               >
                 {element.type === "image" ? (
                   <img
                     src={element.content}
                     alt="Design element"
                     className="w-full h-full object-contain pointer-events-none"
                     draggable={false}
                   />
                 ) : (
                   <div
                     className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none"
                     style={{
                       color: element.color,
                       fontSize: `${element.fontSize}px`,
                       fontFamily: element.fontFamily
                     }}
                   >
                     <span className="font-bold drop-shadow-md text-center break-words">
                       {element.content}
                     </span>
                   </div>
                 )}
                 
                 {/* Resize Handle */}
                 {selectedId === element.id && (
                   <div
                     className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full cursor-se-resize flex items-center justify-center"
                     onMouseDown={(e) => handleResizeStart(e, element.id)}
                   >
                     <Maximize2 className="w-2 h-2 text-primary-foreground" />
                   </div>
                 )}
               </div>
             ))}
           
           {/* Camera Module */}
           {cameraModule}
           
           {/* Notch/Dynamic Island */}
           {notchModule}
         </div>
       </div>
 
       {/* Element Properties Panel */}
       {selectedElement && (
         <div className="p-4 bg-secondary/30 rounded-lg space-y-4">
           <h4 className="font-medium flex items-center gap-2">
             {selectedElement.type === "text" ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
             Chỉnh sửa {selectedElement.type === "text" ? "Text" : "Hình ảnh"}
           </h4>
           
           {selectedElement.type === "text" && (
             <>
               <div>
                 <Label>Nội dung</Label>
                 <Input
                   value={selectedElement.content}
                   onChange={(e) => updateElement(selectedId!, { content: e.target.value })}
                   placeholder="Nhập text..."
                 />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <Label>Màu chữ</Label>
                   <Input
                     type="color"
                     value={selectedElement.color || "#000000"}
                     onChange={(e) => updateElement(selectedId!, { color: e.target.value })}
                     className="h-10 cursor-pointer"
                   />
                 </div>
                 <div>
                   <Label>Cỡ chữ: {selectedElement.fontSize}px</Label>
                   <Slider
                     value={[selectedElement.fontSize || 16]}
                     onValueChange={([value]) => updateElement(selectedId!, { fontSize: value })}
                     min={8}
                     max={32}
                     step={1}
                     className="mt-2"
                   />
                 </div>
               </div>
             </>
           )}
           
           <div>
             <Label className="flex items-center gap-2">
               <RotateCw className="w-4 h-4" />
               Xoay: {selectedElement.rotation}°
             </Label>
             <Slider
               value={[selectedElement.rotation]}
               onValueChange={([value]) => updateElement(selectedId!, { rotation: value })}
               min={0}
               max={360}
               step={1}
               className="mt-2"
             />
           </div>
 
           <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
             <div className="flex items-center gap-1">
               <Move className="w-3 h-3" />
               Kéo để di chuyển
             </div>
             <div className="flex items-center gap-1">
               <Maximize2 className="w-3 h-3" />
               Kéo góc để resize
             </div>
           </div>
         </div>
       )}
 
       {elements.length === 0 && (
         <div className="text-center py-4 text-muted-foreground text-sm">
           Click "Thêm text" hoặc "Thêm ảnh" để bắt đầu thiết kế
         </div>
       )}
     </div>
   );
 };
 
 export default CaseDesignEditor;