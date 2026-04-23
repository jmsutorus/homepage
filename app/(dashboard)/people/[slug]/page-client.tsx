"use client";

import { useState } from "react";
import { type Person } from "@/lib/db/people";
import { calculateAge, formatPhoneNumber } from "@/lib/people-utils";
import { getZodiacSignFromBirthday } from "@/lib/zodiac";
import { PersonFormDialog } from "@/components/widgets/people/person-form-dialog";
import { PhotoEditDialog } from "@/components/widgets/people/photo-edit-dialog";
import { useRouter } from "next/navigation";
import { Heart, Mail, Phone, MapPin, Calendar, Edit, ChevronLeft, Filter, Plus, Image as ImageIcon, Gift, Pencil } from "lucide-react";
import { formatDateLongSafe } from "@/lib/utils";

interface PersonDetailClientProps {
  person: Person;
  sharedHistory: any[];
}

export function PersonDetailClient({ person, sharedHistory }: PersonDetailClientProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  
  const zodiacSign = getZodiacSignFromBirthday(person.birthday);
  const age = calculateAge(person.birthday);
  
  const birthdayParts = person.birthday.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const birthdayDisplay = `${monthNames[parseInt(birthdayParts[1]) - 1]} ${parseInt(birthdayParts[2])}`;

  const handleEditSuccess = () => {
    router.refresh();
  };

  return (
    <main className="mt-8 px-4 md:px-12 max-w-6xl mx-auto space-y-12 pb-32 font-lexend">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/people')}
        className="cursor-pointer flex items-center gap-2 text-media-on-surface-variant hover:text-media-primary transition-colors font-bold text-sm tracking-tight"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO DIRECTORY
      </button>

      {/* Section 1: Profile Header */}
      <section className="relative pt-4">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          <div className="relative w-full md:w-1/2 aspect-[4/5] bg-media-surface-container-high rounded-xl overflow-hidden shadow-2xl">
            {person.photo ? (
              <img 
                alt={person.name} 
                className="w-full h-full object-cover" 
                src={person.photo} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-media-primary-fixed text-media-primary text-9xl font-bold">
                {person.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Photo Edit Button */}
            <button 
              onClick={() => setIsPhotoDialogOpen(true)}
              className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all shadow-lg cursor-pointer z-10 group"
              title="Edit Profile Photo"
            >
              <Pencil className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-media-primary/80 to-transparent">
              <span className="bg-media-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2 inline-block shadow-sm">
                {person.relationshipTypeName || person.relationship}
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-tight">
                {person.name}
              </h1>
            </div>
          </div>
          <div className="flex-1 w-full flex flex-col items-start gap-6 pb-4">
            <p className="text-media-on-surface-variant leading-relaxed text-lg max-w-md italic font-serif">
              {person.notes || "No biographical notes recorded yet. Reflect on your shared journey to add depth to this editorial profile."}
            </p>
            <button 
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-media-secondary text-white px-8 py-4 rounded-lg font-bold flex items-center gap-3 scale-100 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Personal Details Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-media-surface-container-low p-8 rounded-xl flex flex-col justify-between h-48 border border-media-outline-variant/10">
          <span className="text-media-secondary font-bold tracking-widest uppercase text-xs">Contact Information</span>
          <div className="space-y-1">
            {person.phone ? (
              <a 
                href={`tel:${person.phone}`} 
                className="text-lg font-bold text-media-on-surface-variant block hover:text-media-primary transition-colors"
              >
                {formatPhoneNumber(person.phone)}
              </a>
            ) : (
              <p className="text-xl font-bold text-media-on-surface-variant opacity-50">No phone documented</p>
            )}

            {person.email ? (
              <a 
                href={`mailto:${person.email}`} 
                className="text-lg font-bold text-media-primary block hover:underline transition-all"
              >
                {person.email}
              </a>
            ) : (
              <p className="text-xl font-bold text-media-primary opacity-50">No email documented</p>
            )}

            {person.address && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-media-on-surface-variant flex items-center gap-1 mt-1 hover:text-media-primary transition-colors truncate max-w-full"
                title={person.address}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{person.address}</span>
              </a>
            )}
          </div>
        </div>
        
        <div className="bg-media-primary text-white p-8 rounded-xl flex flex-col justify-between h-48 shadow-inner">
          <span className="text-media-primary-fixed-dim font-bold tracking-widest uppercase text-xs">Birthday</span>
          <div>
            <p className="text-3xl font-bold">{birthdayDisplay}</p>
            <p className="text-media-primary-fixed text-sm">Age: {age || 'Unknown'}</p>
          </div>
        </div>

        <div className="bg-media-tertiary-fixed p-8 rounded-xl flex flex-col justify-between h-48 border border-media-outline-variant/10">
          <span className="text-media-on-tertiary-fixed-variant font-bold tracking-widest uppercase text-xs">Zodiac</span>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-media-on-tertiary-fixed">{zodiacSign?.name || 'Unknown'}</p>
            <span className="text-4xl text-media-on-tertiary-fixed opacity-40">{zodiacSign?.emoji || '✨'}</span>
          </div>
        </div>

        {/* Gift Ideas / Address Section */}
        <div className="md:col-span-4 bg-media-surface-container p-8 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-media-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="p-3 bg-white rounded-full text-media-secondary shadow-sm">
              <Gift className="w-5 h-5" />
            </span>
            <div>
              <span className="text-media-on-surface-variant font-bold tracking-widest uppercase text-[10px]">Aspirational Tokens</span>
              <p className="font-bold text-media-primary">{person.gift_ideas || "No gift ideas archived yet."}</p>
            </div>
          </div>
          {person.is_partner && person.anniversary && (
            <div className="flex items-center gap-4 md:border-l border-media-outline-variant/20 md:pl-8">
              <span className="p-3 bg-rose-500/10 rounded-full text-rose-500 shadow-sm">
                <Heart className="w-5 h-5 fill-rose-500" />
              </span>
              <div>
                <span className="text-media-on-surface-variant font-bold tracking-widest uppercase text-[10px]">Anniversary</span>
                <p className="font-bold text-media-primary">{formatDateLongSafe(person.anniversary)}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Shared History Timeline */}
      <section className="space-y-12 pb-12">
        <div className="flex items-center justify-between border-b border-media-outline-variant/20 pb-4">
          <h2 className="text-4xl font-bold tracking-tight text-media-primary">Shared History</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-media-surface-container text-media-on-surface-variant cursor-pointer hover:bg-media-surface-container-high transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-media-surface-container text-media-on-surface-variant cursor-pointer hover:bg-media-surface-container-high transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {sharedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-media-surface-container-low rounded-xl border border-dashed border-media-outline-variant/30">
            <Calendar className="w-12 h-12 text-media-outline/30 mb-4" />
            <p className="text-media-on-surface-variant font-medium">No shared events archived yet.</p>
            <p className="text-media-on-surface-variant text-sm">Link this person to events, vacations, or parks to build your history.</p>
          </div>
        ) : (
          <div className="relative pl-8 md:pl-0">
            {/* Timeline Vertical Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-media-outline-variant/30 transform md:-translate-x-1/2"></div>
            
            {/* Timeline Entries */}
            <div className="space-y-24">
              {sharedHistory.map((entry, index) => (
                <div key={`${entry.entry_type}-${entry.id}`} className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'text-left md:text-right order-2 md:order-1' : 'order-1 md:order-2'}`}>
                    <span className="text-media-secondary font-bold tracking-tighter text-sm">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <h3 className="text-2xl font-bold text-media-primary mb-2 tracking-tight">{entry.title}</h3>
                    <p className="text-media-on-surface-variant leading-relaxed line-clamp-3">
                      {entry.description || `A quiet chapter shared during our ${entry.entry_type} journey.`}
                    </p>
                  </div>
                  
                  <div className="absolute left-[-32px] md:left-1/2 top-0 md:top-auto w-4 h-4 rounded-full bg-media-secondary ring-4 ring-media-surface transform md:-translate-x-1/2 z-10"></div>
                  
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'order-1 md:order-2' : 'order-2 md:order-1'}`}>
                    <div className="rounded-xl overflow-hidden shadow-xl aspect-video bg-media-surface-container-low relative group cursor-pointer">
                      {entry.image ? (
                        <img 
                          alt={entry.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          src={entry.image} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-media-surface-container-high text-media-primary/20">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-media-primary/0 group-hover:bg-media-primary/10 transition-colors"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Edit Dialog */}
      <PersonFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingPerson={person}
        onSuccess={handleEditSuccess}
      />

      {/* Photo Edit Dialog */}
      <PhotoEditDialog
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        person={person}
        onSuccess={handleEditSuccess}
      />
    </main>
  );
}
