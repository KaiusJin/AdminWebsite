import { collections } from "../collections.js";

export async function loadContent(client, table, signal) {
  const query = client.from(table).select("*");
  const ordered = query.order("order", { ascending: true }).order("id");
  const { data, error } = await ordered.abortSignal(signal);
  if (error) throw error;
  return data || [];
}

export async function saveOrder(client, table, items) {
  const results = await Promise.all(
    items.map((item, order) =>
      client
        .from(table)
        .update({ order })
        .eq("id", item.id)
        .select("id")
        .single(),
    ),
  );
  const failure = results.find((result) => result.error);
  if (failure) throw failure.error;
}

export async function saveContent(client, table, formData, { item = null, entries = [] } = {}) {
  const content = editableContent(formData, table);
  const sortable = collections[table].sortable !== false;
  const request = item
    ? client.from(table).update(content).eq("id", item.id)
    : client.from(table).insert({
        ...content,
        order:
          sortable && entries.length
            ? Math.max(...entries.map((entry) => entry.order ?? 0)) + 1
            : 0,
      });
  const { error } = await request.select("id").single();
  if (error) throw error;
}

export async function deleteContent(client, table, id) {
  const { error } = await client
    .from(table)
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
}

const generated = ["id", "order", "created_at", "updated_at", "singleton", "role_icon", "category_icon"];
const retired = {
  site_profile: ["heading", "hero_tags", "focus_areas", "resume_url", "contact_slogans"],
  awards: ["description", "bullets", "link_text"],
};

export function editableContent(row, table) {
  const excluded = [...generated, ...(retired[table] || []), ...(collections[table]?.experience ? ["link_text"] : [])];
  return Object.fromEntries(Object.entries(row).filter(([key]) => !excluded.includes(key)));
}
