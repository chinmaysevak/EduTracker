// ============================================
// Study Materials - Modern Design
// ============================================

import { useState } from 'react';
import { Plus, File, ExternalLink, Trash2, Edit2, BookOpen, Filter, Search, Link2, StickyNote, FolderOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubjects, useStudyMaterials } from '@/hooks/useData';
import { toast } from 'sonner';
import type { StudyMaterial } from '@/types';

const materialTypeConfig = {
  note: {
    label: 'Note',
    icon: StickyNote,
    gradient: 'from-amber-400 to-orange-500',
    bgClass: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
  },
  pdf: {
    label: 'PDF',
    icon: File,
    gradient: 'from-rose-400 to-red-500',
    bgClass: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
  },
  link: {
    label: 'Link',
    icon: Link2,
    gradient: 'from-cyan-400 to-blue-500',
    bgClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400'
  },
};

// ... imports

interface StudyMaterialsProps {
  onStudy?: (materialId: string) => void;
}

export default function StudyMaterials({ onStudy }: StudyMaterialsProps) {
  const { subjects } = useSubjects();
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useStudyMaterials();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    type: 'note' as 'note' | 'pdf' | 'link',
    content: '',
    file: null as File | null
  });

  const filteredMaterials = materials.filter(m => {
    const matchesSubject = selectedSubject === 'all' || m.subjectId === selectedSubject;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || subjectId;
  };

  const getSubjectColor = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.color || '#6b7280';
  };

  const handleAddMaterial = async () => {
    if (formData.subjectId && formData.title.trim()) {
      if (formData.type === 'pdf' && !formData.file) {
        toast.error('Please upload a PDF file');
        return;
      }

      const content = formData.type === 'pdf' ? formData.file?.name || 'Untitled PDF' : formData.content.trim();

      await addMaterial({
        subjectId: formData.subjectId,
        title: formData.title.trim(),
        type: formData.type,
        content: content
      }, formData.file || undefined);

      setFormData({ subjectId: '', title: '', type: 'note', content: '', file: null });
      setIsAddDialogOpen(false);
      toast.success('Material added successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleUpdateMaterial = () => {
    if (editingMaterial && formData.title.trim() && formData.content.trim()) {
      updateMaterial(editingMaterial.id, {
        title: formData.title.trim(),
        type: formData.type,
        content: formData.content.trim()
      });
      setEditingMaterial(null);
      setEditingMaterial(null);
      setFormData({ subjectId: '', title: '', type: 'note', content: '', file: null });
    }
  };

  const openEditDialog = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setFormData({
      subjectId: material.subjectId,
      title: material.title,
      type: material.type,
      content: material.content,
      file: null
    });
  };

  const renderMaterialContent = (material: StudyMaterial) => {
    switch (material.type) {
      case 'link':
        return (
          <a
            href={material.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 break-all text-sm"
          >
            {material.content}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      case 'pdf':
        return (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <File className="w-4 h-4" />
            <span className="text-sm font-medium">{material.content}</span>
          </div>
        );
      case 'note':
      default:
        return (
          <p className="text-muted-foreground whitespace-pre-wrap text-sm line-clamp-4">
            {material.content}
          </p>
        );
    }
  };

  const stats = {
    total: materials.length,
    notes: materials.filter(m => m.type === 'note').length,
    pdfs: materials.filter(m => m.type === 'pdf').length,
    links: materials.filter(m => m.type === 'link').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Study Materials</h2>
          <p className="text-muted-foreground mt-1">Organize your notes, PDFs, and learning resources</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg card-modern border-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                Add New Material
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger className="mt-1.5 rounded-xl h-12">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter material title"
                  className="mt-1.5 rounded-xl h-12"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'note' | 'pdf' | 'link' })}>
                  <SelectTrigger className="mt-1.5 rounded-xl h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="pdf">PDF Reference</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {formData.type === 'link' ? 'URL' : formData.type === 'pdf' ? 'PDF File' : 'Content'}
                </Label>
                {formData.type === 'note' ? (
                  <Textarea
                    value={formData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your notes..."
                    rows={5}
                    className="mt-1.5 rounded-xl"
                  />
                ) : formData.type === 'pdf' ? (
                  <div className="mt-1.5">
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, file, content: file.name });
                        }
                      }}
                      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {formData.file && (
                      <p className="text-xs text-muted-foreground mt-1">Selected: {formData.file.name}</p>
                    )}
                  </div>
                ) : (
                  <Input
                    value={formData.content}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="https://..."
                    className="mt-1.5 rounded-xl h-12"
                  />
                )}
              </div>

              <Button onClick={handleAddMaterial} className="w-full btn-gradient rounded-xl h-12">
                Add Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Materials</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <StickyNote className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.notes}</p>
            <p className="text-sm text-muted-foreground">Notes</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg">
                <File className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-500">{stats.pdfs}</p>
            <p className="text-sm text-muted-foreground">PDFs</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Link2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-600">{stats.links}</p>
            <p className="text-sm text-muted-foreground">Links</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4 rounded-xl h-12">
          <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg">Notes</TabsTrigger>
          <TabsTrigger value="pdfs" className="rounded-lg">PDFs</TabsTrigger>
          <TabsTrigger value="links" className="rounded-lg">Links</TabsTrigger>
        </TabsList>

        {['all', 'notes', 'pdfs', 'links'].map((tabValue) => {
          const typeMap: Record<string, string> = { notes: 'note', pdfs: 'pdf', links: 'link' };
          const tabMaterials = tabValue === 'all'
            ? filteredMaterials
            : filteredMaterials.filter(m => m.type === typeMap[tabValue]);

          return (
            <TabsContent key={tabValue} value={tabValue}>
              {tabMaterials.length === 0 ? (
                <Card className="card-modern border-0">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold text-muted-foreground">No materials found</p>
                    <p className="text-sm text-muted-foreground mt-1">Add your first study material</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tabMaterials.map((material) => {
                    const TypeIcon = materialTypeConfig[material.type].icon;
                    const bgClass = materialTypeConfig[material.type].bgClass;
                    const subjectColor = getSubjectColor(material.subjectId);

                    return (
                      <Card key={material.id} className="card-modern card-hover border-0 overflow-hidden">
                        <div className="h-1.5" style={{ backgroundColor: subjectColor }} />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge className={`${bgClass} rounded-lg`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {materialTypeConfig[material.type].label}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditDialog(material)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500" onClick={() => setMaterialToDelete(material)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-base mt-3 line-clamp-2">{material.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
                            <p className="text-xs text-muted-foreground">{getSubjectName(material.subjectId)}</p>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/50 rounded-xl p-4">
                            {renderMaterialContent(material)}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(material.createdAt).toLocaleDateString()}
                            </div>
                            <Button size="sm" className="rounded-lg h-8 px-3" onClick={() => {
                              if (onStudy) {
                                onStudy(material.id);
                              } else {
                                toast.info('Starting study session...', { description: `Opening ${material.title}` });
                              }
                            }}>
                              Start Study
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
              }
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
        <DialogContent className="sm:max-w-lg card-modern border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1.5 rounded-xl h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'note' | 'pdf' | 'link' })}>
                <SelectTrigger className="mt-1.5 rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="pdf">PDF Reference</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Content</Label>
              {formData.type === 'note' ? (
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} className="mt-1.5 rounded-xl" />
              ) : (
                <Input value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="mt-1.5 rounded-xl h-12" />
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUpdateMaterial} className="flex-1 btn-gradient rounded-xl h-12">Update</Button>
              <Button variant="outline" onClick={() => setEditingMaterial(null)} className="rounded-xl h-12 px-6">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete material confirmation */}
      <AlertDialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete material?</AlertDialogTitle>
            <AlertDialogDescription>
              {materialToDelete && `"${materialToDelete.title}" will be permanently removed. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (materialToDelete) {
                  deleteMaterial(materialToDelete.id);
                  setMaterialToDelete(null);
                  toast.success('Material deleted.');
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
