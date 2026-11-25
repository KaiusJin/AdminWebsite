import ArrayEditor from "../../components/ArrayEditor";
import { MediaSelect } from "../media/MediaPicker";
import useMediaAssets from "../media/useMediaAssets";

export default function PersonalEntryFields({
  formData,
  handleChange,
  renderField,
  updateArray,
}) {
  const { assets, error } = useMediaAssets();

  return (
    <>
      <label className="input-group">
        Category
        <select
          value={formData.kind}
          onChange={(event) =>
            handleChange("kind", event.target.value)
          }
        >
          {["photography", "travel", "daily", "music"].map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </label>
      {renderField("Story", "body", "textarea")}
      {renderField("Date", "date", "date")}
      {formData.kind === "music" && (
        <MediaSelect
          assets={assets}
          error={error}
          kind="audio"
          onSelect={(asset) =>
            handleChange("external_url", asset.url)
          }
        />
      )}
      {renderField("Music / Related URL", "external_url", "url")}
      <MediaSelect
        assets={assets}
        error={error}
        kind="image"
        onSelect={(asset) =>
          updateArray("images", (images) => [
            ...images,
            {
              url: asset.url,
              alt: asset.alt,
              caption: "",
            },
          ])
        }
      />
      <ArrayEditor
        label="Photo Gallery"
        itemLabel="photo"
        addLabel="Add Photo"
        rowClass="gallery-row"
        fields={[
          {
            key: "url",
            label: "Image URL",
            type: "url",
            placeholder: "Image URL",
          },
          {
            key: "alt",
            label: "Image description",
            placeholder: "Image description",
          },
          {
            key: "caption",
            label: "Caption",
            placeholder: "Caption",
          },
        ]}
        value={formData.images}
        onChange={(update) => updateArray("images", update)}
      />
    </>
  );
}
