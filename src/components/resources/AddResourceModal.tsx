import React, { useState } from 'react';
import { X, FileText, Link, Youtube, FileIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import type { ResourceType } from '@/types';
import { toast } from 'sonner';

interface AddResourceModalProps {
    onClose: () => void;
    initialType?: ResourceType;
    initialSubjectId?: string;
}

export default function AddResourceModal({ onClose, initialType = 'file', initialSubjectId = '' }: AddResourceModalProps) {
    const { subjects, resources } = useStudentStore();

    const [type, setType] = useState<ResourceType>(initialType);
    const [title, setTitle] = useState('');
    const [subjectId, setSubjectId] = useState(initialSubjectId);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    // Type specific states
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [content, setContent] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const getYoutubeThumbnail = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
        return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : undefined;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !subjectId) {
            toast.error('Title and Subject are required');
            return;
        }

        setIsSubmitting(true);

        try {
            const baseResource = {
                title: title.trim(),
                subjectId,
                type,
                isFavorite: false,
                tags: tags.length > 0 ? tags : undefined
            };

            if (type === 'file') {
                if (!file) throw new Error('Please select a file');
                await resources.addResource({
                    ...baseResource,
                    type: 'file',
                    fileType: file.name.split('.').pop(),
                    fileSize: file.size
                }, file);

            } else if (type === 'link') {
                if (!url) throw new Error('Please enter a valid URL');
                await resources.addResource({
                    ...baseResource,
                    type: 'link',
                    url
                });

            } else if (type === 'youtube') {
                if (!youtubeUrl) throw new Error('Please enter a YouTube link');
                const thumbnailUrl = getYoutubeThumbnail(youtubeUrl);
                await resources.addResource({
                    ...baseResource,
                    type: 'youtube',
                    youtubeUrl,
                    thumbnailUrl
                });

            } else if (type === 'note') {
                if (!content.trim()) throw new Error('Please enter note content');
                await resources.addResource({
                    ...baseResource,
                    type: 'note',
                    content
                });
            }

            toast.success('Resource added successfully!');
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to add resource');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h2 className="text-lg font-semibold">Add Resource</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Type Selection */}
                    <div className="grid grid-cols-4 gap-2 bg-muted/50 p-1.5 rounded-lg">
                        {(['file', 'link', 'youtube', 'note'] as const).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-all ${type === t
                                        ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                            >
                                {t === 'file' && <FileIcon className="w-4 h-4 text-blue-500" />}
                                {t === 'link' && <Link className="w-4 h-4 text-emerald-500" />}
                                {t === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                                {t === 'note' && <FileText className="w-4 h-4 text-amber-500" />}
                                <span className="capitalize">{t}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Title <span className="text-destructive">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Intro to Algorithms PDF"
                                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Subject <span className="text-destructive">*</span></label>
                            {subjects.subjects.length > 0 ? (
                                <div className="relative">
                                    <select
                                        value={subjectId}
                                        onChange={(e) => setSubjectId(e.target.value)}
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    >
                                        <option value="" disabled>Select a subject</option>
                                        {subjects.subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border mt-1">
                                    You need to create a subject first before adding resources.
                                </div>
                            )}
                        </div>

                        {/* Type Specific Fields */}
                        <div className="pt-2 border-t border-border/10">
                            {type === 'file' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Upload File <span className="text-destructive">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setFile(file);
                                                if (file && !title) setTitle(file.name.split('.').slice(0, -1).join('.'));
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        <div className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 hover:border-primary/30 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                                <Upload className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">{file ? file.name : 'Click or drag file to upload'}</span>
                                            <span className="text-xs text-muted-foreground mt-1">PDF, DOC, PPT, Images and Archives</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === 'link' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">URL <span className="text-destructive">*</span></label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            )}

                            {type === 'youtube' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">YouTube Link <span className="text-destructive">*</span></label>
                                    <input
                                        type="url"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                    {youtubeUrl && getYoutubeThumbnail(youtubeUrl) && (
                                        <div className="mt-3 relative rounded border border-border/50 overflow-hidden w-full max-w-[200px] aspect-video">
                                            <img src={getYoutubeThumbnail(youtubeUrl)} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {type === 'note' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Note Content <span className="text-destructive">*</span></label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your note here..."
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm h-32 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Tags (optional)</label>
                            <div className="w-full flex flex-wrap gap-2 bg-background border border-input rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 min-h-[42px]">
                                {tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-medium">
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Type tag and press Enter"
                                    className="flex-1 bg-transparent border-none text-sm outline-none min-w-[120px] p-0 focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting || subjects.subjects.length === 0}>
                            {isSubmitting ? 'Saving...' : 'Add Resource'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
