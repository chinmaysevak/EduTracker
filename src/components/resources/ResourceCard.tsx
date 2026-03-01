import { FileText, Link as LinkIcon, Youtube, File as FileIcon, Star, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { Resource, Subject } from '@/types';

interface ResourceCardProps {
    resource: Resource;
    subject?: Subject;
    onOpen: (resource: Resource) => void;
    onEdit: (resource: Resource) => void;
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string) => void;
}

const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
        case 'file': return <FileIcon className="w-5 h-5 text-blue-500" />;
        case 'link': return <LinkIcon className="w-5 h-5 text-emerald-500" />;
        case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
        case 'note': return <FileText className="w-5 h-5 text-amber-500" />;
    }
};

const getResourceColor = (type: Resource['type']) => {
    switch (type) {
        case 'file': return 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40';
        case 'link': return 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40';
        case 'youtube': return 'border-red-500/20 bg-red-500/5 hover:border-red-500/40';
        case 'note': return 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40';
    }
};

export default function ResourceCard({
    resource,
    subject,
    onOpen,
    onEdit,
    onDelete,
    onToggleFavorite
}: ResourceCardProps) {
    const isYoutube = resource.type === 'youtube';

    return (
        <div className={`group relative rounded-xl border ${getResourceColor(resource.type)} transition-all duration-300 overflow-hidden flex flex-col h-full`}>
            {/* YouTube Thumbnail Preview */}
            {isYoutube && resource.thumbnailUrl && (
                <div
                    className="w-full h-32 bg-cover bg-center border-b border-border/50 cursor-pointer relative"
                    style={{ backgroundImage: `url(${resource.thumbnailUrl})` }}
                    onClick={() => onOpen(resource)}
                >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-600 shadow-lg flex items-center justify-center backdrop-blur-sm">
                            <Youtube className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {!isYoutube && getResourceIcon(resource.type)}
                            <h3
                                className="font-semibold text-base truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => onOpen(resource)}
                                title={resource.title}
                            >
                                {resource.title}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                            {subject && (
                                <span
                                    className="px-2 py-0.5 rounded-full border border-border/50 bg-background/50 truncate max-w-[120px]"
                                    style={{ color: subject.color || 'inherit' }}
                                >
                                    {subject.name}
                                </span>
                            )}
                            {resource.fileType && (
                                <span className="uppercase font-mono tracking-wider">{resource.fileType}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                        {resource.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Content Preview for Notes */}
                {resource.type === 'note' && resource.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 mb-4">
                        {resource.content}
                    </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/10">
                    <span className="text-[10px] text-muted-foreground font-medium" title={new Date(resource.createdAt).toLocaleString()}>
                        {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${resource.isFavorite ? 'text-amber-500 opacity-100' : 'text-muted-foreground hover:text-amber-500'}`}
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(resource.id); }}
                        >
                            <Star className={`w-3.5 h-3.5 ${resource.isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                            onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        {resource.type === 'link' && resource.url && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-emerald-500"
                                onClick={(e) => { e.stopPropagation(); window.open(resource.url, '_blank'); }}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
