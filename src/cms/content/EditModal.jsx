import { useEffect, useRef, useState } from "react";
import { collections, journeyScenes } from "../collections.js";
import { editableContent } from "./contentApi.js";
import { X } from "lucide-react";
import ArrayEditor from "../../components/ArrayEditor";
import MediaPicker from "../media/MediaPicker";
import ProfileFields from "./ProfileFields";
import PersonalEntryFields from "./PersonalEntryFields";

export default function EditModal({
  onClose,
  onSave,
  item,
  table,
  busy,
  error = "",
  entries = [],
}) {
  const [formData, setFormData] = useState(() =>
    item
      ? editableContent(item, table)
      : collections[table].defaultValues || {},
  );
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const isExperience = Boolean(collections[table].experience);

  const handleChange = (field, value, locale) => {
    setFormData((previous) => {
      if (locale) return { ...previous, [locale]: { ...previous[locale], [field]: value } };
      const next = { ...previous, [field]: value };
      if (field === "is_present" && value === true) next.end_date = "";
      if (field === "end_date" && value !== "") next.is_present = false;
      return next;
    });
  };

  const updateArray = (field, update) => {
    setFormData((previous) => ({
      ...previous,
      [field]: update(previous[field] || []),
    }));
  };

  const renderField = (label, field, type = "text", locale) => {
    const multiline = type === "textarea";
    const Control = multiline ? "textarea" : "input";
    const id = locale ? `${locale}-${field}` : `field-${field}`;
    return (
      <div className="input-group" key={field}>
        <label htmlFor={id}>{label}</label>
        <Control
          id={id}
          type={multiline ? undefined : type}
          rows={multiline ? (locale ? 3 : 5) : undefined}
          value={(locale ? formData[locale]?.[field] : formData[field]) ?? ""}
          onChange={event => handleChange(field, event.target.value, locale)}
        />
      </div>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay"
      aria-labelledby="editor-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="editor-title">
            {item ? "Edit" : "New"} {collections[table].singular}
          </h2>
          <button
            disabled={busy}
            onClick={onClose}
            className="btn-icon"
            aria-label="Close editor"
          >
            <X />
          </button>
        </div>

        <div className="modal-body">
          <fieldset className="editor-fields" disabled={busy}>
            {error && (
              <p role="alert" className="cms-error">
                {error}
              </p>
            )}
            {table !== "skills" && table !== "site_profile" && renderField("Title", "title")}
            {table === "skills" && renderField("Category Name", "category")}

            {isExperience && renderField("Role", "role")}

            {(table === "projects" || isExperience) && (
              <>
                <div className="form-grid">
                  {renderField("Start Date", "start_date")}
                  <div className="input-group">
                    <label htmlFor="end-date">End date</label>
                    <input
                      id="end-date"
                      type="text"
                      value={formData.end_date || ""}
                      disabled={formData.is_present}
                      onChange={(event) =>
                        handleChange("end_date", event.target.value)
                      }
                      style={{
                        opacity: formData.is_present ? 0.5 : 1,
                        cursor: formData.is_present ? "not-allowed" : "text",
                      }}
                      placeholder={formData.is_present ? "Present" : ""}
                    />
                  </div>
                </div>
                <div className="input-group-row">
                  <input
                    type="checkbox"
                    id="is_present"
                    checked={formData.is_present || false}
                    onChange={(event) =>
                      handleChange("is_present", event.target.checked)
                    }
                  />
                  <label htmlFor="is_present">
                    Currently working here / In progress (Present)
                  </label>
                </div>
              </>
            )}

            {table === "projects" && (
              <>
                <MediaPicker
                  kind="image"
                  onSelect={(asset) =>
                    setFormData((previous) => ({
                      ...previous,
                      image_url: asset.url,
                      image_alt: asset.alt,
                    }))
                  }
                />
                {renderField("Cover Image URL", "image_url")}
                {renderField("Cover Image Description", "image_alt")}
              </>
            )}

            {table === "awards" && (
              <>
                {renderField("Organization", "organization")}
                {renderField("Year", "year")}
              </>
            )}

            {table === "site_profile" && (
              <ProfileFields renderField={renderField} />
            )}

            {table === "personal_entries" && (
              <PersonalEntryFields
                formData={formData}
                handleChange={handleChange}
                renderField={renderField}
                updateArray={updateArray}
              />
            )}

            {table === "journey_scene_content" && (
              <>
                <label className="input-group">
                  Scene
                  <select
                    value={formData.scene_id || ""}
                    onChange={(event) =>
                      handleChange("scene_id", event.target.value)
                    }
                  >
                    <option value="" disabled>
                      Choose a scene
                    </option>
                    {journeyScenes
                      .filter(
                        (scene) =>
                          scene === item?.scene_id ||
                          !entries.some((entry) => entry.scene_id === scene),
                      )
                      .map((scene) => (
                        <option key={scene} value={scene}>
                          {scene}
                        </option>
                      ))}
                  </select>
                </label>
                {renderField("Description", "description", "textarea")}
              </>
            )}

            <div className="form-grid">
              {table === "projects" && (
                <>
                  {renderField("GitHub Repo Link", "github_link")}
                  {renderField("Live Demo / Web Link", "link")}
                  {renderField("Demo Link Label (Optional)", "link_text")}
                </>
              )}
              {isExperience && renderField("Website Link", "link")}
              {table === "awards" && renderField("Credential URL", "link", "url")}
            </div>

            {(table === "projects" || isExperience) && (
              <ArrayEditor
                label={table === "projects" ? "Slogan (first bullet) / Highlights" : "Bullets / Highlights"}
                itemLabel="highlight"
                addLabel="Add Bullet"
                fields={[{ key: "text", label: "Highlight" }]}
                value={formData.bullets}
                onChange={(update) => updateArray("bullets", update)}
              />
            )}

            {(table === "skills" || table === "projects" || isExperience) && (
              <ArrayEditor
                label={
                  table === "skills"
                    ? "Tags in this Category"
                    : "Tech Stack / Skills"
                }
                itemLabel="skill"
                addLabel="Add Tag"
                fields={[{ key: "tag", label: "Skill" }]}
                value={formData.skills}
                onChange={(update) => updateArray("skills", update)}
              />
            )}
          </fieldset>
        </div>

        <div className="modal-footer">
          <button disabled={busy} className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={busy}
            className="btn btn-primary"
            onClick={() => onSave(formData)}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
