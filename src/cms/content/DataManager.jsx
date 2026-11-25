import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Edit, Trash2, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import EditModal from "./EditModal";
import { collections } from "../collections.js";
import { deleteContent, loadContent, saveContent, saveOrder } from "./contentApi.js";

export default function DataManager({ table }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(null);
  const collection = collections[table];
  const sortable = collection.sortable !== false;
  const canAdd = data.length < (collection.maxEntries ?? Infinity);

  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    loadContent(supabase, table, abort.signal)
      .then((items) => {
        if (active) setData(items);
      })
      .catch((reason) => {
        if (active) {
          setData([]);
          setError(reason.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      abort.abort();
    };
  }, [table, revision]);

  const refresh = () => {
    setLoading(true);
    setRevision((value) => value + 1);
  };
  const mutate = async (operation, failurePrefix = "") => {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (reason) {
      setError(`${failurePrefix}${reason.message}`);
    } finally {
      setBusy(false);
      refresh();
    }
  };
  const onDragEnd = (result) => {
    if (
      !result.destination ||
      result.source.index === result.destination.index ||
      busy
    )
      return;
    const items = [...data];
    const [item] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, item);
    setData(items);
    mutate(
      () => saveOrder(supabase, table, items),
      "Some ordering changes may have saved; the list has been reloaded. ",
    );
  };
  const handleSave = (formData) =>
    mutate(async () => {
      await saveContent(supabase, table, formData, {
        item: editing.item,
        entries: data,
      });
      setEditing(null);
    });
  const deleteItem = (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    mutate(() => deleteContent(supabase, table, id));
  };
  const openEditor = (item) => {
    setError("");
    setEditing({ item });
  };
  const row = (item, provided, dragging = false) => (
    <tr
      key={item.id}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className={dragging ? "is-dragging" : undefined}
    >
      {sortable && (
        <td className="reorder-cell">
          <button
            type="button"
            className="drag-handle"
            {...provided?.dragHandleProps}
            aria-label={`Reorder ${item.title || item.category || "entry"}`}
          >
            <GripVertical size={18} aria-hidden="true" />
          </button>
        </td>
      )}
      <td>
        <button
          className="record-title"
          onClick={() => openEditor(item)}
          disabled={busy}
        >
          {item.title || item.category || item.name || "Profile & contact"}
        </button>
        <p className="record-meta">
          {item.organization ||
            item.role ||
            item.kind ||
            item.scene_id ||
            item.hero_badge}
          {table === "awards" && item.year && (
            <span className="record-year-mobile"> · {item.year}</span>
          )}
        </p>
      </td>
      {table === "awards" && <td className="year-cell">{item.year}</td>}
      <td className="actions-cell">
        <div className="row-actions">
          <button
            className="btn-icon"
            disabled={busy}
            aria-label={`Edit ${item.title || item.category || "profile"}`}
            onClick={() => openEditor(item)}
          >
            <Edit size={17} />
          </button>
          <button
            className="btn-icon delete-action"
            disabled={busy}
            aria-label={`Delete ${item.title || item.category || "profile"}`}
            onClick={() => deleteItem(item.id)}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
  const heading = (
    <thead>
      <tr>
        {sortable && <th className="reorder-cell" aria-label="Reorder" />}
        <th>
          {table === "awards"
            ? "Award"
            : table === "skills"
              ? "Category"
              : "Name"}
        </th>
        {table === "awards" && <th className="year-cell">Year</th>}
        <th className="actions-cell">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );

  return (
    <div>
      {error && !editing && (
        <p role="alert" className="cms-error">
          {error}{" "}
          <button
            className="btn btn-outline"
            onClick={() => {
              setError("");
              refresh();
            }}
            disabled={busy}
          >
            Retry
          </button>
        </p>
      )}
      {loading ? (
        <p role="status">Loading data…</p>
      ) : (
        <>
          <div className="collection-toolbar">
            <p className="entry-count">
              {data.length} {data.length === 1 ? "entry" : "entries"}
            </p>
            {canAdd && !error && (
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={() => openEditor(null)}
              >
                <Plus size={17} aria-hidden="true" /> Add{" "}
                {collection.singular}
              </button>
            )}
          </div>
          <div className="collection-list">
            {sortable ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <table>
                  {heading}
                  <Droppable droppableId={table}>
                    {(provided) => (
                      <tbody
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {data.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                            isDragDisabled={busy}
                          >
                            {(provided, snapshot) =>
                              row(item, provided, snapshot.isDragging)
                            }
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </table>
              </DragDropContext>
            ) : (
              <table>
                {heading}
                <tbody>{data.map((item) => row(item))}</tbody>
              </table>
            )}
          </div>
          {!data.length && !error && (
            <p className="empty-state">
              No {collection.plural.toLowerCase()} yet.
            </p>
          )}
        </>
      )}
      {editing && (
        <EditModal
          key={editing.item?.id || "new"}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          item={editing.item}
          table={table}
          busy={busy}
          entries={data}
          error={error}
        />
      )}
    </div>
  );
}
