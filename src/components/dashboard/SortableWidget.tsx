import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import React from 'react';

interface SortableWidgetProps {
    id: string;
    spanClasses: string;
    isEditing: boolean;
    children: React.ReactNode;
}

export function SortableWidget({ id, spanClasses, isEditing, children }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
        zIndex: isDragging ? 0 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${spanClasses} relative group ${
                isEditing ? 'outline outline-2 outline-dashed outline-border/60 outline-offset-2 rounded-[2rem]' : ''
            }`}
        >
            {isEditing && (
                <>
                    {/* Visual drag handle indicator (non-interactive) */}
                    <div className="absolute -top-1 -right-1 z-50 w-8 h-8 bg-primary/90 rounded-full shadow-lg flex items-center justify-center pointer-events-none transition-transform scale-100 animate-in zoom-in-50 duration-300">
                        <GripHorizontal className="w-4 h-4 text-primary-foreground" />
                    </div>
                    
                    {/* Full-card draggable overlay */}
                    <div 
                        {...attributes} 
                        {...listeners}
                        title="Drag to move"
                        className="absolute inset-0 z-40 cursor-grab active:cursor-grabbing rounded-[2rem] hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                    />
                </>
            )}
            
            <div className={`h-full ${isEditing ? 'pointer-events-none select-none' : ''}`}>
                {children}
            </div>
        </div>
    );
}
