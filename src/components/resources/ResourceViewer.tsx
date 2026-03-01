import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileUrl } from '@/lib/db';
import type { Resource } from '@/types';

interface ResourceViewerProps {
    resource: Resource | null;
    onClose: () => void;
}

export default function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
    const [fileObjectUrl, setFileObjectUrl] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!resource) return;

        if (resource.type === 'file' && resource.fileId) {
            setIsLoading(true);
            setError(null);
            getFileUrl(resource.fileId)
                .then(url => setFileObjectUrl(url))
                .catch(err => {
                    console.error('Failed to load file', err);
                    setError('Could not load the file. It may have been deleted or corrupted.');
                })
                .finally(() => setIsLoading(false));
        }

        return () => {
            if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
        };
    }, [resource]);

    if (!resource) return null;

    // Extract YouTube ID for embed
    let youtubeEmbedId = '';
    if (resource.type === 'youtube' && resource.youtubeUrl) {
        const match = resource.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
        if (match && match[1]) {
            youtubeEmbedId = match[1];
        }
    }

    const handleDownload = () => {
        if (fileObjectUrl) {
            const a = document.createElement('a');
            a.href = fileObjectUrl;
            a.download = resource.title + (resource.fileType ? `.${resource.fileType}` : '');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl max-h-full flex flex-col bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 glass">
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className="text-xl font-bold truncate">{resource.title}</h2>
                        {resource.tags?.map(tag => (
                            <span key={tag} className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {resource.type === 'file' && fileObjectUrl && (
                            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                        )}
                        {resource.type === 'link' && resource.url && (
                            <Button asChild variant="outline" size="sm" className="gap-2">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="hidden sm:inline">Open in New Tab</span>
                                </a>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground ml-2">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-muted/20 relative min-h-[50vh] p-4 sm:p-6">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p>Loading file...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive/80 p-6 text-center">
                            <X className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium text-lg">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <div className="h-full w-full rounded-xl overflow-hidden shadow-inner bg-background border border-border/30">

                            {resource.type === 'youtube' && youtubeEmbedId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeEmbedId}?autoplay=1`}
                                    title={resource.title}
                                    className="w-full h-full min-h-[60vh] border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : resource.type === 'note' ? (
                                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-6 h-full overflow-y-auto font-sans leading-relaxed whitespace-pre-wrap">
                                    {resource.content || <p className="text-muted-foreground italic">This note is empty.</p>}
                                </div>
                            ) : resource.type === 'file' && fileObjectUrl ? (
                                resource.fileType?.toLowerCase() === 'pdf' ? (
                                    <iframe src={`${fileObjectUrl}#toolbar=0`} className="w-full h-full min-h-[75vh] border-0 bg-white" title={resource.title} />
                                ) : ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(resource.fileType?.toLowerCase() || '') ? (
                                    <div className="w-full h-full flex items-center justify-center p-4 bg-black/5 dark:bg-black/40">
                                        <img src={fileObjectUrl} alt={resource.title} className="max-w-full max-h-[80vh] object-contain rounded drop-shadow-md" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground space-y-4">
                                        <Download className="w-16 h-16 opacity-20" />
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground mb-1">Preview not available</h3>
                                            <p className="text-sm">For .{resource.fileType} files, please download to view.</p>
                                        </div>
                                        <Button onClick={handleDownload} variant="default" className="mt-4">
                                            Download File
                                        </Button>
                                    </div>
                                )
                            ) : resource.type === 'link' ? (
                                <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <ExternalLink className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2">{resource.title}</h3>
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline break-all">
                                            {resource.url}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Unsupported resource type or missing data.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
