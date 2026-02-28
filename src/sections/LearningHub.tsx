// ============================================
// Learning Hub - YouTube Playlists (Modern)
// ============================================

import { useState } from 'react';
import { 
  Plus, 
  PlayCircle, 
  ExternalLink, 
  Trash2, 
  Edit2, 
  Youtube,
  Filter,
  Search,
  Video,
  Play,
  Library
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useSubjects, usePlaylists } from '@/hooks/useData';
import { toast } from 'sonner';
import type { YouTubePlaylist } from '@/types';

export default function LearningHub() {
  const { subjects } = useSubjects();
  const { playlists, addPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<YouTubePlaylist | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<YouTubePlaylist | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    url: '',
    description: ''
  });

  const filteredPlaylists = playlists.filter(p => {
    const matchesSubject = selectedSubject === 'all' || p.subjectId === selectedSubject;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const groupedPlaylists = filteredPlaylists.reduce((acc, playlist) => {
    const subject = subjects.find(s => s.id === playlist.subjectId);
    const subjectName = subject?.name || 'Unknown Subject';
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(playlist);
    return acc;
  }, {} as Record<string, YouTubePlaylist[]>);

  const handleAddPlaylist = () => {
    if (formData.name.trim() && formData.url.trim() && formData.subjectId) {
      addPlaylist({
        name: formData.name.trim(),
        subjectId: formData.subjectId,
        url: formData.url.trim(),
        description: formData.description.trim() || undefined
      });
      setFormData({ name: '', subjectId: '', url: '', description: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdatePlaylist = () => {
    if (editingPlaylist && formData.name.trim() && formData.url.trim()) {
      updatePlaylist(editingPlaylist.id, {
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined
      });
      setEditingPlaylist(null);
      setFormData({ name: '', subjectId: '', url: '', description: '' });
    }
  };

  const openEditDialog = (playlist: YouTubePlaylist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      subjectId: playlist.subjectId,
      url: playlist.url,
      description: playlist.description || ''
    });
  };

  const openYouTubeLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSubjectColor = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.color || '#6b7280';
  };

  const stats = {
    total: playlists.length,
    subjects: Object.keys(groupedPlaylists).length,
    recent: playlists.filter(p => {
      const date = new Date(p.addedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Learning Hub</h2>
          <p className="text-muted-foreground mt-1">Manage your YouTube playlists and video resources</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Add Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg card-modern border-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                Add YouTube Playlist
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-sm font-medium">Playlist Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Complete JavaScript Course"
                  className="mt-1.5 rounded-xl h-12"
                />
              </div>
              
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
                <Label className="text-sm font-medium">YouTube URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/playlist?list=..."
                  className="mt-1.5 rounded-xl h-12"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              
              <Button onClick={handleAddPlaylist} className="w-full btn-gradient rounded-xl h-12">
                Add Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                <Library className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Playlists</p>
          </CardContent>
        </Card>
        
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-500">{stats.subjects}</p>
            <p className="text-sm text-muted-foreground">Subjects</p>
          </CardContent>
        </Card>
        
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-500">{stats.recent}</p>
            <p className="text-sm text-muted-foreground">Added This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search playlists..."
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

      {/* Playlists Display */}
      {filteredPlaylists.length === 0 ? (
        <Card className="card-modern border-0">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Youtube className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground">No playlists found</p>
            <p className="text-sm text-muted-foreground mt-1">Add YouTube playlists to get started</p>
          </CardContent>
        </Card>
      ) : selectedSubject === 'all' ? (
        <div className="space-y-8">
          {Object.entries(groupedPlaylists).map(([subjectName, subjectPlaylists]) => {
            const subjectColor = getSubjectColor(subjectPlaylists[0]?.subjectId || '');
            return (
              <div key={subjectName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subjectColor }} />
                  <h3 className="text-lg font-semibold">{subjectName}</h3>
                  <Badge variant="secondary" className="rounded-lg">{subjectPlaylists.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectPlaylists.map((playlist) => (
                    <PlaylistCard 
                      key={playlist.id} 
                      playlist={playlist}
                      onEdit={() => openEditDialog(playlist)}
                      onDelete={() => setPlaylistToDelete(playlist)}
                      onOpen={() => openYouTubeLink(playlist.url)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist}
              onEdit={() => openEditDialog(playlist)}
              onDelete={() => setPlaylistToDelete(playlist)}
              onOpen={() => openYouTubeLink(playlist.url)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlaylist} onOpenChange={() => setEditingPlaylist(null)}>
        <DialogContent className="sm:max-w-lg card-modern border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium">Playlist Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1.5 rounded-xl h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">YouTube URL</Label>
              <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="mt-1.5 rounded-xl h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="mt-1.5 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUpdatePlaylist} className="flex-1 btn-gradient rounded-xl h-12">Update</Button>
              <Button variant="outline" onClick={() => setEditingPlaylist(null)} className="rounded-xl h-12 px-6">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete playlist confirmation */}
      <AlertDialog open={!!playlistToDelete} onOpenChange={(open) => !open && setPlaylistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              {playlistToDelete && `"${playlistToDelete.name}" will be removed from your list. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (playlistToDelete) {
                  deletePlaylist(playlistToDelete.id);
                  setPlaylistToDelete(null);
                  toast.success('Playlist removed.');
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PlaylistCardProps {
  playlist: YouTubePlaylist;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

function PlaylistCard({ playlist, onEdit, onDelete, onOpen }: PlaylistCardProps) {
  const extractPlaylistId = (url: string): string | null => {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const playlistId = extractPlaylistId(playlist.url);
  const thumbnailUrl = playlistId ? `https://img.youtube.com/vi/${playlistId}/mqdefault.jpg` : null;

  return (
    <Card className="card-modern card-hover border-0 overflow-hidden group">
      <div className="h-36 bg-gray-200 dark:bg-gray-800 relative cursor-pointer overflow-hidden" onClick={onOpen}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
            <Youtube className="w-10 h-10 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <PlayCircle className="w-12 h-12 text-white" />
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium line-clamp-2">{playlist.name}</CardTitle>
        {playlist.description && (
          <CardDescription className="text-xs line-clamp-2">{playlist.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {new Date(playlist.addedAt).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onOpen}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
