import { useState, useMemo } from 'react';
import { Plus, Search, Filter, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    const [activeResource, setActiveResource] = useState<Resource | null>(null);

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

    const handleEdit = (/* resource: Resource */) => {
        // Currently editing is not fully spec'd out, but we could open the modal with pre-filled data
        alert('Edit functionality coming soon.');
    };

    return (
        <div className="h-full flex flex-col pt-16 md:pt-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            {/* Header section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Resources Library</h1>
                <p className="text-muted-foreground mb-6">Store, organize, and access all your study materials in one place.</p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search resources by title or tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto gap-2 rounded-xl">
                        <Plus className="w-4 h-4" />
                        Add Resource
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 pb-8 flex-1">
                {/* Sidebar / Subject Filter */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                    <div className="bg-card border border-border/50 rounded-xl p-4 sticky top-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                            <Filter className="w-4 h-4" /> Filter by Subject
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedSubjectId(null)}
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
                                    onClick={() => setSelectedSubjectId(subject.id)}
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
                <div className="flex-1 space-y-10 min-w-0">

                    {resources.resources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card">
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
                        <div className="text-center p-12 bg-card border border-border/50 rounded-2xl">
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
                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-amber-500/10 text-amber-500">
                                            ★
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
                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-500/10 text-blue-500">
                                            ⏱
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
                            <section>
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <h2 className="text-lg font-bold">
                                        {selectedSubjectId ? 'Subject Resources' : 'All Resources'}
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

            {activeResource && (
                <ResourceViewer
                    resource={activeResource}
                    onClose={() => setActiveResource(null)}
                />
            )}
        </div>
    );
}
