import { useState, useEffect, useMemo, useRef, FormEvent } from 'react';
import { 
  Image as ImageIcon, 
  ArrowLeft, 
  X, 
  ZoomIn, 
  Folder, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Star
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { galleryGroups as defaultGalleryGroups } from '../data/gallery';
import { Phase, GalleryGroup, GalleryImage } from '../types';

const ADMIN_EMAIL = 'cadetsalman2034@gmail.com';
const PHASES: Phase[] = ['1st Phase', '2nd Phase', '3rd Phase', '4th Phase'];

interface GalleryPageProps {
  activeAlbumId: string | null;
  setActiveAlbumId: (id: string | null) => void;
  galleryGroupsList?: GalleryGroup[];
}

export default function GalleryPage({ 
  activeAlbumId, 
  setActiveAlbumId,
  galleryGroupsList = []
}: GalleryPageProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase>('1st Phase');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Group Management Modals
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GalleryGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GalleryGroup | null>(null);

  // Photo Management Modals
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<{ group: GalleryGroup; photo: GalleryImage } | null>(null);
  const [photoToEdit, setPhotoToEdit] = useState<{ group: GalleryGroup; photo: GalleryImage } | null>(null);

  // Form States for Group
  const [groupFormTitle, setGroupFormTitle] = useState('');
  const [groupFormDesc, setGroupFormDesc] = useState('');
  const [groupFormPhase, setGroupFormPhase] = useState<Phase>('1st Phase');
  const [groupFormCoverImage, setGroupFormCoverImage] = useState('');
  const [groupFormCoverFile, setGroupFormCoverFile] = useState<File | null>(null);

  // Form States for Photo
  const [photoFormSrc, setPhotoFormSrc] = useState('');
  const [photoFormCaption, setPhotoFormCaption] = useState('');
  const [photoFormAlt, setPhotoFormAlt] = useState('');
  const [photoFormFile, setPhotoFormFile] = useState<File | null>(null);

  // Toast / Status state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Admin Verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isCurrentUserAdmin = Boolean(
    currentUser?.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  // Use synchronized Firestore groups or fallback to default
  const allGroups = useMemo(() => {
    return galleryGroupsList && galleryGroupsList.length > 0 ? galleryGroupsList : defaultGalleryGroups;
  }, [galleryGroupsList]);

  // Seed default groups to Firestore once if collection is empty and admin is present
  useEffect(() => {
    const seedInitialDataIfNeeded = async () => {
      if (!isCurrentUserAdmin) return;
      try {
        const snap = await getDocs(collection(db, 'galleryGroups'));
        if (snap.empty) {
          for (const g of defaultGalleryGroups) {
            await setDoc(doc(db, 'galleryGroups', g.id), {
              ...g,
              createdTimestamp: Date.now(),
              updatedTimestamp: Date.now(),
              createdBy: ADMIN_EMAIL,
            });
          }
        }
      } catch (err) {
        console.warn('Note checking/seeding gallery groups:', err);
      }
    };
    seedInitialDataIfNeeded();
  }, [isCurrentUserAdmin]);

  // Active Album details
  const activeGroup = useMemo(() => {
    return allGroups.find((g) => g.id === activeAlbumId) || null;
  }, [allGroups, activeAlbumId]);

  // Filtered albums by selected phase
  const filteredGroups = useMemo(() => {
    return allGroups.filter((g) => g.phase === selectedPhase);
  }, [allGroups, selectedPhase]);

  // Helper for toasts
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Utility to convert file to Base64 Data URL
  const convertFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !activeGroup) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < activeGroup.images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeGroup.images.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, activeGroup]);

  // Open Create Group Modal
  const handleOpenCreateGroup = () => {
    setGroupFormTitle('');
    setGroupFormDesc('');
    setGroupFormPhase(selectedPhase);
    setGroupFormCoverImage('');
    setGroupFormCoverFile(null);
    setIsCreateGroupModalOpen(true);
  };

  // Open Edit Group Modal
  const handleOpenEditGroup = (group: GalleryGroup) => {
    setGroupToEdit(group);
    setGroupFormTitle(group.title);
    setGroupFormDesc(group.description || '');
    setGroupFormPhase(group.phase);
    setGroupFormCoverImage(group.coverImage);
    setGroupFormCoverFile(null);
    setIsEditGroupModalOpen(true);
  };

  // Handle Save Create Group
  const handleCreateGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!groupFormTitle.trim()) {
      showToast('Please enter an album title', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCoverImage = groupFormCoverImage.trim();
      if (groupFormCoverFile) {
        finalCoverImage = await convertFileToDataUrl(groupFormCoverFile);
      }

      if (!finalCoverImage) {
        finalCoverImage = '/gallery/FB_IMG_1788480064015.jpg'; // Default fallback cover
      }

      const generatedId = 'album_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newGroup: GalleryGroup = {
        id: generatedId,
        title: groupFormTitle.trim(),
        description: groupFormDesc.trim() || 'Photo album for the 23rd batch',
        coverImage: finalCoverImage,
        phase: groupFormPhase,
        images: [],
        createdTimestamp: Date.now(),
        updatedTimestamp: Date.now(),
        createdBy: currentUser?.email || ADMIN_EMAIL,
      };

      await setDoc(doc(db, 'galleryGroups', generatedId), newGroup);
      showToast(`Album "${newGroup.title}" created successfully!`);
      setIsCreateGroupModalOpen(false);
      setSelectedPhase(groupFormPhase);
    } catch (err: any) {
      console.error('Error creating album:', err);
      showToast(err.message || 'Failed to create album. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Edit Group
  const handleEditGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!groupToEdit || !groupFormTitle.trim()) return;

    setIsSubmitting(true);
    try {
      let finalCoverImage = groupFormCoverImage.trim();
      if (groupFormCoverFile) {
        finalCoverImage = await convertFileToDataUrl(groupFormCoverFile);
      }

      const docRef = doc(db, 'galleryGroups', groupToEdit.id);
      await updateDoc(docRef, {
        title: groupFormTitle.trim(),
        description: groupFormDesc.trim(),
        phase: groupFormPhase,
        coverImage: finalCoverImage || groupToEdit.coverImage,
        updatedTimestamp: Date.now(),
      });

      showToast(`Album "${groupFormTitle.trim()}" updated successfully!`);
      setIsEditGroupModalOpen(false);
      setGroupToEdit(null);
    } catch (err: any) {
      console.error('Error updating album:', err);
      showToast(err.message || 'Failed to update album.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Group
  const handleDeleteGroupConfirm = async () => {
    if (!groupToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'galleryGroups', groupToDelete.id));
      showToast(`Album "${groupToDelete.title}" deleted.`);
      if (activeAlbumId === groupToDelete.id) {
        setActiveAlbumId(null);
      }
      setGroupToDelete(null);
    } catch (err: any) {
      console.error('Error deleting album:', err);
      showToast(err.message || 'Failed to delete album.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Add Photo Modal
  const handleOpenAddPhoto = () => {
    setPhotoFormSrc('');
    setPhotoFormCaption('');
    setPhotoFormAlt('');
    setPhotoFormFile(null);
    setIsAddPhotoModalOpen(true);
  };

  // Handle Add Photo Submit
  const handleAddPhotoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;

    setIsSubmitting(true);
    try {
      let finalImageSrc = photoFormSrc.trim();
      if (photoFormFile) {
        finalImageSrc = await convertFileToDataUrl(photoFormFile);
      }

      if (!finalImageSrc) {
        showToast('Please provide an Image URL or upload a photo file', 'error');
        setIsSubmitting(false);
        return;
      }

      const newImageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newPhoto: GalleryImage = {
        id: newImageId,
        src: finalImageSrc,
        alt: photoFormAlt.trim() || photoFormCaption.trim() || `${activeGroup.title} Photo`,
        caption: photoFormCaption.trim() || undefined,
        createdTimestamp: Date.now(),
      };

      const updatedImages = [...(activeGroup.images || []), newPhoto];
      const docRef = doc(db, 'galleryGroups', activeGroup.id);
      await updateDoc(docRef, {
        images: updatedImages,
        updatedTimestamp: Date.now(),
      });

      showToast('Photo added to album!');
      setIsAddPhotoModalOpen(false);
    } catch (err: any) {
      console.error('Error adding photo:', err);
      showToast(err.message || 'Failed to add photo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Photo Confirm
  const handleDeletePhotoConfirm = async () => {
    if (!photoToDelete) return;
    setIsSubmitting(true);
    try {
      const { group, photo } = photoToDelete;
      const updatedImages = (group.images || []).filter((img) => img.id !== photo.id);
      
      // If deleted photo was the cover image, set next available image as cover
      let updatedCover = group.coverImage;
      if (group.coverImage === photo.src && updatedImages.length > 0) {
        updatedCover = updatedImages[0].src;
      }

      const docRef = doc(db, 'galleryGroups', group.id);
      await updateDoc(docRef, {
        images: updatedImages,
        coverImage: updatedCover,
        updatedTimestamp: Date.now(),
      });

      showToast('Photo removed from album.');
      setPhotoToDelete(null);
      if (lightboxIndex !== null) {
        setLightboxIndex(null);
      }
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      showToast(err.message || 'Failed to remove photo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Set as Album Cover
  const handleSetAsCover = async (group: GalleryGroup, photo: GalleryImage) => {
    try {
      const docRef = doc(db, 'galleryGroups', group.id);
      await updateDoc(docRef, {
        coverImage: photo.src,
        updatedTimestamp: Date.now(),
      });
      showToast('Set as album cover photo!');
    } catch (err: any) {
      console.error('Error updating album cover:', err);
      showToast('Failed to update album cover.', 'error');
    }
  };

  // Handle Edit Photo Caption Submit
  const handleEditPhotoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!photoToEdit) return;

    setIsSubmitting(true);
    try {
      const { group, photo } = photoToEdit;
      const updatedImages = (group.images || []).map((img) => {
        if (img.id === photo.id) {
          return {
            ...img,
            caption: photoFormCaption.trim() || undefined,
            alt: photoFormAlt.trim() || img.alt,
          };
        }
        return img;
      });

      const docRef = doc(db, 'galleryGroups', group.id);
      await updateDoc(docRef, {
        images: updatedImages,
        updatedTimestamp: Date.now(),
      });

      showToast('Photo details updated!');
      setPhotoToEdit(null);
    } catch (err: any) {
      console.error('Error editing photo:', err);
      showToast(err.message || 'Failed to update photo details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="gallery-toast-notification"
          className={`fixed bottom-8 right-8 z-[110] px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50' 
              : 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? <Check size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-rose-400" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeGroup && activeGroup.images[lightboxIndex] && (
        <div 
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-300 select-none"
        >
          {/* Top Controls */}
          <div className="w-full flex items-center justify-between z-20 max-w-6xl">
            <div className="text-white text-xs sm:text-sm font-medium bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              {lightboxIndex + 1} / {activeGroup.images.length}
            </div>
            
            <div className="flex items-center gap-2">
              {isCurrentUserAdmin && (
                <button
                  id="lightbox-delete-photo-btn"
                  onClick={() => setPhotoToDelete({ group: activeGroup, photo: activeGroup.images[lightboxIndex] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-semibold border border-rose-500/30 transition-colors"
                  title="Delete this photo"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button 
                id="lightbox-close-btn"
                onClick={() => setLightboxIndex(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                title="Close lightbox (Esc)"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Main Photo Area with Prev/Next buttons */}
          <div className="relative w-full max-w-6xl flex-grow flex items-center justify-center my-auto overflow-hidden">
            {activeGroup.images.length > 1 && (
              <button
                id="lightbox-prev-btn"
                onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeGroup.images.length - 1))}
                className="absolute left-2 sm:left-4 p-3 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 transition-all z-20 hover:scale-110"
                title="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img 
              src={activeGroup.images[lightboxIndex].src} 
              alt={activeGroup.images[lightboxIndex].alt}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300 animate-in zoom-in-95"
            />

            {activeGroup.images.length > 1 && (
              <button
                id="lightbox-next-btn"
                onClick={() => setLightboxIndex((prev) => (prev !== null && prev < activeGroup.images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 p-3 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 transition-all z-20 hover:scale-110"
                title="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Caption and Info at Bottom */}
          <div className="w-full max-w-3xl text-center z-20 mt-2">
            {activeGroup.images[lightboxIndex].caption ? (
              <p className="text-white text-base font-medium drop-shadow-md bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md inline-block border border-white/10">
                {activeGroup.images[lightboxIndex].caption}
              </p>
            ) : (
              <p className="text-slate-400 text-xs">{activeGroup.images[lightboxIndex].alt}</p>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/25 shadow-inner">
            <ImageIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {activeGroup ? activeGroup.title : 'Batch Gallery'}
              </h1>
              {isCurrentUserAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" /> Admin
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              {activeGroup 
                ? `${activeGroup.phase} • ${activeGroup.description || 'Memories & snapshots'}` 
                : 'Moments, celebrations, and academic sessions of 23rd Batch'}
            </p>
          </div>
        </div>

        {/* Action Controls for Admin */}
        <div className="flex items-center gap-2.5">
          {isCurrentUserAdmin && !activeGroup && (
            <button
              id="admin-create-album-btn"
              onClick={handleOpenCreateGroup}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_16px_rgba(5,150,105,0.25)] hover:scale-105 text-sm"
            >
              <Plus size={18} /> Create Album
            </button>
          )}

          {isCurrentUserAdmin && activeGroup && (
            <div className="flex items-center gap-2">
              <button
                id="admin-add-photo-btn"
                onClick={handleOpenAddPhoto}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-3.5 py-2 rounded-xl transition-all shadow-md text-xs sm:text-sm hover:scale-105"
              >
                <Plus size={16} /> Add Photos
              </button>
              <button
                id="admin-edit-album-btn"
                onClick={() => handleOpenEditGroup(activeGroup)}
                className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-[#0a231b]/60 hover:bg-emerald-50 dark:hover:bg-[#0e2f24] text-slate-800 dark:text-slate-200 font-semibold px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/10 transition-all text-xs sm:text-sm shadow-sm"
              >
                <Edit3 size={15} className="text-emerald-600 dark:text-emerald-400" /> Edit Album
              </button>
              <button
                id="admin-delete-album-btn"
                onClick={() => setGroupToDelete(activeGroup)}
                className="inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white font-semibold px-3 py-2 rounded-xl border border-rose-500/20 transition-all text-xs sm:text-sm"
                title="Delete this entire album"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Notice Bar */}
      {isCurrentUserAdmin && (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 rounded-2xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Admin privileges active: You can create, edit, or delete albums, and add or delete photos directly.</span>
          </div>
        </div>
      )}

      {/* Phase Selector Tabs (when browsing album groups) */}
      {!activeGroup && (
        <div className="flex flex-wrap gap-2 bg-white/80 dark:bg-[#0a231b]/60 p-2 rounded-2xl border border-emerald-900/10 dark:border-white/5 backdrop-blur-sm shadow-sm">
          {PHASES.map((phase) => {
            const count = allGroups.filter((g) => g.phase === phase).length;
            const isSelected = selectedPhase === phase;
            return (
              <button
                key={phase}
                id={`gallery-phase-tab-${phase.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedPhase(phase)}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/30 shadow-sm'
                    : 'bg-transparent text-emerald-950/70 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] hover:text-emerald-950 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{phase}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-emerald-700/50 text-white dark:bg-emerald-500/30 dark:text-emerald-200' : 'bg-emerald-100 dark:bg-slate-800 text-emerald-900 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* View: Inside An Album */}
      {activeGroup ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              id="gallery-back-to-albums-btn"
              onClick={() => setActiveAlbumId(null)}
              className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors font-semibold text-sm bg-white/80 dark:bg-[#0a231b]/60 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] w-fit px-4 py-2 rounded-xl border border-emerald-900/10 dark:border-white/5 shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Albums
            </button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {activeGroup.images?.length || 0} Photos
            </span>
          </div>
          
          {(!activeGroup.images || activeGroup.images.length === 0) ? (
            <div className="text-center py-20 bg-white/80 dark:bg-[#0a231b]/60 rounded-3xl border border-dashed border-emerald-900/20 dark:border-emerald-500/20 p-8 shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                <ImageIcon size={30} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Photos in this Album</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md">
                {isCurrentUserAdmin 
                  ? 'Click "Add Photos" above to upload photos to this album.'
                  : 'Photos for this album will appear once added by admin.'}
              </p>
              {isCurrentUserAdmin && (
                <button
                  onClick={handleOpenAddPhoto}
                  className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md"
                >
                  <Plus size={16} /> Add First Photo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGroup.images.map((img, idx) => (
                <div 
                  key={img.id}
                  id={`gallery-photo-card-${img.id}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-950/20 border border-emerald-900/10 dark:border-white/5 shadow-md hover:shadow-xl transition-all"
                >
                  <img 
                    src={img.src} 
                    alt={img.alt || 'Album photo'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay with Zoom Icon */}
                  <div 
                    onClick={() => setLightboxIndex(idx)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                      <ZoomIn size={20} />
                    </div>
                  </div>

                  {/* Photo Caption Badge on hover if available */}
                  {img.caption && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white truncate pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.caption}
                    </div>
                  )}

                  {/* Admin Photo Controls */}
                  {isCurrentUserAdmin && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsCover(activeGroup, img);
                        }}
                        className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                          activeGroup.coverImage === img.src
                            ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                            : 'bg-black/60 hover:bg-amber-500 text-white border-white/20'
                        }`}
                        title={activeGroup.coverImage === img.src ? 'Current Album Cover' : 'Set as Album Cover'}
                      >
                        <Star size={13} className={activeGroup.coverImage === img.src ? 'fill-white' : ''} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoToEdit({ group: activeGroup, photo: img });
                          setPhotoFormCaption(img.caption || '');
                          setPhotoFormAlt(img.alt || '');
                        }}
                        className="p-1.5 bg-black/60 hover:bg-emerald-600 text-white rounded-lg backdrop-blur-md border border-white/20 transition-all"
                        title="Edit photo caption"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoToDelete({ group: activeGroup, photo: img });
                        }}
                        className="p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md border border-white/20 transition-all"
                        title="Delete photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md border border-emerald-900/10 dark:border-white/5 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 dark:border-white/5 text-emerald-700 dark:text-slate-400">
            <Folder size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">No Albums Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md">
            Albums and photos for {selectedPhase} will be added as we progress through academic sessions.
          </p>
          {isCurrentUserAdmin && (
            <button
              onClick={handleOpenCreateGroup}
              className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md"
            >
              <Plus size={16} /> Create Album in {selectedPhase}
            </button>
          )}
        </div>
      ) : (
        /* Albums Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div 
              key={group.id}
              id={`gallery-album-card-${group.id}`}
              onClick={() => setActiveAlbumId(group.id)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-950/20 border border-emerald-900/10 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
            >
              <img 
                src={group.coverImage} 
                alt={group.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-90 transition-opacity" />
              
              {/* Admin Actions Overlay on Group Card */}
              {isCurrentUserAdmin && (
                <div 
                  className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenEditGroup(group)}
                    className="p-2 bg-black/60 hover:bg-emerald-600 text-white rounded-xl backdrop-blur-md border border-white/20 transition-all shadow-md"
                    title="Edit album details"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setGroupToDelete(group)}
                    className="p-2 bg-black/60 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md border border-white/20 transition-all shadow-md"
                    title="Delete entire album"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Album Card Details Overlay */}
              <div className="absolute bottom-3.5 left-4 right-4 text-white font-medium drop-shadow-md flex items-end justify-between gap-2 z-10">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-base leading-snug text-white drop-shadow-sm truncate group-hover:text-emerald-300 transition-colors">
                    {group.title}
                  </div>
                  <div className="text-xs text-emerald-300/90 mt-1 font-semibold flex items-center gap-1.5">
                    <span>{group.images?.length || 0} Photos</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] uppercase font-bold bg-white/20 dark:bg-emerald-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-emerald-200 border border-white/20">
                  {group.phase}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. CREATE ALBUM MODAL */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/20 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Plus size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Album</h3>
              </div>
              <button 
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Album Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Ward Orientation"
                  value={groupFormTitle}
                  onChange={(e) => setGroupFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Welcome and orientation sessions in hospital"
                  value={groupFormDesc}
                  onChange={(e) => setGroupFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Academic Phase *
                </label>
                <select
                  value={groupFormPhase}
                  onChange={(e) => setGroupFormPhase(e.target.value as Phase)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PHASES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Cover Image URL or File
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="https://... or /gallery/image.jpg"
                    value={groupFormCoverImage}
                    onChange={(e) => {
                      setGroupFormCoverImage(e.target.value);
                      if (e.target.value) setGroupFormCoverFile(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setGroupFormCoverFile(e.target.files[0]);
                          setGroupFormCoverImage('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-[#0e2f24] hover:bg-emerald-100 dark:hover:bg-[#133d2f] text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-500/30 transition-colors"
                    >
                      <Upload size={14} /> Upload from Device
                    </button>
                    {groupFormCoverFile && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 truncate max-w-[200px]">
                        ✓ {groupFormCoverFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ALBUM MODAL */}
      {isEditGroupModalOpen && groupToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/20 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Edit3 size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Album Details</h3>
              </div>
              <button 
                onClick={() => setIsEditGroupModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Album Title *
                </label>
                <input
                  type="text"
                  required
                  value={groupFormTitle}
                  onChange={(e) => setGroupFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  value={groupFormDesc}
                  onChange={(e) => setGroupFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Academic Phase
                </label>
                <select
                  value={groupFormPhase}
                  onChange={(e) => setGroupFormPhase(e.target.value as Phase)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PHASES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Cover Image URL
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={groupFormCoverImage}
                    onChange={(e) => {
                      setGroupFormCoverImage(e.target.value);
                      if (e.target.value) setGroupFormCoverFile(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setGroupFormCoverFile(e.target.files[0]);
                          setGroupFormCoverImage('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-[#0e2f24] hover:bg-emerald-100 dark:hover:bg-[#133d2f] text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-500/30 transition-colors"
                    >
                      <Upload size={14} /> Upload Replacement Image
                    </button>
                    {groupFormCoverFile && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 truncate max-w-[200px]">
                        ✓ {groupFormCoverFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE ALBUM CONFIRMATION MODAL */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a231b] border border-rose-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <Trash2 size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Album?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-200">"{groupToDelete.title}"</strong> and all <strong className="text-slate-900 dark:text-slate-200">{groupToDelete.images?.length || 0}</strong> photos inside it?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteGroupConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/30"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Album'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD PHOTO MODAL */}
      {isAddPhotoModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/20 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Upload size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add Photo to {activeGroup.title}</h3>
              </div>
              <button 
                onClick={() => setIsAddPhotoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Photo Source (Image URL or Upload) *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="https://... or /gallery/photo.jpg"
                    value={photoFormSrc}
                    onChange={(e) => {
                      setPhotoFormSrc(e.target.value);
                      if (e.target.value) setPhotoFormFile(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      ref={photoFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoFormFile(e.target.files[0]);
                          setPhotoFormSrc('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-[#0e2f24] hover:bg-emerald-100 dark:hover:bg-[#133d2f] text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-500/30 transition-colors"
                    >
                      <Upload size={14} /> Upload from Device
                    </button>
                    {photoFormFile && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 truncate max-w-[200px]">
                        ✓ {photoFormFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Photo Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dissection session in Anatomy lab"
                  value={photoFormCaption}
                  onChange={(e) => setPhotoFormCaption(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Alt Text / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Batchmates group picture"
                  value={photoFormAlt}
                  onChange={(e) => setPhotoFormAlt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding Photo...' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT PHOTO DETAILS MODAL */}
      {photoToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/20 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Photo Details</h3>
              <button 
                onClick={() => setPhotoToEdit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditPhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Batch presentation highlight"
                  value={photoFormCaption}
                  onChange={(e) => setPhotoFormCaption(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Alt Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discussion session"
                  value={photoFormAlt}
                  onChange={(e) => setPhotoFormAlt(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#061d15] border border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setPhotoToEdit(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE PHOTO CONFIRMATION MODAL */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a231b] border border-rose-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <Trash2 size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Photo?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to remove this photo from album <strong className="text-slate-900 dark:text-slate-200">"{photoToDelete.group.title}"</strong>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeletePhotoConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/30"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
