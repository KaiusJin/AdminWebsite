export const journeyScenes = [
  "cottage",
  "meadow",
  "town",
  "library",
  "academy",
  "lake",
  "station",
];

// Insertion order is the navigation order in the content studio.
export const collections = {
  site_profile: {
    plural: "Profile & contact",
    singular: "profile",
    sortable: false,
    maxEntries: 1,
  },
  work_experiences: {
    plural: "Work experience",
    singular: "work experience",
    experience: true,
  },
  club_experiences: {
    plural: "Clubs & design teams",
    singular: "club or design team",
    experience: true,
  },
  volunteer_experiences: {
    plural: "Volunteering",
    singular: "volunteer experience",
    experience: true,
  },
  projects: { plural: "Projects", singular: "project" },
  awards: { plural: "Awards", singular: "award" },
  skills: { plural: "Skills", singular: "skill category" },
  personal_entries: {
    plural: "Personal journal",
    singular: "journal entry",
    defaultValues: { kind: "daily" },
  },
  journey_scene_content: {
    plural: "Journey scenes",
    singular: "scene",
    sortable: false,
    maxEntries: journeyScenes.length,
  },
  media: { plural: "Media library" },
};
