import { useState, useMemo, useRef } from 'react';
import { Plus, Search, Filter, BookOpen, Star, Clock, FolderOpen, FileUp, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useStudentStore } from '@/context/StudentContext';
import ResourceCard from '@/components/resources/ResourceCard';
import AddResourceModal from '@/components/resources/AddResourceModal';
import ResourceViewer from '@/components/resources/ResourceViewer';
import type { Resource } from '@/types';

export default function Resources() {
    const { resources, subjects } = useStudentStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [activeResource, setActiveResource] = useState<Resource | null>(null);
    const resourceSectionRef = useRef<HTMLDivElement | null>(null);

    // Filters and sorting
    const filteredResources = useMemo(() => {
        let result = resources.resources;

        if (selectedSubjectId) {
            result = result.filter(r => r.subjectId === selectedSubjectId);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.tags?.some(tag => tag.toLowerCase().includes(q))
            );
        }

        // Sort by newest first
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [resources.resources, selectedSubjectId, searchQuery]);

    // Derived sections
    const favorites = filteredResources.filter(r => r.isFavorite);
    const recent = filteredResources.slice(0, 5);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            resources.deleteResource(id);
        }
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
    };

    const handleEditClose = () => {
        setEditingResource(null);
    };

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            {/* Premium Hero Header */}
            <div className="section-hero mesh-gradient mb-5" data-tutorial="resources-header">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                            <div className="section-hero-icon">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display section-hero-title">Resources Library</h1>
                                <p className="text-muted-foreground text-sm mt-2">Store, organize, and access all your study materials in one place.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto gap-2 rounded-xl text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 hover:border-rose-300 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                        Reset
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                            <AlertCircle className="w-5 h-5" />
                                            Reset Resource Library
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground text-base">
                                            Are you sure you want to permanently delete <strong>all your resources</strong> (notes, links, uploads)? 
                                            <br /><br />
                                            This is usually done at the start of a new semester. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => { resources.resetResources(); }} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/20 shadow-rose-500/10 border-0">
                                            Yes, Reset Resources
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto gap-2 rounded-xl btn-gradient btn-glow">
                                <FileUp className="w-4 h-4" />
                                Add Resource
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center" data-tutorial="resources-search">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search resources by title or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-card/80 backdrop-blur border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 pb-6 flex-1">
                {/* Sidebar / Subject Filter */}
                <div className="w-full lg:w-56 flex-shrink-0 space-y-4" data-tutorial="resources-filter">
                    <div className="bg-card border border-border/50 rounded-xl p-4 sticky top-[90px]">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                            <Filter className="w-4 h-4" /> Filter by Subject
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    setSelectedSubjectId(null);
                                    setTimeout(() => {
                                        resourceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 0);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedSubjectId === null
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted font-medium'
                                    }`}
                            >
                                All Subjects
                            </button>
                            {subjects.subjects.map(subject => (
                                <button
                                    key={subject.id}
                                    onClick={() => {
                                        setSelectedSubjectId(subject.id);
                                        setTimeout(() => {
                                            resourceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 0);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedSubjectId === subject.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-muted font-medium'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color || '#cbd5e1' }} />
                                    <span className="truncate">{subject.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6 min-w-0">

                    {resources.resources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Your library is empty</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Start building your digital study library by adding PDF files, YouTube videos, important links, or writing your own notes.
                            </p>
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add First Resource
                            </Button>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center p-8 bg-card border border-border/50 rounded-2xl">
                            <p className="text-muted-foreground">No resources found matching your search.</p>
                            <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedSubjectId(null); }}>
                                Clear filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Favorites Section */}
                            {favorites.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-yellow-500/10 text-yellow-400">
                                            <Star className="w-4 h-4" />
                                        </span>
                                        Favorites
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {favorites.map(resource => (
                                            <ResourceCard
                                                key={resource.id}
                                                resource={resource}
                                                subject={subjects.subjects.find(s => s.id === resource.subjectId)}
                                                onOpen={setActiveResource}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onToggleFavorite={resources.toggleFavorite}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Recent Section - Only show if no search/filter to avoid confusion */}
                            {!searchQuery && !selectedSubjectId && recent.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500/10 text-cyan-400">
                                            <Clock className="w-4 h-4" />
                                        </span>
                                        Recently Added
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {recent.map(resource => (
                                            <ResourceCard
                                                key={resource.id}
                                                resource={resource}
                                                subject={subjects.subjects.find(s => s.id === resource.subjectId)}
                                                onOpen={setActiveResource}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onToggleFavorite={resources.toggleFavorite}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* All Resources Grid */}
                            <section ref={resourceSectionRef}>
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        {selectedSubjectId ? (
                                            <>
                                                <span className="flex items-center justify-center w-6 h-6 rounded bg-purple-500/10 text-purple-400">
                                                    <FolderOpen className="w-4 h-4" />
                                                </span>
                                                Subject Resources
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex items-center justify-center w-6 h-6 rounded bg-purple-500/10 text-purple-400">
                                                    <FolderOpen className="w-4 h-4" />
                                                </span>
                                                All Resources
                                            </>
                                        )}
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredResources.length})</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredResources.map(resource => (
                                        <ResourceCard
                                            key={resource.id}
                                            resource={resource}
                                            subject={subjects.subjects.find(s => s.id === resource.subjectId)}
                                            onOpen={setActiveResource}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleFavorite={resources.toggleFavorite}
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>

            {isAddModalOpen && (
                <AddResourceModal
                    onClose={() => setIsAddModalOpen(false)}
                    initialSubjectId={selectedSubjectId || ''}
                />
            )}

            {editingResource && (
                <AddResourceModal
                    onClose={handleEditClose}
                    editResource={editingResource}
                />
            )}

            {activeResource && (
                <ResourceViewer
                    resource={activeResource}
                    onClose={() => setActiveResource(null)}
                />
            )}
        </div>
    );
}
