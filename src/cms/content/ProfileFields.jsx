const journeyFields = [
  ["Welcome introduction", "welcome_intro"],
  ["Focus label", "focus"],
  ["Profile heading", "heading"],
  ["Profile introduction", "intro"],
  ["Profile biography", "bio"],
  ["Education school", "education_school"],
  ["Education field", "education_field"],
  ["Location detail", "location_detail"],
  ["Contact heading", "contact_heading"],
  ["Contact introduction", "contact_intro"],
  ["Contact closing", "contact_outro"],
];

export default function ProfileFields({ renderField }) {
  const renderJourneyFields = (locale, label) => (
    <section>
      <h3>Journey — {label}</h3>
      {journeyFields.map(([fieldLabel, field]) => renderField(fieldLabel, field, "textarea", locale))}
    </section>
  );

  return (
    <>
      <h3>Classic profile</h3>
      {renderField("Name", "name")}
      {renderField("Hero badge", "hero_badge")}
      {renderField("Introduction", "intro", "textarea")}
      {renderField("Biography", "bio", "textarea")}
      {renderField("Location", "location")}
      {renderField("Education", "education")}
      <h3>Contact links</h3>
      {renderField("Email", "email", "email")}
      {renderField("GitHub URL", "github", "url")}
      {renderField("LinkedIn URL", "linkedin", "url")}
      {renderJourneyFields("journey_en", "English")}
      {renderJourneyFields("journey_zh", "中文")}
    </>
  );
}
